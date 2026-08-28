import { Router } from "express"
import { authenticate } from "../../../middleware/authenticate.js"
import { cacheMiddleware } from "../../../middleware/cacheMiddleware.js"
import { env } from "../../../config/env.js"
import {
  getOverview,
  getROI,
  getAlertTrends,
  getAssetExposure,
  getDemandCurve,
  exportPDF,
} from "../controllers/analytics.controller.js"

const router = Router()

router.use(authenticate)

router.get("/overview", cacheMiddleware(env.CACHE_TTL_KPI, "kpi"), getOverview)
router.get("/roi", cacheMiddleware(env.CACHE_TTL_ANALYTICS_ROI, "analytics:roi"), getROI)
router.get("/alerts/trends", getAlertTrends)
router.get("/assets/exposure", getAssetExposure)
router.get("/demand-curve", getDemandCurve)
router.get("/export/pdf", exportPDF)

export default router
