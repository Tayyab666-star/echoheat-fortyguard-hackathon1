import { z } from "zod"

// ── Coordinate validation ───────────────────────────────────

const latLngSchema = z.object({
  lat: z.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90"),
  lng: z.number().min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180"),
})

// ── Vehicle sub-schemas ─────────────────────────────────────

const routeStopSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  scheduledTime: z.string().optional(),
})

const vehicleDataSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  licensePlate: z.string().min(1, "License plate is required"),
  currentRoute: z
    .object({
      origin: z.string().default(""),
      destination: z.string().default(""),
      stops: z.array(routeStopSchema).default([]),
    })
    .optional(),
  telematicsProvider: z.enum(["samsara", "geotab", "mock"]).default("mock"),
  externalAssetId: z.string().default(""),
  cargo: z
    .object({
      type: z.string().default(""),
      setpointTemp: z.number().default(-20),
      toleranceBand: z.number().default(2),
    })
    .optional(),
  reefer: z
    .object({
      model: z.string().default(""),
      lastServiceDate: z.string().optional(),
      insulationRValue: z.number().default(0),
    })
    .optional(),
})

// ── Site sub-schemas ────────────────────────────────────────

const siteDataSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  address: z.string().min(1, "Site address is required"),
  coordinates: latLngSchema,
  workerCount: z.number().int().min(0).default(0),
  activeShift: z
    .object({
      start: z.string().default("06:00"),
      end: z.string().default("14:00"),
    })
    .optional(),
  projectManager: z
    .object({
      name: z.string().default(""),
      phone: z.string().default(""),
    })
    .optional(),
  compliancePlatform: z.enum(["procore", "hammertech", "none"]).default("none"),
  externalProjectId: z.string().default(""),
})

// ── Facility sub-schemas ────────────────────────────────────

const hvacSystemSchema = z.object({
  systemId: z.string().min(1, "System ID is required"),
  type: z.string().min(1, "HVAC system type is required"),
  capacity: z.number().min(0).default(0),
  bacnetAddress: z.string().default(""),
})

const facilityDataSchema = z.object({
  facilityName: z.string().min(1, "Facility name is required"),
  address: z.string().min(1, "Facility address is required"),
  squareFootage: z.number().min(0).default(0),
  buildingEnvelope: z
    .object({
      uValue: z.number().default(0),
      roofType: z.string().default(""),
      glazingRatio: z.number().min(0).max(1).default(0),
    })
    .optional(),
  hvacSystems: z.array(hvacSystemSchema).default([]),
  utilityAccount: z
    .object({
      provider: z.string().default(""),
      peakTariffWindow: z
        .object({
          start: z.string().default("14:00"),
          end: z.string().default("18:00"),
        })
        .optional(),
      baseRate: z.number().min(0).default(0),
      peakRate: z.number().min(0).default(0),
    })
    .optional(),
})

// ── Create Asset ────────────────────────────────────────────

export const createAssetSchema = z
  .object({
    assetType: z.enum(["vehicle", "site", "facility"], {
      errorMap: () => ({ message: "Asset type must be vehicle, site, or facility" }),
    }),
    tags: z.array(z.string().trim().min(1)).default([]),
    vehicleData: vehicleDataSchema.optional(),
    siteData: siteDataSchema.optional(),
    facilityData: facilityDataSchema.optional(),
  })
  .strict()
  .refine(
    (data) => {
      if (data.assetType === "vehicle") return !!data.vehicleData
      if (data.assetType === "site") return !!data.siteData
      if (data.assetType === "facility") return !!data.facilityData
      return false
    },
    {
      message: "vehicleData is required for vehicle, siteData for site, facilityData for facility",
      path: ["assetType"],
    }
  )

// ── Update Asset ────────────────────────────────────────────

export const updateAssetSchema = z
  .object({
    tags: z.array(z.string().trim().min(1)).optional(),
    isActive: z.boolean().optional(),
    vehicleData: vehicleDataSchema.partial().optional(),
    siteData: z
      .object({
        siteName: z.string().optional(),
        address: z.string().optional(),
        coordinates: latLngSchema.optional(),
        workerCount: z.number().int().min(0).optional(),
        activeShift: z
          .object({ start: z.string(), end: z.string() })
          .optional(),
        projectManager: z
          .object({ name: z.string(), phone: z.string() })
          .optional(),
        compliancePlatform: z.enum(["procore", "hammertech", "none"]).optional(),
        externalProjectId: z.string().optional(),
      })
      .strict()
      .optional(),
    facilityData: z
      .object({
        facilityName: z.string().optional(),
        address: z.string().optional(),
        squareFootage: z.number().min(0).optional(),
        buildingEnvelope: z
          .object({
            uValue: z.number().optional(),
            roofType: z.string().optional(),
            glazingRatio: z.number().min(0).max(1).optional(),
          })
          .optional(),
        hvacSystems: z.array(hvacSystemSchema).optional(),
        utilityAccount: z
          .object({
            provider: z.string().optional(),
            peakTariffWindow: z
              .object({ start: z.string(), end: z.string() })
              .optional(),
            baseRate: z.number().min(0).optional(),
            peakRate: z.number().min(0).optional(),
          })
          .optional(),
      })
      .strict()
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  })

// ── List / Filter ───────────────────────────────────────────

export const listAssetsSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  assetType: z.enum(["vehicle", "site", "facility"]).optional(),
  isActive: z
    .string()
    .transform((v) => v === "true")
    .optional(),
  search: z.string().optional(),
  tag: z.string().optional(),
  sort: z.enum(["createdAt", "updatedAt", "lastHeartbeatAt"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
})

// ── History Query ───────────────────────────────────────────

export const assetHistorySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  interval: z.enum(["hourly", "daily", "weekly"]).default("daily"),
  limit: z.coerce.number().int().min(1).max(500).default(100),
})

export type CreateAssetInput = z.infer<typeof createAssetSchema>
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>
export type ListAssetsQuery = z.infer<typeof listAssetsSchema>
export type AssetHistoryQuery = z.infer<typeof assetHistorySchema>
