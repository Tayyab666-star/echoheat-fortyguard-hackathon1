import { z } from "zod"

// ── FortyGuard Snapshot ─────────────────────────────────────

export const fortygardSnapshotSchema = z
  .object({
    lat: z.number().min(-90).max(90).describe("Latitude"),
    lng: z.number().min(-180).max(180).describe("Longitude"),
    radiusMeters: z.coerce.number().min(10).max(5000).default(500).describe("Search radius in meters"),
  })
  .strict()

// ── FortyGuard Corridor ─────────────────────────────────────

export const fortygardCorridorSchema = z
  .object({
    waypoints: z
      .string()
      .transform((val) => {
        try {
          return JSON.parse(val) as Array<{ lat: number; lng: number }>
        } catch {
          throw new Error("waypoints must be valid JSON array of {lat, lng}")
        }
      })
      .refine(
        (val) => Array.isArray(val) && val.length >= 2 && val.length <= 50,
        "waypoints must be an array of 2-50 coordinate objects"
      )
      .describe("JSON array of [{lat, lng}] waypoints"),
  })
  .strict()

// ── Samsara Connect ─────────────────────────────────────────

export const samsaraConnectSchema = z
  .object({
    accessToken: z.string().min(1, "Access token is required"),
    refreshToken: z.string().optional(),
    expiresAt: z.string().optional().describe("ISO 8601 expiry time"),
    scope: z.array(z.string()).optional(),
  })
  .strict()

// ── Procore Connect ─────────────────────────────────────────

export const procoreConnectSchema = z
  .object({
    code: z.string().min(1, "Authorization code is required"),
    state: z.string().optional(),
  })
  .strict()

// ── Procore Callback ────────────────────────────────────────

export const procoreCallbackSchema = z
  .object({
    code: z.string().min(1, "Authorization code is required"),
    state: z.string().optional(),
  })
  .strict()

export type FortygardSnapshotInput = z.infer<typeof fortygardSnapshotSchema>
export type FortygardCorridorInput = z.infer<typeof fortygardCorridorSchema>
export type SamsaraConnectInput = z.infer<typeof samsaraConnectSchema>
export type ProcoreConnectInput = z.infer<typeof procoreConnectSchema>
