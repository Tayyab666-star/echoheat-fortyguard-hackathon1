import mongoose from "mongoose"
import { logger } from "../config/logger.js"
import { fortygardClient, isError } from "../modules/integrations/services/fortygard.service.js"
import { getCacheStats, resetCacheStats } from "./cache.service.js"
import { env } from "../config/env.js"

// ── Cache Warming ────────────────────────────────────────────
// Pre-fetch FortyGuard data for all active assets on startup
// and log cache hit rate every 30 minutes.

export async function warmFortyGuardCache(): Promise<void> {
  try {
    const db = mongoose.connection.db
    if (!db) {
      logger.warn("Cache warming: DB not connected, skipping")
      return
    }

    const assets = await db
      .collection("assets")
      .find(
        { isActive: true },
        { projection: { _id: 1, assetType: 1, vehicleData: 1, siteData: 1 } }
      )
      .limit(50)
      .toArray()

    if (assets.length === 0) {
      logger.info("Cache warming: no active assets found")
      return
    }

    logger.info(`Cache warming: pre-fetching FortyGuard data for ${assets.length} assets`)

    let warmed = 0
    let errors = 0
    for (const asset of assets) {
      try {
        // Extract coordinates based on asset type
        let lat = 0
        let lng = 0
        const assetType = (asset as any).assetType
        const vd = (asset as any).vehicleData
        const sd = (asset as any).siteData

        if (assetType === "vehicle" && vd?.currentStatus?.location) {
          lat = vd.currentStatus.location.lat ?? 0
          lng = vd.currentStatus.location.lng ?? 0
        } else if (assetType === "site" && sd?.coordinates) {
          lat = sd.coordinates.lat ?? 0
          lng = sd.coordinates.lng ?? 0
        }

        if (lat === 0 && lng === 0) continue

        const result = await fortygardClient.getEnvironmentData(lat, lng, 500)
        if (isError(result)) {
          errors++
          logger.debug(`Cache warming: FortyGuard error for ${(asset as any)._id}: [${result.code}]`)
        } else {
          warmed++
        }
      } catch (err) {
        errors++
        logger.debug(`Cache warming: failed for asset ${(asset as any)._id}:`, err)
      }
    }

    logger.info(`Cache warming: completed — ${warmed} warmed, ${errors} errors out of ${assets.length} assets`)
  } catch (err) {
    logger.error("Cache warming error:", err)
  }
}

// ── Cache Hit Rate Logger ────────────────────────────────────
// Logs cache metrics every 30 minutes for monitoring.

export function startCacheMetricsLogger(): NodeJS.Timeout {
  return setInterval(() => {
    const stats = getCacheStats()
    logger.info("Cache metrics", {
      hits: stats.hits,
      misses: stats.misses,
      hitRate: `${stats.hitRate}%`,
    })
    resetCacheStats()
  }, 30 * 60 * 1000) // every 30 minutes
}

// ── Startup Orchestrator ─────────────────────────────────────
// Called from app.ts after server starts listening.

export async function initializeCache(): Promise<void> {
  if (!env.CACHE_WARM_ON_START) {
    logger.info("Cache warming disabled via CACHE_WARM_ON_START=false")
    return
  }

  await warmFortyGuardCache()
  startCacheMetricsLogger()
}
