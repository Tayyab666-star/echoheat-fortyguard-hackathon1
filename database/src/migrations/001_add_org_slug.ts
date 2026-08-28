import type { Connection } from "mongoose"
import type { MigrationFile } from "./types.js"

// ── Migration 001: Ensure organization slug field ────────────
// Adds slug generation for existing organizations that may lack it.
// This migration is idempotent — safe to run multiple times.

const migration: MigrationFile = {
  name: "001_add_org_slug",

  async up(connection: Connection): Promise<void> {
    const db = connection.db
    if (!db) throw new Error("Database connection not established")

    const orgs = db.collection("organizations")

    // Ensure slug index exists (idempotent)
    await orgs.createIndex({ slug: 1 }, { unique: true, background: true })

    // For any organizations missing a slug, generate one from name
    const cursor = orgs.find({ slug: { $exists: false } })
    let updated = 0

    while (await cursor.hasNext()) {
      const doc = await cursor.next()
      if (!doc) continue

      const slug = (doc["name"] as string)
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "")

      await orgs.updateOne({ _id: doc["_id"] }, { $set: { slug } })
      updated++
    }

    console.log(`    [001] Updated ${updated} organizations with slug values`)
  },

  async down(connection: Connection): Promise<void> {
    const db = connection.db
    if (!db) throw new Error("Database connection not established")

    const orgs = db.collection("organizations")

    // Remove slug field from all organizations
    await orgs.updateMany({}, { $unset: { slug: "" } })

    // Drop slug index
    try {
      await orgs.dropIndex("slug_1")
    } catch {
      // Index may not exist, ignore
    }

    console.log("    [001] Rolled back slug field from organizations")
  },
}

export default migration
