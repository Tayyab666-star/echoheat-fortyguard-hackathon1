import { connectDatabase, disconnectDatabase } from "../connection.js"
import { seedOrganizations } from "./organizations.seed.js"
import { seedUsers } from "./users.seed.js"
import { seedAssets } from "./assets.seed.js"
import { seedThermalReadings } from "./thermalReadings.seed.js"
import { seedAlerts } from "./alerts.seed.js"

async function runSeed(): Promise<void> {
  const startTime = Date.now()

  console.log("╔══════════════════════════════════════════════════════════════════════════════╗")
  console.log("║                     EchoHeat Database Seed Runner                           ║")
  console.log("╚══════════════════════════════════════════════════════════════════════════════╝")
  console.log("")

  if (process.env["NODE_ENV"] === "production") {
    console.error("[Seed] ABORT: Refusing to seed in production environment.")
    console.error("[Seed] Set NODE_ENV=development or NODE_ENV=test to run seeds.")
    process.exit(1)
  }

  await connectDatabase()
  console.log("[Seed] Connected to MongoDB")
  console.log("")

  try {
    // 1. Organizations
    const organizations = await seedOrganizations()
    console.log("")

    // 2. Users
    const users = await seedUsers(organizations)
    console.log("")

    // 3. Assets
    const assets = await seedAssets(organizations, users)
    console.log("")

    // 4. ThermalReadings
    await seedThermalReadings(organizations, assets)
    console.log("")

    // 5. Alerts
    await seedAlerts(organizations, assets)
    console.log("")

    // ── Summary ──
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

    console.log("╔══════════════════════════════════════════════════════════════════════════════╗")
    console.log("║                           SEED COMPLETE SUMMARY                            ║")
    console.log("╠══════════════════════════════════════════════════════════════════════════════╣")
    console.log(`║  Organizations :  2                                                         ║`)
    console.log(`║  Users         :  8  (4 per org)                                            ║`)
    console.log(`║  Vehicles      :  50                                                        ║`)
    console.log(`║  Sites         :   5                                                        ║`)
    console.log(`║  Facilities    :   3                                                        ║`)
    console.log(`║  Readings      :  ${String(58 * 30 * 24).padStart(6)}  (30d × 24h × 58 assets)           ║`)
    console.log(`║  Alerts        : 200                                                        ║`)
    console.log(`║  Elapsed       : ${elapsed.padStart(5)}s                                                       ║`)
    console.log("╚══════════════════════════════════════════════════════════════════════════════╝")
  } catch (err) {
    console.error("[Seed] Fatal error during seeding:", err)
    process.exitCode = 1
  } finally {
    await disconnectDatabase()
  }
}

runSeed()
