import mongoose, { Schema, type Document, type Types } from "mongoose"

// ── Types ───────────────────────────────────────────────────

export type AlertSeverity = "critical" | "warning" | "info"
export type AlertType =
  | "wbgt_breach"
  | "cargo_at_risk"
  | "peak_demand"
  | "reroute_needed"
  | "pre_cool_executed"
  | "osha_log_filed"
export type AlertStatus = "pending" | "auto_executed" | "dismissed" | "escalated"
export type AssetType = "vehicle" | "site" | "facility"

export interface IAlertAction {
  actionType: string
  executedAt?: Date
  executedBy: string
  payload?: Record<string, unknown>
  result?: string
  integrationTarget?: string
}

export interface IAlert extends Document {
  _id: Types.ObjectId
  organization: string
  asset: Types.ObjectId
  assetType: AssetType
  severity: AlertSeverity
  alertType: AlertType
  title: string
  message: string
  thermalSnapshot: {
    wbgt?: number
    ambientTemp: number
    internalTemp?: number
    peakLoad?: number
  }
  location: {
    lat: number
    lng: number
    address: string
  }
  status: AlertStatus
  actions: IAlertAction[]
  autoResolvedAt?: Date
  resolvedBy?: string
  createdAt: Date
  updatedAt: Date
}

// ── Sub-schemas ─────────────────────────────────────────────

const alertActionSchema = new Schema<IAlertAction>(
  {
    actionType: { type: String, required: true },
    executedAt: { type: Date },
    executedBy: { type: String, required: true },
    payload: { type: Schema.Types.Mixed },
    result: { type: String },
    integrationTarget: { type: String },
  },
  { _id: false }
)

const thermalSnapshotSchema = new Schema(
  {
    wbgt: { type: Number },
    ambientTemp: { type: Number, required: true },
    internalTemp: { type: Number },
    peakLoad: { type: Number },
  },
  { _id: false }
)

const locationSchema = new Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, required: true },
  },
  { _id: false }
)

// ── Main schema ─────────────────────────────────────────────

const alertSchema = new Schema<IAlert>(
  {
    organization: {
      type: String,
      required: [true, "Organization is required"],
      trim: true,
      index: true,
    },
    asset: {
      type: Schema.Types.ObjectId,
      ref: "Asset",
      required: [true, "Asset reference is required"],
      index: true,
    },
    assetType: {
      type: String,
      enum: ["vehicle", "site", "facility"],
      required: [true, "Asset type is required"],
    },
    severity: {
      type: String,
      enum: ["critical", "warning", "info"],
      required: [true, "Severity is required"],
      index: true,
    },
    alertType: {
      type: String,
      enum: ["wbgt_breach", "cargo_at_risk", "peak_demand", "reroute_needed", "pre_cool_executed", "osha_log_filed"],
      required: [true, "Alert type is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
    },
    thermalSnapshot: {
      type: thermalSnapshotSchema,
      required: true,
    },
    location: {
      type: locationSchema,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "auto_executed", "dismissed", "escalated"],
      default: "pending",
      index: true,
    },
    actions: {
      type: [alertActionSchema],
      default: [],
    },
    autoResolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: String,
    },
  },
  { timestamps: true }
)

alertSchema.index({ organization: 1, status: 1, severity: 1 })
alertSchema.index({ organization: 1, createdAt: -1 })
alertSchema.index({ asset: 1, createdAt: -1 })
alertSchema.index({ status: 1, createdAt: -1 })

export const Alert = mongoose.model<IAlert>("Alert", alertSchema)
