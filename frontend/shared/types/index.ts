// ============================================================
// EchoHeat — Shared Domain Types
// Used by both frontend and backend
// ============================================================

// ── Alerts ──────────────────────────────────────────────────

export type Severity = "CRITICAL" | "WARNING" | "INFO" | "RESOLVED"

export type AlertType = "PRE_COOL" | "ROUTE_RISK" | "OSHA_BREACH" | "FACILITY_PEAK"

export type AlertStatus = "executed" | "pending" | "dismissed"

export type AlertFilter = "all" | "critical" | "warning" | "executed" | "pending"

export interface AlertAction {
  label: string
  variant: "primary" | "ghost" | "orange" | "blue"
}

export interface AlertData {
  id: string
  severity: Severity
  type: AlertType
  asset: string
  location: string
  message: string
  timestamp: string
  status: AlertStatus
  actions: AlertAction[]
}

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

export interface ExecutionLogEntry {
  time: string
  event: string
}

// ── Fleet / Vehicles ────────────────────────────────────────

export type VehicleStatus = "PRE-COOLING" | "AT RISK" | "COMPLIANT" | "REROUTING"

export interface Vehicle {
  id: string
  route: string
  cargoType: string
  internalTemp: number
  status: VehicleStatus
}

// ── Facility / Chillers ─────────────────────────────────────

export type ChillerStatus = "PRE-COOLING" | "IDLE" | "AT-LOAD" | "FAULT"

export interface Chiller {
  id: string
  name: string
  load: number
  status: ChillerStatus
  setpoint: number
  actual: number
}

export interface ScheduleItem {
  id: string
  time: string
  description: string
  savings: string
  status: "completed" | "active" | "upcoming"
  overrideable: boolean
}

// ── Safety / Compliance ─────────────────────────────────────

export interface LogEntry {
  id: string
  timestamp: string
  wbgt: number
  action: string
  loggedTo: string
  auditStatus: "defensible" | "pending"
}

export interface DispatchAlert {
  id: string
  foreman: string
  contact: string
  contactType: "phone" | "email"
  message: string
  time: string
  confirmed: boolean
}

export interface Site {
  id: string
  name: string
  address: string
  risk: "low" | "moderate" | "high" | "critical"
}

export interface TimeBlock {
  start: number
  duration: number
  type: "work" | "rest"
}

// ── Analytics / ROI ─────────────────────────────────────────

export interface AvoidedLossItem {
  label: string
  value: string
}

export interface SegmentROI {
  key: string
  label: string
  annualCost: string
  avoidedLoss: AvoidedLossItem[]
  netROI: string
}

export interface MonthlySavings {
  months: string[]
  avoidedLoss: number[]
  echoheatCost: number[]
}

export interface IncidentData {
  months: string[]
  withoutEchoHeat: number[]
  withEchoHeat: number[]
}

export interface KPIData {
  label: string
  currentValue: string
  color: string
  trend: { value: string; direction: "up" | "down" | "flat" }
  data: number[]
}

export interface DashboardMetrics {
  avgWbgt: { value: string; unit: string; delta: string; deltaType: "success" | "danger" | "neutral" }
  peakDemand: { value: string; unit: string; delta: string; deltaType: "success" | "danger" | "neutral" }
  oshaLogs: { value: string; unit: string; delta: string; deltaType: "success" | "danger" | "neutral" }
  fuelSaved: { value: string; unit: string; delta: string; deltaType: "success" | "danger" | "neutral" }
}

// ── Live Feed ───────────────────────────────────────────────

export type FeedActionType = "PRE_COOL" | "REROUTE" | "REST_DISPATCH" | "ALERT"
export type FeedActionStatus = "completed" | "in-progress" | "failed"

export interface FeedEntry {
  id: string
  timestamp: string
  type: FeedActionType
  description: string
  status: FeedActionStatus
}

// ── Fleet Status ────────────────────────────────────────────

export interface FleetStatusMetric {
  label: string
  value: string
  badge: string
  badgeColor: string
  sparkline: number[]
}

// ── Thermal Zones ───────────────────────────────────────────

export interface ThermalZone {
  label: string
  range: string
  color: string
  count: number
}

// ── Onboarding ──────────────────────────────────────────────

export interface Integration {
  id: string
  name: string
  description: string
  assetsFound: number
  connected: boolean
}

export interface OnboardingThreshold {
  id: string
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
}
