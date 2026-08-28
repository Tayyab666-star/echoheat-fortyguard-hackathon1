import mongoose, { Schema } from "mongoose"
import type { IOrganization, IOrganizationSettings, IAlertThresholds, IAssetCounts } from "../interfaces/organization.js"

// ── Sub-document schemas ─────────────────────────────────────

const alertThresholdsSchema = new Schema<IAlertThresholds>(
  {
    wbgt: { type: Number, default: 28, min: [0, "WBGT threshold cannot be negative"], max: [50, "WBGT threshold cannot exceed 50"] },
    cargoTemp: { type: Number, default: -18, min: [-50, "Cargo temp too low"], max: [20, "Cargo temp too high"] },
    peakDemand: { type: Number, default: 100, min: [0, "Peak demand cannot be negative"] },
  },
  { _id: false }
)

const organizationSettingsSchema = new Schema<IOrganizationSettings>(
  {
    alertThresholds: { type: alertThresholdsSchema, default: () => ({}) },
    autoExecute: { type: Boolean, default: false },
  },
  { _id: false }
)

const assetCountsSchema = new Schema<IAssetCounts>(
  {
    vehicles: { type: Number, default: 0, min: [0, "Vehicle count cannot be negative"] },
    sites: { type: Number, default: 0, min: [0, "Site count cannot be negative"] },
    facilities: { type: Number, default: 0, min: [0, "Facility count cannot be negative"] },
  },
  { _id: false }
)

// ── Slug generation helper ───────────────────────────────────

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// ── Main Organization schema ─────────────────────────────────

const organizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
      maxlength: [200, "Organization name cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    plan: {
      type: String,
      enum: {
        values: ["free", "pro", "enterprise"],
        message: "Plan must be free, pro, or enterprise",
      },
      default: "free",
    },
    settings: {
      type: organizationSettingsSchema,
      default: () => ({
        alertThresholds: { wbgt: 28, cargoTemp: -18, peakDemand: 100 },
        autoExecute: false,
      }),
    },
    billingEmail: {
      type: String,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid billing email"],
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "trialing", "past_due", "canceled", "none"],
      default: "none",
    },
    assetCounts: {
      type: assetCountsSchema,
      default: () => ({ vehicles: 0, sites: 0, facilities: 0 }),
    },
  },
  { timestamps: true }
)

// ── Indexes ──────────────────────────────────────────────────

organizationSchema.index({ slug: 1 }, { unique: true })
organizationSchema.index({ name: "text" })

// ── Virtual: id ──────────────────────────────────────────────

organizationSchema.virtual("id").get(function () {
  return this._id.toHexString()
})

organizationSchema.set("toJSON", { virtuals: true })
organizationSchema.set("toObject", { virtuals: true })

// ── Pre-save hook: auto-generate slug from name ──────────────

organizationSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = generateSlug(this.name)
  }
  next()
})

// ── Pre-validate hook: ensure slug uniqueness on name change ─

organizationSchema.pre("validate", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = generateSlug(this.name)
  }
  next()
})

// ── Export model ─────────────────────────────────────────────

export const Organization = mongoose.model<IOrganization>("Organization", organizationSchema)
