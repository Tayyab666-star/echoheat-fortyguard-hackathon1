import mongoose from "mongoose"
import { ThermalReading } from "../../assets/ThermalReading.model.js"
import { Alert } from "../../alerts/Alert.model.js"
import { AppError } from "../../../utils/AppError.js"
import { logger } from "../../../config/logger.js"
import type {
  WbgtParamsInput,
  ThermalLagParamsInput,
  CargoDecayParamsInput,
  PeakDemandParamsInput,
  RoiParamsInput,
} from "../validators.js"
import thresholds from "../../../data/thresholds.json"

// ── Constants ───────────────────────────────────────────────

const SPECIFIC_HEAT_CONCRETE = 0.88 // kJ/(kg·K)
const STEFAN_BOLTZMANN = 5.67e-8 // W/(m²·K⁴)
const Q10_PERISHABLE = 2.0 // Q10 coefficient for perishable goods

// ── Data Analyst Thresholds ─────────────────────────────────
// Imported from data-analyst-work/data/processed/correlation_results.csv
// These thresholds are used for alert generation based on correlation analysis

// ── Types ───────────────────────────────────────────────────

export interface WBGTResult {
  wbgt: number
  heatStressCategory: string
  requiredWorkRestRatio: string
  riskLevel: "minimal" | "low" | "moderate" | "high" | "extreme"
  riskScore: number
  oshaRecommendation: string
  inputs: {
    dryBulbTemp: number
    wetBulbTemp: number
    globeTemp: number
    relativeHumidity: number
    solarRadiation: number
    windSpeed: number
  }
  correlationThresholds: {
    workerIncidentThreshold: number
    deliveryDelayThreshold: number
    coolingLoadThreshold: number
  }
}

export interface ThermalLagResult {
  lagMinutes: number
  lagHours: number
  preCoolStartTime: Date
  recommendedSetpoint: number
  peakExposureTime: Date
  explanation: string
  inputs: {
    ambientTemp: number
    uValue: number
    wallMass: number
    currentIndoorTemp: number
    targetTemp: number
    solarLoad: number
    surfaceArea: number
  }
}

export interface CargoDecayResult {
  projectedTempAt30min: number
  projectedTempAt60min: number
  timeToExceedSetpoint: number | null
  riskLevel: "safe" | "caution" | "warning" | "critical" | "emergency"
  riskScore: number
  recommendPreCoolAt: number
  decayRatePerHour: number
  explanation: string
  inputs: {
    currentInternalTemp: number
    ambientRoadTemp: number
    insulationRValue: number
    doorOpenEvents: number
    timeElapsed: number
    setpointTemp: number
  }
}

interface StagingEntry {
  time: string
  action: string
  expectedLoadReduction: number
}

export interface PeakDemandResult {
  coincidentPeakRisk: "low" | "moderate" | "high" | "critical"
  riskScore: number
  recommendedPreCoolStart: string
  projectedSavings: number
  stagingSchedule: StagingEntry[]
  explanation: string
  inputs: {
    currentLoad: number
    forecastedAmbientTemp: number
    thermalLag: number
    activeSystems: number
    tariffPeakWindow: { start: string; end: string }
  }
}

export interface ROISummary {
  assetId: string
  period: string
  periodCost: number
  avoidedLosses: {
    cargoLossPrevention: number
    fuelOptimization: number
    slaBreachAvoidance: number
    finesAvoided: number
    total: number
  }
  netROI: number
  roiMultiple: string
  alertsTriggered: number
  readingsCount: number
}

// ── WBGT Calculation (ISO 7243 / Stull 2011) ────────────────

