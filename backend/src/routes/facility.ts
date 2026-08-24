import { Router } from "express"
import {
  getChillers,
  getSchedule,
  getDemandCurves,
} from "../services"

const router = Router()

// GET /api/facility/chillers
router.get("/chillers", (_req, res) => {
  const chillers = getChillers()
  res.json({ chillers, total: chillers.length })
})

// GET /api/facility/schedule
router.get("/schedule", (_req, res) => {
  const schedule = getSchedule()
  res.json({ schedule })
})

// GET /api/facility/demand-curves
router.get("/demand-curves", (_req, res) => {
  const { baseline, optimized } = getDemandCurves()
  res.json({ baseline, optimized })
})

// POST /api/facility/chillers/:id/precool
router.post("/chillers/:id/precool", (req, res) => {
  res.json({
    success: true,
    message: `Pre-cooling initiated for chiller ${req.params.id}`,
    initiatedAt: new Date().toISOString(),
  })
})

// POST /api/facility/schedule/:id/override
router.post("/schedule/:id/override", (req, res) => {
  res.json({
    success: true,
    message: `Schedule ${req.params.id} overridden`,
    overriddenAt: new Date().toISOString(),
  })
})

export default router
