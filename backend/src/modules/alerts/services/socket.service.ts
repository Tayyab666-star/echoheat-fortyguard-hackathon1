import { Server as HttpServer } from "http"
import { Server, type Socket, type Namespace } from "socket.io"
import jwt from "jsonwebtoken"
import { env } from "../../../config/env.js"
import { logger } from "../../../config/logger.js"
import type { JwtPayload } from "../../../middleware/authenticate.js"

// ── Types ───────────────────────────────────────────────────

interface AuthenticatedSocket extends Socket {
  data: {
    user: JwtPayload
  }
}

interface AlertNewPayload {
  id: string
  organization: string
  asset: unknown
  assetType: string
  severity: string
  alertType: string
  title: string
  message: string
  thermalSnapshot: { wbgt?: number; ambientTemp: number; internalTemp?: number; peakLoad?: number }
  location: { lat: number; lng: number; address: string }
  status: string
  createdAt: Date
}

interface AlertUpdatePayload {
  alertId: string
  changes: Record<string, unknown>
}

interface AssetStatusPayload {
  assetId: string
  status: Record<string, unknown>
}

interface SystemStatsPayload {
  activeAlerts: number
  assetsAtRisk: number
}

// ── Socket Service ──────────────────────────────────────────

class SocketService {
  private io: Server | null = null
  private alertsNamespace: Namespace | null = null

  // ── Initialize ────────────────────────────────────────────

  init(httpServer: HttpServer): Server {
    this.io = new Server(httpServer, {
      cors: {
        origin: env.ALLOWED_ORIGINS.split(",").map((o: string) => o.trim()),
        methods: ["GET", "POST"],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    })

    // ── Auth middleware ──────────────────────────────────────

    this.io.use((socket: Socket, next) => {
      const token =
        (socket.handshake.auth?.token as string) ??
        (socket.handshake.headers?.authorization?.startsWith("Bearer ")
          ? socket.handshake.headers.authorization.split(" ")[1]
          : undefined)

      if (!token) {
        next(new Error("Authentication required"))
        return
      }

      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as unknown as JwtPayload
        ;(socket as AuthenticatedSocket).data.user = decoded
        next()
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          next(new Error("Token expired"))
          return
        }
        next(new Error("Invalid token"))
      }
    })

    // ── Alerts namespace ────────────────────────────────────

    this.alertsNamespace = this.io.of("/alerts")

    this.alertsNamespace.on("connection", (socket: Socket) => {
      const authSocket = socket as AuthenticatedSocket
      const user = authSocket.data.user

      logger.info(`Socket connected: ${user.userId} (${user.email}) org=${user.organization}`)

      // Auto-join organization room
      authSocket.join(`org:${user.organization}`)
      logger.info(`Socket joined room org:${user.organization}`)

      // ── Client event: subscribe:asset ─────────────────────

      authSocket.on("subscribe:asset", (data: { assetId: string }) => {
        if (!data?.assetId) return
        authSocket.join(`asset:${data.assetId}`)
        logger.debug(`Socket subscribed to asset ${data.assetId}`)
      })

      // ── Client event: unsubscribe:asset ───────────────────

      authSocket.on("unsubscribe:asset", (data: { assetId: string }) => {
        if (!data?.assetId) return
        authSocket.leave(`asset:${data.assetId}`)
        logger.debug(`Socket unsubscribed from asset ${data.assetId}`)
      })

      // ── Client event: execute:action ──────────────────────

      authSocket.on(
        "execute:action",
        async (data: { alertId: string; actionType: string }) => {
          if (!data?.alertId || !data?.actionType) return

          logger.info(`Socket execute:action from ${user.userId}: alert=${data.alertId} action=${data.actionType}`)

          // Emit back as alert:update for all clients in the org
          this.emitAlertUpdate(user.organization, {
            alertId: data.alertId,
            changes: {
              status: "auto_executed",
              lastAction: {
                actionType: data.actionType,
                executedBy: user.userId,
                executedAt: new Date(),
              },
            },
          })
        }
      )

      // ── Disconnect ────────────────────────────────────────

      authSocket.on("disconnect", (reason) => {
        logger.info(`Socket disconnected: ${user.userId} reason=${reason}`)
      })
    })

    // ── System stats broadcast (every 30s) ──────────────────

    setInterval(() => {
      this.broadcastSystemStats()
    }, 30000)

    logger.info("Socket.io initialized on /alerts namespace")
    return this.io
  }

  // ── Emit: new alert ───────────────────────────────────────

  emitNewAlert(orgId: string, payload: AlertNewPayload): void {
    if (!this.alertsNamespace) return

    // Emit to organization room
    this.alertsNamespace.to(`org:${orgId}`).emit("alert:new", payload)

    // Also emit to asset-specific room
    const assetId = typeof payload.asset === "object" && payload.asset !== null
      ? String((payload.asset as { _id?: unknown })._id ?? payload.asset)
      : String(payload.asset)
    this.alertsNamespace.to(`asset:${assetId}`).emit("alert:new", payload)

    logger.debug(`Emitted alert:new to org:${orgId} and asset:${assetId}`)
  }

  // ── Emit: alert update ────────────────────────────────────

  emitAlertUpdate(orgId: string, payload: AlertUpdatePayload): void {
    if (!this.alertsNamespace) return
    this.alertsNamespace.to(`org:${orgId}`).emit("alert:update", payload)
    logger.debug(`Emitted alert:update to org:${orgId}`)
  }

  // ── Emit: asset status ────────────────────────────────────

  emitAssetStatus(orgId: string, payload: AssetStatusPayload): void {
    if (!this.alertsNamespace) return
    this.alertsNamespace.to(`org:${orgId}`).emit("asset:status", payload)
    this.alertsNamespace.to(`asset:${payload.assetId}`).emit("asset:status", payload)
  }

  // ── Emit: system stats ────────────────────────────────────

  emitSystemStats(payload: SystemStatsPayload): void {
    if (!this.alertsNamespace) return
    this.alertsNamespace.emit("system:stats", payload)
  }

  // ── Broadcast system stats (called by interval) ───────────

  private async broadcastSystemStats(): Promise<void> {
    try {
      const { Alert } = await import("../Alert.model.js")
      const { Asset } = await import("../../assets/Asset.model.js")

      const activeAlerts = await Alert.countDocuments({ status: "pending" })
      const assetsAtRisk = await Asset.countDocuments({
        isActive: true,
        _id: { $in: await Alert.distinct("asset", { status: "pending" }) },
      })

      this.emitSystemStats({ activeAlerts, assetsAtRisk })
    } catch (error) {
      logger.error("Failed to broadcast system stats:", error)
    }
  }

  // ── Get server instance ───────────────────────────────────

  getIO(): Server | null {
    return this.io
  }
}

export const socketService = new SocketService()
