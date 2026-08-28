import { alertsRepository, type AlertStats } from "../repositories/alerts.repository.js"
import { AppError } from "../../../utils/AppError.js"
import { logger } from "../../../config/logger.js"
import type { ListAlertsQuery, DismissAlertInput, ExecuteActionInput } from "../validators.js"
import { socketService } from "./socket.service.js"

export class AlertsService {
  // ── List alerts ─────────────────────────────────────────────

  async listAlerts(query: ListAlertsQuery, orgId: string) {
    return alertsRepository.list(query, orgId)
  }

  // ── Get alert by ID ────────────────────────────────────────

  async getAlertById(id: string) {
    const alert = await alertsRepository.findById(id)
    if (!alert) throw AppError.notFound("Alert not found")
    return this.serialize(alert)
  }

  // ── Dismiss alert ──────────────────────────────────────────

  async dismissAlert(id: string, userId: string, input: DismissAlertInput) {
    const alert = await alertsRepository.findById(id)
    if (!alert) throw AppError.notFound("Alert not found")

    if (alert.status === "dismissed") {
      throw AppError.badRequest("Alert is already dismissed")
    }

    const action = {
      actionType: "dismiss",
      executedAt: new Date(),
      executedBy: userId,
      payload: { reason: input.reason },
      result: "Alert dismissed by user",
    }

    const updated = await alertsRepository.updateById(id, {
      status: "dismissed",
      resolvedBy: userId,
      autoResolvedAt: new Date(),
    })

    await alertsRepository.pushAction(id, action)

    if (updated) {
      socketService.emitAlertUpdate(alert.organization, {
        alertId: id,
        changes: { status: "dismissed", resolvedBy: userId },
      })
    }

    logger.info(`Alert ${id} dismissed by user ${userId}`)
    return this.serialize(updated!)
  }

  // ── Execute action ─────────────────────────────────────────

  async executeAction(id: string, userId: string, input: ExecuteActionInput) {
    const alert = await alertsRepository.findById(id)
    if (!alert) throw AppError.notFound("Alert not found")

    if (alert.status === "dismissed") {
      throw AppError.badRequest("Cannot execute action on a dismissed alert")
    }

    // Determine integration target based on alert type
    let integrationTarget: string | undefined
    switch (alert.alertType) {
      case "wbgt_breach":
      case "osha_log_filed":
        integrationTarget = "procore"
        break
      case "reroute_needed":
        integrationTarget = "samsara"
        break
      case "peak_demand":
      case "pre_cool_executed":
        integrationTarget = "bacnet"
        break
      case "cargo_at_risk":
        integrationTarget = "samsara"
        break
    }

    const action = {
      actionType: input.actionType,
      executedAt: new Date(),
      executedBy: userId,
      payload: input.payload,
      result: `Action '${input.actionType}' executed successfully`,
      integrationTarget,
    }

    const updatedStatus = alert.severity === "critical" ? "auto_executed" : "escalated"
    const updated = await alertsRepository.updateById(id, {
      status: updatedStatus,
    })

    await alertsRepository.pushAction(id, action)

    if (updated) {
      socketService.emitAlertUpdate(alert.organization, {
        alertId: id,
        changes: { status: updatedStatus, lastAction: action },
      })
    }

    logger.info(`Action '${input.actionType}' executed on alert ${id} by user ${userId}`)
    return this.serialize(updated!)
  }

  // ── Get stats ──────────────────────────────────────────────

  async getStats(orgId: string): Promise<AlertStats> {
    return alertsRepository.getStats(orgId)
  }

  // ── Helpers ────────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private serialize(alert: any) {
    return {
      id: alert._id?.toString?.() ?? alert.id,
      organization: alert.organization,
      asset: alert.asset,
      assetType: alert.assetType,
      severity: alert.severity,
      alertType: alert.alertType,
      title: alert.title,
      message: alert.message,
      thermalSnapshot: alert.thermalSnapshot,
      location: alert.location,
      status: alert.status,
      actions: alert.actions,
      autoResolvedAt: alert.autoResolvedAt,
      resolvedBy: alert.resolvedBy,
      createdAt: alert.createdAt,
      updatedAt: alert.updatedAt,
    }
  }
}

export const alertsService = new AlertsService()
