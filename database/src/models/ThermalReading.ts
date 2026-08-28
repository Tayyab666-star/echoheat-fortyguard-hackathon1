import mongoose, { Schema, type Types } from "mongoose"
import type {
  IThermalReading,
  IEnvironment,
  IAssetSpecific,
  ICalculatedRisk,
  IReadingCoordinates,
} from "../interfaces/thermalReading.js"

// ── Sub-document schemas ─────────────────────────────────────

const environmentSchema = new Schema<IEnvironment>(
  {
    ambientTemp: { type: Number, required: [true, "Ambient temperature is required"] },
    wbgt: { type: Number, required: [true, "WBGT is required"], min: 0, max: 50 },
    humidity: { type: Number, required: [true, "Humidity is required"], min: 0, max: 100 },
    solarRadiation: { type: Number, required: [true, "Solar radiation is required"], min: 0 },
    windSpeed: { type: Number, required: [true, "Wind speed is required"], min: 0 },
  },
  { _id: false }
)

const assetSpecificSchema = new Schema<IAssetSpecific>(
  {
    internalTemp: { type: Number, min: -50, max: 80 },
    currentLoad: { type: Number, min: 0 },
    workerCount: { type: Number, min: 0 },
  },
  { _id: false }
)

const calculatedRiskSchema = new Schema<ICalculatedRisk>(
  {
    riskLevel: {
      type: String,
      enum: ["minimal", "low", "moderate", "high", "extreme"],
      required: [true, "Risk level is required"],
    },
    wbgtCategory: {
      type: String,
      enum: ["safe", "caution", "warning", "danger", "extreme"],
      required: [true, "WBGT category is required"],
    },
    thermalLagMinutes: { type: Number, min: 0 },
  },
  { _id: false }
)

const readingCoordinatesSchema = new Schema<IReadingCoordinates>(
  {
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
    address: { type: String, required: true },
  },
  { _id: false }
)

// ── Main ThermalReading schema ───────────────────────────────

const thermalReadingSchema = new Schema<IThermalReading>(
  {
    asset: {
      type: Schema.Types.ObjectId,
      ref: "Asset",
      required: [true, "Asset reference is required"],
      index: true,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization is required"],
      index: true,
    },
    assetType: {
      type: String,
      enum: ["vehicle", "site", "facility"],
      required: [true, "Asset type is required"],
    },
    readingSource: {
      type: String,
      enum: ["fortygard", "mock"],
      required: [true, "Reading source is required"],
    },
    environment: {
      type: environmentSchema,
      required: [true, "Environment data is required"],
    },
    assetSpecific: {
      type: assetSpecificSchema,
      default: () => ({}),
    },
    calculatedRisk: {
      type: calculatedRiskSchema,
      required: [true, "Calculated risk is required"],
    },
    coordinates: {
      type: readingCoordinatesSchema,
      required: [true, "Coordinates are required"],
    },
    recordedAt: {
      type: Date,
      required: [true, "Recorded timestamp is required"],
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
)

// ── Indexes ──────────────────────────────────────────────────

thermalReadingSchema.index({ asset: 1, recordedAt: -1 })
thermalReadingSchema.index({ organization: 1, recordedAt: -1, riskLevel: 1 })

// ── TTL index: auto-delete after 90 days (7776000 seconds) ───

thermalReadingSchema.index({ recordedAt: 1 }, { expireAfterSeconds: 7776000 })

// ── Virtual: id ──────────────────────────────────────────────

thermalReadingSchema.virtual("id").get(function () {
  return this._id.toHexString()
})

thermalReadingSchema.set("toJSON", { virtuals: true })
thermalReadingSchema.set("toObject", { virtuals: true })

// ── Export model ─────────────────────────────────────────────

export const ThermalReading = mongoose.model<IThermalReading>("ThermalReading", thermalReadingSchema)
