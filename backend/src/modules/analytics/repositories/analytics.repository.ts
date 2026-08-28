import mongoose, { type PipelineStage } from "mongoose"
import { Alert } from "../../alerts/Alert.model.js"
import { ThermalReading } from "../../assets/ThermalReading.model.js"
import { Asset } from "../../assets/Asset.model.js"

// ── Types ───────────────────────────────────────────────────

interface OverviewKPIs {
  alertsBySeverity: { critical: number; warning: number; info: number }
  autoExecutedActions: number
  assetsAtRisk: number
  estimatedSaved: number
  wbgtReadingsAboveThreshold: { count: number; percentage: number }
  totalReadings: number
}

export interface ROISegment {
  segment: string
  subscriptionCost: number
  avoidedLosses: number
  netROI: number
}

export interface AlertTrend {
  date: string
  critical: number
  warning: number
  info: number
  autoExecuted: number
}

export interface ExposureCell {
  dayOfWeek: number
  hour: number
  avgWBGT: number
}

interface DemandCurve {
  baseline: number[]
  optimized: number[]
  savings: number[]
}

// ── Helpers ─────────────────────────────────────────────────

function buildDateMatch(from?: Date, to?: Date, field: string = "createdAt"): Record<string, unknown> {
  if (!from && !to) return {}
  const dateCondition: Record<string, Date> = {}
  if (from) dateCondition.$gte = from
  if (to) dateCondition.$lte = to
  return { [field]: dateCondition }
}

function buildAssetMatch(orgId: string, assetType?: string, assetId?: string): Record<string, unknown> {
  const match: Record<string, unknown> = { organization: orgId }
  if (assetType) match.assetType = assetType
  if (assetId) match.asset = new mongoose.Types.ObjectId(assetId)
  return match
}

// ── Analytics Repository ────────────────────────────────────

export class AnalyticsRepository {
  // ── 1. Overview KPIs ────────────────────────────────────────

  async getOverviewKPIs(orgId: string, from?: Date, to?: Date, assetType?: string, assetId?: string): Promise<OverviewKPIs> {
    const dateMatch = buildDateMatch(from, to)
    const assetMatch = buildAssetMatch(orgId, assetType, assetId)

    // Alerts by severity
    const severityPipeline: PipelineStage[] = [
      { $match: { ...assetMatch, ...dateMatch } as any },
      { $group: { _id: "$severity", count: { $sum: 1 } } },
    ]
    const severityResults = await Alert.aggregate(severityPipeline)
    const alertsBySeverity = { critical: 0, warning: 0, info: 0 }
    for (const r of severityResults) {
      if (r._id in alertsBySeverity) {
        alertsBySeverity[r._id as keyof typeof alertsBySeverity] = r.count as number
      }
    }

    // Auto-executed actions count
    const autoExecPipeline: PipelineStage[] = [
      { $match: { ...assetMatch, ...dateMatch, status: "auto_executed" } as any },
      { $unwind: "$actions" },
      { $match: { "actions.executedAt": { $exists: true, $ne: null } } },
      { $count: "total" },
    ]
    const autoExecResult = await Alert.aggregate(autoExecPipeline)
    const autoExecutedActions = (autoExecResult[0]?.total as number) ?? 0

    // Assets at risk right now
    const assetsAtRiskPipeline: PipelineStage[] = [
      { $match: buildAssetMatch(orgId, assetType, assetId) },
      {
        $lookup: {
          from: "thermalreadings",
          localField: "_id",
          foreignField: "asset",
          as: "latestReading",
          pipeline: [{ $sort: { timestamp: -1 } }, { $limit: 1 }],
        },
      },
      { $unwind: { path: "$latestReading", preserveNullAndEmptyArrays: false } },
      { $match: { "latestReading.riskLevel": { $in: ["high", "extreme"] } } },
      { $count: "total" },
    ]
    const assetsAtRiskResult = await Asset.aggregate(assetsAtRiskPipeline)
    const assetsAtRisk = (assetsAtRiskResult[0]?.total as number) ?? 0

    // Estimated $ saved
    const savedPipeline: PipelineStage[] = [
      {
        $match: {
          ...assetMatch,
          ...dateMatch,
          "actions.executedAt": { $exists: true, $ne: null },
        } as any,
      },
      { $unwind: "$actions" },
      { $match: { "actions.executedAt": { $exists: true, $ne: null } } },
      {
        $group: {
          _id: null,
          totalSaved: {
            $sum: {
              $toDouble: { $ifNull: ["$actions.payload.avoidedLoss", 0] },
            },
          },
        },
      },
    ]
    const savedResult = await Alert.aggregate(savedPipeline)
    const estimatedSaved = (savedResult[0]?.totalSaved as number) ?? 0

    // WBGT readings above threshold
    const wbgtPipeline: PipelineStage[] = [
      { $match: { ...assetMatch, ...dateMatch, "metrics.wbgt": { $exists: true, $ne: null } } as any },
      {
        $facet: {
          aboveThreshold: [
            { $match: { "metrics.wbgt": { $gte: 28 } } },
            { $count: "count" },
          ],
          total: [
            { $count: "count" },
          ],
        },
      },
    ]
    const wbgtResult = await ThermalReading.aggregate(wbgtPipeline)
    const wbgtAboveThreshold = (wbgtResult[0]?.aboveThreshold[0]?.count as number) ?? 0
    const totalReadings = (wbgtResult[0]?.total[0]?.count as number) ?? 0

    return {
      alertsBySeverity,
      autoExecutedActions,
      assetsAtRisk,
      estimatedSaved,
      wbgtReadingsAboveThreshold: {
        count: wbgtAboveThreshold,
        percentage: totalReadings > 0 ? Math.round((wbgtAboveThreshold / totalReadings) * 10000) / 100 : 0,
      },
      totalReadings,
    }
  }

