import mongoose, { type FilterQuery, type PipelineStage, type HydratedDocument } from "mongoose"
import { Alert, type IAlert } from "../Alert.model.js"
import { AppError } from "../../../utils/AppError.js"
import type { ListAlertsQuery } from "../validators.js"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LeanAlert = Record<string, any> & { _id: mongoose.Types.ObjectId }

export interface AlertStats {
  total: number
  bySeverity: { critical: number; warning: number; info: number }
  byStatus: { pending: number; auto_executed: number; dismissed: number; escalated: number }
  byType: Record<string, number>
  last24h: number
}

export class AlertsRepository {
  // ── CRUD ────────────────────────────────────────────────────

  async create(data: Record<string, unknown>): Promise<HydratedDocument<IAlert>> {
    return Alert.create(data)
  }

  async findById(id: string): Promise<HydratedDocument<IAlert> | null> {
    return Alert.findById(id).populate("asset", "assetType vehicleData.vehicleId siteData.siteName facilityData.facilityName")
  }

  async updateById(id: string, update: Record<string, unknown>): Promise<HydratedDocument<IAlert> | null> {
    return Alert.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true })
  }

  async pushAction(id: string, action: Record<string, unknown>): Promise<HydratedDocument<IAlert> | null> {
    return Alert.findByIdAndUpdate(id, { $push: { actions: action } }, { new: true })
  }

  // ── Cursor-based list ──────────────────────────────────────

  async list(query: ListAlertsQuery, orgId: string) {
    const filter: FilterQuery<IAlert> = { organization: orgId }

    if (query.status) filter.status = query.status
    if (query.severity) filter.severity = query.severity
    if (query.alertType) filter.alertType = query.alertType
    if (query.assetId) filter.asset = new mongoose.Types.ObjectId(query.assetId)
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: "i" } },
        { message: { $regex: query.search, $options: "i" } },
      ]
    }

    if (query.cursor) {
      const cursorDoc = await Alert.findById(query.cursor).select("_id createdAt").lean()
      if (cursorDoc) {
        filter.$and = filter.$and ?? []
        ;(filter.$and as FilterQuery<IAlert>[]).push({
          [query.order === "desc" ? "$lt" : "$gt"]: {
            _id: new mongoose.Types.ObjectId(query.cursor),
          },
        })
      }
    }

    const sortDir = query.order === "desc" ? -1 : 1
    const limit = Math.min(query.limit, 100)

    const [rawAlerts, total] = await Promise.all([
      Alert.find(filter)
        .sort({ [query.sort]: sortDir, _id: sortDir })
        .limit(limit + 1)
        .populate("asset", "assetType vehicleData.vehicleId siteData.siteName facilityData.facilityName")
        .lean<LeanAlert[]>(),
      Alert.countDocuments(filter),
    ])

    const hasMore = rawAlerts.length > limit
    const results = hasMore ? rawAlerts.slice(0, limit) : rawAlerts
    const nextCursor = hasMore ? String(results[results.length - 1]!._id) : null

    return {
      alerts: results.map((a) => this.serialize(a)),
      pagination: { total, limit, nextCursor, hasMore },
    }
  }

  // ── Stats aggregation ──────────────────────────────────────

  async getStats(orgId: string): Promise<AlertStats> {
    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const filter: FilterQuery<IAlert> = { organization: orgId }

    const [total, severityCounts, statusCounts, typeCounts, last24hCount] = await Promise.all([
      Alert.countDocuments(filter),
      Alert.aggregate([
        { $match: filter },
        { $group: { _id: "$severity", count: { $sum: 1 } } },
      ]),
      Alert.aggregate([
        { $match: filter },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Alert.aggregate([
        { $match: filter },
        { $group: { _id: "$alertType", count: { $sum: 1 } } },
      ]),
      Alert.countDocuments({ ...filter, createdAt: { $gte: last24h } }),
    ])

    const bySeverity = { critical: 0, warning: 0, info: 0 }
    severityCounts.forEach((s) => {
      if (s._id in bySeverity) bySeverity[s._id as keyof typeof bySeverity] = s.count
    })

    const byStatus = { pending: 0, auto_executed: 0, dismissed: 0, escalated: 0 }
    statusCounts.forEach((s) => {
      if (s._id in byStatus) byStatus[s._id as keyof typeof byStatus] = s.count
    })

    const byType: Record<string, number> = {}
    typeCounts.forEach((t) => {
      byType[t._id] = t.count
    })

    return {
      total,
      bySeverity,
      byStatus,
      byType,
      last24h: last24hCount,
    }
  }

  // ── Helpers ────────────────────────────────────────────────

  private serialize(a: LeanAlert) {
    return {
      id: a._id.toString(),
      organization: a.organization as string,
      asset: a.asset,
      assetType: a.assetType as string,
      severity: a.severity as string,
      alertType: a.alertType as string,
      title: a.title as string,
      message: a.message as string,
      thermalSnapshot: a.thermalSnapshot,
      location: a.location,
      status: a.status as string,
      actions: a.actions as IAlert["actions"],
      autoResolvedAt: a.autoResolvedAt as Date | undefined,
      resolvedBy: a.resolvedBy as string | undefined,
      createdAt: a.createdAt as Date,
      updatedAt: a.updatedAt as Date,
    }
  }
}

export const alertsRepository = new AlertsRepository()
