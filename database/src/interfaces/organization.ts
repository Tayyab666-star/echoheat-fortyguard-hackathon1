import type { Types, Document } from "mongoose"

// ── Enums ────────────────────────────────────────────────────

export type PlanType = "free" | "pro" | "enterprise"

// ── Sub-document interfaces ──────────────────────────────────

export interface IAlertThresholds {
  wbgt: number
  cargoTemp: number
  peakDemand: number
}

export interface IOrganizationSettings {
  alertThresholds: IAlertThresholds
  autoExecute: boolean
}

export interface IAssetCounts {
  vehicles: number
  sites: number
  facilities: number
}

// ── Document interface ───────────────────────────────────────

export interface IOrganization extends Document {
  _id: Types.ObjectId
  name: string
  slug: string
  plan: PlanType
  settings: IOrganizationSettings
  billingEmail: string
  subscriptionStatus: string
  assetCounts: IAssetCounts
  createdAt: Date
  updatedAt: Date
}
