import { analyticsRepository } from "../repositories/analytics.repository.js"
import type {
  OverviewQuery,
  ROIQuery,
  AlertTrendsQuery,
  AssetExposureQuery,
  DemandCurveQuery,
} from "../validators.js"

// ── Unit economics (EchoHeat business model) ────────────────

const UNIT_ECONOMICS = {
  SPOILAGE_AVoided: 150_000,
  OSHA_FINE_AVOIDED: 160_000,
  WC_CLAIM_AVOIDED: 45_000,
  DEMAND_SAVINGS_PER_KW: 8_500,
  EQUIPMENT_LIFE_EXTEND: 3_200,
  FUEL_SAVINGS_REROUTE: 2_500,
  PRECOOL_SAVINGS: 1_200,
  SUBSCRIPTION_FLEET: 35_000,
  SUBSCRIPTION_SAFETY: 28_000,
  SUBSCRIPTION_FACILITY: 42_000,
}

// ── Analytics Service ───────────────────────────────────────

export class AnalyticsService {
  async getOverviewKPIs(orgId: string, query: OverviewQuery) {
    const { from, to, assetType, assetId } = query
    const [kpis, assetStats] = await Promise.all([
      analyticsRepository.getOverviewKPIs(orgId, from, to, assetType, assetId),
      analyticsRepository.getAssetStats(orgId, assetType),
    ])

    return {
      ...kpis,
      assetStats,
      unitEconomics: {
        avoidedSpoilageCost: UNIT_ECONOMICS.SPOILAGE_AVoided,
        avoidedOshaFine: UNIT_ECONOMICS.OSHA_FINE_AVOIDED,
      },
      period: { from: from?.toISOString() ?? null, to: to?.toISOString() ?? null },
    }
  }

  async getROIBreakdown(orgId: string, query: ROIQuery) {
    const { from, to, assetType, assetId } = query
    const segments = await analyticsRepository.getROIBreakdown(orgId, from, to, assetType, assetId)

    const totalCost = segments.reduce((sum, s) => sum + s.subscriptionCost, 0)
    const totalAvoided = segments.reduce((sum, s) => sum + s.avoidedLosses, 0)
    const blendedROI = totalCost > 0 ? Math.round((totalAvoided / totalCost) * 100) / 100 : 0

    return {
      segments,
      summary: {
        totalSubscriptionCost: totalCost,
        totalAvoidedLosses: totalAvoided,
        blendedROIMultiplier: blendedROI,
        netBenefit: totalAvoided - totalCost,
      },
      unitEconomics: UNIT_ECONOMICS,
      period: { from: from?.toISOString() ?? null, to: to?.toISOString() ?? null },
    }
  }

  async getAlertTrends(orgId: string, query: AlertTrendsQuery) {
    const { from, to, interval, assetType, assetId } = query
    const trends = await analyticsRepository.getAlertTrends(orgId, from, to, interval, assetType, assetId)

    const totals = trends.reduce(
      (acc, t) => ({
        critical: acc.critical + t.critical,
        warning: acc.warning + t.warning,
        info: acc.info + t.info,
        autoExecuted: acc.autoExecuted + t.autoExecuted,
      }),
      { critical: 0, warning: 0, info: 0, autoExecuted: 0 }
    )

    return {
      trends,
      totals,
      interval,
      period: { from: from?.toISOString() ?? null, to: to?.toISOString() ?? null },
    }
  }

  async getAssetExposureHeatmap(orgId: string, query: AssetExposureQuery) {
    const { from, to, assetType, assetId } = query
    const heatmap = await analyticsRepository.getAssetExposureHeatmap(orgId, from, to, assetType, assetId)

    // Calculate summary stats
    const cellsWithData = heatmap.filter((c) => c.avgWBGT > 0)
    const avgWBGT = cellsWithData.length > 0
      ? Math.round((cellsWithData.reduce((s, c) => s + c.avgWBGT, 0) / cellsWithData.length) * 10) / 10
      : 0
    const peakWBGT = cellsWithData.length > 0
      ? Math.round(Math.max(...cellsWithData.map((c) => c.avgWBGT)) * 10) / 10
      : 0
    const highRiskCells = cellsWithData.filter((c) => c.avgWBGT >= 28).length

    return {
      heatmap,
      summary: {
        gridDimensions: "7 days × 24 hours (168 cells)",
        cellsWithData: cellsWithData.length,
        overallAvgWBGT: avgWBGT,
        peakWBGT,
        highRiskCells,
        highRiskPercentage: cellsWithData.length > 0
          ? Math.round((highRiskCells / cellsWithData.length) * 10000) / 100
          : 0,
      },
      period: { from: from?.toISOString() ?? null, to: to?.toISOString() ?? null },
    }
  }

  async getDemandCurveData(query: DemandCurveQuery) {
    const { facilityId, date } = query
    const curveDate = date ?? new Date()
    const demandCurve = await analyticsRepository.getDemandCurveData(facilityId, curveDate)

    // Calculate summary
    const totalBaselineKWh = demandCurve.baseline.reduce((s, v) => s + v, 0)
    const totalOptimizedKWh = demandCurve.optimized.reduce((s, v) => s + v, 0)
    const totalSavingsDollars = demandCurve.savings.reduce((s, v) => s + v, 0)
    const demandReduction = totalBaselineKWh > 0
      ? Math.round(((totalBaselineKWh - totalOptimizedKWh) / totalBaselineKWh) * 10000) / 100
      : 0

    return {
      ...demandCurve,
      summary: {
        totalBaselineKWh,
        totalOptimizedKWh,
        demandReductionPercentage: demandReduction,
        totalSavingsDollars: Math.round(totalSavingsDollars * 100) / 100,
        peakHoursOptimized: demandCurve.baseline.reduce((count, v, i) => {
          const peakStart = 14
          const peakEnd = 18
          return i >= peakStart && i <= peakEnd && v > 0 ? count + 1 : count
        }, 0),
      },
      date: curveDate.toISOString().split("T")[0],
    }
  }
}

export const analyticsService = new AnalyticsService()
