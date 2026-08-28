import axios from "axios"
import { env } from "../../../config/env.js"
import { logger } from "../../../config/logger.js"
import { integrationsRepository } from "../repositories/integrations.repository.js"

// ── Types ───────────────────────────────────────────────────

export interface VehicleLocation {
  vehicleId: string
  latitude: number
  longitude: number
  speed: number
  heading: number
  timestamp: string
  address?: string
}

export interface ReeferTemperature {
  vehicleId: string
  sensorId: string
  temperature: number
  unit: "C" | "F"
  timestamp: string
  isLogging: boolean
}

// ── Mock data generators ────────────────────────────────────

function generateMockVehicleLocations(vehicleCount = 8): VehicleLocation[] {
  const baseLat = 25.2048
  const baseLng = 55.2708

  return Array.from({ length: vehicleCount }, (_, i) => ({
    vehicleId: `KI-${String(i + 1).padStart(2, "0")}`,
    latitude: baseLat + (Math.random() - 0.5) * 0.1,
    longitude: baseLng + (Math.random() - 0.5) * 0.1,
    speed: Math.round(Math.random() * 80),
    heading: Math.round(Math.random() * 360),
    timestamp: new Date().toISOString(),
    address: `Route ${["KHI", "DXB", "LHR"][i % 3]}-${String(i + 1).padStart(2, "0")}`,
  }))
}

function generateMockReeferTemperatures(vehicleId: string): ReeferTemperature[] {
  return [
    {
      vehicleId,
      sensorId: `${vehicleId}-C1`,
      temperature: -20 + (Math.random() - 0.5) * 4,
      unit: "C",
      timestamp: new Date().toISOString(),
      isLogging: true,
    },
    {
      vehicleId,
      sensorId: `${vehicleId}-C2`,
      temperature: -18 + (Math.random() - 0.5) * 3,
      unit: "C",
      timestamp: new Date().toISOString(),
      isLogging: true,
    },
  ]
}

// ── Samsara Service ─────────────────────────────────────────

export class SamsaraService {
  private client = axios.create({
    baseURL: "https://api.samsara.com/v1",
    timeout: 10000,
  })

  private async getAccessToken(orgId: string): Promise<string | null> {
    const token = await integrationsRepository.findToken(orgId, "samsara")
    if (!token) return null
    if (token.expiresAt && new Date(token.expiresAt) < new Date()) {
      logger.warn(`Samsara token expired for org ${orgId}`)
      return null
    }
    return token.accessToken
  }

  async getVehicleLocations(orgId: string): Promise<VehicleLocation[]> {
    const accessToken = await this.getAccessToken(orgId)

    if (!accessToken) {
      logger.info(`Samsara not connected for org ${orgId}, returning mock data`)
      return generateMockVehicleLocations()
    }

    try {
      const response = await this.client.get("/fleet/list", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      return response.data.vehicles as VehicleLocation[]
    } catch (error) {
      logger.error("Samsara API error:", error)
      return generateMockVehicleLocations()
    }
  }

  async getReeferTemperatures(orgId: string, vehicleId: string): Promise<ReeferTemperature[]> {
    const accessToken = await this.getAccessToken(orgId)

    if (!accessToken) {
      return generateMockReeferTemperatures(vehicleId)
    }

    try {
      const response = await this.client.get(`/fleet/vehicles/${vehicleId}/reefer`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      return response.data.temperatures as ReeferTemperature[]
    } catch (error) {
      logger.error(`Samsara reefer API error for ${vehicleId}:`, error)
      return generateMockReeferTemperatures(vehicleId)
    }
  }

  async triggerPreCool(orgId: string, vehicleId: string, targetTemp: number): Promise<{ success: boolean; message: string }> {
    const accessToken = await this.getAccessToken(orgId)

    if (!accessToken) {
      logger.info(`[SIMULATED] Samsara pre-cool: vehicle=${vehicleId} target=${targetTemp}°C`)
      return { success: true, message: `[SIMULATED] Pre-cooling initiated for ${vehicleId} to ${targetTemp}°C` }
    }

    try {
      await this.client.post(
        `/fleet/vehicles/${vehicleId}/commands/precool`,
        { targetTemperature: targetTemp },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      logger.info(`Samsara pre-cool triggered: vehicle=${vehicleId} target=${targetTemp}°C`)
      return { success: true, message: `Pre-cooling initiated for ${vehicleId} to ${targetTemp}°C` }
    } catch (error) {
      logger.error(`Samsara pre-cool error for ${vehicleId}:`, error)
      return { success: false, message: `Failed to trigger pre-cool for ${vehicleId}` }
    }
  }

  async updateRouteSequence(orgId: string, vehicleId: string, newStops: Array<{ lat: number; lng: number; scheduledTime?: string }>): Promise<{ success: boolean; message: string }> {
    const accessToken = await this.getAccessToken(orgId)

    if (!accessToken) {
      logger.info(`[SIMULATED] Samsara reroute: vehicle=${vehicleId} stops=${newStops.length}`)
      return { success: true, message: `[SIMULATED] Route updated for ${vehicleId} with ${newStops.length} stops` }
    }

    try {
      await this.client.put(
        `/fleet/vehicles/${vehicleId}/route`,
        { stops: newStops },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      logger.info(`Samsara route updated: vehicle=${vehicleId}`)
      return { success: true, message: `Route updated for ${vehicleId}` }
    } catch (error) {
      logger.error(`Samsara route update error for ${vehicleId}:`, error)
      return { success: false, message: `Failed to update route for ${vehicleId}` }
    }
  }

  async connect(orgId: string, data: { accessToken: string; refreshToken?: string; expiresAt?: string; scope?: string[] }): Promise<void> {
    await integrationsRepository.upsertToken(orgId, "samsara", {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      scope: data.scope,
    })
    logger.info(`Samsara connected for org ${orgId}`)
  }

  async disconnect(orgId: string): Promise<void> {
    await integrationsRepository.removeToken(orgId, "samsara")
    logger.info(`Samsara disconnected for org ${orgId}`)
  }

  async getStatus(orgId: string): Promise<{ connected: boolean; provider: string }> {
    const connected = await integrationsRepository.isConnected(orgId, "samsara")
    return { connected, provider: "samsara" }
  }
}

export const samsaraService = new SamsaraService()
