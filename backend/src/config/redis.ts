import { createClient, type RedisClientType } from "redis"
import { env } from "./env.js"
import { logger } from "./logger.js"

// ── Centralized Redis Client ─────────────────────────────────
// Single shared connection with retry logic, event logging,
// graceful shutdown, and Upstash/TLS compatibility.
// All cache consumers share this client.

let client: RedisClientType | null = null
let connecting = false

async function connectWithRetry(url: string, retries = 5, delay = 2000): Promise<RedisClientType> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const isTLS = url.startsWith("rediss://")

      const socketOpts: Record<string, unknown> = {
        reconnectStrategy: (retries: number) => {
          if (retries > 20) {
            logger.error("Redis: max reconnect attempts exceeded, giving up")
            return new Error("Max reconnect attempts exceeded")
          }
          return Math.min(retries * 200, 5000)
        },
      }

      if (isTLS) {
        socketOpts.tls = true
      }

      const c = createClient({
        url,
        socket: socketOpts,
      })

      c.on("connect", () => logger.info("Redis: connecting..."))
      c.on("ready", () => logger.info("Redis: connected and ready"))
      c.on("error", (err: Error) => logger.error("Redis error:", err))
      c.on("reconnecting", () => logger.warn("Redis: reconnecting..."))
      c.on("end", () => logger.warn("Redis: connection closed"))

      await c.connect()
      return c
    } catch (err) {
      logger.error(`Redis: connection attempt ${attempt}/${retries} failed`, err)
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, delay * attempt))
      }
    }
  }
  throw new Error("Redis: failed to connect after all retries")
}

export async function getRedisClient(): Promise<RedisClientType | null> {
  if (!env.REDIS_URL) return null
  if (client?.isOpen) return client
  if (connecting) {
    while (connecting) await new Promise((r) => setTimeout(r, 100))
    if (client?.isOpen) return client
  }

  connecting = true
  try {
    client = await connectWithRetry(env.REDIS_URL)
    return client
  } finally {
    connecting = false
  }
}

export async function closeRedis(): Promise<void> {
  if (client?.isOpen) {
    await client.quit()
    client = null
    logger.info("Redis: connection closed gracefully")
  }
}


