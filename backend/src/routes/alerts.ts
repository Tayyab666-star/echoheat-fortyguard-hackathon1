import { Router } from "express"
import {
  getAlerts,
  getAlertById,
  getSensorSnapshot,
  getExecutionLog,
} from "../services"
import type { AlertFilter } from "../../../shared/types"

const router = Router()

// GET /api/alerts?filter=critical&search=KI-04
router.get("/", (req, res) => {
  const filter = (req.query.filter as AlertFilter) ?? "all"
  const search = (req.query.search as string) ?? undefined
  const alerts = getAlerts(filter, search)
  res.json({ alerts, total: alerts.length })
})

// GET /api/alerts/:id
router.get("/:id", (req, res) => {
  const alert = getAlertById(req.params.id)
  if (!alert) {
    res.status(404).json({ error: "Alert not found" })
    return
  }

  const snapshot = getSensorSnapshot(alert.id)
  const execLog = getExecutionLog(alert.id)

  res.json({ alert, snapshot, executionLog: execLog })
})

// POST /api/alerts/:id/execute
router.post("/:id/execute", (req, res) => {
  const alert = getAlertById(req.params.id)
  if (!alert) {
    res.status(404).json({ error: "Alert not found" })
    return
  }

  // Simulate action execution
  res.json({
    success: true,
    message: `Action executed for alert ${alert.id}`,
    executedAt: new Date().toISOString(),
  })
})

// POST /api/alerts/:id/dismiss
router.post("/:id/dismiss", (req, res) => {
  const alert = getAlertById(req.params.id)
  if (!alert) {
    res.status(404).json({ error: "Alert not found" })
    return
  }

  res.json({
    success: true,
    message: `Alert ${alert.id} dismissed`,
    dismissedAt: new Date().toISOString(),
  })
})

// POST /api/alerts/mark-all-read
router.post("/mark-all-read", (_req, res) => {
  res.json({
    success: true,
    message: "All alerts marked as read",
    markedAt: new Date().toISOString(),
  })
})

export default router
