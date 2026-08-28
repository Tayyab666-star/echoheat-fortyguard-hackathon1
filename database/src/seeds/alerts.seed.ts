import mongoose from "mongoose"
import { Alert } from "../models/Alert.js"
import type { AlertSeverity, AlertType, AlertStatus } from "../interfaces/alert.js"
import type { SeedOrganization } from "./organizations.seed.js"
import type { SeedAsset } from "./assets.seed.js"

const ALERT_TEMPLATES: Array<{
  severity: AlertSeverity
  alertType: AlertType
  title: string
  message: string
  wbgtBase: number
  ambientBase: number
}> = [
  {
    severity: "critical",
    alertType: "wbgt_breach",
    title: "WBGT Extreme Danger Threshold Exceeded",
    message: "WBGT reading has reached extreme danger levels. Immediate worker relocation required per OSHA guidelines.",
    wbgtBase: 33,
    ambientBase: 46,
  },
  {
    severity: "critical",
    alertType: "cargo_at_risk",
    title: "Reefer Temperature Rising Above Setpoint",
    message: "Internal cargo temperature has risen 5°C above setpoint. Product integrity at risk.",
    wbgtBase: 30,
    ambientBase: 42,
  },
  {
    severity: "warning",
    alertType: "peak_demand",
    title: "Building Peak Demand Approaching Limit",
    message: "Current electrical demand is at 92% of contracted peak. Pre-cooling recommended.",
    wbgtBase: 28,
    ambientBase: 40,
  },
  {
    severity: "warning",
    alertType: "reroute_needed",
    title: "Heat-Adjusted Route Recommended",
    message: "Detected high heat exposure on current route. Rerouting to shaded corridors.",
    wbgtBase: 31,
    ambientBase: 44,
  },
  {
    severity: "info",
    alertType: "pre_cool_executed",
    title: "Pre-Cooling Cycle Completed",
    message: "Automated pre-cooling cycle completed. Interior temperature reduced to setpoint.",
    wbgtBase: 26,
    ambientBase: 36,
  },
  {
    severity: "info",
    alertType: "osha_log_filed",
    title: "OSHA Heat Illness Prevention Log Updated",
    message: "Mandatory rest break logged and synced to Procore compliance dashboard.",
    wbgtBase: 27,
    ambientBase: 38,
  },
  {
    severity: "critical",
    alertType: "wbgt_breach",
    title: "Construction Site Heat Emergency",
    message: "Outdoor WBGT has exceeded danger threshold. All outdoor operations suspended.",
    wbgtBase: 34,
    ambientBase: 47,
  },
  {
    severity: "warning",
    alertType: "cargo_at_risk",
    title: "Pharmaceutical Shipment Temperature Warning",
    message: "Temperature excursion detected in pharmaceutical cold chain. Inspect immediately.",
    wbgtBase: 29,
    ambientBase: 41,
  },
  {
    severity: "warning",
    alertType: "peak_demand",
    title: "HVAC Chiller Demand Spike Detected",
    message: "Unusual demand spike detected. Coordinating with grid operator for load shedding.",
    wbgtBase: 28,
    ambientBase: 39,
  },
  {
    severity: "info",
    alertType: "pre_cool_executed",
    title: "Facility Pre-Cool Initiated Ahead of Peak Window",
    message: "Pre-cooling initiated 2 hours before peak tariff window. Estimated savings: AED 850.",
    wbgtBase: 25,
    ambientBase: 35,
  },
]

const STATUS_DISTRIBUTION: AlertStatus[] = [
  "auto_executed", "auto_executed", "auto_executed", "auto_executed",
  "dismissed", "dismissed", "dismissed",
  "pending", "pending", "pending",
]

