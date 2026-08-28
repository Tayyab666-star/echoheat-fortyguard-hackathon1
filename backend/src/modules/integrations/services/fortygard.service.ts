import axios, { type AxiosError } from "axios"
import { env } from "../../../config/env.js"
import { logger } from "../../../config/logger.js"
import { cacheService } from "../../../utils/cache.service.js"

// ── Types ────────────────────────────────────────────────────

export interface FortyGuardReading {
  timestamp: string
  location: { lat: number; lng: number }
  temperature_2m: number
  relative_humidity: number
  solar_radiation: number
  wind_speed: number
  apparent_temperature: number
}

export interface FortyGuardRouteWaypoint {
  lat: number
  lng: number
  temperature: number
  humidity: number
  solarRadiation: number
  windSpeed: number
  thermalRisk: "minimal" | "low" | "moderate" | "high" | "extreme"
}

export interface FortyGuardError {
  success: false
  error: string
  code:
    | "API_KEY_MISSING"
    | "API_KEY_INVALID"
    | "CREDITS_EXHAUSTED"
    | "RATE_LIMITED"
    | "API_UNAVAILABLE"
    | "MOCK_MODE"
  fallbackUsed: boolean
}

export type FortyGuardResponse = FortyGuardReading | FortyGuardError

// ── Helpers ──────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isError(response: any): response is FortyGuardError {
  return response && typeof response === "object" && "success" in response && response.success === false
}

function generateMockReading(lat: number, lng: number): FortyGuardReading {
  const now = new Date()
  const hour = now.getHours() + now.getMinutes() / 60

  const diurnalPhase = ((hour - 6) / 24) * 2 * Math.PI
  const diurnalAmplitude = 8
  const diurnalComponent = diurnalAmplitude * Math.sin(diurnalPhase - Math.PI / 2)

  const latFactor = 35 - Math.abs(lat) * 0.3
  const baseTemp = env.FORTYGUARD_BASE_TEMP + latFactor * 0.1

  const spikeComponent = env.FORTYGUARD_HEAT_SPIKE * Math.max(0, Math.sin(diurnalPhase))

  const noise = (Math.random() - 0.5) * 4
  const temp = baseTemp + diurnalComponent + spikeComponent + noise

  const humidity = Math.max(10, Math.min(100, 60 - (temp - 30) * 2 + (Math.random() - 0.5) * 10))

  const solarAngle = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI))
  const solarRadiation = solarAngle * 900 + (Math.random() - 0.5) * 100

  const windSpeed = 2 + Math.random() * 6 + Math.sin(hour * 0.5) * 2

  return {
    timestamp: now.toISOString(),
    location: { lat, lng },
    temperature_2m: Number(Math.round(temp * 10) / 10),
    relative_humidity: Number(Math.max(10, Math.min(100, humidity)).toFixed(1)),
    solar_radiation: Number(Math.max(0, solarRadiation).toFixed(0)),
    wind_speed: Number(Math.max(0, windSpeed).toFixed(1)),
    apparent_temperature: Number((temp + 2).toFixed(1)),
  }
}

function generateMockCorridor(
  waypoints: Array<{ lat: number; lng: number }>
): FortyGuardRouteWaypoint[] {
  return waypoints.map((wp) => {
    const reading = generateMockReading(wp.lat, wp.lng)

    let thermalRisk: FortyGuardRouteWaypoint["thermalRisk"] = "minimal"
    if (reading.temperature_2m >= 42) thermalRisk = "extreme"
    else if (reading.temperature_2m >= 38) thermalRisk = "high"
    else if (reading.temperature_2m >= 34) thermalRisk = "moderate"
    else if (reading.temperature_2m >= 30) thermalRisk = "low"

    return {
      lat: wp.lat,
      lng: wp.lng,
      temperature: reading.temperature_2m,
      humidity: reading.relative_humidity,
      solarRadiation: reading.solar_radiation,
      windSpeed: reading.wind_speed,
      thermalRisk,
    }
  })
}

// ── Main API Client ──────────────────────────────────────────

class FortygardClient {
  private readonly baseURL = "https://api.fortyguard.com/v1"
  private readonly cachePrefix = "fg:api"

  private cacheKey(lat: number, lng: number, radius: number): string {
    return `${this.cachePrefix}:${lat.toFixed(3)}:${lng.toFixed(3)}:${radius}`
  }

  private corridorCacheKey(waypoints: Array<{ lat: number; lng: number }>): string {
    const hash = waypoints.map((w) => `${w.lat},${w.lng}`).join("|")
    return `${this.cachePrefix}:corridor:${Buffer.from(hash).toString("base64").slice(0, 40)}`
  }

  // ── Fetch microclimate reading ─────────────────────────────

