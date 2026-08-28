import { Router } from "express"
import {
  listAlerts,
  getAlertById,
  dismissAlert,
  executeAction,
  getStats,
} from "../controllers/alerts.controller.js"
import { authenticate } from "../../../middleware/authenticate.js"
import { cacheMiddleware } from "../../../middleware/cacheMiddleware.js"
import { env } from "../../../config/env.js"

const router = Router()

router.use(authenticate)

router.get("/stats", cacheMiddleware(env.CACHE_TTL_ALERT_STATS, "alert:stats"), getStats)
router.get("/", listAlerts)
router.get("/:id", getAlertById)
router.patch("/:id/dismiss", dismissAlert)
router.patch("/:id/execute", executeAction)

export default router
