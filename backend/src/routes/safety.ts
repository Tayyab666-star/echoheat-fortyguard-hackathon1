import { Router } from "express"
import {
  getComplianceLogs,
  getDispatchAlerts,
  getSites,
  getShiftBlocks,
} from "../services"

const router = Router()

// GET /api/safety/compliance-logs
router.get("/compliance-logs", (_req, res) => {
  const logs = getComplianceLogs()
  res.json({ logs, total: logs.length })
})

// GET /api/safety/dispatch-alerts
router.get("/dispatch-alerts", (_req, res) => {
  const alerts = getDispatchAlerts()
  res.json({ alerts, total: alerts.length })
})

// GET /api/safety/sites
router.get("/sites", (_req, res) => {
  const sites = getSites()
  res.json({ sites })
})

// GET /api/safety/shift-blocks
router.get("/shift-blocks", (_req, res) => {
  const blocks = getShiftBlocks()
  res.json({ blocks })
})

// POST /api/safety/dispatch-alerts/:id/confirm
router.post("/dispatch-alerts/:id/confirm", (req, res) => {
  res.json({
    success: true,
    message: `Dispatch alert ${req.params.id} confirmed`,
    confirmedAt: new Date().toISOString(),
  })
})

export default router
