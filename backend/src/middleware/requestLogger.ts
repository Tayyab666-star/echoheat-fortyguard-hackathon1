import type { Request, Response, NextFunction } from "express"
import { logger } from "../config/logger.js"

// ── Health check paths to skip ──────────────────────────────

const SKIP_PATHS = new Set(["/api/v1/health", "/health", "/ping", "/favicon.ico"])

/**
 * Custom request logger middleware.
 *
 * Logs: method, path, status, duration, userId, orgId
 * Skips health check endpoints.
 * Format: :method :url :status :response-time ms - :res[content-length]
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  // Skip health checks
  if (SKIP_PATHS.has(req.path)) {
    next()
    return
  }

  const start = Date.now()

  // Capture the original end method to log on response completion
  const originalEnd = res.end
  res.end = function (this: Response, ...args: any[]) {
    const duration = Date.now() - start
    const statusCode = res.statusCode

    const logData = {
      method: req.method,
      path: req.path,
      url: req.originalUrl,
      status: statusCode,
      duration: `${duration}ms`,
      contentLength: res.getHeader("content-length") ?? 0,
      userId: req.user?.userId ?? null,
      orgId: req.user?.organization ?? null,
      ip: req.ip ?? req.socket?.remoteAddress ?? null,
      userAgent: req.get("user-agent") ?? null,
    }

    // Log level based on status code
    if (statusCode >= 500) {
      logger.error(`${req.method} ${req.originalUrl} ${statusCode} ${duration}ms`, logData)
    } else if (statusCode >= 400) {
      logger.warn(`${req.method} ${req.originalUrl} ${statusCode} ${duration}ms`, logData)
    } else {
      logger.http(`${req.method} ${req.originalUrl} ${statusCode} ${duration}ms`, logData)
    }

    return originalEnd.apply(this, args as any)
  } as any

  next()
}
