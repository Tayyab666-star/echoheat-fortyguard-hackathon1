import { assetsRepository } from "../repositories/assets.repository.js"
import { AppError } from "../../../utils/AppError.js"
import { cacheService } from "../../../utils/cache.service.js"
import { env } from "../../../config/env.js"
import type { CreateAssetInput, UpdateAssetInput, ListAssetsQuery, AssetHistoryQuery } from "../validators.js"

function validateCoordinates(data: Record<string, unknown>): void {
  const coordPaths: Array<{ path: string; val: unknown }> = []

  if (data.siteData && typeof data.siteData === "object") {
    const sd = data.siteData as Record<string, unknown>
    if (sd.coordinates) coordPaths.push({ path: "siteData.coordinates", val: sd.coordinates })
  }
  if (data.vehicleData && typeof data.vehicleData === "object") {
    const vd = data.vehicleData as Record<string, unknown>
    if (vd.currentRoute && typeof vd.currentRoute === "object") {
      const route = vd.currentRoute as Record<string, unknown>
      if (Array.isArray(route.stops)) {
        route.stops.forEach((stop: unknown, i: number) => {
          if (stop && typeof stop === "object") {
            const s = stop as Record<string, unknown>
            coordPaths.push({ path: `vehicleData.currentRoute.stops[${i}]`, val: s })
          }
        })
      }
    }
  }

  for (const { path, val } of coordPaths) {
    const c = val as Record<string, unknown>
    if (typeof c.lat !== "number" || typeof c.lng !== "number") {
      throw AppError.badRequest(`Invalid coordinates at ${path}: lat and lng must be numbers`)
    }
    if (c.lat < -90 || c.lat > 90) {
      throw AppError.badRequest(`Invalid latitude at ${path}: must be between -90 and 90`)
    }
    if (c.lng < -180 || c.lng > 180) {
      throw AppError.badRequest(`Invalid longitude at ${path}: must be between -180 and 180`)
    }
  }
}

function assessRisk(wbgt?: number, internalTemp?: number, externalTemp?: number): { level: string; score: number } {
  if (wbgt !== undefined && wbgt !== null) {
    if (wbgt >= 32.2) return { level: "extreme", score: 95 }
    if (wbgt >= 29.4) return { level: "high", score: 80 }
    if (wbgt >= 26.7) return { level: "moderate", score: 60 }
    if (wbgt >= 23.9) return { level: "low", score: 30 }
    return { level: "minimal", score: 10 }
  }

  if (internalTemp !== undefined && externalTemp !== undefined) {
    const delta = Math.abs(internalTemp - externalTemp)
    if (delta > 15) return { level: "extreme", score: 90 }
    if (delta > 10) return { level: "high", score: 75 }
    if (delta > 5) return { level: "moderate", score: 50 }
    return { level: "low", score: 20 }
  }

  return { level: "minimal", score: 10 }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeAsset(raw: any) {
  return {
    id: String(raw._id),
    assetType: raw.assetType as string,
    owner: raw.owner,
    organization: raw.organization as string,
    tags: raw.tags as string[],
    isActive: raw.isActive as boolean,
    lastHeartbeatAt: raw.lastHeartbeatAt as Date,
    createdAt: raw.createdAt as Date,
    updatedAt: raw.updatedAt as Date,
    vehicleData: raw.vehicleData as Record<string, unknown> | undefined,
    siteData: raw.siteData as Record<string, unknown> | undefined,
    facilityData: raw.facilityData as Record<string, unknown> | undefined,
  }
}

export class AssetsService {
  async createAsset(data: CreateAssetInput, orgId: string, userId: string) {
    validateCoordinates(data as unknown as Record<string, unknown>)
    const asset = await assetsRepository.create(data as unknown as Record<string, unknown>, orgId, userId)
    return serializeAsset(asset.toObject())
  }

  async getAsset(id: string) {
    const asset = await assetsRepository.findById(id)
    if (!asset) throw AppError.notFound("Asset not found")
    return serializeAsset(asset.toObject())
  }

  async updateAsset(id: string, data: UpdateAssetInput) {
    if (data.siteData && "coordinates" in data.siteData && data.siteData.coordinates) {
      validateCoordinates({ siteData: data.siteData })
    }
    const asset = await assetsRepository.update(id, data as unknown as Record<string, unknown>)
    if (!asset) throw AppError.notFound("Asset not found")
    return serializeAsset(asset.toObject())
  }

  async deleteAsset(id: string) {
    const asset = await assetsRepository.findById(id)
    if (!asset) throw AppError.notFound("Asset not found")
    await assetsRepository.delete(id)
    return { message: "Asset deleted successfully" }
  }

  async listAssets(query: ListAssetsQuery, orgId: string) {
    return assetsRepository.list(query, orgId)
  }

  async getAssetStatus(id: string) {
    const cacheKey = `asset:status:${id}`

    const cached = await cacheService.get<Record<string, unknown>>(cacheKey)
    if (cached) return cached

    const asset = await assetsRepository.findById(id)
    if (!asset) throw AppError.notFound("Asset not found")

    const latestReading = await assetsRepository.getLatestThermalReading(id)

    const serialized = serializeAsset(asset.toObject())

    let currentStatus: Record<string, unknown> = {}
    let risk = { level: "minimal", score: 10 }

    if (asset.assetType === "vehicle" && asset.vehicleData) {
      currentStatus = (asset.vehicleData as Record<string, unknown>).currentStatus as Record<string, unknown> ?? {}
    } else if (asset.assetType === "site" && asset.siteData) {
      const sd = asset.siteData as Record<string, unknown>
      currentStatus = (sd.currentStatus as Record<string, unknown>) ?? {}
      const cs = sd.currentStatus as Record<string, unknown> | undefined
      if (cs?.wbgt !== undefined) {
        risk = assessRisk(cs.wbgt as number)
      }
    } else if (asset.assetType === "facility" && asset.facilityData) {
      currentStatus = (asset.facilityData as Record<string, unknown>).currentStatus as Record<string, unknown> ?? {}
    }

    if (latestReading) {
      const m = latestReading.metrics
      risk = assessRisk(m.wbgt, m.internalTemp, m.externalTemp)
    }

    const result = {
      asset: serialized,
      latestReading: latestReading
        ? {
            id: latestReading._id.toString(),
            timestamp: latestReading.timestamp,
            source: latestReading.source,
            metrics: latestReading.metrics,
            riskScore: latestReading.riskScore,
            riskLevel: latestReading.riskLevel,
          }
        : null,
      currentStatus,
      risk,
      lastHeartbeatAt: asset.lastHeartbeatAt,
    }

    await cacheService.set(cacheKey, result, env.CACHE_TTL_ASSET_STATUS)
    return result
  }

  async getAssetHistory(id: string, query: AssetHistoryQuery) {
    const asset = await assetsRepository.findById(id)
    if (!asset) throw AppError.notFound("Asset not found")

    const readings = await assetsRepository.getThermalHistory(id, query)

    return {
      assetId: id,
      assetType: asset.assetType,
      interval: query.interval,
      readings,
    }
  }
}

export const assetsService = new AssetsService()
