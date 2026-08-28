import { connectDatabase, disconnectDatabase } from "./connection.js"
import { runMigrations, showMigrationStatus } from "./migrations/index.js"

async function main(): Promise<void> {
  const command = process.argv[2]

  await connectDatabase()
  console.log("[Migrate] Connected to MongoDB")
  console.log("")

  try {
    const connection = (await import("mongoose")).default.connection

    switch (command) {
      case "up":
        await runMigrations(connection)
        break
      case "status":
        await showMigrationStatus(connection)
        break
      default:
        console.error("Usage: tsx src/migrate.ts <up|status>")
        console.error("  up     — Run all pending migrations")
        console.error("  status — Show migration status")
        process.exit(1)
    }
  } finally {
    await disconnectDatabase()
  }
}

main()
