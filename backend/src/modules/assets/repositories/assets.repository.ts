import mongoose, { type FilterQuery, type PipelineStage, type HydratedDocument } from "mongoose"
import { Asset, type IAsset } from "../Asset.model.js"
import { ThermalReading, type IThermalReading } from "../ThermalReading.model.js"
import { AppError } from "../../../utils/AppError.js"
import type { ListAssetsQuery, AssetHistoryQuery } from "../validators.js"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LeanAsset = Record<string, any> & { _id: mongoose.Types.ObjectId }

export class AssetsRepository {
  // ── CRUD ────────────────────────────────────────────────────

  async create(data: Record<string, unknown>, orgId: string, userId: string): Promise<HydratedDocument<IAsset>> {
    return Asset.create({ ...data, organization: orgId, owner: userId })
  }

  async findById(id: string): Promise<HydratedDocument<IAsset> | null> {
    return Asset.findById(id).populate("owner", "name email")
  }

  async update(id: string, data: Record<string, unknown>): Promise<HydratedDocument<IAsset> | null> {
    return Asset.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).populate(
      "owner",
      "name email"
    )
  }

  async delete(id: string): Promise<void> {
    const asset = await Asset.findByIdAndDelete(id)
    if (!asset) throw AppError.notFound("Asset not found")
    await ThermalReading.deleteMany({ asset: id })
  }

  // ── Cursor-based list ──────────────────────────────────────

  async list(query: ListAssetsQuery, orgId: string) {
    const filter: FilterQuery<IAsset> = { organization: orgId }

    if (query.assetType) filter.assetType = query.assetType
    if (query.isActive !== undefined) filter.isActive = query.isActive
    if (query.tag) filter.tags = { $in: [query.tag] }
    if (query.search) {
      filter.$or = [
        { "vehicleData.vehicleId": { $regex: query.search, $options: "i" } },
        { "vehicleData.licensePlate": { $regex: query.search, $options: "i" } },
        { "siteData.siteName": { $regex: query.search, $options: "i" } },
        { "facilityData.facilityName": { $regex: query.search, $options: "i" } },
      ]
    }

    if (query.cursor) {
      const cursorDoc = await Asset.findById(query.cursor).select("_id createdAt").lean()
      if (cursorDoc) {
        filter.$and = filter.$and ?? []
        ;(filter.$and as FilterQuery<IAsset>[]).push({
          [query.order === "desc" ? "$lt" : "$gt"]: {
            _id: new mongoose.Types.ObjectId(query.cursor),
          },
        })
      }
    }

    const sortDir = query.order === "desc" ? -1 : 1
    const limit = Math.min(query.limit, 100)

    const [rawAssets, total] = await Promise.all([
      Asset.find(filter)
        .sort({ [query.sort]: sortDir, _id: sortDir })
        .limit(limit + 1)
        .populate("owner", "name email")
        .lean<LeanAsset[]>(),
      Asset.countDocuments(filter),
    ])

    const hasMore = rawAssets.length > limit
    const results = hasMore ? rawAssets.slice(0, limit) : rawAssets
    const nextCursor = hasMore ? String(results[results.length - 1]!._id) : null

    return {
      assets: results.map((a) => this.serialize(a)),
      pagination: {
        total,
        limit,
        nextCursor,
        hasMore,
      },
    }
  }

  // ── Thermal readings ───────────────────────────────────────

  async getLatestThermalReading(assetId: string): Promise<IThermalReading | null> {
    return ThermalReading.findOne({ asset: assetId }).sort({ timestamp: -1 })
  }

  async getThermalHistory(assetId: string, query: AssetHistoryQuery) {
    const matchStage: PipelineStage.Match = {
      $match: {
        asset: new mongoose.Types.ObjectId(assetId),
        ...(query.from || query.to
          ? {
              timestamp: {
                ...(query.from ? { $gte: new Date(query.from) } : {}),
                ...(query.to ? { $lte: new Date(query.to) } : {}),
              },
            }
          : {}),
      },
    }

    let groupId: Record<string, unknown>
    let sortStage: PipelineStage.Sort

    if (query.interval === "hourly") {
      groupId = {
        year: { $year: "$timestamp" },
        month: { $month: "$timestamp" },
        day: { $dayOfMonth: "$timestamp" },
        hour: { $hour: "$timestamp" },
      }
      sortStage = { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1 } }
    } else if (query.interval === "weekly") {
      groupId = {
        year: { $year: "$timestamp" },
        week: { $week: "$timestamp" },
      }
      sortStage = { $sort: { "_id.year": 1, "_id.week": 1 } }
    } else {
      groupId = {
        year: { $year: "$timestamp" },
        month: { $month: "$timestamp" },
        day: { $dayOfMonth: "$timestamp" },
      }
      sortStage = { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    }

    const pipeline: PipelineStage[] = [
      matchStage,
      {
        $group: {
          _id: groupId,
          avgInternalTemp: { $avg: "$metrics.internalTemp" },
          avgExternalTemp: { $avg: "$metrics.externalTemp" },
          avgWbgt: { $avg: "$metrics.wbgt" },
          avgHumidity: { $avg: "$metrics.humidity" },
          maxRiskScore: { $max: "$riskScore" },
          minRiskScore: { $min: "$riskScore" },
          readingCount: { $sum: 1 },
          lastTimestamp: { $max: "$timestamp" },
        },
      },
      sortStage,
      { $limit: query.limit },
    ]

    const results = await ThermalReading.aggregate(pipeline)

    return results.map((r) => ({
      interval: r._id,
      avgInternalTemp: r.avgInternalTemp ? Math.round(r.avgInternalTemp * 10) / 10 : null,
      avgExternalTemp: r.avgExternalTemp ? Math.round(r.avgExternalTemp * 10) / 10 : null,
      avgWbgt: r.avgWbgt ? Math.round(r.avgWbgt * 10) / 10 : null,
      avgHumidity: r.avgHumidity ? Math.round(r.avgHumidity * 10) / 10 : null,
      maxRiskScore: r.maxRiskScore,
      minRiskScore: r.minRiskScore,
      readingCount: r.readingCount,
      timestamp: r.lastTimestamp,
    }))
  }

  // ── Helpers ────────────────────────────────────────────────

  private serialize(a: LeanAsset) {
    return {
      id: a._id.toString(),
      assetType: a.assetType as string,
      owner: a.owner,
      organization: a.organization as string,
      tags: a.tags as string[],
      isActive: a.isActive as boolean,
      lastHeartbeatAt: a.lastHeartbeatAt as Date,
      createdAt: a.createdAt as Date,
      updatedAt: a.updatedAt as Date,
      vehicleData: a.vehicleData,
      siteData: a.siteData,
      facilityData: a.facilityData,
    }
  }
}

export const assetsRepository = new AssetsRepository()
