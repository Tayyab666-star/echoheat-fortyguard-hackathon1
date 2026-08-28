import mongoose, { Schema, type Types, type Document } from "mongoose"

// ── Migration document interface ─────────────────────────────

export interface IMigration extends Document {
  _id: Types.ObjectId
  name: string
  appliedAt: Date
  checksum: string
  executionTimeMs: number
}

// ── Migration schema ─────────────────────────────────────────

const migrationSchema = new Schema<IMigration>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    checksum: {
      type: String,
      required: true,
    },
    executionTimeMs: {
      type: Number,
      required: true,
    },
  },
  { timestamps: false }
)

migrationSchema.index({ name: 1 }, { unique: true })

export const Migration = mongoose.model<IMigration>("Migration", migrationSchema)
