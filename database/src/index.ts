// ── Database module exports ──────────────────────────────────
// Central export point for all models, interfaces, and connection utilities

// ── Connection ───────────────────────────────────────────────
export { connectDatabase, disconnectDatabase, mongoose } from "./connection.js"

// ── Models ───────────────────────────────────────────────────
export { User } from "./models/User.js"
export { Organization } from "./models/Organization.js"
export { Asset, VehicleAsset, SiteAsset, FacilityAsset } from "./models/Asset.js"
export { ThermalReading } from "./models/ThermalReading.js"
export { Alert } from "./models/Alert.js"
export { AlertActionRecord } from "./models/AlertAction.js"

// ── Interfaces & Types ───────────────────────────────────────
export type { IUser, IUserModel, UserRole, IRefreshToken, IConnectedIntegrations } from "./interfaces/user.js"
export {
  type IOrganization,
  type PlanType,
  type IOrganizationSettings,
  type IAlertThresholds,
  type IAssetCounts,
} from "./interfaces/organization.js"
export {
  type IAsset,
  type IVehicleAsset,
  type ISiteAsset,
  type IFacilityAsset,
  type AssetType,
  type ICoordinates,
  type IVehicleData,
  type ISiteData,
  type IFacilityData,
  type IHvacSystem,
  type IBuildingEnvelope,
  type IUtilityAccount,
} from "./interfaces/asset.js"
export {
  type IThermalReading,
  type ReadingSource,
  type RiskLevel,
  type WbgtCategory,
  type IEnvironment,
  type IAssetSpecific,
  type ICalculatedRisk,
} from "./interfaces/thermalReading.js"
export {
  type IAlert,
  type AlertSeverity,
  type AlertType,
  type AlertStatus,
  type IThermalSnapshot,
  type IAlertLocation,
} from "./interfaces/alert.js"
export {
  type IAlertActionRecord,
  type ActionType,
} from "./interfaces/alertAction.js"
