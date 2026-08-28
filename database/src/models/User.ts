import mongoose, { Schema, type Types } from "mongoose"
import bcrypt from "bcryptjs"
import type { IUser, IUserModel, IRefreshToken, IConnectedIntegrations } from "../interfaces/user.js"

// ── Sub-document schema ──────────────────────────────────────

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    userAgent: { type: String },
    ip: { type: String },
  },
  { _id: false }
)

const connectedIntegrationsSchema = new Schema<IConnectedIntegrations>(
  {
    samsara: { type: Boolean, default: false },
    procore: { type: Boolean, default: false },
    bacnet: { type: Boolean, default: false },
  },
  { _id: false }
)

// ── Main User schema ─────────────────────────────────────────

const userSchema = new Schema<IUser, IUserModel>(
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
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization is required"],
      index: true,
    },
    onboardingComplete: {
      type: Boolean,
      default: false,
    },
    connectedIntegrations: {
      type: connectedIntegrationsSchema,
      default: () => ({ samsara: false, procore: false, bacnet: false }),
    },
    refreshTokens: {
      type: [refreshTokenSchema],
      default: [],
      select: false,
      validate: {
        validator: function (tokens: IRefreshToken[]) {
          return tokens.length <= 5
        },
        message: "Cannot store more than 5 refresh tokens",
      },
    },
    lastLoginAt: {
      type: Date,
    },
  },
  { timestamps: true }
)

// ── Indexes ──────────────────────────────────────────────────

userSchema.index({ organization: 1 })
userSchema.index({ "refreshTokens.token": 1 }, { sparse: true })

// ── Virtual: id ──────────────────────────────────────────────

userSchema.virtual("id").get(function () {
  return this._id.toHexString()
})

userSchema.set("toJSON", { virtuals: true })
userSchema.set("toObject", { virtuals: true })

// ── Pre-save hook: hash password if modified ─────────────────

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// ── Pre-save hook: enforce max 5 refresh tokens ──────────────

userSchema.pre("save", function (next) {
  if (this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5)
  }
  next()
})

// ── Instance method: comparePassword ─────────────────────────

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// ── Static method: findByEmailAndOrg ─────────────────────────

userSchema.statics.findByEmailAndOrg = function (email: string, orgId: Types.ObjectId) {
  return this.findOne({ email: email.toLowerCase(), organization: orgId })
}

// ── Export model ─────────────────────────────────────────────

export const User = mongoose.model<IUser, IUserModel>("User", userSchema)
