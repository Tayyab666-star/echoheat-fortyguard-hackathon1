import type { Request, Response, NextFunction } from "express"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import { AppError } from "../utils/AppError.js"
import { logger } from "../config/logger.js"
import { env } from "../config/env.js"

// ── Custom error interface ──────────────────────────────────

interface CustomError extends Error {
  statusCode?: number
  isOperational?: boolean
  code?: string | number
  errors?: Record<string, string[]>
  path?: string
  value?: string
  keyPattern?: Record<string, unknown>
  // Mongoose CastError
  kind?: string
}

// ── Global Error Handler ────────────────────────────────────

export function globalErrorHandler(err: CustomError, _req: Request, res: Response, _next: NextFunction): void {
  // ── Mongoose ValidationError → 400 ─────────────────────────
  if (err instanceof mongoose.Error.ValidationError) {
    const errors: Record<string, string[]> = {}
    for (const [field, detail] of Object.entries(err.errors)) {
      errors[field] = [(detail as any).message]
    }

    logger.warn(`Validation error: ${err.message}`, { errors })

    res.status(400).json({
      status: "error",
      message: "Validation failed",
      code: "ERR_VALIDATION",
      errors,
    })
    return
  }

  // ── Mongoose CastError (bad ObjectId) → 404 ───────────────
  if (err instanceof mongoose.Error.CastError) {
    logger.warn(`CastError: ${err.message}`, { path: err.path, value: err.value })

    res.status(404).json({
      status: "error",
      message: "Resource not found",
      code: "ERR_NOT_FOUND",
    })
    return
  }

  // ── Mongoose Duplicate Key Error (code 11000) → 409 ───────
  if ((err as any).code === 11000 || err.keyPattern) {
    const field = Object.keys(err.keyPattern ?? {})[0] ?? "unknown"
    logger.warn(`Duplicate key error: ${field}`, { keyPattern: err.keyPattern })

    res.status(409).json({
      status: "error",
      message: `Resource already exists with ${field}`,
      code: "ERR_DUPLICATE",
      field,
    })
    return
  }

  // ── JWT Errors → 401 ──────────────────────────────────────
  if (err instanceof jwt.TokenExpiredError) {
    res.status(401).json({
      status: "error",
      message: "Access token has expired",
      code: "ERR_TOKEN_EXPIRED",
    })
    return
  }

  if (err instanceof jwt.JsonWebTokenError) {
    res.status(401).json({
      status: "error",
      message: "Invalid access token",
      code: "ERR_INVALID_TOKEN",
    })
    return
  }

  if (err instanceof jwt.NotBeforeError) {
    res.status(401).json({
      status: "error",
      message: "Token is not yet active",
      code: "ERR_TOKEN_NOT_ACTIVE",
    })
    return
  }

  // ── Operational AppError (expected errors) ─────────────────
  const statusCode = err.statusCode ?? 500
  const isOperational = err.isOperational ?? false

  if (isOperational) {
    logger.warn(`Operational error [${statusCode}]: ${err.message}`, {
      code: err.code,
      stack: env.NODE_ENV === "development" ? err.stack : undefined,
    })

    const response: Record<string, unknown> = {
      status: "error",
      message: err.message,
      code: err.code ?? `ERR_${statusCode}`,
    }

    if (err.errors) response.errors = err.errors
    if (env.NODE_ENV === "development") response.stack = err.stack

    res.status(statusCode).json(response)
    return
  }

  // ── Programming/Unknown errors ─────────────────────────────
  logger.error(`Unexpected error [${statusCode}]: ${err.message}`, {
    stack: err.stack,
    name: err.name,
  })

  // Production: include error message for debugging (remove after fixing)
  if (env.NODE_ENV === "production") {
    res.status(500).json({
      status: "error",
      message: err.message || "Something went wrong",
      code: "ERR_500",
      name: err.name,
    })
    return
  }

  // Development: include stack trace
  res.status(statusCode).json({
    status: "error",
    message: err.message,
    code: err.code ?? `ERR_${statusCode}`,
    stack: err.stack,
  })
}

// ── 404 Not Found Handler ───────────────────────────────────

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(AppError.notFound("Route not found. Check the API documentation for available endpoints."))
}