export class ThermalEngine {
  calculateWBGT(params: WbgtParamsInput): WBGTResult {
    const { dryBulbTemp, relativeHumidity, solarRadiation, windSpeed } = params

    // Stull 2011 wet-bulb approximation (°C, RH in %)
    const rw = relativeHumidity
    const wetBulbTemp =
      dryBulbTemp * Math.atan(0.151977 * Math.sqrt(rw + 8.313659)) +
      Math.atan(dryBulbTemp + rw) -
      Math.atan(rw - 1.676331) +
      0.00391838 * Math.pow(rw, 1.5) * Math.atan(0.023101 * rw) -
      4.686035

    // Globe temperature approximation (no globe sensor → estimate from DB + solar)
    // GT ≈ DB + (solarRadiation × absorption) / (h_conv) - (emission × σ × T⁴) / h_conv
    // Simplified: GT ≈ DB + 0.01 × solarRadiation - 0.005 × windSpeed
    const globeTemp = dryBulbTemp + 0.01 * solarRadiation - 0.005 * windSpeed

    // ISO 7243: WBGT = 0.7 × NWB + 0.2 × GT + 0.1 × DB
    const wbgt = 0.7 * wetBulbTemp + 0.2 * globeTemp + 0.1 * dryBulbTemp

    const roundedWbgt = Math.round(wbgt * 10) / 10

    // OSHA heat stress categorization
    let heatStressCategory: string
    let requiredWorkRestRatio: string
    let riskLevel: WBGTResult["riskLevel"]
    let riskScore: number
    let oshaRecommendation: string

    if (roundedWbgt < 26.0) {
      heatStressCategory = "No restriction"
      requiredWorkRestRatio = "Work continuously"
      riskLevel = "minimal"
      riskScore = 10
      oshaRecommendation =
        "No restrictions. Maintain hydration. Monitor conditions."
    } else if (roundedWbgt < 28.0) {
      heatStressCategory = "Light work"
      requiredWorkRestRatio = "Work continuously (light tasks)"
      riskLevel = "low"
      riskScore = 30
      oshaRecommendation =
        "Light work only. One quart of water per hour. Monitor workers for heat strain."
    } else if (roundedWbgt < 30.0) {
      heatStressCategory = "Moderate caution"
      requiredWorkRestRatio = "50/10 (50 min work, 10 min rest)"
      riskLevel = "moderate"
      riskScore = 50
      oshaRecommendation =
        "Mandatory rest breaks. One quart of water per hour. Rotate heavy tasks."
    } else if (roundedWbgt < 32.0) {
      heatStressCategory = "Heavy work limit"
      requiredWorkRestRatio = "45/15 (45 min work, 15 min rest)"
      riskLevel = "moderate"
      riskScore = 65
      oshaRecommendation =
        "Mandatory 15-min rest each hour in shaded area. Buddy system required."
    } else if (roundedWbgt < 33.0) {
      heatStressCategory = "Heavy work"
      requiredWorkRestRatio = "40/20 (40 min work, 20 min rest)"
      riskLevel = "high"
      riskScore = 75
      oshaRecommendation =
        "Work 40 min, rest 20 min. Close monitoring for heat illness symptoms."
    } else if (roundedWbgt < 35.0) {
      heatStressCategory = "Very heavy work"
      requiredWorkRestRatio = "30/30 (30 min work, 30 min rest)"
      riskLevel = "high"
      riskScore = 85
      oshaRecommendation =
        "Limit to essential work. Immediate medical attention for anyone showing symptoms."
    } else if (roundedWbgt < 39.0) {
      heatStressCategory = "Extreme danger"
      requiredWorkRestRatio = "45/15 (mandatory rest enforcement)"
      riskLevel = "extreme"
      riskScore = 92
      oshaRecommendation =
        "STOP non-essential outdoor work. Mandatory rest cycles. OSHA breach likely."
    } else {
      heatStressCategory = "OSHA breach"
      requiredWorkRestRatio = "10/50 (or stop all work)"
      riskLevel = "extreme"
      riskScore = 98
      oshaRecommendation =
        "STOP ALL outdoor work immediately. OSHA action level breached. Mandatory rest enforcement. Log to Procore."
    }

    // Reference data analyst correlation thresholds for alert generation
    const workerIncidentThreshold = thresholds.worker_incident_flag.threshold_c

    return {
      wbgt: roundedWbgt,
      heatStressCategory,
      requiredWorkRestRatio,
      riskLevel,
      riskScore,
      oshaRecommendation,
      inputs: {
        dryBulbTemp,
        wetBulbTemp: Math.round(wetBulbTemp * 100) / 100,
        globeTemp: Math.round(globeTemp * 100) / 100,
        relativeHumidity,
        solarRadiation,
        windSpeed,
      },
      correlationThresholds: {
        workerIncidentThreshold,
        deliveryDelayThreshold: thresholds.delivery_delay_min.threshold_c,
        coolingLoadThreshold: thresholds.cooling_load_mw.threshold_c,
      },
    }
  }

