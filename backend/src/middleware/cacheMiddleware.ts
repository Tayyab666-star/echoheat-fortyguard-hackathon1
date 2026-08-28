import type { Request, Response, NextFunction } from "express"
import { cacheService } from "../utils/cache.service.js"
import { logger } from "../config/logger.js"

// ── Cache Key Builder ────────────────────────────────────────
// Builds a cache key from request path + query params.
// Excludes auth headers and volatile params.

function buildCacheKey(req: Request, prefix?: string): string {
  const base = prefix ?? req.path
  const sorted = Object.keys(req.query)
    .sort()
    .map((k) => `${k}=${String(req.query[k])}`)
    .join("&")
  return sorted ? `${base}?${sorted}` : base
}

// ── Cache Middleware ─────────────────────────────────────────
// Intercepts GET responses, serves from cache or sets cache.
// Responds with cached data on cache hit.

export function cacheMiddleware(ttlSeconds: number, keyPrefix?: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.method !== "GET") {
      next()
      return
    }

    const cacheKey = buildCacheKey(req, keyPrefix)

    try {
      const cached = await cacheService.get<unknown>(cacheKey)
      if (cached !== null) {
        logger.debug(`Cache HIT: ${cacheKey}`)
        res.status(200).json({ status: "success", data: cached })
        return
      }
    } catch {
      // Cache miss — continue to handler
    }

    // Intercept res.json to capture and cache the response
    const originalJson = res.json.bind(res)
    res.json = ((body: unknown) => {
      // Only cache successful responses with status "success"
      if (res.statusCode === 200 && body && typeof body === "object" && "status" in body && (body as any).status === "success") {
        const data = (body as { status: string; data: unknown }).data
        cacheService.set(cacheKey, data, ttlSeconds).catch(() => {})
      }
      return originalJson(body)
    }) as typeof res.json

    next()
  }
}
