import mongoose from "mongoose"

// ── Connection configuration ─────────────────────────────────

const MONGODB_URI = process.env["MONGODB_URI"] ?? "mongodb://localhost:27017/echoheat"

interface ConnectionOptions {
  maxPoolSize?: number
  serverSelectionTimeoutMS?: number
  socketTimeoutMS?: number
}

const defaultOptions: ConnectionOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
}

// ── Connection manager ───────────────────────────────────────

export async function connectDatabase(options?: ConnectionOptions): Promise<typeof mongoose> {
  const mergedOptions = { ...defaultOptions, ...options }

  mongoose.set("strictQuery", true)

  mongoose.connection.on("connected", () => {
    console.log("[DB] MongoDB connected successfully")
  })

  mongoose.connection.on("error", (err) => {
    console.error("[DB] MongoDB connection error:", err)
  })

  mongoose.connection.on("disconnected", () => {
    console.log("[DB] MongoDB disconnected")
  })

  // Graceful shutdown
  process.on("SIGINT", async () => {
    await mongoose.connection.close()
    console.log("[DB] MongoDB connection closed through app termination")
    process.exit(0)
  })

  return mongoose.connect(MONGODB_URI, mergedOptions as mongoose.ConnectOptions)
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect()
  console.log("[DB] MongoDB disconnected")
}

export function getConnectionString(): string {
  return MONGODB_URI
}

export { mongoose }
