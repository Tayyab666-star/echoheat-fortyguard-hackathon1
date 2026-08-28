import mongoose from "mongoose"
import { env } from "./env.js"
import { logger } from "./logger.js"

export async function connectDB(): Promise<void> {
  mongoose.connection.on("error", (error) => {
    logger.error("MongoDB runtime error:", error)
  })

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected")
  })

  try {
    await mongoose.connect(env.MONGODB_URI, {
      autoIndex: env.NODE_ENV !== "production",
    })
    logger.info("MongoDB connected successfully")
  } catch (error) {
    logger.error("MongoDB connection error:", error)
    process.exit(1)
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect()
  logger.info("MongoDB disconnected")
}
