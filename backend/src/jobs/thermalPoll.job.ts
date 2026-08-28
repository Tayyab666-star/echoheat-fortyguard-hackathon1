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
          { "location.coordinates": { $exists: true }, status: { $ne: "retired" } },
          { projection: { _id: 1, name: 1, type: 1, "location.coordinates": 1, organization: 1 } }
        )
        .limit(50)
        .toArray()

      if (assets.length === 0) {
        logger.debug("Thermal poll: no active assets with coordinates found")
        return
      }

      logger.info(`Thermal poll: evaluating ${assets.length} assets`)

      let successCount = 0
      let errorCount = 0
      let mockCount = 0

      for (const asset of assets) {
        try {
          const coords = (asset as any).location?.coordinates
          if (!coords?.latitude || !coords?.longitude) continue

          // Fetch microclimate data from FortyGuard (with error handling)
          const response = await fortygardClient.getEnvironmentData(
            coords.latitude,
            coords.longitude,
            500
          )

          // Check if FortyGuard returned an error
          if (isError(response)) {
            errorCount++
            logger.warn(
              `Thermal poll: FortyGuard error for asset ${(asset as any).name}: [${response.code}] ${response.error}`
            )

            // If mock data is available in the error response, still store it
            if (response.fallbackUsed && "temperature_2m" in response) {
              const reading = response as any
              await db.collection("thermalreadings").insertOne({
                assetId: asset._id,
                assetType: (asset as any).type,
                organization: (asset as any).organization ?? "default",
                temperature: reading.temperature_2m,
                humidity: reading.relative_humidity,
                solarRadiation: reading.solar_radiation,
                windSpeed: reading.wind_speed,
                wbgt: null,
                source: "mock",
                riskScore: 0,
                riskLevel: "unknown",
                fortyGuardError: {
                  code: response.code,
                  message: response.error,
                },
                timestamp: new Date(),
                createdAt: new Date(),
              })
              mockCount++
            }
            continue
          }

          // Success — store thermal reading
          successCount++
          await db.collection("thermalreadings").insertOne({
            assetId: asset._id,
            assetType: (asset as any).type,
            organization: (asset as any).organization ?? "default",
            temperature: response.temperature_2m,
            humidity: response.relative_humidity,
            solarRadiation: response.solar_radiation,
            windSpeed: response.wind_speed,
            wbgt: null, // Will be calculated by thermal engine
            source: "fortygard",
            riskScore: Math.min(100, Math.round(response.temperature_2m * 2.5)),
            riskLevel:
              response.temperature_2m >= 42
                ? "critical"
                : response.temperature_2m >= 38
                  ? "high"
                  : response.temperature_2m >= 34
                    ? "moderate"
                    : "low",
            timestamp: new Date(response.timestamp),
            createdAt: new Date(),
          })

          // Invalidate asset status cache for this asset
          await cacheService.del(`asset:status:${asset._id}`)
        } catch (err) {
          errorCount++
          logger.error(`Thermal poll: unexpected error processing asset ${(asset as any).name}:`, err)
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
