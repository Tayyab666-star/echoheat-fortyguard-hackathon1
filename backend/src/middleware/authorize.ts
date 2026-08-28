import type { Request, Response, NextFunction } from "express"
import { AppError } from "../utils/AppError.js"

/**
 * Role-based authorization middleware.
 *
 * Must be used AFTER the authenticate middleware.
 * Returns 403 Forbidden if the authenticated user's role is not in the
 * allowed list.
 *
 * @example
 *   router.get("/admin", authenticate, authorize("admin"), handler)
 *   router.post("/", authenticate, authorize("admin", "fleet_manager"), handler)
 */
export function authorize(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(AppError.unauthorized("Not authenticated"))
      return
    }

    if (allowedRoles.length === 0) {
      next()
      return
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(
        AppError.forbidden(
          `Insufficient permissions. Required role: ${allowedRoles.join(" or ")}`
        )
      )
      return
    }

    next()
  }
}