  // ── 2. ROI Breakdown ────────────────────────────────────────

  async getROIBreakdown(orgId: string, from?: Date, to?: Date, assetType?: string, assetId?: string): Promise<ROISegment[]> {
    const dateMatch = buildDateMatch(from, to)
    const assetMatch = buildAssetMatch(orgId, assetType, assetId)

    const roiPipeline: PipelineStage[] = [
      { $match: { ...assetMatch, ...dateMatch, "actions.executedAt": { $exists: true, $ne: null } } as any },
      { $unwind: "$actions" },
      { $match: { "actions.executedAt": { $exists: true, $ne: null } } },
      {
        $group: {
          _id: "$alertType",
          count: { $sum: 1 },
        },
      },
    ]
    const roiResults = await Alert.aggregate(roiPipeline)

    const actionCounts: Record<string, number> = {}
    for (const r of roiResults) {
      actionCounts[r._id as string] = r.count as number
    }

    // Fleet segment
    const fleetAvoidedSpoilage = (actionCounts["cargo_at_risk"] ?? 0) * 150_000
    const fleetFuelSaved = (actionCounts["reroute_needed"] ?? 0) * 2_500
    const fleetPreCoolSaved = (actionCounts["pre_cool_executed"] ?? 0) * 1_200
    const fleetSubscription = 35_000
    const fleetAvoided = fleetAvoidedSpoilage + fleetFuelSaved + fleetPreCoolSaved

    // Safety segment
    const safetyFinesAvoided = (actionCounts["osha_log_filed"] ?? 0) * 160_000
    const safetyWCClaims = (actionCounts["wbgt_breach"] ?? 0) * 45_000
    const safetySubscription = 28_000
    const safetyAvoided = safetyFinesAvoided + safetyWCClaims

    // Facility segment
    const facilityDemandSavings = (actionCounts["peak_demand"] ?? 0) * 8_500
    const facilityEquipment = (actionCounts["peak_demand"] ?? 0) * 3_200
    const facilitySubscription = 42_000
    const facilityAvoided = facilityDemandSavings + facilityEquipment

    return [
      {
        segment: "fleet",
        subscriptionCost: fleetSubscription,
        avoidedLosses: fleetAvoided,
        netROI: fleetSubscription > 0 ? Math.round((fleetAvoided / fleetSubscription) * 100) / 100 : 0,
      },
      {
        segment: "safety",
        subscriptionCost: safetySubscription,
        avoidedLosses: safetyAvoided,
        netROI: safetySubscription > 0 ? Math.round((safetyAvoided / safetySubscription) * 100) / 100 : 0,
      },
      {
        segment: "facility",
        subscriptionCost: facilitySubscription,
        avoidedLosses: facilityAvoided,
        netROI: facilitySubscription > 0 ? Math.round((facilityAvoided / facilitySubscription) * 100) / 100 : 0,
      },
    ]
  }