  // ── Thermal Lag Calculation ──────────────────────────────────

  calculateThermalLag(params: ThermalLagParamsInput): ThermalLagResult {
    const { ambientTemp, uValue, wallMass, currentIndoorTemp, targetTemp, solarLoad, surfaceArea } = params

    // Temperature difference driving heat flow
    const deltaOutdoor = Math.abs(ambientTemp - currentIndoorTemp)
    const deltaTarget = Math.abs(currentIndoorTemp - targetTemp)

    // Heat flux through envelope (W): Q = U × A × ΔT
    const envelopeHeatFlux = uValue * surfaceArea * deltaOutdoor

    // Solar heat gain (W): Q_solar = solarLoad × surfaceArea (simplified)
    const solarHeatGain = solarLoad * surfaceArea * 0.3 // 30% solar absorptance

    // Total heat input (W)
    const totalHeatFlux = envelopeHeatFlux + solarHeatGain

    // Thermal capacity (J/K): C = mass × specificHeat × 1000
    const thermalCapacity = wallMass * SPECIFIC_HEAT_CONCRETE * 1000

    // Time constant (seconds): τ = C / (U × A)
    const timeConstant = totalHeatFlux > 0 ? thermalCapacity / totalHeatFlux : Infinity

    // Time constant in minutes
    const lagMinutes = Math.round(timeConstant / 60)
    const lagHours = Math.round((lagMinutes / 60) * 10) / 10

    // Pre-cool start time: lag before peak temperature
    const now = new Date()
    const preCoolStartTime = new Date(now.getTime() + lagMinutes * 60 * 1000)

    // Recommended setpoint: offset from target to account for thermal lag
    const recommendedSetpoint = Math.round((targetTemp - deltaTarget * 0.3) * 10) / 10

    // Peak exposure time: when indoor temp would reach ambient if no cooling
    const peakExposureMinutes = Math.round((lagMinutes * 1.5) / 30) * 30
    const peakExposureTime = new Date(now.getTime() + peakExposureMinutes * 60 * 1000)

    // Build explanation
    let explanation: string
    if (lagMinutes < 30) {
      explanation = `Very low thermal lag (${lagMinutes} min). Building responds quickly to outdoor temperature changes. Pre-cooling has minimal benefit.`
    } else if (lagMinutes < 120) {
      explanation = `Moderate thermal lag (${lagMinutes} min). Pre-cooling ${Math.round(lagMinutes * 0.8)} min before peak is recommended.`
    } else if (lagMinutes < 360) {
      explanation = `High thermal lag (${lagHours} hours). Excellent thermal mass. Pre-cool ${Math.round(lagHours * 0.8)} hours before peak tariff window.`
    } else {
      explanation = `Very high thermal lag (${lagHours} hours). Exceptional thermal mass. Charge thermal mass during off-peak hours for peak shaving.`
    }

    return {
      lagMinutes,
      lagHours,
      preCoolStartTime,
      recommendedSetpoint,
      peakExposureTime,
      explanation,
      inputs: {
        ambientTemp,
        uValue,
        wallMass,
        currentIndoorTemp,
        targetTemp,
        solarLoad,
        surfaceArea,
      },
    }
  }

  // ── Cargo Temperature Decay (Q10 Model) ─────────────────────

