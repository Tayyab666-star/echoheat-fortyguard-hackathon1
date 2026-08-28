import { z } from "zod"

// ── Common date range ───────────────────────────────────────

const dateRangeSchema = z.object({
  from: z.coerce.date().optional().describe("Start date (ISO 8601)"),
  to: z.coerce.date().optional().describe("End date (ISO 8601)"),
})

// ── GET /analytics/overview ─────────────────────────────────

export const overviewQuerySchema = dateRangeSchema.extend({
  assetType: z.enum(["vehicle", "site", "facility"]).optional(),
  assetId: z.string().optional(),
})

// ── GET /analytics/roi ──────────────────────────────────────

export const roiQuerySchema = dateRangeSchema.extend({
  assetType: z.enum(["vehicle", "site", "facility"]).optional(),
  assetId: z.string().optional(),
})

// ── GET /analytics/alerts/trends ────────────────────────────

export const alertTrendsQuerySchema = dateRangeSchema.extend({
  interval: z.enum(["day", "week", "month"]).default("day"),
  assetType: z.enum(["vehicle", "site", "facility"]).optional(),
  assetId: z.string().optional(),
})

// ── GET /analytics/assets/exposure ──────────────────────────

export const assetExposureQuerySchema = dateRangeSchema.extend({
  assetType: z.enum(["vehicle", "site", "facility"]).optional(),
  assetId: z.string().optional(),
})

// ── GET /analytics/demand-curve ─────────────────────────────

export const demandCurveQuerySchema = z.object({
  facilityId: z.string().min(1, "facilityId is required"),
  date: z.coerce.date().optional().describe("Date for demand curve (ISO 8601), defaults to today"),
})

// ── GET /analytics/export/pdf ───────────────────────────────

export const pdfExportQuerySchema = dateRangeSchema.extend({
  assetType: z.enum(["vehicle", "site", "facility"]).optional(),
  assetId: z.string().optional(),
})

export type OverviewQuery = z.infer<typeof overviewQuerySchema>
export type ROIQuery = z.infer<typeof roiQuerySchema>
export type AlertTrendsQuery = z.infer<typeof alertTrendsQuerySchema>
export type AssetExposureQuery = z.infer<typeof assetExposureQuerySchema>
export type DemandCurveQuery = z.infer<typeof demandCurveQuerySchema>
export type PDFExportQuery = z.infer<typeof pdfExportQuerySchema>
