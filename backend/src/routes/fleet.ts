import { Router } from "express"
import { getVehicles, getFleetStatusMetrics } from "../services"

const router = Router()

// GET /api/fleet/vehicles
router.get("/vehicles", (_req, res) => {
  const vehicles = getVehicles()
  res.json({ vehicles, total: vehicles.length })
})

// GET /api/fleet/status
router.get("/status", (_req, res) => {
  const metrics = getFleetStatusMetrics()
  res.json({ metrics })
})

// POST /api/fleet/vehicles/:id/reroute
router.post("/vehicles/:id/reroute", (req, res) => {
  res.json({
    success: true,
    message: `Vehicle ${req.params.id} reroute initiated`,
    reroutedAt: new Date().toISOString(),
  })
})

// POST /api/fleet/vehicles/:id/precool
router.post("/vehicles/:id/precool", (req, res) => {
  res.json({
    success: true,
    message: `Pre-cooling initiated for vehicle ${req.params.id}`,
    initiatedAt: new Date().toISOString(),
  })
})

export default router
