import { type Request, type Response } from "express"
import { sendSuccess, sendError } from "../../utils/response.js"
import { fortygardClient, isError } from "./services/fortygard.service.js"
import { samsaraService } from "./services/samsara.service.js"
import { procoreService } from "./services/procore.service.js"
import { fortygardSnapshotSchema, fortygardCorridorSchema, samsaraConnectSchema, procoreConnectSchema } from "./validators.js"
import { validate } from "../../utils/validators.js"
import { logger } from "../../config/logger.js"

// ── FortyGuard ──────────────────────────────────────────────

export async function getFortygardSnapshot(req: Request, res: Response): Promise<void> {
  try {
    const { lat, lng, radiusMeters } = validate(fortygardSnapshotSchema, req.query)
    const result = await fortygardClient.getEnvironmentData(lat, lng, radiusMeters)

    if (isError(result)) {
      // FortyGuard returned a typed error — forward it clearly
      const statusCode =
        result.code === "API_KEY_MISSING" || result.code === "API_KEY_INVALID"
          ? 503
          : result.code === "CREDITS_EXHAUSTED" || result.code === "RATE_LIMITED"
            ? 429
            : 502

      sendError(res, result.error, statusCode, {
        fortyGuardCode: [result.code],
        fallbackUsed: [String(result.fallbackUsed)],
      })
      return
    }

    sendSuccess(res, { snapshot: result })
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      sendError(res, (error as any).errors ?? error.message, (error as any).statusCode)
    } else {
      logger.error("Fortygard snapshot error:", error)
      sendError(res, "Failed to fetch microclimate data", 500)
    }
  }
}

export async function getFortygardCorridor(req: Request, res: Response): Promise<void> {
  try {
    const { waypoints } = validate(fortygardCorridorSchema, req.body)
    const result = await fortygardClient.getHeatCorridor(waypoints)

    if (isError(result)) {
      const statusCode =
        result.code === "API_KEY_MISSING" || result.code === "API_KEY_INVALID"
          ? 503
          : result.code === "CREDITS_EXHAUSTED" || result.code === "RATE_LIMITED"
            ? 429
            : 502

      sendError(res, result.error, statusCode, {
        fortyGuardCode: [result.code],
        fallbackUsed: [String(result.fallbackUsed)],
      })
      return
    }

    sendSuccess(res, { corridor: result, count: result.length })
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      sendError(res, (error as any).errors ?? error.message, (error as any).statusCode)
    } else {
      logger.error("Fortygard corridor error:", error)
      sendError(res, "Failed to fetch heat corridor", 500)
    }
  }
}

// ── Samsara ─────────────────────────────────────────────────

export async function connectSamsara(req: Request, res: Response): Promise<void> {
  try {
    const data = validate(samsaraConnectSchema, req.body)
    const orgId = (req as any).user.organization as string
    await samsaraService.connect(orgId, data)
    sendSuccess(res, { message: "Samsara connected successfully" })
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      sendError(res, (error as any).errors ?? error.message, (error as any).statusCode)
    } else {
      logger.error("Samsara connect error:", error)
      sendError(res, "Failed to connect Samsara", 500)
    }
  }
}

export async function disconnectSamsara(req: Request, res: Response): Promise<void> {
  try {
    const orgId = (req as any).user.organization as string
    await samsaraService.disconnect(orgId)
    sendSuccess(res, { message: "Samsara disconnected" })
  } catch (error) {
    logger.error("Samsara disconnect error:", error)
    sendError(res, "Failed to disconnect Samsara", 500)
  }
}

export async function syncSamsaraData(req: Request, res: Response): Promise<void> {
  try {
    const orgId = (req as any).user.organization as string
    const locations = await samsaraService.getVehicleLocations(orgId)
    sendSuccess(res, { locations, count: locations.length })
  } catch (error) {
    logger.error("Samsara sync error:", error)
    sendError(res, "Failed to sync Samsara data", 500)
  }
}

export async function getSamsaraStatus(req: Request, res: Response): Promise<void> {
  try {
    const orgId = (req as any).user.organization as string
    const status = await samsaraService.getStatus(orgId)
    sendSuccess(res, { status })
  } catch (error) {
    logger.error("Samsara status error:", error)
    sendError(res, "Failed to check Samsara status", 500)
  }
}

// ── Procore ─────────────────────────────────────────────────

export async function connectProcore(req: Request, res: Response): Promise<void> {
  try {
    const orgId = (req as any).user.organization as string
    const authUrl = procoreService.getAuthUrl(orgId)
    sendSuccess(res, { authUrl })
  } catch (error) {
    logger.error("Procore connect error:", error)
    sendError(res, "Failed to generate Procore auth URL", 500)
  }
}

export async function handleProcoreCallback(req: Request, res: Response): Promise<void> {
  try {
    const { code } = validate(procoreConnectSchema, req.query)
    const orgId = (req as any).user.organization as string
    await procoreService.handleCallback(orgId, code)
    sendSuccess(res, { message: "Procore connected successfully" })
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      sendError(res, (error as any).errors ?? error.message, (error as any).statusCode)
    } else {
      logger.error("Procore callback error:", error)
      sendError(res, "Failed to connect Procore", 500)
    }
  }
}

export async function getProcoreStatus(req: Request, res: Response): Promise<void> {
  try {
    const orgId = (req as any).user.organization as string
    const status = await procoreService.getStatus(orgId)
    sendSuccess(res, { status })
  } catch (error) {
    logger.error("Procore status error:", error)
    sendError(res, "Failed to check Procore status", 500)
  }
}