const LOCATIONS = [
  { lat: 24.8607, lng: 67.0011, address: "Karachi, Sindh, Pakistan" },
  { lat: 24.8036, lng: 67.3286, address: "Port Qasim, Karachi" },
  { lat: 24.8669, lng: 67.0314, address: "Sindh Industrial Area, Karachi" },
  { lat: 24.8109, lng: 67.0256, address: "Clifton, Karachi" },
  { lat: 24.8855, lng: 67.0663, address: "Gulshan-e-Iqbal, Karachi" },
  { lat: 24.8456, lng: 67.1842, address: "Malir, Karachi" },
  { lat: 24.8228, lng: 67.0356, address: "Defence, Karachi" },
  { lat: 24.8737, lng: 66.9985, address: "Orangi Town, Karachi" },
  { lat: 24.8091, lng: 67.0220, address: "Clifton Block 4, Karachi" },
  { lat: 24.8855, lng: 67.0663, address: "Gulshan-e-Iqbal Block 13-D, Karachi" },
]

const TOTAL_ALERTS = 200
const BATCH_SIZE = 1000

export async function seedAlerts(
  organizations: SeedOrganization[],
  assets: SeedAsset[]
): Promise<void> {
  console.log("[Seed] Seeding 200 alerts...")

  await Alert.deleteMany({})

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const docs = []

  for (let i = 0; i < TOTAL_ALERTS; i++) {
    const template = ALERT_TEMPLATES[i % ALERT_TEMPLATES.length]!
    const status = STATUS_DISTRIBUTION[i % STATUS_DISTRIBUTION.length]!
    const location = LOCATIONS[i % LOCATIONS.length]!
    const asset = assets[i % assets.length]!

    const randomDaysOffset = Math.random() * 30
    const randomHoursOffset = Math.random() * 24
    const createdAt = new Date(thirtyDaysAgo.getTime() + (randomDaysOffset * 24 + randomHoursOffset) * 3600000)

    const wbgtNoise = (Math.random() - 0.5) * 3
    const wbgt = Math.round((template.wbgtBase + wbgtNoise) * 100) / 100
    const ambientTemp = Math.round((template.ambientBase + (Math.random() - 0.5) * 4) * 100) / 100
    const internalTemp = asset.assetType === "vehicle"
      ? Math.round((-19 + Math.random() * 8) * 100) / 100
      : undefined

    const actions = status === "auto_executed"
      ? [{
          actionType: template.alertType === "wbgt_breach" ? "rest_dispatched"
            : template.alertType === "cargo_at_risk" ? "pre_cool_triggered"
            : template.alertType === "reroute_needed" ? "route_rerouted"
            : template.alertType === "peak_demand" ? "demand_response"
            : template.alertType === "osha_log_filed" ? "osha_logged"
            : "notification_sent",
          executedAt: createdAt,
          executedBy: "echoheat-autonomous-engine",
          result: "success",
          estimatedValueSaved: Math.round(Math.random() * 2000 * 100) / 100,
        }]
      : []

    docs.push({
      organization: asset.organization,
      asset: asset._id,
      assetType: asset.assetType,
      severity: template.severity,
      alertType: template.alertType,
      title: template.title,
      message: template.message,
      thermalSnapshot: {
        wbgt,
        ambientTemp,
        internalTemp,
        peakLoad: asset.assetType === "facility" ? Math.round((0.7 + Math.random() * 0.3) * 100) / 100 : undefined,
      },
      location,
      status,
      actions,
      createdAt,
      updatedAt: createdAt,
    })
  }

  // Batch insert
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE)
    await Alert.insertMany(batch, { ordered: false })
  }

  const statusCounts = docs.reduce(
    (acc, d) => {
      acc[d.status] = (acc[d.status] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  console.log(`[Seed] Created ${TOTAL_ALERTS} alerts`)
  console.log(`  - auto_executed: ${statusCounts["auto_executed"] ?? 0}`)
  console.log(`  - dismissed: ${statusCounts["dismissed"] ?? 0}`)
  console.log(`  - pending: ${statusCounts["pending"] ?? 0}`)
}
