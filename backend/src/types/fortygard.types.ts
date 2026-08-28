/**
 * FortyGuard TypeScript Interfaces
 * Converted from data-analyst-work/shared/types/index.ts
 * and backend/src/data/mock.ts
 */

// ── FortyGuard API Types ─────────────────────────────────────

export interface FortyGuardReading {
  timestamp: string
  location: {
    lat: number
    lng: number
    address?: string
  }
  temperature_2m: number          // ambient temp at 2-meter height (°C)
  relative_humidity: number       // percentage
  solar_radiation: number         // W/m²
  wind_speed: number              // m/s
  apparent_temperature: number    // feels-like temp
  precipitation: number           // mm
}

// ── Thermal Engine Types ─────────────────────────────────────

export interface WBGTResult {
  wbgt: number
  heatStressCategory: string
  workRestRatio: string
  riskLevel: 'safe' | 'caution' | 'warning' | 'danger' | 'extreme'
}

export interface ThermalLagResult {
  lagHours: number
  lagMinutes: number
  explanation: string
}

export interface CargoDecayResult {
  projectedTemp: number
  tempRise: number
  riskLevel: 'safe' | 'caution' | 'warning' | 'critical'
  recommendation: string
}

// ── Sensor Snapshot Types (from data analyst) ─────────────────

export interface SensorSnapshot {
  "sensor.reading.wbgt": number
  "sensor.reading.ambient": number
  "sensor.reading.humidity": number
  "asset.zone": string
  "asset.region": string
  "osha.action_level": number
  "osha.rest_ratio": string
  "fortyguard.risk_score": number
  "fortyguard.confidence": number
  "thermal.kinetics.t_lag": string
  "thermal.kinetics.heat_flux": number
}

// ── Alert Types ──────────────────────────────────────────────

export type Severity = "CRITICAL" | "WARNING" | "INFO" | "RESOLVED"
export type AlertType = "PRE_COOL" | "ROUTE_RISK" | "OSHA_BREACH" | "FACILITY_PEAK"
export type AlertStatus = "executed" | "pending" | "dismissed"

export interface AlertData {
  id: string
  severity: Severity
  type: AlertType
  asset: string
  location: string
  message: string
  timestamp: string
  status: AlertStatus
}

// ── Vehicle Types ────────────────────────────────────────────

export type VehicleStatus = "PRE-COOLING" | "AT RISK" | "COMPLIANT" | "REROUTING"

export interface Vehicle {
  id: string
  route: string
  cargoType: string
  internalTemp: number
  status: VehicleStatus
}

// ── Correlation Thresholds ───────────────────────────────────

export interface CorrelationThreshold {
  threshold_c: number
  correlation: number
  p_value: number
  description: string
}

export interface CorrelationThresholds {
  cooling_load_mw: CorrelationThreshold
  delivery_delay_min: CorrelationThreshold
  worker_incident_flag: CorrelationThreshold
}
