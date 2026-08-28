export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly code: string

  constructor(message: string, statusCode: number, code?: string, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.code = code ?? `ERR_${statusCode}`
    Object.setPrototypeOf(this, new.target.prototype)
    Error.captureStackTrace(this, this.constructor)
  }

  static badRequest(message = "Bad request", code?: string): AppError {
    return new AppError(message, 400, code)
  }

  static unauthorized(message = "Unauthorized", code?: string): AppError {
    return new AppError(message, 401, code)
  }

  static forbidden(message = "Forbidden", code?: string): AppError {
    return new AppError(message, 403, code)
  }

  static notFound(message = "Resource not found", code?: string): AppError {
    return new AppError(message, 404, code)
  }

  static conflict(message = "Resource conflict", code?: string): AppError {
    return new AppError(message, 409, code)
  }

  static validation(message = "Validation error", code?: string): AppError {
    return new AppError(message, 422, code)
  }

  static tooManyRequests(message = "Too many requests", code?: string): AppError {
    return new AppError(message, 429, code)
  }

  static internal(message = "Internal server error", code?: string): AppError {
    return new AppError(message, 500, code, false)
  }
}
