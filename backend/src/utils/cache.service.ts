import { getRedisClient } from "../config/redis.js"
import { logger } from "../config/logger.js"

// ── Cache Metrics ────────────────────────────────────────────
let hits = 0
let misses = 0

export function getCacheStats() {
  return { hits, misses, hitRate: hits + misses > 0 ? Math.round((hits / (hits + misses)) * 10000) / 100 : 0 }
}

export function resetCacheStats() {
  hits = 0
  misses = 0
}

// ── CacheService ─────────────────────────────────────────────
// JSON-based cache with graceful fallback on Redis failure.
// Cache misses are never fatal errors.

export const cacheService = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const redis = await getRedisClient()
      if (!redis) { misses++; return null }
      const raw = await redis.get(key)
      if (!raw) {
        misses++
        return null
      }
      hits++
      return JSON.parse(raw) as T
    } catch (err) {
      logger.debug(`Cache GET error for key ${key}:`, err)
      misses++
      return null
    }
  },

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    try {
      const redis = await getRedisClient()
      if (!redis) return
      await redis.setEx(key, ttlSeconds, JSON.stringify(value))
    } catch (err) {
      logger.debug(`Cache SET error for key ${key}:`, err)
    }
  },

  async del(key: string): Promise<void> {
    try {
      const redis = await getRedisClient()
      if (!redis) return
      await redis.del(key)
    } catch (err) {
      logger.debug(`Cache DEL error for key ${key}:`, err)
    }
  },

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const redis = await getRedisClient()
      if (!redis) return
      let cursor = "0"
      do {
        const result = await redis.scan(cursor, { MATCH: pattern, COUNT: 100 })
        cursor = result.cursor
        if (result.keys.length > 0) {
          await redis.del(result.keys)
          logger.debug(`Cache: invalidated ${result.keys.length} keys matching "${pattern}"`)
        }
      } while (cursor !== "0")
    } catch (err) {
      logger.debug(`Cache INVALIDATE pattern error for ${pattern}:`, err)
    }
  },
}
