import type { Types, Document } from "mongoose"

// ── Enums ────────────────────────────────────────────────────

export type ReadingSource = "fortygard" | "mock"
export type RiskLevel = "minimal" | "low" | "moderate" | "high" | "extreme"
export type WbgtCategory = "safe" | "caution" | "warning" | "danger" | "extreme"

// ── Sub-document interfaces ──────────────────────────────────

export interface IEnvironment {
  ambientTemp: number
  wbgt: number
  humidity: number
  solarRadiation: number
  windSpeed: number
}

export interface IAssetSpecific {
  internalTemp?: number
  currentLoad?: number
  workerCount?: number
}

export interface ICalculatedRisk {
  riskLevel: RiskLevel
  wbgtCategory: WbgtCategory
  thermalLagMinutes?: number
}

export interface IReadingCoordinates {
  lat: number
  lng: number
  address: string
}

// ── Document interface ───────────────────────────────────────

export interface IThermalReading extends Document {
  _id: Types.ObjectId
  asset: Types.ObjectId
  organization: Types.ObjectId
  assetType: "vehicle" | "site" | "facility"
  readingSource: ReadingSource
  environment: IEnvironment
  assetSpecific: IAssetSpecific
  calculatedRisk: ICalculatedRisk
  coordinates: IReadingCoordinates
  recordedAt: Date
  createdAt: Date
  updatedAt: Date
}
