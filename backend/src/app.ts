import express, { Request, Response } from "express";
import cors from "cors";
import alertsRouter from "./routes/alerts";
import orchestrateRouter from "./routes/orchestrate";

const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// Health check endpoint
app.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "online",
    service: "EchoHeat Orchestration API",
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use("/api/v1/alerts", alertsRouter);
app.use("/api/v1/orchestrate", orchestrateRouter);

const PORT = process.env.PORT || 8000;
app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`[ECHOHEAT BACKEND] Server running on port ${PORT}`);
});

export default app;
import express from "express";
import cors from "cors";
import alertsRouter from "./routes/alerts";
import orchestrateRouter from "./routes/orchestrate"; // <-- Add this import

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// Root health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "online", service: "EchoHeat Orchestration Backend" });
});

app.use("/api/v1/alerts", alertsRouter);
app.use("/api/v1/orchestrate", orchestrateRouter); // <-- Register orchestrate route

const PORT = process.env.PORT || 8000;
app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`EchoHeat Backend running on port ${PORT}`);
});

import express from "express"
import cors from "cors"
import helmet from "helmet"
import { createServer } from "http"

import { env } from "./config/env.js"
import { logger } from "./config/logger.js"
import { connectDB, disconnectDB } from "./config/db.js"
import { closeRedis } from "./config/redis.js"
import {
  globalErrorHandler,
  notFoundHandler,
  publicLimiter,
  authenticatedLimiter,
  loginLimiter,
  requestLogger,
  sanitize,
} from "./middleware/index.js"
import { sendSuccess } from "./utils/response.js"
import { socketService } from "./modules/alerts/services/socket.service.js"
import { initializeCache } from "./utils/cacheWarming.js"

import authRoutes from "./modules/auth/routes/auth.routes.js"
import assetsRoutes from "./modules/assets/routes/assets.routes.js"
import alertsRoutes from "./modules/alerts/routes/alerts.routes.js"
import analyticsRoutes from "./modules/analytics/routes/analytics.routes.js"
import integrationsRoutes from "./modules/integrations/routes/integrations.routes.js"
import thermalEngineRoutes from "./modules/thermalEngine/routes/thermalEngine.routes.js"
import { startThermalPollJob } from "./jobs/thermalPoll.job.js"

import mongoose from "mongoose"

const app = express()
const httpServer = createServer(app)

// ── Initialize Socket.io ────────────────────────────────────
socketService.init(httpServer)

// ── Security: Helmet ────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  noSniff: true,
  xssFilter: true,
}))

// ── Security: CORS (whitelist from env) ─────────────────────
const allowedOrigins = env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin) {
      callback(null, true)
      return
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      logger.warn(`CORS blocked origin: ${origin}`)
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
  exposedHeaders: ["X-Request-ID"],
  maxAge: 86400, // Preflight cache: 24 hours
}))

// ── Body Parsing ────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// ── Input Sanitization (NoSQL injection prevention) ─────────
app.use(sanitize)

// ── Request Logging ─────────────────────────────────────────
app.use(requestLogger)

// ── Rate Limiting ───────────────────────────────────────────
app.use("/api/v1", publicLimiter)

// ── Health Check ────────────────────────────────────────────
app.get("/api/v1/health", (_req, res) => {
  sendSuccess(res, {
    status: "ok",
    service: "echoheat-api",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    websocket: socketService.getIO() !== null ? "connected" : "disconnected",
  })
})

app.get("/api/v1/health/db", async (_req, res) => {
  try {
    await mongoose.connection.db?.admin().ping()
    sendSuccess(res, { status: "ok", mongodb: "connected" })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    sendSuccess(res, { status: "error", mongodb: "disconnected", error: message }, "Database unavailable", 503 as any)
  }
})

// ── API Routes ──────────────────────────────────────────────
app.use("/api/v1/auth", loginLimiter, authRoutes)
app.use("/api/v1/assets", authenticatedLimiter, assetsRoutes)
app.use("/api/v1/alerts", authenticatedLimiter, alertsRoutes)
app.use("/api/v1/analytics", authenticatedLimiter, analyticsRoutes)
app.use("/api/v1/thermal-engine", authenticatedLimiter, thermalEngineRoutes)
app.use("/api/v1/integrations", authenticatedLimiter, integrationsRoutes)

// ── 404 fallback ────────────────────────────────────────────
app.use(notFoundHandler)

// ── Global Error Handler ────────────────────────────────────
app.use(globalErrorHandler)

// ── Start Server ────────────────────────────────────────────
const PORT = env.PORT

httpServer.listen(PORT, async () => {
  logger.info(`EchoHeat API running on port ${PORT} [${env.NODE_ENV}]`)
  logger.info(`Health check: http://localhost:${PORT}/api/v1/health`)
  logger.info(`WebSocket: ws://localhost:${PORT}/alerts`)

  // Connect to MongoDB (non-fatal in production)
  try {
    await connectDB()
  } catch {
    logger.warn("Startup: MongoDB connection failed, running in degraded mode")
  }

  // Start the 5-minute thermal poll cron job
  startThermalPollJob()

  // Initialize Redis cache warming and metrics logger
  try {
    await initializeCache()
  } catch {
    logger.warn("Startup: Cache initialization skipped")
  }
})

// ── Graceful Shutdown ────────────────────────────────────────
async function gracefulShutdown(signal: string) {
  logger.info(`${signal} received, shutting down gracefully...`)
  httpServer.close(async () => {
    await disconnectDB()
    await closeRedis()
    logger.info("Server shut down")
    process.exit(0)
  })

  // Force exit after 10s if graceful shutdown stalls
  setTimeout(() => {
    logger.error("Forced shutdown after timeout")
    process.exit(1)
  }, 10_000)
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
process.on("SIGINT", () => gracefulShutdown("SIGINT"))

export default app
