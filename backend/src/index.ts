import express from "express"
import cors from "cors"

import alertsRouter from "./routes/alerts"
import fleetRouter from "./routes/fleet"
import facilityRouter from "./routes/facility"
import safetyRouter from "./routes/safety"
import dashboardRouter from "./routes/dashboard"

const app = express()
const PORT = process.env.PORT ?? 4000

// ── Middleware ───────────────────────────────────────────────
app.use(cors({ origin: ["http://localhost:3000", "http://localhost:3001"], credentials: true }))
app.use(express.json())

// ── Health check ────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "echoheat-backend", timestamp: new Date().toISOString() })
})

// ── API Routes ──────────────────────────────────────────────
app.use("/api/alerts", alertsRouter)
app.use("/api/fleet", fleetRouter)
app.use("/api/facility", facilityRouter)
app.use("/api/safety", safetyRouter)
app.use("/api", dashboardRouter)

// ── 404 fallback ────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" })
})

// ── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  EchoHeat Backend API`)
  console.log(`  http://localhost:${PORT}/api/health\n`)
})

export default app
