import type { Response } from "express"

interface SuccessResponse<T = unknown> {
  status: "success"
  message?: string
  data: T
}

interface ErrorResponse {
  status: "error"
  message: string
  errors?: Record<string, string[]>
}

export function sendSuccess<T>(res: Response, data: T, message?: string, statusCode = 200): void {
  const body: SuccessResponse<T> = { status: "success", data }
  if (message) body.message = message
  res.status(statusCode).json(body)
}

export function sendError(res: Response, message: string, statusCode = 500, errors?: Record<string, string[]>): void {
  const body: ErrorResponse = { status: "error", message }
  if (errors) body.errors = errors
  res.status(statusCode).json(body)
}
