import mongoose, { Schema, type Types } from "mongoose"
import type {
  IAsset,
  IVehicleAsset,
  ISiteAsset,
  IFacilityAsset,
  ICoordinates,
  IVehicleData,
  ISiteData,
  IFacilityData,
  IVehicleCargo,
  IVehicleReefer,
  IVehicleCurrentStatus,
  ISiteActiveShift,
  ISiteProjectManager,
  ISiteCurrentStatus,
  IHvacSystem,
  IBuildingEnvelope,
  IUtilityAccount,
  IFacilityCurrentStatus,
  IRouteStop,
} from "../interfaces/asset.js"

// ── Shared sub-schemas ───────────────────────────────────────

const coordinatesSchema = new Schema<ICoordinates>(
  {
    lat: { type: Number, required: [true, "Latitude is required"], min: -90, max: 90 },
    lng: { type: Number, required: [true, "Longitude is required"], min: -180, max: 180 },
  },
  { _id: false }
)

const routeStopSchema = new Schema<IRouteStop>(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    scheduledTime: { type: String },
  },
  { _id: false }
)

// ── Vehicle sub-schemas ──────────────────────────────────────

const vehicleCargoSchema = new Schema<IVehicleCargo>(
  {
    type: { type: String, default: "" },
    setpointTemp: { type: Number, default: -20 },
    toleranceBand: { type: Number, default: 2, min: 0 },
  },
  { _id: false }
)

