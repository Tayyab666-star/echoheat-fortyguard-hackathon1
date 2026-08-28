import { z } from "zod"

// ── List Alerts Query ───────────────────────────────────────

export const listAlertsSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["pending", "auto_executed", "dismissed", "escalated"]).optional(),
  severity: z.enum(["critical", "warning", "info"]).optional(),
  alertType: z
    .enum(["wbgt_breach", "cargo_at_risk", "peak_demand", "reroute_needed", "pre_cool_executed", "osha_log_filed"])
    .optional(),
  assetId: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(["createdAt", "updatedAt", "severity"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
})

// ── Dismiss Alert ───────────────────────────────────────────

export const dismissAlertSchema = z
  .object({
    reason: z.string().max(500, "Reason cannot exceed 500 characters").optional(),
  })
  .strict()

// ── Execute Action ──────────────────────────────────────────

export const executeActionSchema = z
  .object({
    actionType: z
      .string()
      .min(1, "Action type is required")
      .describe("The type of action to execute (e.g., dispatch_rest, reroute, pre_cool)"),
    payload: z.record(z.unknown()).optional().describe("Optional payload for the action"),
  })
  .strict()

export type ListAlertsQuery = z.infer<typeof listAlertsSchema>
export type DismissAlertInput = z.infer<typeof dismissAlertSchema>
export type ExecuteActionInput = z.infer<typeof executeActionSchema>