  calculateCargoDecay(params: CargoDecayParamsInput): CargoDecayResult {
    const { currentInternalTemp, ambientRoadTemp, insulationRValue, doorOpenEvents, timeElapsed, setpointTemp } = params

    // Base decay constant from insulation R-value
    // Higher R-value → slower heat transfer → lower k
    // k = 1 / (R × thermal_mass_factor) per minute
    const insulationFactor = 1 / (insulationRValue * 0.1) // normalized

    // Door open penalty: each event adds ~5 minutes of direct heat exposure
    const doorPenalty = doorOpenEvents * 5 * insulationFactor

    // Effective decay constant (per minute)
    const k = (insulationFactor + doorPenalty) * 0.001

    // Q10 model: rate doubles per 10°C above setpoint
    const tempAboveSetpoint = Math.max(0, currentInternalTemp - setpointTemp)
    const q10Multiplier = Math.pow(Q10_PERISHABLE, tempAboveSetpoint / 10)

    // Combined decay rate (per minute)
    const effectiveK = k * q10Multiplier

    // Project temperature at t minutes using Newton's law of cooling/heating
    // T(t) = T_ambient + (T_initial - T_ambient) × e^(-k×t)
    const projectTemp = (minutes: number): number => {
      const projected = ambientRoadTemp + (currentInternalTemp - ambientRoadTemp) * Math.exp(-effectiveK * minutes)
      return Math.round(projected * 100) / 100
    }

    const projectedTempAt30min = projectTemp(30)
    const projectedTempAt60min = projectTemp(60)

    // Time to exceed setpoint (if currently below)
    let timeToExceedSetpoint: number | null = null
    if (currentInternalTemp < setpointTemp && ambientRoadTemp > setpointTemp) {
      // Solve: setpointTemp = ambient + (current - ambient) × e^(-k×t)
      // t = -ln((setpointTemp - ambient) / (current - ambient)) / k
      const ratio = (setpointTemp - ambientRoadTemp) / (currentInternalTemp - ambientRoadTemp)
      if (ratio > 0 && ratio < 1) {
        timeToExceedSetpoint = Math.round(-Math.log(ratio) / effectiveK)
        if (timeToExceedSetpoint > 480) timeToExceedSetpoint = null // >8 hours
      }
    }

    // Decay rate per hour
    const decayRatePerHour = Math.round(effectiveK * 60 * 1000) / 1000

    // Risk assessment
    let riskLevel: CargoDecayResult["riskLevel"]
    let riskScore: number
    let recommendPreCoolAt: number

    const tempRise = projectedTempAt60min - currentInternalTemp

    if (projectedTempAt60min <= setpointTemp) {
      riskLevel = "safe"
      riskScore = 10
      recommendPreCoolAt = 0
    } else if (projectedTempAt60min <= setpointTemp + 2) {
      riskLevel = "caution"
      riskScore = 30
      recommendPreCoolAt = timeToExceedSetpoint ? Math.max(0, timeToExceedSetpoint - 30) : 60
    } else if (projectedTempAt60min <= setpointTemp + 5) {
      riskLevel = "warning"
      riskScore = 55
      recommendPreCoolAt = timeToExceedSetpoint ? Math.max(0, timeToExceedSetpoint - 20) : 30
    } else if (projectedTempAt60min <= setpointTemp + 10) {
      riskLevel = "critical"
      riskScore = 80
      recommendPreCoolAt = timeToExceedSetpoint ? Math.max(0, timeToExceedSetpoint - 10) : 15
    } else {
      riskLevel = "emergency"
      riskScore = 95
      recommendPreCoolAt = 0
    }

    // Build explanation
    let explanation: string
    if (tempRise <= 0) {
      explanation = `Cargo temperature stable. No decay expected within 60 minutes. Setpoint of ${setpointTemp}°C is maintained.`
    } else if (tempRise < 2) {
      explanation = `Slow temperature rise of ${tempRise.toFixed(1)}°C/hr. Insulation (R=${insulationRValue}) is adequate.`
    } else if (tempRise < 5) {
      explanation = `Moderate rise of ${tempRise.toFixed(1)}°C/hr. Consider pre-cooling within ${recommendPreCoolAt} minutes.`
    } else {
      explanation = `Rapid temperature rise of ${tempRise.toFixed(1)}°C/hr. ${doorOpenEvents > 0 ? `${doorOpenEvents} door events accelerated heat gain. ` : ""}Immediate pre-cooling recommended.`
    }

    return {
      projectedTempAt30min,
      projectedTempAt60min,
      timeToExceedSetpoint,
      riskLevel,
      riskScore,
      recommendPreCoolAt,
      decayRatePerHour,
      explanation,
      inputs: {
        currentInternalTemp,
        ambientRoadTemp,
        insulationRValue,
        doorOpenEvents,
        timeElapsed,
        setpointTemp,
      },
    }
  }

  // ── Peak Demand Risk ────────────────────────────────────────