  async getEnvironmentData(
    lat: number,
    lng: number,
    radiusMeters: number = 500
  ): Promise<FortyGuardResponse> {
    // 1. Mock mode check
    if (env.FORTYGUARD_MOCK) {
      logger.debug(`[FortyGuard] Mock mode — generating synthetic data for ${lat},${lng}`)
      const mockReading = generateMockReading(lat, lng)
      return {
        ...mockReading,
        success: false,
        error: "FortyGuard API is running in mock mode. Live data not available.",
        code: "MOCK_MODE",
        fallbackUsed: true,
      } as FortyGuardResponse
    }

    // 2. API key check
    if (!env.FORTYGUARD_API_KEY || env.FORTYGUARD_API_KEY.trim() === "") {
      logger.error("[FortyGuard] API key is missing. Set FORTYGUARD_API_KEY in .env")
      return {
        success: false,
        error: "FortyGuard API key is not configured. Contact your administrator.",
        code: "API_KEY_MISSING",
        fallbackUsed: false,
      }
    }

    // 3. Check Redis cache (5 min TTL per geo-cluster)
    const cacheKey = this.cacheKey(lat, lng, radiusMeters)
    try {
      const cached = await cacheService.get<FortyGuardReading>(cacheKey)
      if (cached) {
        logger.debug(`[FortyGuard] Cache hit for ${lat},${lng}`)
        return cached
      }
    } catch {
      // Cache miss or Redis unavailable — continue to API call
    }

    // 4. Call real FortyGuard API
    try {
      const response = await axios.get<FortyGuardReading>(`${this.baseURL}/microclimate`, {
        params: { lat, lng, radius: radiusMeters },
        headers: {
          Authorization: `Bearer ${env.FORTYGUARD_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 8000,
      })

      const data = response.data

      // Cache the result for 5 minutes
      await cacheService.set(cacheKey, data, env.CACHE_TTL_FORTYGUARD)

      logger.info(`[FortyGuard] Live data fetched for ${lat},${lng} — temp=${data.temperature_2m}°C`)
      return data
    } catch (err) {
      const error = err as AxiosError

      if (error.response?.status === 401) {
        logger.error("[FortyGuard] Invalid API key — 401 Unauthorized")
        return {
          success: false,
          error: "FortyGuard API key is invalid or expired. Please update FORTYGUARD_API_KEY.",
          code: "API_KEY_INVALID",
          fallbackUsed: false,
        }
      }

      if (error.response?.status === 402) {
        logger.error("[FortyGuard] Credits exhausted — 402 Payment Required")
        return {
          success: false,
          error: "FortyGuard API credits are exhausted. Using mock data as fallback.",
          code: "CREDITS_EXHAUSTED",
          fallbackUsed: true,
        }
      }

      if (error.response?.status === 429) {
        logger.warn("[FortyGuard] Rate limited — 429 Too Many Requests")
        return {
          success: false,
          error: "FortyGuard API rate limit reached. Retrying shortly.",
          code: "RATE_LIMITED",
          fallbackUsed: true,
        }
      }

      logger.error("[FortyGuard] API unavailable:", error.message)
      return {
        success: false,
        error: "FortyGuard API is currently unavailable. Please try again shortly.",
        code: "API_UNAVAILABLE",
        fallbackUsed: false,
      }
    }
  }

  // ── Fetch heat corridor along a route ──────────────────────

  async getHeatCorridor(
    waypoints: Array<{ lat: number; lng: number }>
  ): Promise<FortyGuardRouteWaypoint[] | FortyGuardError> {
    // 1. Mock mode
    if (env.FORTYGUARD_MOCK) {
      logger.debug("[FortyGuard] Mock mode — generating synthetic corridor")
      return {
        ...generateMockCorridor(waypoints),
        success: false,
        error: "FortyGuard API is running in mock mode. Live corridor data not available.",
        code: "MOCK_MODE",
        fallbackUsed: true,
      } as any
    }

    // 2. API key check
    if (!env.FORTYGUARD_API_KEY || env.FORTYGUARD_API_KEY.trim() === "") {
      return {
        success: false,
        error: "FortyGuard API key is not configured.",
        code: "API_KEY_MISSING",
        fallbackUsed: false,
      }
    }

    // 3. Check cache
    const cacheKey = this.corridorCacheKey(waypoints)
    try {
      const cached = await cacheService.get<FortyGuardRouteWaypoint[]>(cacheKey)
      if (cached) {
        logger.debug("[FortyGuard] Corridor cache hit")
        return cached
      }
    } catch {
      // Continue to API
    }

    // 4. Call API
    try {
      const response = await axios.post<{ waypoints: FortyGuardRouteWaypoint[] }>(
        `${this.baseURL}/heat-corridor`,
        { waypoints },
        {
          headers: {
            Authorization: `Bearer ${env.FORTYGUARD_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      )

      const data = response.data.waypoints
      await cacheService.set(cacheKey, data, env.CACHE_TTL_FORTYGUARD)
      logger.info(`[FortyGuard] Heat corridor fetched — ${data.length} waypoints`)
      return data
    } catch (err) {
      const error = err as AxiosError

      if (error.response?.status === 401) {
        return {
          success: false,
          error: "FortyGuard API key is invalid.",
          code: "API_KEY_INVALID",
          fallbackUsed: false,
        }
      }

      if (error.response?.status === 402 || error.response?.status === 429) {
        logger.warn("[FortyGuard] Corridor fallback to mock due to credits/rate limit")
        return generateMockCorridor(waypoints)
      }

      logger.error("[FortyGuard] Corridor API error:", error.message)
      return {
        success: false,
        error: "FortyGuard corridor API is currently unavailable.",
        code: "API_UNAVAILABLE",
        fallbackUsed: false,
      }
    }
  }

  // ── Get live environment data (returns reading or error) ───

  async getLiveEnvironmentData(lat: number, lng: number): Promise<FortyGuardReading | null> {
    const response = await this.getEnvironmentData(lat, lng, 200)
    if (isError(response)) {
      if (response.fallbackUsed && "temperature_2m" in response) {
        return response as unknown as FortyGuardReading
      }
      logger.warn(`[FortyGuard] Cannot get live data: ${response.error}`)
      return null
    }
    return response
  }

  // ── Health check ───────────────────────────────────────────

  async healthCheck(): Promise<{ status: string; mockMode: boolean; keyConfigured: boolean }> {
    return {
      status: env.FORTYGUARD_MOCK ? "mock" : "live",
      mockMode: env.FORTYGUARD_MOCK,
      keyConfigured: Boolean(env.FORTYGUARD_API_KEY && env.FORTYGUARD_API_KEY.trim() !== ""),
    }
  }
}

export const fortygardClient = new FortygardClient()
export { isError }
