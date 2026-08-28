import mongoose from "mongoose"
import { Asset, type IAsset } from "../assets/Asset.model.js"
import { ThermalReading, type IThermalReading } from "../assets/ThermalReading.model.js"
import { Alert, type IAlert, type AlertSeverity, type AlertType } from "./Alert.model.js"
import { socketService } from "./services/socket.service.js"
import { fortygardClient, isError } from "../integrations/services/fortygard.service.js"
import { logger } from "../../config/logger.js"

// ── Thresholds ──────────────────────────────────────────────

const WBGT_THRESHOLDS = {
  WARNING: 28.0,
  CRITICAL: 32.0,
}

const CARGO_TEMP_THRESHOLDS = {
  WARNING_OFFSET: 2, // °C above setpoint
  CRITICAL_OFFSET: 5,
}

const PEAK_DEMAND_THRESHOLDS = {
  WARNING_RATIO: 0.8, // 80% of estimated capacity
  CRITICAL_RATIO: 0.95,
}

// ── Alert Generator Service ─────────────────────────────────

export class AlertGeneratorService {
  // ── Evaluate a single asset ────────────────────────────────

  async evaluateAsset(
    asset: IAsset,
    thermalReading: IThermalReading
  ): Promise<IAlert[]> {
    const generatedAlerts: IAlert[] = []

    switch (asset.assetType) {
      case "vehicle":
        generatedAlerts.push(...(await this.evaluateVehicle(asset, thermalReading)))
        break
      case "site":
        generatedAlerts.push(...(await this.evaluateSite(asset, thermalReading)))
        break
      case "facility":
        generatedAlerts.push(...(await this.evaluateFacility(asset, thermalReading)))
        break
    }

    // Persist and broadcast each generated alert
    for (const alert of generatedAlerts) {
      const saved = await alert.save()

      // Broadcast to organization room
      socketService.emitNewAlert(alert.organization, {
        id: saved._id.toString(),
        organization: saved.organization,
        asset: saved.asset,
        assetType: saved.assetType,
        severity: saved.severity,
        alertType: saved.alertType,
        title: saved.title,
        message: saved.message,
        thermalSnapshot: saved.thermalSnapshot,
        location: saved.location,
        status: saved.status,
        createdAt: saved.createdAt,
      })

      logger.info(`Alert generated: ${saved.alertType} [${saved.severity}] for asset ${asset._id}`)
    }

    return generatedAlerts
  }

  // ── Evaluate all active assets ─────────────────────────────

  async evaluateAllAssets(): Promise<{ evaluated: number; alertsGenerated: number }> {
    const activeAssets = await Asset.find({ isActive: true }).lean()
    let totalAlerts = 0

    for (const asset of activeAssets) {
      const latestReading = await ThermalReading.findOne({ asset: asset._id })
        .sort({ timestamp: -1 })
        .lean()

      if (!latestReading) continue

      // Hydrate the asset for the evaluation
      const hydratedAsset = await Asset.findById(asset._id)
      if (!hydratedAsset) continue

      const alerts = await this.evaluateAsset(hydratedAsset, latestReading as unknown as IThermalReading)
      totalAlerts += alerts.length
    }

    // Emit system stats
    const activeAlertCount = await Alert.countDocuments({ status: "pending" })
    const assetsAtRisk = await Asset.countDocuments({
      isActive: true,
      "vehicleData.currentStatus.engineStatus": "on",
    })

    socketService.emitSystemStats({ activeAlerts: activeAlertCount, assetsAtRisk })

    return { evaluated: activeAssets.length, alertsGenerated: totalAlerts }
  }

  // ── Evaluate with live FortyGuard data ───────────────────────
  // Fetches real-time env data from FortyGuard for a specific asset
  // and evaluates it against thresholds immediately.

  async evaluateAssetWithLiveFortyGuard(
    assetId: mongoose.Types.ObjectId
  ): Promise<{ alerts: IAlert[]; fortyGuardError?: string }> {
    const asset = await Asset.findById(assetId)
    if (!asset) {
      return { alerts: [], fortyGuardError: "Asset not found" }
    }

    // Get coordinates from asset
    let lat = 0
    let lng = 0

    if (asset.assetType === "vehicle") {
      const vd = asset.vehicleData as unknown as Record<string, unknown> | undefined
      const status = vd?.currentStatus as Record<string, unknown> | undefined
      const loc = status?.location as Record<string, unknown> | undefined
      lat = (loc?.lat as number) ?? 0
      lng = (loc?.lng as number) ?? 0
    } else if (asset.assetType === "site") {
      const sd = asset.siteData as unknown as Record<string, unknown> | undefined
      const coords = sd?.coordinates as Record<string, unknown> | undefined
      lat = (coords?.lat as number) ?? 0
      lng = (coords?.lng as number) ?? 0
    }

    if (lat === 0 && lng === 0) {
      return { alerts: [], fortyGuardError: "No coordinates available for this asset" }
    }

    // Fetch live FortyGuard data
    const envData = await fortygardClient.getEnvironmentData(lat, lng, 500)

    if (isError(envData)) {
      logger.warn(
        `[AlertGenerator] FortyGuard error for asset ${(asset as any)._id}: [${envData.code}] ${envData.error}`
      )
      return { alerts: [], fortyGuardError: envData.error }
    }

    // Create a synthetic thermal reading from live data
    const syntheticReading = {
      asset: asset._id,
      timestamp: new Date(),
      metrics: {
        wbgt: null, // Will be calculated by thermal engine
        ambientTemp: envData.temperature_2m,
        externalTemp: envData.temperature_2m,
      },
      source: "fortygard",
    } as unknown as IThermalReading

    // Evaluate the asset with live data
    const alerts = await this.evaluateAsset(asset, syntheticReading)

    return { alerts }
  }