  calculatePeakDemandRisk(params: PeakDemandParamsInput): PeakDemandResult {
    const { currentLoad, forecastedAmbientTemp, thermalLag, activeSystems, tariffPeakWindow } = params

    // Parse peak window times
    const [peakStartH, peakStartM] = tariffPeakWindow.start.split(":").map(Number)
    const [peakEndH, peakEndM] = tariffPeakWindow.end.split(":").map(Number)
    const peakStartMinutes = (peakStartH ?? 0) * 60 + (peakStartM ?? 0)
    const peakEndMinutes = (peakEndH ?? 0) * 60 + (peakEndM ?? 0)

    // Load increase per degree above 25°C (typical HVAC response)
    const degreesAboveComfort = Math.max(0, forecastedAmbientTemp - 25)
    const loadIncreasePerDegree = currentLoad * 0.035 // 3.5% per °C
    const projectedPeakLoad = currentLoad + degreesAboveComfort * loadIncreasePerDegree

    // Coincident peak risk
    let coincidentPeakRisk: PeakDemandResult["coincidentPeakRisk"]
    let riskScore: number

    const loadIncreaseRatio = (projectedPeakLoad - currentLoad) / currentLoad

    if (loadIncreaseRatio < 0.1) {
      coincidentPeakRisk = "low"
      riskScore = 20
    } else if (loadIncreaseRatio < 0.2) {
      coincidentPeakRisk = "moderate"
      riskScore = 50
    } else if (loadIncreaseRatio < 0.35) {
      coincidentPeakRisk = "high"
      riskScore = 75
    } else {
      coincidentPeakRisk = "critical"
      riskScore = 90
    }

    // Pre-cool start: thermalLag minutes before peak window
    const preCoolStartMinutes = peakStartMinutes - thermalLag
    const preCoolStartHour = Math.floor(((preCoolStartMinutes % 1440) + 1440) % 1440 / 60)
    const preCoolStartMin = ((preCoolStartMinutes % 60) + 60) % 60
    const recommendedPreCoolStart = `${String(preCoolStartHour).padStart(2, "0")}:${String(Math.round(preCoolStartMin)).padStart(2, "0")}`

    // Projected savings from pre-cooling
    // Pre-cooling reduces peak load by absorbing heat into thermal mass
    const preCoolReduction = Math.min(degreesAboveComfort * loadIncreasePerDegree * 0.6, currentLoad * 0.15)
    const projectedSavings = Math.round(preCoolReduction * ((peakEndMinutes - peakStartMinutes) / 60) * 100) / 100

    // Staging schedule
    const stagingSchedule: StagingEntry[] = []

    // Stage 1: Pre-cool start
    stagingSchedule.push({
      time: recommendedPreCoolStart,
      action: "Initiate pre-cooling. Reduce setpoints by 2-3°C across all zones.",
      expectedLoadReduction: Math.round(preCoolReduction * 0.3),
    })

    // Stage 2: Staging down
    const stage2Minutes = peakStartMinutes - Math.round(thermalLag * 0.5)
    const stage2Hour = Math.floor(((stage2Minutes % 1440) + 1440) % 1440 / 60)
    const stage2Min = Math.round(((stage2Minutes % 60) + 60) % 60)
    stagingSchedule.push({
      time: `${String(stage2Hour).padStart(2, "0")}:${String(stage2Min).padStart(2, "0")}`,
      action: `Stage down ${Math.min(activeSystems, 2)} chiller units. Transfer load to thermal mass.`,
      expectedLoadReduction: Math.round(preCoolReduction * 0.4),
    })

    // Stage 3: Peak window start
    stagingSchedule.push({
      time: tariffPeakWindow.start,
      action: "Peak window begins. Thermal mass absorbing load. Monitor for 15 min.",
      expectedLoadReduction: Math.round(preCoolReduction * 0.3),
    })

    // Stage 4: Peak shaving
    const peakMidMinutes = peakStartMinutes + Math.round((peakEndMinutes - peakStartMinutes) * 0.5)
    const peakMidHour = Math.floor(((peakMidMinutes % 1440) + 1440) % 1440 / 60)
    const peakMidMin = Math.round(((peakMidMinutes % 60) + 60) % 60)
    stagingSchedule.push({
      time: `${String(peakMidHour).padStart(2, "0")}:${String(peakMidMin).padStart(2, "0")}`,
      action: "Peak shaving active. Maximum thermal mass discharge. Reduce non-critical loads.",
      expectedLoadReduction: Math.round(preCoolReduction),
    })

    // Build explanation
    let explanation: string
    if (coincidentPeakRisk === "low") {
      explanation = `Low risk. Projected peak load increase of ${(loadIncreaseRatio * 100).toFixed(1)}% is within normal operating margin. No pre-cooling required.`
    } else if (coincidentPeakRisk === "moderate") {
      explanation = `Moderate risk. ${degreesAboveComfort.toFixed(1)}°C above comfort baseline. Pre-cool ${thermalLag} min before peak window saves ~$${projectedSavings.toFixed(0)}.`
    } else if (coincidentPeakRisk === "high") {
      explanation = `High risk. Projected load increase of ${(loadIncreaseRatio * 100).toFixed(1)}%. Pre-cooling essential. Staging schedule reduces peak by ~${Math.round(preCoolReduction)} kW.`
    } else {
      explanation = `CRITICAL risk. Load increase of ${(loadIncreaseRatio * 100).toFixed(1)}% will exceed tariff threshold. Immediate pre-cooling + load shedding required.`
    }

    return {
      coincidentPeakRisk,
      riskScore,
      recommendedPreCoolStart,
      projectedSavings,
      stagingSchedule,
      explanation,
      inputs: {
        currentLoad,
        forecastedAmbientTemp,
        thermalLag,
        activeSystems,
        tariffPeakWindow,
      },
    }
  }

