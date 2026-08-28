import type { Types, Document } from "mongoose"

// ── Enums ────────────────────────────────────────────────────

export type ActionType =
  | "pre_cool_triggered"
  | "route_rerouted"
  | "rest_dispatched"
  | "osha_logged"
  | "notification_sent"
  | "escalation_triggered"
  | "demand_response"

// ── Document interface ───────────────────────────────────────

export interface IAlertActionRecord extends Document {
  _id: Types.ObjectId
  alert: Types.ObjectId
  actionType: ActionType
  executedAt: Date
  executedBy: string
  integrationTarget?: string
  payload?: Record<string, unknown>
  result?: string
  estimatedValueSaved?: number
  createdAt: Date
  updatedAt: Date
}
