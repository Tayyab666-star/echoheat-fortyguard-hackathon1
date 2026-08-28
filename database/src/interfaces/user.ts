import type { Types, Document, Model } from "mongoose"

// ── Enums ────────────────────────────────────────────────────

export type UserRole = "admin" | "fleet_manager" | "safety_director" | "facility_manager"

// ── Sub-document interfaces ──────────────────────────────────

export interface IRefreshToken {
  token: string
  expiresAt: Date
  createdAt: Date
  userAgent?: string
  ip?: string
}

export interface IConnectedIntegrations {
  samsara: boolean
  procore: boolean
  bacnet: boolean
}

// ── Document interface ───────────────────────────────────────

export interface IUser extends Document {
  _id: Types.ObjectId
  email: string
  password: string
  name: string
  role: UserRole
  organization: Types.ObjectId
  onboardingComplete: boolean
  connectedIntegrations: IConnectedIntegrations
  refreshTokens: IRefreshToken[]
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date

  comparePassword(candidatePassword: string): Promise<boolean>
}

// ── Static methods interface ─────────────────────────────────

export interface IUserModel extends Model<IUser> {
  findByEmailAndOrg(email: string, orgId: Types.ObjectId): Promise<IUser | null>
}