  // ── Bulk evaluate all assets with live FortyGuard data ────────

  async evaluateAllWithLiveFortyGuard(): Promise<{
    evaluated: number
    alertsGenerated: number
    fortyGuardErrors: number
  }> {
    const activeAssets = await Asset.find({ isActive: true }).lean()
    let totalAlerts = 0
    let fortyGuardErrors = 0

    for (const asset of activeAssets) {
      try {
        const result = await this.evaluateAssetWithLiveFortyGuard(asset._id)
        totalAlerts += result.alerts.length
        if (result.fortyGuardError) fortyGuardErrors++
      } catch (err) {
        logger.error(`[AlertGenerator] Error evaluating asset ${asset._id} with live data:`, err)
        fortyGuardErrors++
      }
    }

    return {
      evaluated: activeAssets.length,
      alertsGenerated: totalAlerts,
      fortyGuardErrors,
    }
  }

  // ── Vehicle evaluation ─────────────────────────────────────

  private async evaluateVehicle(
    asset: IAsset,
    reading: IThermalReading
  ): Promise<IAlert[]> {
    const alerts: IAlert[] = []
    const vd = asset.vehicleData as unknown as Record<string, unknown> | undefined
    if (!vd) return alerts

    const internalTemp = (vd.currentStatus as Record<string, unknown>)?.internalTemp as number | undefined
    const cargo = vd.cargo as Record<string, unknown> | undefined
    const setpointTemp = (cargo?.setpointTemp as number) ?? -20
    const toleranceBand = (cargo?.toleranceBand as number) ?? 2

    // Check internal temp vs setpoint
    if (internalTemp !== undefined && internalTemp > setpointTemp + toleranceBand) {
      const offset = internalTemp - setpointTemp
      const severity: AlertSeverity = offset >= CARGO_TEMP_THRESHOLDS.CRITICAL_OFFSET ? "critical" : "warning"

      const location = (vd.currentStatus as Record<string, unknown>)?.location as Record<string, unknown> | undefined

      alerts.push(
        await this.createAlert({
          organization: asset.organization,
          asset: asset._id,
          assetType: "vehicle",
          severity,
          alertType: "cargo_at_risk",
          title: `Cargo temperature at risk — ${vd.vehicleId as string}`,
          message: `Internal temp ${internalTemp}°C exceeds setpoint ${setpointTemp}°C by ${offset.toFixed(1)}°C. Tolerance band: ±${toleranceBand}°C.`,
          thermalSnapshot: {
            wbgt: reading.metrics.wbgt,
            ambientTemp: reading.metrics.ambientTemp ?? reading.metrics.externalTemp ?? 0,
            internalTemp,
          },
          location: {
            lat: (location?.lat as number) ?? 0,
            lng: (location?.lng as number) ?? 0,
            address: `Route ${(vd.currentRoute as Record<string, unknown>)?.destination as string ?? "Unknown"}`,
          },
        })
      )
    }

    // Check WBGT for driver safety
    if (reading.metrics.wbgt !== undefined && reading.metrics.wbgt >= WBGT_THRESHOLDS.WARNING) {
      const severity: AlertSeverity = reading.metrics.wbgt >= WBGT_THRESHOLDS.CRITICAL ? "critical" : "warning"
      const location = (vd.currentStatus as Record<string, unknown>)?.location as Record<string, unknown> | undefined

      alerts.push(
        await this.createAlert({
          organization: asset.organization,
          asset: asset._id,
          assetType: "vehicle",
          severity,
          alertType: "wbgt_breach",
          title: `WBGT threshold exceeded — ${vd.vehicleId as string}`,
          message: `WBGT at ${reading.metrics.wbgt}°C. ${severity === "critical" ? "OSHA action level breached. Mandatory rest enforcement required." : "Monitor conditions. Increase hydration."}`,
          thermalSnapshot: {
            wbgt: reading.metrics.wbgt,
            ambientTemp: reading.metrics.ambientTemp ?? reading.metrics.externalTemp ?? 0,
            internalTemp,
          },
          location: {
            lat: (location?.lat as number) ?? 0,
            lng: (location?.lng as number) ?? 0,
            address: `Route ${(vd.currentRoute as Record<string, unknown>)?.destination as string ?? "Unknown"}`,
          },
        })
      )
    }

    return alerts
  }

