import { Router } from "express"
import { authenticate } from "../../../middleware/authenticate.js"
import { cacheMiddleware } from "../../../middleware/cacheMiddleware.js"
import { env } from "../../../config/env.js"
import {
  getFortygardSnapshot,
  getFortygardCorridor,
  connectSamsara,
  disconnectSamsara,
  syncSamsaraData,
  getSamsaraStatus,
  connectProcore,
  handleProcoreCallback,
  getProcoreStatus,
} from "../integrations.controller.js"

const router = Router()

// ── FortyGuard ──────────────────────────────────────────────

router.get("/fortygard/snapshot", authenticate, cacheMiddleware(env.CACHE_TTL_FORTYGUARD, "fg:snapshot"), getFortygardSnapshot)
router.post("/fortygard/corridor", authenticate, getFortygardCorridor)

// ── Samsara ─────────────────────────────────────────────────

router.post("/samsara/connect", authenticate, connectSamsara)
router.post("/samsara/disconnect", authenticate, disconnectSamsara)
router.post("/samsara/sync", authenticate, syncSamsaraData)
router.get("/samsara/status", authenticate, getSamsaraStatus)

// ── Procore ─────────────────────────────────────────────────

router.get("/procore/auth", authenticate, connectProcore)
router.get("/procore/auth-callback", authenticate, handleProcoreCallback)
router.get("/procore/status", authenticate, getProcoreStatus)

export default router
