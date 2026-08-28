import mongoose from "mongoose"
import { connectDatabase, disconnectDatabase } from "./connection.js"

// ── Index definitions (all from DB-01 schema) ────────────────
// Each entry: [collection, indexSpec, options]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IndexKey = Record<string, any>

interface IndexDef {
  collection: string
  index: IndexKey
  options?: Record<string, unknown>
  name: string
}

const INDEX_DEFINITIONS: IndexDef[] = [
  // ── Organization ──
  {
    collection: "organizations",
    index: { slug: 1 },
    options: { unique: true, background: true },
    name: "org_slug_unique",
  },
  {
    collection: "organizations",
    index: { name: "text" },
    options: { background: true },
    name: "org_name_text",
  },

  // ── User ──
  {
    collection: "users",
    index: { email: 1 },
    options: { background: true },
    name: "user_email",
  },
  {
    collection: "users",
    index: { organization: 1 },
    options: { background: true },
    name: "user_organization",
  },
  {
    collection: "users",
    index: { "refreshTokens.token": 1 },
    options: { sparse: true, background: true },
    name: "user_refresh_tokens_token",
  },

  // ── Asset (base) ──
  {
    collection: "assets",
    index: { organization: 1, assetType: 1, isActive: 1 },
    options: { background: true },
    name: "asset_org_type_active",
  },
  {
    collection: "assets",
    index: { coordinates: "2dsphere" },
    options: { background: true },
    name: "asset_coordinates_2dsphere",
  },
  {
    collection: "assets",
    index: { owner: 1 },
    options: { background: true },
    name: "asset_owner",
  },
  {
    collection: "assets",
    index: { tags: 1 },
    options: { background: true },
    name: "asset_tags",
  },
  {
    collection: "assets",
    index: { createdAt: -1 },
    options: { background: true },
    name: "asset_created_at_desc",
  },

  // ── ThermalReading ──
  {
    collection: "thermalreadings",
    index: { asset: 1, recordedAt: -1 },
    options: { background: true },
    name: "thermal_asset_recorded_at",
  },
  {
    collection: "thermalreadings",
    index: { organization: 1, recordedAt: -1, riskLevel: 1 },
    options: { background: true },
    name: "thermal_org_recorded_risk",
  },
  {
    collection: "thermalreadings",
    index: { recordedAt: 1 },
    options: { expireAfterSeconds: 7776000, background: true },
    name: "thermal_recorded_at_ttl",
  },

  // ── Alert ──
  {
    collection: "alerts",
    index: { organization: 1, createdAt: -1 },
    options: { background: true },
    name: "alert_org_created_at",
  },
  {
    collection: "alerts",
    index: { asset: 1, status: 1 },
    options: { background: true },
    name: "alert_asset_status",
  },
  {
    collection: "alerts",
    index: { organization: 1, severity: 1, status: 1 },
    options: { background: true },
    name: "alert_org_severity_status",
  },
  {
    collection: "alerts",
    index: { status: 1, createdAt: -1 },
    options: { background: true },
    name: "alert_status_created_at",
  },

  // ── AlertActionRecord ──
  {
    collection: "alertactionrecords",
    index: { alert: 1 },
    options: { background: true },
    name: "alert_action_alert",
  },
  {
    collection: "alertactionrecords",
    index: { executedAt: -1 },
    options: { background: true },
    name: "alert_action_executed_at",
  },
  {
    collection: "alertactionrecords",
    index: { actionType: 1, executedAt: -1 },
    options: { background: true },
    name: "alert_action_type_executed_at",
  },
  {
    collection: "alertactionrecords",
    index: { alert: 1, actionType: 1 },
    options: { background: true },
    name: "alert_action_alert_type",
  },
]

// ── Idempotent index creation ────────────────────────────────

export async function createAllIndexes(): Promise<void> {
  console.log("╔══════════════════════════════════════════════════════════════════════════════╗")
  console.log("║                    EchoHeat Index Creation Script                            ║")
  console.log("╚══════════════════════════════════════════════════════════════════════════════╝")
  console.log("")

  let created = 0
  let skipped = 0
  let errors = 0

  for (const def of INDEX_DEFINITIONS) {
    try {
      const db = mongoose.connection.db
      if (!db) {
        throw new Error("Database connection not established")
      }

      const collection = db.collection(def.collection)

      // Check if index already exists
      const existingIndexes = await collection.indexes()
      const alreadyExists = existingIndexes.some(
        (idx) => JSON.stringify(idx.key) === JSON.stringify(def.index)
      )

      if (alreadyExists) {
        console.log(`  [skip] ${def.name} (already exists on ${def.collection})`)
        skipped++
        continue
      }

      await collection.createIndex(def.index, {
        ...def.options,
        background: true,
        name: def.name,
      })

      console.log(`  [created] ${def.name} → ${def.collection}`)
      created++
    } catch (err) {
      console.error(`  [error] ${def.name}:`, err instanceof Error ? err.message : err)
      errors++
    }
  }

  console.log("")
  console.log("─".repeat(78))
  console.log(`  Created: ${created}  |  Skipped: ${skipped}  |  Errors: ${errors}`)
  console.log("─".repeat(78))
}

// ── CLI entry point ──────────────────────────────────────────

async function main(): Promise<void> {
  await connectDatabase()
  console.log("[Index] Connected to MongoDB")
  console.log("")

  try {
    await createAllIndexes()
  } finally {
    await disconnectDatabase()
  }
}

main()
