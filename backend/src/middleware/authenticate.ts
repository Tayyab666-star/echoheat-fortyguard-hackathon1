import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { env } from "../config/env.js"
import { AppError } from "../utils/AppError.js"

export interface JwtPayload {
  userId: string
  email: string
  role: string
  organization: string
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

/**
 * JWT Authentication middleware.
 *
 * Verifies the Bearer token from the Authorization header and attaches
 * the decoded payload to req.user.
 *
 * - Missing/malformed header → 401 "Missing or invalid authorization header"
 * - Expired token → 401 "Access token has expired"
 * - Invalid/malformed token → 403 "Invalid access token"
 * - Valid token but missing user payload → 403 "Token payload is malformed"
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith("Bearer ")) {
    next(AppError.unauthorized("Missing or invalid authorization header"))
    return
  }

  const token = authHeader.split(" ")[1]

  if (!token) {
    next(AppError.unauthorized("Missing or invalid authorization header"))
    return
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as unknown as JwtPayload

    if (!decoded?.userId || !decoded?.organization) {
      next(AppError.forbidden("Token payload is malformed"))
      return
    }

    req.user = decoded
    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(AppError.unauthorized("Access token has expired"))
      return
    }

    if (error instanceof jwt.JsonWebTokenError) {
      next(AppError.forbidden("Invalid access token"))
      return
    }

    next(AppError.forbidden("Invalid access token"))
  }
}
