import rateLimit from "express-rate-limit"
import type { RateLimitRequestHandler } from "express-rate-limit"
import { env } from "../config/env.js"
import { logger } from "../config/logger.js"

// ── Redis Store (optional, graceful fallback to memory) ─────

async function createRedisStore(): Promise<any> {
  try {
    const { createClient } = await import("redis")
    const client = createClient({ url: env.REDIS_URL })
    client.on("error", () => {})
    await client.connect()

    const { RedisStore } = await import("rate-limit-redis")
    logger.info("Rate limiter: Redis store connected")

    return new RedisStore({
      sendCommand: (...args: string[]) => client.sendCommand(args),
      prefix: "rl:",
    } as any)
  } catch {
    logger.warn("Rate limiter: Redis unavailable, using in-memory store")
    return undefined
  }
}

// Lazy-init store (created once on first rate limiter usage)
let redisStorePromise: Promise<any> | null = null

function getRedisStore(): Promise<any> {
  if (!redisStorePromise) {
    redisStorePromise = createRedisStore()
  }
  return redisStorePromise
}

// ── Key Generators ──────────────────────────────────────────

function ipKeyGenerator(req: import("express").Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
    req.ip ??
    "unknown"
  )
}

function userKeyGenerator(req: import("express").Request): string {
  return req.user?.userId ?? ipKeyGenerator(req)
}

function orgKeyGenerator(req: import("express").Request): string {
  return req.user?.organization ?? ipKeyGenerator(req)
}

// ── Rate Limiters ───────────────────────────────────────────

/**
 * General rate limiter: 1000 req/15min per user (or per IP for unauthenticated).
 * Applied globally to /api/v1.
 */
export const publicLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.RATE_LIMIT_PUBLIC,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many requests, please try again later",
    code: "ERR_RATE_LIMIT",
  },
  keyGenerator: userKeyGenerator,
  skip: (req) => req.path === "/api/v1/health",
})

/**
 * Authenticated rate limiter: 1000 req/15min per user.
 * Applied to protected route groups.
 */
export const authenticatedLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.RATE_LIMIT_AUTHENTICATED,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many requests, please try again later",
    code: "ERR_RATE_LIMIT",
  },
  keyGenerator: userKeyGenerator,
})

/**
 * Login rate limiter: 5 req/15min per IP.
 * Applied to auth endpoints (login, register, forgot-password).
 */
export const loginLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many login attempts. Please try again in 15 minutes.",
    code: "ERR_LOGIN_RATE_LIMIT",
  },
  keyGenerator: ipKeyGenerator,
  skipSuccessfulRequests: true,
})

/**
 * Thermal engine rate limiter: 100 req/min per org.
 * Prevents API abuse of computationally expensive thermal calculations.
 */
export const thermalEngineLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Thermal engine rate limit exceeded. Maximum 100 requests per minute per organization.",
    code: "ERR_THERMAL_RATE_LIMIT",
  },
  keyGenerator: orgKeyGenerator,
})
