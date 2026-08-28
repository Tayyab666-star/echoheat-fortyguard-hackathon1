import mongoose, { Schema, type Types } from "mongoose"
import type {
  IAlert,
  IThermalSnapshot,
  IAlertLocation,
  IAlertAction,
  AlertSeverity,
  AlertType,
  AlertStatus,
} from "../interfaces/alert.js"

// ── Sub-document schemas ─────────────────────────────────────

const thermalSnapshotSchema = new Schema<IThermalSnapshot>(
  {
    wbgt: { type: Number, min: 0, max: 50 },
    ambientTemp: { type: Number, required: [true, "Ambient temperature is required"] },
    internalTemp: { type: Number },
    peakLoad: { type: Number, min: 0 },
  },
  { _id: false }
)

const alertLocationSchema = new Schema<IAlertLocation>(
  {
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
    address: { type: String, required: [true, "Address is required"] },
  },
  { _id: false }
)

const alertActionSchema = new Schema<IAlertAction>(
  {
    actionType: { type: String, required: [true, "Action type is required"] },
    executedAt: { type: Date },
    executedBy: { type: String, required: [true, "Executed by is required"] },
    integrationTarget: { type: String },
    payload: { type: Schema.Types.Mixed },
    result: { type: String },
    estimatedValueSaved: { type: Number, min: 0 },
  },
  { _id: false }
)

// ── Main Alert schema ────────────────────────────────────────

const alertSchema = new Schema<IAlert>(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization is required"],
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
      enum: ["critical", "warning", "info"] as AlertSeverity[],
      required: [true, "Severity is required"],
      index: true,
    },
    alertType: {
      type: String,
      enum: [
        "wbgt_breach",
        "cargo_at_risk",
        "peak_demand",
        "reroute_needed",
        "pre_cool_executed",
        "osha_log_filed",
      ] as AlertType[],
      required: [true, "Alert type is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    thermalSnapshot: {
      type: thermalSnapshotSchema,
      required: [true, "Thermal snapshot is required"],
    },
    location: {
      type: alertLocationSchema,
      required: [true, "Location is required"],
    },
    status: {
      type: String,
      enum: ["pending", "auto_executed", "dismissed", "escalated"] as AlertStatus[],
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

// ── Indexes ──────────────────────────────────────────────────

alertSchema.index({ organization: 1, createdAt: -1 })
alertSchema.index({ asset: 1, status: 1 })
alertSchema.index({ organization: 1, severity: 1, status: 1 })
alertSchema.index({ status: 1, createdAt: -1 })

// ── Virtual: id ──────────────────────────────────────────────

alertSchema.virtual("id").get(function () {
  return this._id.toHexString()
})

alertSchema.set("toJSON", { virtuals: true })
alertSchema.set("toObject", { virtuals: true })

// ── Export model ─────────────────────────────────────────────

export const Alert = mongoose.model<IAlert>("Alert", alertSchema)
