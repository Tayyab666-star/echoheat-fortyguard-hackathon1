import type { Request, Response } from "express"
import { thermalEngine } from "../services/thermalEngine.service.js"
import { sendSuccess, sendError } from "../../../utils/response.js"
import { asyncCatch } from "../../../utils/asyncCatch.js"
import { validate } from "../../../utils/validators.js"
import { fortygardClient, isError } from "../../integrations/services/fortygard.service.js"
import { logger } from "../../../config/logger.js"
import {
  wbgtParamsSchema,
  thermalLagParamsSchema,
  cargoDecayParamsSchema,
  peakDemandParamsSchema,
  roiParamsSchema,
} from "../validators.js"

// ── On-demand WBGT calculation (manual params) ───────────────

export const calculateWBGT = asyncCatch(async (req: Request, res: Response) => {
  const params = validate(wbgtParamsSchema, req.body)
  const result = thermalEngine.calculateWBGT(params)
  sendSuccess(res, result, "WBGT calculated successfully")
})

// ── Live WBGT from FortyGuard coordinates ────────────────────
// POST /api/v1/thermal-engine/wbgt/live
// Fetches real-time env data from FortyGuard, then calculates WBGT

export const calculateLiveWBGT = asyncCatch(async (req: Request, res: Response) => {
  const { lat, lng } = req.body as { lat?: number; lng?: number }

  if (lat === undefined || lng === undefined) {
    sendError(res, "lat and lng are required in request body", 400)
    return
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    sendError(res, "Invalid coordinates: lat must be -90..90, lng must be -180..180", 400)
    return
  }

  // Fetch live environment data from FortyGuard
  const envData = await fortygardClient.getEnvironmentData(lat, lng, 500)

  if (isError(envData)) {
    // FortyGuard returned an error — return it clearly
    logger.warn(`[Live WBGT] FortyGuard error: [${envData.code}] ${envData.error}`)
    sendError(
      res,
      `FortyGuard API error: ${envData.error}`,
      envData.code === "API_KEY_MISSING" || envData.code === "API_KEY_INVALID" ? 503 : 502,
      {
        fortyGuardCode: [envData.code],
        fallbackUsed: [String(envData.fallbackUsed)],
      }
    )
    return
  }

  // Calculate WBGT using live FortyGuard data
  const wbgtResult = thermalEngine.calculateWBGT({
    dryBulbTemp: envData.temperature_2m,
    relativeHumidity: envData.relative_humidity,
    solarRadiation: envData.solar_radiation,
    windSpeed: envData.wind_speed,
  })

  sendSuccess(
    res,
    {
      ...wbgtResult,
      source: "fortygard",
      location: envData.location,
      timestamp: envData.timestamp,
      rawEnvironment: {
        temperature_2m: envData.temperature_2m,
        relative_humidity: envData.relative_humidity,
        solar_radiation: envData.solar_radiation,
        wind_speed: envData.wind_speed,
        apparent_temperature: envData.apparent_temperature,
      },
    },
    "Live WBGT calculated from FortyGuard data"
  )
})

export const calculateThermalLag = asyncCatch(async (req: Request, res: Response) => {
  const params = validate(thermalLagParamsSchema, req.body)
  const result = thermalEngine.calculateThermalLag(params)
  sendSuccess(res, result, "Thermal lag calculated successfully")
})

export const calculateCargoDecay = asyncCatch(async (req: Request, res: Response) => {
  const params = validate(cargoDecayParamsSchema, req.body)
  const result = thermalEngine.calculateCargoDecay(params)
  sendSuccess(res, result, "Cargo decay projection calculated successfully")
})

export const calculatePeakDemand = asyncCatch(async (req: Request, res: Response) => {
  const params = validate(peakDemandParamsSchema, req.body)
  const result = thermalEngine.calculatePeakDemandRisk(params)
  sendSuccess(res, result, "Peak demand risk calculated successfully")
})

export const getROI = asyncCatch(async (req: Request, res: Response) => {
  const params = validate(roiParamsSchema, {
    assetId: req.params.assetId as string,
    period: (req.query.period as string) ?? "30d",
  })
  const result = await thermalEngine.calculateROI(params)
  sendSuccess(res, result, "ROI summary calculated successfully")
})