  // ── 3. Alert Trends ─────────────────────────────────────────

  async getAlertTrends(orgId: string, from?: Date, to?: Date, interval: "day" | "week" | "month" = "day", assetType?: string, assetId?: string): Promise<AlertTrend[]> {
    const dateMatch = buildDateMatch(from, to)
    const assetMatch = buildAssetMatch(orgId, assetType, assetId)

    let groupId: Record<string, unknown>
    switch (interval) {
      case "week":
        groupId = {
          year: { $year: "$createdAt" },
          week: { $isoWeek: "$createdAt" },
        }
        break
      case "month":
        groupId = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        }
        break
      default:
        groupId = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        }
    }

    const pipeline: PipelineStage[] = [
      { $match: { ...assetMatch, ...dateMatch } as any },
      {
        $group: {
          _id: groupId,
          critical: { $sum: { $cond: [{ $eq: ["$severity", "critical"] }, 1, 0] } },
          warning: { $sum: { $cond: [{ $eq: ["$severity", "warning"] }, 1, 0] } },
          info: { $sum: { $cond: [{ $eq: ["$severity", "info"] }, 1, 0] } },
          autoExecuted: {
            $sum: {
              $cond: [{ $eq: ["$status", "auto_executed"] }, 1, 0],
            },
          },
        },
      },
      { $sort: { "_id.year": 1 as const, "_id.month": 1 as const, "_id.day": 1 as const } },
    ]

    const results = await Alert.aggregate(pipeline)

    return results.map((r) => {
      const id = r._id as Record<string, number>
      let date: string
      if (interval === "month") {
        date = `${id.year}-${String(id.month).padStart(2, "0")}`
      } else if (interval === "week") {
        date = `${id.year}-W${String(id.week ?? 0).padStart(2, "0")}`
      } else {
        date = `${id.year}-${String(id.month).padStart(2, "0")}-${String(id.day).padStart(2, "0")}`
      }
      return {
        date,
        critical: r.critical as number,
        warning: r.warning as number,
        info: r.info as number,
        autoExecuted: r.autoExecuted as number,
      }
    })
  }

  // ── 4. Asset Exposure Heatmap ───────────────────────────────

  async getAssetExposureHeatmap(orgId: string, from?: Date, to?: Date, assetType?: string, assetId?: string): Promise<ExposureCell[]> {
    const dateMatch = buildDateMatch(from, to, "timestamp")
    const assetMatch = buildAssetMatch(orgId, assetType, assetId)

    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: "assets",
          localField: "asset",
          foreignField: "_id",
          as: "assetDoc",
          pipeline: [{ $match: assetMatch }, { $project: { organization: 1 } }],
        },
      },
      { $unwind: "$assetDoc" },
      { $match: { ...dateMatch, "metrics.wbgt": { $exists: true, $ne: null } } as any },
      {
        $group: {
          _id: {
            dayOfWeek: { $dayOfWeek: "$timestamp" },
            hour: { $hour: "$timestamp" },
          },
          avgWBGT: { $avg: "$metrics.wbgt" },
        },
      },
      { $sort: { "_id.dayOfWeek": 1 as const, "_id.hour": 1 as const } },
    ]

    const results = await ThermalReading.aggregate(pipeline)

    // Fill the 168-cell grid
    const grid: ExposureCell[] = []
    for (let day = 1; day <= 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const match = results.find(
          (r) => (r._id as any).dayOfWeek === day && (r._id as any).hour === hour
        )
        grid.push({
          dayOfWeek: day,
          hour,
          avgWBGT: match ? Math.round((match.avgWBGT as number) * 10) / 10 : 0,
        })
      }
    }

    return grid
  }

  // ── 5. Demand Curve Data ───────────────────────────────────

  async getDemandCurveData(facilityId: string, date: Date): Promise<DemandCurve> {
    const facility = await Asset.findOne({
      _id: new mongoose.Types.ObjectId(facilityId),
      assetType: "facility",
    }).lean()

    if (!facility) {
      return { baseline: [], optimized: [], savings: [] }
    }

    const fd = facility.facilityData as Record<string, unknown> | undefined
    const utility = fd?.utilityAccount as Record<string, unknown> | undefined
    const baseRate = (utility?.baseRate as number) ?? 0.12
    const peakRate = (utility?.peakRate as number) ?? 0.25

    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const readings = await ThermalReading.find({
      asset: facility._id,
      timestamp: { $gte: startOfDay, $lte: endOfDay },
      "metrics.wbgt": { $exists: true },
    }).sort({ timestamp: 1 }).lean()

    const baseline: number[] = new Array(24).fill(0)
    const optimized: number[] = new Array(24).fill(0)
    const savings: number[] = new Array(24).fill(0)

    const peakWindow = utility?.peakTariffWindow as Record<string, string> | undefined
    const peakStart = parseInt((peakWindow?.start ?? "14").split(":")[0] ?? "14", 10)
    const peakEnd = parseInt((peakWindow?.end ?? "18").split(":")[0] ?? "18", 10)

    // Find max load from readings or use default
    let maxLoad = 0
    for (const r of readings) {
      const metrics = r.metrics as Record<string, unknown> | undefined
      const load = (metrics?.peakLoad as number) ?? 0
      if (load > maxLoad) maxLoad = load
    }
    if (maxLoad === 0) maxLoad = 500

    const avgSavingsRate = 0.20

    for (let hour = 0; hour < 24; hour++) {
      const hourFactor = hour >= 8 && hour <= 18
        ? 0.7 + 0.3 * Math.sin(((hour - 8) / 10) * Math.PI)
        : hour >= peakStart && hour <= peakEnd
          ? 1.0
          : 0.3 + 0.2 * Math.random()

      const baseLoad = Math.round(maxLoad * hourFactor)
      baseline[hour] = baseLoad

      const isPeakWindow = hour >= peakStart && hour <= peakEnd
      const reductionFactor = isPeakWindow ? avgSavingsRate : avgSavingsRate * 0.3
      optimized[hour] = Math.round(baseLoad * (1 - reductionFactor))

      const rate = isPeakWindow ? peakRate : baseRate
      savings[hour] = Math.round((baseLoad - (optimized[hour] ?? 0)) * rate * 100) / 100
    }

    return { baseline, optimized, savings }
  }

  // ── 6. Asset stats ─────────────────────────────────────────

  async getAssetStats(orgId: string, assetType?: string): Promise<{ totalAssets: number; activeAssets: number }> {
    const match: Record<string, unknown> = { organization: orgId }
    if (assetType) match.assetType = assetType

    const [totalAssets, activeAssets] = await Promise.all([
      Asset.countDocuments(match),
      Asset.countDocuments({ ...match, isActive: true }),
    ])

    return { totalAssets, activeAssets }
  }
}

export const analyticsRepository = new AnalyticsRepository()
