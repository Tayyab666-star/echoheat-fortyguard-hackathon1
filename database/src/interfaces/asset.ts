import type { Types, Document } from "mongoose"

// ── Enums ────────────────────────────────────────────────────

export type AssetType = "vehicle" | "site" | "facility"

// ── Shared sub-document interfaces ───────────────────────────

export interface ICoordinates {
  lat: number
  lng: number
}

export interface IRouteStop {
  lat: number
  lng: number
  scheduledTime?: string
}

// ── Vehicle-specific interfaces ──────────────────────────────

export interface IVehicleCargo {
  type: string
  setpointTemp: number
  toleranceBand: number
}

export interface IVehicleReefer {
  model: string
  lastServiceDate?: Date
  insulationRValue: number
}

export interface IVehicleCurrentStatus {
  internalTemp: number
  externalTemp: number
  doorOpenCount: number
  engineStatus: string
  location: ICoordinates
}

export interface IVehicleData {
  vehicleId: string
  licensePlate: string
  currentRoute: {
    origin: string
    destination: string
    stops: IRouteStop[]
  }
  telematicsProvider: "samsara" | "geotab" | "mock"
  externalAssetId: string
  cargo: IVehicleCargo
  reefer: IVehicleReefer
  currentStatus: IVehicleCurrentStatus
}

// ── Site-specific interfaces ─────────────────────────────────

export interface ISiteActiveShift {
  start: string
  end: string
}

export interface ISiteProjectManager {
  name: string
  phone: string
}

export interface ISiteCurrentStatus {
  wbgt: number
  alertLevel: string
  lastRestBreakAt?: Date
  loggedToProcore: boolean
}

export interface ISiteData {
  siteName: string
  address: string
  coordinates: ICoordinates
  workerCount: number
  activeShift: ISiteActiveShift
  projectManager: ISiteProjectManager
  compliancePlatform: "procore" | "hammertech" | "none"
  externalProjectId: string
  currentStatus: ISiteCurrentStatus
}

// ── Facility-specific interfaces ─────────────────────────────

export interface IHvacSystem {
  systemId: string
  type: string
  capacity: number
  bacnetAddress: string
}

export interface IBuildingEnvelope {
  uValue: number
  roofType: string
  glazingRatio: number
}

export interface IUtilityAccount {
  provider: string
  peakTariffWindow: {
    start: string
    end: string
  }
  baseRate: number
  peakRate: number
}

export interface IFacilityCurrentStatus {
  currentLoad: number
  activePrecoolSessions: number
  demandSavingsToday: number
}

export interface IFacilityData {
  facilityName: string
  address: string
  squareFootage: number
  buildingEnvelope: IBuildingEnvelope
  hvacSystems: IHvacSystem[]
  utilityAccount: IUtilityAccount
  currentStatus: IFacilityCurrentStatus
}

// ── Base Asset document interface ────────────────────────────

export interface IAsset extends Document {
  _id: Types.ObjectId
  organization: Types.ObjectId
  owner: Types.ObjectId
  assetType: AssetType
  name: string
  isActive: boolean
  coordinates: ICoordinates
  tags: string[]
  lastHeartbeatAt: Date
  createdAt: Date
  updatedAt: Date
}

// ── Discriminator document interfaces ────────────────────────

export interface IVehicleAsset extends IAsset {
  assetType: "vehicle"
  vehicleData: IVehicleData
}

export interface ISiteAsset extends IAsset {
  assetType: "site"
  siteData: ISiteData
}

export interface IFacilityAsset extends IAsset {
  assetType: "facility"
  facilityData: IFacilityData
}
