import type { Connection } from "mongoose"
import { Migration } from "./Migration.js"
import type { MigrationFile } from "./types.js"
import crypto from "crypto"

// ── Migration registry (add migrations in order here) ────────

async function loadMigrationFiles(): Promise<MigrationFile[]> {
  const migrations: MigrationFile[] = []

  const mod001 = await import("./001_add_org_slug.js")
  migrations.push(mod001.default as unknown as MigrationFile)

  return migrations
}

function computeChecksum(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex").slice(0, 16)
}

// ── Migration runner ─────────────────────────────────────────

export async function runMigrations(connection: Connection): Promise<void> {
  console.log("╔══════════════════════════════════════════════════════════════════════════════╗")
  console.log("║                    EchoHeat Migration Runner                                ║")
  console.log("╚══════════════════════════════════════════════════════════════════════════════╝")
  console.log("")

  const migrations = await loadMigrationFiles()
  const applied = await Migration.find().sort({ name: 1 }).lean()
  const appliedNames = new Set(applied.map((m) => m.name))

  let pending = 0
  let executed = 0
  let errors = 0

  for (const migration of migrations) {
    if (appliedNames.has(migration.name)) {
      continue
    }

    pending++
    console.log(`  [pending] ${migration.name}`)

    const startTime = Date.now()
    const checksum = computeChecksum(migration.name)

    try {
      await migration.up(connection)
      const elapsed = Date.now() - startTime

      await Migration.create({
        name: migration.name,
        appliedAt: new Date(),
        checksum,
        executionTimeMs: elapsed,
      })

      console.log(`  [applied] ${migration.name} (${elapsed}ms)`)
      executed++
    } catch (err) {
      const elapsed = Date.now() - startTime
      console.error(`  [error] ${migration.name}:`, err instanceof Error ? err.message : err)
      errors++
      console.error(`  Migration ${migration.name} failed. Aborting.`)
      break
    }
  }

  console.log("")
  console.log("─".repeat(78))
  console.log(`  Applied: ${executed}  |  Pending: ${pending - executed}  |  Errors: ${errors}`)
  console.log("─".repeat(78))
}

// ── Migration status ─────────────────────────────────────────

export async function showMigrationStatus(connection: Connection): Promise<void> {
  console.log("╔══════════════════════════════════════════════════════════════════════════════╗")
  console.log("║                    EchoHeat Migration Status                                ║")
  console.log("╚══════════════════════════════════════════════════════════════════════════════╝")
  console.log("")

  const migrations = await loadMigrationFiles()
  const applied = await Migration.find().sort({ name: 1 }).lean()
  const appliedMap = new Map(applied.map((m) => [m.name, m]))

  console.log("  Status   │ Name                           │ Applied At        │ Time")
  console.log("  ─────────┼────────────────────────────────┼───────────────────┼──────")

  for (const migration of migrations) {
    const record = appliedMap.get(migration.name)
    if (record) {
      const date = record.appliedAt.toISOString().slice(0, 16)
      const time = `${record.executionTimeMs}ms`
      console.log(`  ✓ applied │ ${migration.name.padEnd(30)} │ ${date.padEnd(17)} │ ${time}`)
    } else {
      console.log(`  ○ pending │ ${migration.name.padEnd(30)} │ —                 │ —`)
    }
  }

  console.log("")
}
