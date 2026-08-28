import mongoose, { Schema, type Document, type Types } from "mongoose"

// ── Sub-schemas ─────────────────────────────────────────────

const routeStopSchema = new Schema(
  { lat: Number, lng: Number, scheduledTime: String },
  { _id: false }
)

const vehicleDataSchema = new Schema(
  {
    vehicleId: { type: String, required: true },
    licensePlate: { type: String, required: true },
    currentRoute: {
      origin: { type: String, default: "" },
      destination: { type: String, default: "" },
      stops: { type: [routeStopSchema], default: [] },
    },
    telematicsProvider: {
      type: String,
      enum: ["samsara", "geotab", "mock"],
      default: "mock",
    },
    externalAssetId: { type: String, default: "" },
    cargo: {
      type: { type: String, default: "" },
      setpointTemp: { type: Number, default: -20 },
      toleranceBand: { type: Number, default: 2 },
    },
    reefer: {
      model: { type: String, default: "" },
      lastServiceDate: { type: Date },
      insulationRValue: { type: Number, default: 0 },
    },
    currentStatus: {
      internalTemp: { type: Number, default: 0 },
      externalTemp: { type: Number, default: 0 },
      doorOpenCount: { type: Number, default: 0 },
      engineStatus: { type: String, default: "off" },
      location: { lat: { type: Number, default: 0 }, lng: { type: Number, default: 0 } },
    },
  },
  { _id: false }
)

const coordinatesSchema = new Schema(
  { lat: { type: Number, required: true }, lng: { type: Number, required: true } },
  { _id: false }
)

const siteDataSchema = new Schema(
  {
    siteName: { type: String, required: true },
    address: { type: String, required: true },
    coordinates: { type: coordinatesSchema, required: true },
    workerCount: { type: Number, default: 0 },
    activeShift: {
      start: { type: String, default: "06:00" },
      end: { type: String, default: "14:00" },
    },
    projectManager: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
    },
    compliancePlatform: {
      type: String,
      enum: ["procore", "hammertech", "none"],
      default: "none",
    },
    externalProjectId: { type: String, default: "" },
    currentStatus: {
      wbgt: { type: Number, default: 0 },
      alertLevel: { type: String, default: "safe" },
      lastRestBreakAt: { type: Date },
      loggedToProcore: { type: Boolean, default: false },
    },
  },
  { _id: false }
)

const hvacSystemSchema = new Schema(
  {
    systemId: { type: String, required: true },
    type: { type: String, required: true },
    capacity: { type: Number, default: 0 },
    bacnetAddress: { type: String, default: "" },
  },
  { _id: false }
)

const facilityDataSchema = new Schema(
  {
    facilityName: { type: String, required: true },
    address: { type: String, required: true },
    squareFootage: { type: Number, default: 0 },
    buildingEnvelope: {
      uValue: { type: Number, default: 0 },
      roofType: { type: String, default: "" },
      glazingRatio: { type: Number, default: 0 },
    },
    hvacSystems: { type: [hvacSystemSchema], default: [] },
    utilityAccount: {
      provider: { type: String, default: "" },
      peakTariffWindow: {
        start: { type: String, default: "14:00" },
        end: { type: String, default: "18:00" },
      },
      baseRate: { type: Number, default: 0 },
      peakRate: { type: Number, default: 0 },
    },
    currentStatus: {
      currentLoad: { type: Number, default: 0 },
      activePrecoolSessions: { type: Number, default: 0 },
      demandSavingsToday: { type: Number, default: 0 },
    },
  },
  { _id: false }
)

// ── Main Asset schema ───────────────────────────────────────

export type AssetType = "vehicle" | "site" | "facility"

export interface IAsset extends Document {
  assetType: AssetType
  owner: Types.ObjectId
  organization: string
  tags: string[]
  isActive: boolean
  lastHeartbeatAt: Date
  vehicleData?: typeof vehicleDataSchema extends Schema<infer T> ? T : never
  siteData?: typeof siteDataSchema extends Schema<infer T> ? T : never
  facilityData?: typeof facilityDataSchema extends Schema<infer T> ? T : never
  createdAt: Date
  updatedAt: Date
}

const assetSchema = new Schema<IAsset>(
  {
    assetType: {
      type: String,
      enum: ["vehicle", "site", "facility"],
      required: [true, "Asset type is required"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Asset owner is required"],
    },
    organization: {
      type: String,
      required: [true, "Organization is required"],
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastHeartbeatAt: {
      type: Date,
      default: Date.now,
    },
    vehicleData: { type: vehicleDataSchema },
    siteData: { type: siteDataSchema },
    facilityData: { type: facilityDataSchema },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

assetSchema.index({ organization: 1, assetType: 1 })
assetSchema.index({ owner: 1 })
assetSchema.index({ tags: 1 })
assetSchema.index({ createdAt: -1 })
assetSchema.index({ "vehicleData.vehicleId": 1 }, { sparse: true })
assetSchema.index({ "vehicleData.externalAssetId": 1 }, { sparse: true })

export const Asset = mongoose.model<IAsset>("Asset", assetSchema)
