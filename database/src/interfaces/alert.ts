import type { Types, Document } from "mongoose"

// ── Enums ────────────────────────────────────────────────────

export type AlertSeverity = "critical" | "warning" | "info"
export type AlertType =
  | "wbgt_breach"
  | "cargo_at_risk"
  | "peak_demand"
  | "reroute_needed"
  | "pre_cool_executed"
  | "osha_log_filed"
export type AlertStatus = "pending" | "auto_executed" | "dismissed" | "escalated"

// ── Sub-document interfaces ──────────────────────────────────

export interface IThermalSnapshot {
  wbgt?: number
  ambientTemp: number
  internalTemp?: number
  peakLoad?: number
}

export interface IAlertLocation {
  lat: number
  lng: number
  address: string
}

// ── AlertAction embedded interface ───────────────────────────

export interface IAlertAction {
  actionType: string
  executedAt?: Date
  executedBy: string
  integrationTarget?: string
  payload?: Record<string, unknown>
  result?: string
  estimatedValueSaved?: number
}

// ── Document interface ───────────────────────────────────────

export interface IAlert extends Document {
  _id: Types.ObjectId
  organization: Types.ObjectId
  asset: Types.ObjectId
  assetType: "vehicle" | "site" | "facility"
  severity: AlertSeverity
  alertType: AlertType
  title: string
  message: string
  thermalSnapshot: IThermalSnapshot
  location: IAlertLocation
  status: AlertStatus
  actions: IAlertAction[]
  autoResolvedAt?: Date
  resolvedBy?: string
  createdAt: Date
  updatedAt: Date
}