const vehicleReeferSchema = new Schema<IVehicleReefer>(
  {
    model: { type: String, default: "" },
    lastServiceDate: { type: Date },
    insulationRValue: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
)

const vehicleCurrentStatusSchema = new Schema<IVehicleCurrentStatus>(
  {
    internalTemp: { type: Number, default: 0 },
    externalTemp: { type: Number, default: 0 },
    doorOpenCount: { type: Number, default: 0, min: 0 },
    engineStatus: { type: String, default: "off" },
    location: { type: coordinatesSchema, default: () => ({ lat: 0, lng: 0 }) },
  },
  { _id: false }
)

const vehicleDataSchema = new Schema<IVehicleData>(
  {
    vehicleId: { type: String, required: [true, "Vehicle ID is required"] },
    licensePlate: { type: String, required: [true, "License plate is required"] },
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
    cargo: { type: vehicleCargoSchema, default: () => ({}) },
    reefer: { type: vehicleReeferSchema, default: () => ({}) },
    currentStatus: { type: vehicleCurrentStatusSchema, default: () => ({}) },
  },
  { _id: false }
)

// ── Site sub-schemas ─────────────────────────────────────────

const siteActiveShiftSchema = new Schema<ISiteActiveShift>(
  {
    start: { type: String, default: "06:00" },
    end: { type: String, default: "14:00" },
  },
  { _id: false }
)

const siteProjectManagerSchema = new Schema<ISiteProjectManager>(
  {
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
  },
  { _id: false }
)

const siteCurrentStatusSchema = new Schema<ISiteCurrentStatus>(
  {
    wbgt: { type: Number, default: 0 },
    alertLevel: { type: String, default: "safe" },
    lastRestBreakAt: { type: Date },
    loggedToProcore: { type: Boolean, default: false },
  },
  { _id: false }
)

const siteDataSchema = new Schema<ISiteData>(
  {
    siteName: { type: String, required: [true, "Site name is required"] },
    address: { type: String, required: [true, "Site address is required"] },
    coordinates: { type: coordinatesSchema, required: [true, "Site coordinates are required"] },
    workerCount: { type: Number, default: 0, min: 0 },
    activeShift: { type: siteActiveShiftSchema, default: () => ({}) },
    projectManager: { type: siteProjectManagerSchema, default: () => ({}) },
    compliancePlatform: {
      type: String,
      enum: ["procore", "hammertech", "none"],
      default: "none",
    },
    externalProjectId: { type: String, default: "" },
    currentStatus: { type: siteCurrentStatusSchema, default: () => ({}) },
  },
  { _id: false }
)

// ── Facility sub-schemas ─────────────────────────────────────

const hvacSystemSchema = new Schema<IHvacSystem>(
  {
    systemId: { type: String, required: [true, "HVAC system ID is required"] },
    type: { type: String, required: [true, "HVAC system type is required"] },
    capacity: { type: Number, default: 0, min: 0 },
    bacnetAddress: { type: String, default: "" },
  },
  { _id: false }
)

const buildingEnvelopeSchema = new Schema<IBuildingEnvelope>(
  {
    uValue: { type: Number, default: 0, min: 0 },
    roofType: { type: String, default: "" },
    glazingRatio: { type: Number, default: 0, min: 0, max: 1 },
  },
  { _id: false }
)

const utilityAccountSchema = new Schema<IUtilityAccount>(
  {
    provider: { type: String, default: "" },
    peakTariffWindow: {
      start: { type: String, default: "14:00" },
      end: { type: String, default: "18:00" },
    },
    baseRate: { type: Number, default: 0, min: 0 },
    peakRate: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
)

const facilityCurrentStatusSchema = new Schema<IFacilityCurrentStatus>(
  {
    currentLoad: { type: Number, default: 0, min: 0 },
    activePrecoolSessions: { type: Number, default: 0, min: 0 },
    demandSavingsToday: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
)

const facilityDataSchema = new Schema<IFacilityData>(
  {
    facilityName: { type: String, required: [true, "Facility name is required"] },
    address: { type: String, required: [true, "Facility address is required"] },
    squareFootage: { type: Number, default: 0, min: 0 },
    buildingEnvelope: { type: buildingEnvelopeSchema, default: () => ({}) },
    hvacSystems: { type: [hvacSystemSchema], default: [] },
    utilityAccount: { type: utilityAccountSchema, default: () => ({}) },
    currentStatus: { type: facilityCurrentStatusSchema, default: () => ({}) },
  },
  { _id: false }
)

// ── Base Asset schema ────────────────────────────────────────

const assetSchema = new Schema<IAsset>(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization is required"],
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Asset owner is required"],
      index: true,
    },
    assetType: {
      type: String,
      enum: ["vehicle", "site", "facility"],
      required: [true, "Asset type is required"],
    },
    name: {
      type: String,
      required: [true, "Asset name is required"],
      trim: true,
      maxlength: [200, "Asset name cannot exceed 200 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    coordinates: {
      type: coordinatesSchema,
      default: () => ({ lat: 0, lng: 0 }),
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    lastHeartbeatAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// ── Indexes ──────────────────────────────────────────────────

assetSchema.index({ organization: 1, assetType: 1, isActive: 1 })
assetSchema.index({ coordinates: "2dsphere" })
assetSchema.index({ owner: 1 })
assetSchema.index({ tags: 1 })
assetSchema.index({ createdAt: -1 })

// ── Virtual: id ──────────────────────────────────────────────

assetSchema.virtual("id").get(function () {
  return this._id.toHexString()
})

// ── Discriminators ───────────────────────────────────────────

const VehicleAsset = mongoose.model<IAsset>("Asset", assetSchema).discriminator<IVehicleAsset>(
  "VehicleAsset",
  new Schema<IVehicleAsset>({
    vehicleData: { type: vehicleDataSchema, required: [true, "Vehicle data is required for vehicle assets"] },
  })
)

const SiteAsset = mongoose.model<IAsset>("Asset", assetSchema).discriminator<ISiteAsset>(
  "SiteAsset",
  new Schema<ISiteAsset>({
    siteData: { type: siteDataSchema, required: [true, "Site data is required for site assets"] },
  })
)

const FacilityAsset = mongoose.model<IAsset>("Asset", assetSchema).discriminator<IFacilityAsset>(
  "FacilityAsset",
  new Schema<IFacilityAsset>({
    facilityData: { type: facilityDataSchema, required: [true, "Facility data is required for facility assets"] },
  })
)

// ── Export base model and discriminators ──────────────────────

export const Asset = mongoose.model<IAsset>("Asset", assetSchema)
export { VehicleAsset, SiteAsset, FacilityAsset }
