import type { Request, Response } from "express"
import { sendSuccess, sendError } from "../../../utils/response.js"
import { asyncCatch } from "../../../utils/asyncCatch.js"
import { validate } from "../../../utils/validators.js"
import {
  overviewQuerySchema,
  roiQuerySchema,
  alertTrendsQuerySchema,
  assetExposureQuerySchema,
  demandCurveQuerySchema,
  pdfExportQuerySchema,
} from "../validators.js"
import { analyticsService } from "../services/analytics.service.js"
import { logger } from "../../../config/logger.js"

// ── GET /analytics/overview ─────────────────────────────────

export const getOverview = asyncCatch(async (req: Request, res: Response) => {
  const query = validate(overviewQuerySchema, req.query)
  const result = await analyticsService.getOverviewKPIs(req.user!.organization, query)
  sendSuccess(res, result)
})

// ── GET /analytics/roi ──────────────────────────────────────

export const getROI = asyncCatch(async (req: Request, res: Response) => {
  const query = validate(roiQuerySchema, req.query)
  const result = await analyticsService.getROIBreakdown(req.user!.organization, query)
  sendSuccess(res, result)
})

// ── GET /analytics/alerts/trends ────────────────────────────

export const getAlertTrends = asyncCatch(async (req: Request, res: Response) => {
  const query = validate(alertTrendsQuerySchema, req.query)
  const result = await analyticsService.getAlertTrends(req.user!.organization, query)
  sendSuccess(res, result)
})

// ── GET /analytics/assets/exposure ──────────────────────────

export const getAssetExposure = asyncCatch(async (req: Request, res: Response) => {
  const query = validate(assetExposureQuerySchema, req.query)
  const result = await analyticsService.getAssetExposureHeatmap(req.user!.organization, query)
  sendSuccess(res, result)
})

// ── GET /analytics/demand-curve ─────────────────────────────

export const getDemandCurve = asyncCatch(async (req: Request, res: Response) => {
  const query = validate(demandCurveQuerySchema, req.query)
  const result = await analyticsService.getDemandCurveData(query)
  sendSuccess(res, result)
})

// ── GET /analytics/export/pdf ───────────────────────────────

