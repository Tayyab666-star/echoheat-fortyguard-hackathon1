import type { Request, Response, NextFunction } from "express"

/**
 * Input sanitization middleware.
 *
 * Strips $-prefixed keys from req.body to prevent NoSQL injection attacks.
 * MongoDB operators like $gt, $ne, $where can be abused if user input
 * is passed directly into queries.
 *
 * Applied before route handlers on all POST/PUT/PATCH routes.
 */
export function sanitize(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === "object") {
    req.body = stripDollarKeys(req.body)
  }

  if (req.query && typeof req.query === "object") {
    req.query = stripDollarKeys(req.query as Record<string, unknown>) as any
  }

  if (req.params && typeof req.params === "object") {
    req.params = stripDollarKeys(req.params as Record<string, unknown>) as any
  }

  next()
}

/**
 * Recursively removes $-prefixed keys from an object or array.
 */
function stripDollarKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(stripDollarKeys)
  }

  if (obj !== null && typeof obj === "object" && !(obj instanceof Date)) {
    const sanitized: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (!key.startsWith("$")) {
        sanitized[key] = stripDollarKeys(value)
      }
    }
    return sanitized
  }

  return obj
}
