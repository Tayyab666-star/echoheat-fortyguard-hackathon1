import type { Request, Response } from "express"
import { alertsService } from "../services/alerts.service.js"
import { sendSuccess } from "../../../utils/response.js"
import { asyncCatch } from "../../../utils/asyncCatch.js"
import { validate } from "../../../utils/validators.js"
import { listAlertsSchema, dismissAlertSchema, executeActionSchema } from "../validators.js"

export const listAlerts = asyncCatch(async (req: Request, res: Response) => {
  const query = validate(listAlertsSchema, req.query)
  const result = await alertsService.listAlerts(query, req.user!.organization)
  sendSuccess(res, result)
})

export const getAlertById = asyncCatch(async (req: Request, res: Response) => {
  const id = req.params.id as string
  const result = await alertsService.getAlertById(id)
  sendSuccess(res, result)
})

export const dismissAlert = asyncCatch(async (req: Request, res: Response) => {
  const id = req.params.id as string
  const body = validate(dismissAlertSchema, req.body ?? {})
  const result = await alertsService.dismissAlert(id, req.user!.userId, body)
  sendSuccess(res, result, "Alert dismissed")
})

export const executeAction = asyncCatch(async (req: Request, res: Response) => {
  const id = req.params.id as string
  const body = validate(executeActionSchema, req.body)
  const result = await alertsService.executeAction(id, req.user!.userId, body)
  sendSuccess(res, result, "Action executed")
})

export const getStats = asyncCatch(async (_req: Request, res: Response) => {
  const result = await alertsService.getStats(_req.user!.organization)
  sendSuccess(res, result)
})
