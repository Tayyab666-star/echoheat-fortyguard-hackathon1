import mongoose, { Schema, type Document } from "mongoose"

export interface IIntegrationToken extends Document {
  organization: string
  provider: "samsara" | "procore" | "fortygard"
  accessToken: string
  refreshToken?: string
  expiresAt?: Date
  scope?: string[]
  meta?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

const integrationTokenSchema = new Schema<IIntegrationToken>(
  {
    organization: {
      type: String,
      required: true,
      trim: true,
    },
    provider: {
      type: String,
      enum: ["samsara", "procore", "fortygard"],
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
    expiresAt: {
      type: Date,
    },
    scope: {
      type: [String],
    },
    meta: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
)

integrationTokenSchema.index({ organization: 1, provider: 1 }, { unique: true })

export const IntegrationToken = mongoose.model<IIntegrationToken>("IntegrationToken", integrationTokenSchema)