export const exportPDF = asyncCatch(async (req: Request, res: Response) => {
  const query = validate(pdfExportQuerySchema, req.query)

  try {
    // Dynamic import to avoid hard dependency on puppeteer at startup
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    const puppeteer: any = require("puppeteer")
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })

    const page = await browser.newPage()

    // Fetch analytics data
    const orgId = req.user!.organization
    const [overview, roi, trends] = await Promise.all([
      analyticsService.getOverviewKPIs(orgId, query),
      analyticsService.getROIBreakdown(orgId, query),
      analyticsService.getAlertTrends(orgId, { ...query, interval: "day" as const }),
    ])

    // Generate HTML report
    const html = generateReportHTML(overview, roi, trends, query)
    await page.setContent(html, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
    })

    await browser.close()

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename="echoheat-report-${new Date().toISOString().split("T")[0]}.pdf"`)
    res.status(200).send(pdfBuffer)
  } catch (error) {
    logger.error("PDF export error:", error)
    sendError(res, "Failed to generate PDF report", 500)
  }
})

// ── HTML Report Generator ───────────────────────────────────

function generateReportHTML(overview: any, roi: any, trends: any, query: any): string {
  const dateRange = query.from && query.to
    ? `${new Date(query.from).toLocaleDateString()} — ${new Date(query.to).toLocaleDateString()}`
    : "All Time"

  const segmentsHTML = roi.segments.map((s: any) => `
    <tr>
      <td style="padding:8px;border:1px solid #e5e7eb;text-transform:capitalize">${s.segment}</td>
      <td style="padding:8px;border:1px solid #e5e7eb;text-align:right">$${s.subscriptionCost.toLocaleString()}</td>
      <td style="padding:8px;border:1px solid #e5e7eb;text-align:right">$${s.avoidedLosses.toLocaleString()}</td>
      <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;font-weight:bold;color:${s.netROI >= 1 ? '#059669' : '#dc2626'}">${s.netROI}x</td>
    </tr>
  `).join("")

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; line-height: 1.5; }
    .header { background: linear-gradient(135deg, #ea580c, #dc2626); color: white; padding: 30px 40px; }
    .header h1 { font-size: 28px; font-weight: 700; }
    .header p { opacity: 0.9; margin-top: 4px; font-size: 14px; }
    .content { padding: 30px 40px; }
    .section { margin-bottom: 30px; }
    .section h2 { font-size: 18px; font-weight: 600; color: #ea580c; border-bottom: 2px solid #ea580c; padding-bottom: 6px; margin-bottom: 16px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .kpi-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
    .kpi-label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
    .kpi-value { font-size: 24px; font-weight: 700; color: #111827; margin-top: 4px; }
    .kpi-sub { font-size: 12px; color: #6b7280; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th { background: #f3f4f6; padding: 8px; border: 1px solid #e5e7eb; text-align: left; font-weight: 600; }
    .footer { background: #f9fafb; padding: 20px 40px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; margin-right: 4px; }
    .badge-critical { background: #fef2f2; color: #dc2626; }
    .badge-warning { background: #fffbeb; color: #d97706; }
    .badge-info { background: #eff6ff; color: #2563eb; }
  </style>
</head>
<body>
  <div class="header">
    <h1>EchoHeat Analytics Report</h1>
    <p>FortyGuard Heat Intelligence Platform — ${dateRange}</p>
  </div>

  <div class="content">
    <div class="section">
      <h2>Executive Summary</h2>
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Total Alerts</div>
          <div class="kpi-value">${overview.alertsBySeverity.critical + overview.alertsBySeverity.warning + overview.alertsBySeverity.info}</div>
          <div class="kpi-sub">
            <span class="badge badge-critical">${overview.alertsBySeverity.critical} critical</span>
            <span class="badge badge-warning">${overview.alertsBySeverity.warning} warning</span>
            <span class="badge badge-info">${overview.alertsBySeverity.info} info</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Estimated Savings</div>
          <div class="kpi-value" style="color:#059669">$${(overview.estimatedSaved / 1000).toFixed(1)}K</div>
          <div class="kpi-sub">${overview.autoExecutedActions} actions auto-executed</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Assets at Risk</div>
          <div class="kpi-value" style="color:${overview.assetsAtRisk > 0 ? '#dc2626' : '#059669'}">${overview.assetsAtRisk}</div>
          <div class="kpi-sub">${overview.totalReadings} total readings analyzed</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">WBGT Above Threshold</div>
          <div class="kpi-value">${overview.wbgtReadingsAboveThreshold.percentage}%</div>
          <div class="kpi-sub">${overview.wbgtReadingsAboveThreshold.count} of ${overview.totalReadings} readings</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>ROI Breakdown by Segment</h2>
      <table>
        <thead>
          <tr>
            <th>Segment</th>
            <th style="text-align:right">Subscription</th>
            <th style="text-align:right">Avoided Losses</th>
            <th style="text-align:right">ROI Multiplier</th>
          </tr>
        </thead>
        <tbody>${segmentsHTML}</tbody>
      </table>
      <p style="margin-top:12px;font-size:13px;color:#6b7280">
        Blended ROI: <strong>${roi.summary.blendedROIMultiplier}x</strong> — Net Benefit: <strong style="color:#059669">$${roi.summary.netBenefit.toLocaleString()}</strong>
      </p>
    </div>

    <div class="section">
      <h2>Unit Economics</h2>
      <table>
        <thead><tr><th>Metric</th><th style="text-align:right">Value</th></tr></thead>
        <tbody>
          <tr><td>Avoided Spoilage (per incident)</td><td style="text-align:right">$150,000</td></tr>
          <tr><td>Avoided OSHA Fine (per incident)</td><td style="text-align:right">$160,000</td></tr>
          <tr><td>Peak Demand Savings (per kW)</td><td style="text-align:right">$8,500</td></tr>
          <tr><td>Fleet Subscription</td><td style="text-align:right">$35,000/yr</td></tr>
          <tr><td>Safety Subscription</td><td style="text-align:right">$28,000/yr</td></tr>
          <tr><td>Facility Subscription</td><td style="text-align:right">$42,000/yr</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="footer">
    EchoHeat — FortyGuard Heat Intelligence Platform | Generated ${new Date().toISOString().split("T")[0]} | Confidential
  </div>
</body>
</html>`
}
