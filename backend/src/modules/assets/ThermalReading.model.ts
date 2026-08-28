import mongoose, { Schema, type Types } from "mongoose"

export interface IThermalReading extends Document {
  _id: Types.ObjectId
  asset: Types.ObjectId
  timestamp: Date
  source: "samsara" | "geotab" | "bacnet" | "sensor" | "mock"
  metrics: {
    internalTemp?: number
    externalTemp?: number
    wbgt?: number
    humidity?: number
    heatFlux?: number
    ambientTemp?: number
    windSpeed?: number
  }
  riskScore: number
  riskLevel: "minimal" | "low" | "moderate" | "high" | "extreme"
  geoLocation?: { lat: number; lng: number }
}

const thermalReadingSchema = new Schema<IThermalReading>(
  {
    asset: {
      type: Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    source: {
      type: String,
      enum: ["samsara", "geotab", "bacnet", "sensor", "mock"],
      required: true,
    },
    metrics: {
      internalTemp: Number,
      externalTemp: Number,
      wbgt: Number,
      humidity: Number,
      heatFlux: Number,
      ambientTemp: Number,
      windSpeed: Number,
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    riskLevel: {
      type: String,
      enum: ["minimal", "low", "moderate", "high", "extreme"],
      required: true,
    },
    geoLocation: {
      lat: Number,
      lng: Number,
    },
  },
  { timestamps: true }
)

thermalReadingSchema.index({ asset: 1, timestamp: -1 })
thermalReadingSchema.index({ asset: 1, timestamp: 1, source: 1 })

export const ThermalReading = mongoose.model<IThermalReading>("ThermalReading", thermalReadingSchema)
