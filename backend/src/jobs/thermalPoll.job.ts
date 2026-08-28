import cron from "node-cron"
import mongoose from "mongoose"
import { logger } from "../config/logger.js"
import { fortygardClient, isError } from "../modules/integrations/services/fortygard.service.js"
import { cacheService } from "../utils/cache.service.js"

// ── Thermal Poll Job ────────────────────────────────────────
// Runs every 5 minutes to:
// 1. Fetch FortyGuard microclimate data for active sites/facilities
// 2. Run thermal lag / WBGT calculations
// 3. Generate alerts when thresholds are exceeded
// If FortyGuard API fails, logs the error and skips that asset
// (never crashes the cron cycle)

export function startThermalPollJob(): cron.ScheduledTask {
  const task = cron.schedule("*/5 * * * *", async () => {
    try {
      const db = mongoose.connection.db
      if (!db) {
        logger.warn("Thermal poll: DB not connected, skipping")
        return
      }

      // Fetch active assets with coordinates
      const assets = await db
        .collection("assets")
        .find(
          { isActive: true },
          { projection: { _id: 1, assetType: 1, organization: 1, vehicleData: 1, siteData: 1 } }
        )
        .limit(50)
        .toArray()

      if (assets.length === 0) {
        logger.debug("Thermal poll: no active assets found")
        return
      }

      logger.info(`Thermal poll: evaluating ${assets.length} assets`)

      let successCount = 0
      let errorCount = 0
      let mockCount = 0

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

          // Fetch microclimate data from FortyGuard (with error handling)
          const response = await fortygardClient.getEnvironmentData(lat, lng, 500)

          // Check if FortyGuard returned an error
          if (isError(response)) {
            errorCount++
            logger.warn(
              `Thermal poll: FortyGuard error for asset ${(asset as any)._id}: [${response.code}] ${response.error}`
            )

            // If mock data is available in the error response, still store it
            if (response.fallbackUsed && "temperature_2m" in response) {
              const reading = response as any
              await db.collection("thermalreadings").insertOne({
                asset: asset._id,
                timestamp: new Date(),
                source: "mock",
                metrics: {
                  ambientTemp: reading.temperature_2m,
                  humidity: reading.relative_humidity,
                  windSpeed: reading.wind_speed,
                },
                riskScore: 0,
                riskLevel: "low",
                createdAt: new Date(),
                updatedAt: new Date(),
              })
              mockCount++
            }
            continue
          }

          // Success — store thermal reading
          successCount++
          await db.collection("thermalreadings").insertOne({
            asset: asset._id,
            timestamp: new Date(response.timestamp),
            source: "sensor",
            metrics: {
              ambientTemp: response.temperature_2m,
              humidity: response.relative_humidity,
              windSpeed: response.wind_speed,
            },
            riskScore: Math.min(100, Math.round(response.temperature_2m * 2.5)),
            riskLevel:
              response.temperature_2m >= 42
                ? "extreme"
                : response.temperature_2m >= 38
                  ? "high"
                  : response.temperature_2m >= 34
                    ? "moderate"
                    : "low",
            createdAt: new Date(),
            updatedAt: new Date(),
          })

          // Invalidate asset status cache for this asset
          await cacheService.del(`asset:status:${asset._id}`)
        } catch (err) {
          errorCount++
          logger.error(`Thermal poll: unexpected error processing asset ${(asset as any)._id}:`, err)
        }
      }

      logger.info(
        `Thermal poll cycle completed — ${successCount} live, ${mockCount} mock, ${errorCount} errors out of ${assets.length} assets`
      )
    } catch (error) {
      logger.error("Thermal poll job error:", error)
    }
  })

  logger.info("Thermal poll job started (every 5 minutes)")
  return task
}
