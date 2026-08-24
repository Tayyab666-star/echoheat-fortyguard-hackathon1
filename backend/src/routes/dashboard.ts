import { Router } from "express"
import {
  getFeedEntries,
  getThermalZones,
  getMonthlySavings,
  getIncidentData,
  getROISegments,
  getKPIData,
} from "../services"

const router = Router()

// GET /api/dashboard/feed
router.get("/feed", (_req, res) => {
  const entries = getFeedEntries()
  res.json({ entries, total: entries.length })
})

// GET /api/dashboard/zones
router.get("/zones", (_req, res) => {
  const zones = getThermalZones()
  res.json({ zones })
})

// GET /api/analytics/savings
router.get("/analytics/savings", (_req, res) => {
  const savings = getMonthlySavings()
  res.json(savings)
})

// GET /api/analytics/incidents
router.get("/analytics/incidents", (_req, res) => {
  const incidents = getIncidentData()
  res.json(incidents)
})

// GET /api/analytics/roi
router.get("/analytics/roi", (_req, res) => {
  const segments = getROISegments()
  const totalCost = "$425,400"
  const totalAvoided = "$618,600"
  const blendedROI = "8.3x"
  res.json({ segments, totalCost, totalAvoided, blendedROI })
})

// GET /api/analytics/kpi
router.get("/analytics/kpi", (_req, res) => {
  const kpi = getKPIData()
  res.json({ kpi })
})

export default router