  // ── Site evaluation ────────────────────────────────────────

  private async evaluateSite(
    asset: IAsset,
    reading: IThermalReading
  ): Promise<IAlert[]> {
    const alerts: IAlert[] = []
    const sd = asset.siteData as unknown as Record<string, unknown> | undefined
    if (!sd) return alerts

    const wbgt = reading.metrics.wbgt
    const coords = sd.coordinates as Record<string, unknown> | undefined

    if (wbgt !== undefined && wbgt >= WBGT_THRESHOLDS.WARNING) {
      const severity: AlertSeverity = wbgt >= WBGT_THRESHOLDS.CRITICAL ? "critical" : "warning"
      const workerCount = (sd.workerCount as number) ?? 0

      alerts.push(
        await this.createAlert({
          organization: asset.organization,
          asset: asset._id,
          assetType: "site",
          severity,
          alertType: "wbgt_breach",
          title: `WBGT breach at ${sd.siteName as string}`,
          message: `WBGT at ${wbgt}°C across ${workerCount} workers. ${severity === "critical" ? "OSHA breach. Mandatory rest enforcement." : "Rotate crews. Enforce hydration breaks."}`,
          thermalSnapshot: {
            wbgt,
            ambientTemp: reading.metrics.ambientTemp ?? reading.metrics.externalTemp ?? 0,
          },
          location: {
            lat: (coords?.lat as number) ?? 0,
            lng: (coords?.lng as number) ?? 0,
            address: (sd.address as string) ?? "Unknown",
          },
        })
      )

      // Generate OSHA log filed alert for critical
      if (severity === "critical") {
        alerts.push(
          await this.createAlert({
            organization: asset.organization,
            asset: asset._id,
            assetType: "site",
            severity: "info",
            alertType: "osha_log_filed",
            title: `OSHA compliance log auto-generated — ${sd.siteName as string}`,
            message: `WBGT breach at ${wbgt}°C triggered automatic OSHA compliance logging. Logged to ${(sd.compliancePlatform as string) ?? "Procore"}.`,
            thermalSnapshot: {
              wbgt,
              ambientTemp: reading.metrics.ambientTemp ?? reading.metrics.externalTemp ?? 0,
            },
            location: {
              lat: (coords?.lat as number) ?? 0,
              lng: (coords?.lng as number) ?? 0,
              address: (sd.address as string) ?? "Unknown",
            },
          })
        )
      }
    }

    return alerts
  }

  // ── Facility evaluation ────────────────────────────────────

  private async evaluateFacility(
    asset: IAsset,
    reading: IThermalReading
  ): Promise<IAlert[]> {
    const alerts: IAlert[] = []
    const fd = asset.facilityData as unknown as Record<string, unknown> | undefined
    if (!fd) return alerts

    const currentStatus = fd.currentStatus as Record<string, unknown> | undefined
    const currentLoad = (currentStatus?.currentLoad as number) ?? 0
    const utility = fd.utilityAccount as Record<string, unknown> | undefined
    const peakWindow = utility?.peakTariffWindow as Record<string, unknown> | undefined

    // Check peak demand risk
    if (currentLoad > 0 && peakWindow) {
      const estimatedCapacity = currentLoad * 1.3 // rough capacity estimate
      const loadRatio = currentLoad / estimatedCapacity

      if (loadRatio >= PEAK_DEMAND_THRESHOLDS.WARNING_RATIO) {
        const severity: AlertSeverity = loadRatio >= PEAK_DEMAND_THRESHOLDS.CRITICAL_RATIO ? "critical" : "warning"

        alerts.push(
          await this.createAlert({
            organization: asset.organization,
            asset: asset._id,
            assetType: "facility",
            severity,
            alertType: "peak_demand",
            title: `Peak demand risk — ${fd.facilityName as string}`,
            message: `Current load ${currentLoad} kW at ${(loadRatio * 100).toFixed(0)}% of estimated capacity. Peak window ${peakWindow.start as string}-${peakWindow.end as string}. ${severity === "critical" ? "Immediate load shedding required." : "Consider pre-cooling."}`,
            thermalSnapshot: {
              ambientTemp: reading.metrics.ambientTemp ?? reading.metrics.externalTemp ?? 0,
              peakLoad: currentLoad,
            },
            location: {
              lat: 0,
              lng: 0,
              address: (fd.address as string) ?? "Unknown",
            },
          })
        )
      }
    }

    return alerts
  }

  // ── Create alert ───────────────────────────────────────────

  private async createAlert(data: {
    organization: string
    asset: mongoose.Types.ObjectId
    assetType: string
    severity: AlertSeverity
    alertType: AlertType
    title: string
    message: string
    thermalSnapshot: { wbgt?: number; ambientTemp: number; internalTemp?: number; peakLoad?: number }
    location: { lat: number; lng: number; address: string }
  }): Promise<IAlert> {
    return Alert.create({
      ...data,
      status: "pending",
      actions: [],
    })
  }
}

export const alertGenerator = new AlertGeneratorService()