  // ── ROI Calculation ─────────────────────────────────────────

  async calculateROI(params: RoiParamsInput): Promise<ROISummary> {
    const { assetId, period } = params

    // Validate assetId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(assetId)) {
      throw AppError.badRequest("Invalid asset ID format")
    }

    // Calculate date range
    const now = new Date()
    const periodDays: Record<string, number> = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
      "1y": 365,
    }
    const days = periodDays[period] ?? 30
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    // Query thermal readings for the period
    const readings = await ThermalReading.find({
      asset: new mongoose.Types.ObjectId(assetId),
      timestamp: { $gte: startDate, $lte: now },
    }).lean()

    // Query alerts triggered for this asset
    const alerts = await Alert.find({
      asset: assetId,
      createdAt: { $gte: startDate, $lte: now },
    }).lean()

    const readingsCount = readings.length
    const alertsTriggered = alerts.length

    // Calculate avoided losses based on readings and alerts
    // Cargo loss prevention: estimated from temperature excursions prevented
    const highRiskReadings = readings.filter((r) => r.riskScore >= 70)
    const cargoLossPrevention = highRiskReadings.length * 150 // $150 per high-risk event prevented

    // Fuel optimization: estimated from thermal lag utilization
    const avgWbgt = readings.reduce((sum, r) => sum + (r.metrics.wbgt ?? 0), 0) / Math.max(readingsCount, 1)
    const fuelOptimization = avgWbgt > 26 ? days * 12.5 : days * 5 // $12.5/day when hot, $5/day otherwise

    // SLA breach avoidance: from alerts that were resolved
    const resolvedAlerts = alerts.filter((a) => a.status === "auto_executed" || a.status === "dismissed")
    const slaBreachAvoidance = resolvedAlerts.length * 500 // $500 per SLA breach avoided

    // Fines avoided: from critical alerts resolved
    const criticalAlerts = alerts.filter((a) => a.severity === "critical")
    const finesAvoided = criticalAlerts.length * 2500 // $2,500 per critical event

    const totalAvoidedLosses = cargoLossPrevention + fuelOptimization + slaBreachAvoidance + finesAvoided

    // Period cost (EchoHeat subscription estimate)
    const periodCost = Math.round(days * 14.17) // ~$425/month ÷ 30 days

    // Net ROI
    const netROI = totalAvoidedLosses - periodCost
    const roiMultiple = periodCost > 0 ? `${(totalAvoidedLosses / periodCost).toFixed(1)}x` : "N/A"

    logger.info(`ROI calculated for asset ${assetId}: $${netROI} net (${roiMultiple})`)

    return {
      assetId,
      period,
      periodCost,
      avoidedLosses: {
        cargoLossPrevention: Math.round(cargoLossPrevention),
        fuelOptimization: Math.round(fuelOptimization),
        slaBreachAvoidance: Math.round(slaBreachAvoidance),
        finesAvoided: Math.round(finesAvoided),
        total: Math.round(totalAvoidedLosses),
      },
      netROI: Math.round(netROI),
      roiMultiple,
      alertsTriggered,
      readingsCount,
    }
  }
}

export const thermalEngine = new ThermalEngine()
