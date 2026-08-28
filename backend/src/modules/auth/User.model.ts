import mongoose, { Schema, type Document } from "mongoose"
import crypto from "crypto"
import bcrypt from "bcryptjs"

export type UserRole = "admin" | "fleet_manager" | "safety_director" | "facility_manager"

export interface IRefreshToken {
  token: string
  createdAt: Date
  expiresAt: Date
  userAgent?: string
  ip?: string
}

export interface IUser extends Document {
  email: string
  password: string
  name: string
  role: UserRole
  organization: string
  onboardingComplete: boolean
  connectedIntegrations: {
    samsara: boolean
    procore: boolean
    bacnet: boolean
  }
  refreshTokens: IRefreshToken[]
  passwordResetToken?: string
  passwordResetExpires?: Date
  passwordResetOTP?: string
  passwordResetOTPExpiry?: Date
  passwordResetTokenHash?: string
  passwordResetTokenHashExpiry?: Date
  otpAttempts: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
  createPasswordResetToken(): string
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    userAgent: { type: String },
    ip: { type: String },
  },
  { _id: false }
)

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    role: {
      type: String,
      enum: {
        values: ["admin", "fleet_manager", "safety_director", "facility_manager"],
        message: "Role must be admin, fleet_manager, safety_director, or facility_manager",
      },
      default: "fleet_manager",
    },
    organization: {
      type: String,
      required: [true, "Organization is required"],
      trim: true,
    },
    onboardingComplete: {
      type: Boolean,
      default: false,
    },
    connectedIntegrations: {
      samsara: { type: Boolean, default: false },
      procore: { type: Boolean, default: false },
      bacnet: { type: Boolean, default: false },
    },
    refreshTokens: {
      type: [refreshTokenSchema],
      default: [],
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    passwordResetOTP: {
      type: String,
      select: false,
    },
    passwordResetOTPExpiry: {
      type: Date,
      select: false,
    },
    passwordResetTokenHash: {
      type: String,
      select: false,
    },
    passwordResetTokenHashExpiry: {
      type: Date,
      select: false,
    },
    otpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

userSchema.index({ email: 1 })
userSchema.index({ "refreshTokens.token": 1 })

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString("hex")
  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex")
  this.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000)
  return resetToken
}

export const User = mongoose.model<IUser>("User", userSchema)
