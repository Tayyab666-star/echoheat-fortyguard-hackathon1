import mongoose, { Schema } from "mongoose"
import type { IAlertActionRecord, ActionType } from "../interfaces/alertAction.js"

// ── Main AlertAction schema ──────────────────────────────────

const alertActionRecordSchema = new Schema<IAlertActionRecord>(
  {
    alert: {
      type: Schema.Types.ObjectId,
      ref: "Alert",
      required: [true, "Alert reference is required"],
      index: true,
    },
    actionType: {
      type: String,
      enum: [
        "pre_cool_triggered",
        "route_rerouted",
        "rest_dispatched",
        "osha_logged",
        "notification_sent",
        "escalation_triggered",
        "demand_response",
      ] as ActionType[],
      required: [true, "Action type is required"],
      index: true,
    },
    executedAt: {
      type: Date,
      required: [true, "Execution timestamp is required"],
      default: Date.now,
      index: true,
    },
    executedBy: {
      type: String,
      required: [true, "Executed by is required"],
    },
    integrationTarget: {
      type: String,
    },
    payload: {
      type: Schema.Types.Mixed,
    },
    result: {
      type: String,
    },
    estimatedValueSaved: {
      type: Number,
      min: [0, "Estimated value saved cannot be negative"],
    },
  },
  { timestamps: true }
)

// ── Indexes ──────────────────────────────────────────────────

alertActionRecordSchema.index({ alert: 1 })
alertActionRecordSchema.index({ executedAt: -1 })
alertActionRecordSchema.index({ actionType: 1, executedAt: -1 })
alertActionRecordSchema.index({ alert: 1, actionType: 1 })

// ── Virtual: id ──────────────────────────────────────────────

alertActionRecordSchema.virtual("id").get(function () {
  return this._id.toHexString()
})

alertActionRecordSchema.set("toJSON", { virtuals: true })
alertActionRecordSchema.set("toObject", { virtuals: true })

// ── Export model ─────────────────────────────────────────────

export const AlertActionRecord = mongoose.model<IAlertActionRecord>(
  "AlertActionRecord",
  alertActionRecordSchema
)
