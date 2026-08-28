import type { Request, Response, NextFunction } from "express"
import mongoose from "mongoose"
import { AppError } from "../utils/AppError.js"
import { logger } from "../config/logger.js"

/**
 * Multi-tenant organization scoping middleware.
 *
 * Ensures that all resource requests are scoped to the authenticated
 * user's organization, preventing cross-organization data access.
 *
 * Checks the `organization` field on the resource document matches
 * req.user.organization. Supports both param-based (:id) lookups
 * and query-based list operations.
 *
 * Applied to: /assets, /alerts, /analytics routes
 */
export function validateOrg(...collectionNames: string[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.organization) {
        next(AppError.forbidden("Organization context required"))
        return
      }

      const userOrg = req.user.organization

      // For list endpoints (GET / without :id), just attach org filter
      if (!req.params.id) {
        // Attach org filter to query for downstream handlers
        req.query.organization = userOrg
        next()
        return
      }

      // For single-resource endpoints, verify ownership
      const resourceId = req.params.id

      if (!mongoose.Types.ObjectId.isValid(resourceId)) {
        next(AppError.notFound("Invalid resource ID format"))
        return
      }

      // Check across specified collections (or default to assets)
      const collections = collectionNames.length > 0 ? collectionNames : ["assets"]

      for (const collectionName of collections) {
        const db = mongoose.connection.db
        if (!db) continue

        const doc = await db.collection(collectionName).findOne(
          {
            _id: new mongoose.Types.ObjectId(resourceId),
            organization: userOrg,
          },
          { projection: { _id: 1 } }
        )

        if (doc) {
          next()
          return
        }
      }

      // Resource not found in any collection for this org
      logger.warn(
        `Org scope violation: user ${req.user.userId} (${userOrg}) attempted to access resource ${resourceId}`
      )
      next(AppError.notFound("Resource not found"))
    } catch (error) {
      logger.error("validateOrg error:", error)
      next(AppError.internal("Organization validation failed"))
    }
  }
}
