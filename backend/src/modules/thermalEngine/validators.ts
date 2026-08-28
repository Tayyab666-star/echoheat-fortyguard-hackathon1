import { z } from "zod"

// ── WBGT Calculation ────────────────────────────────────────

export const wbgtParamsSchema = z
  .object({
    dryBulbTemp: z
      .number()
      .min(-20, "Dry bulb temperature must be >= -20°C")
      .max(60, "Dry bulb temperature must be <= 60°C")
      .describe("Ambient dry-bulb air temperature in °C"),
    relativeHumidity: z
      .number()
      .min(0, "Relative humidity must be >= 0%")
      .max(100, "Relative humidity must be <= 100%")
      .describe("Relative humidity in %"),
    solarRadiation: z
      .number()
      .min(0, "Solar radiation cannot be negative")
      .max(1400, "Solar radiation must be <= 1400 W/m²")
      .default(0)
      .describe("Solar radiation in W/m² (0 for indoor/shaded)"),
    windSpeed: z
      .number()
      .min(0, "Wind speed cannot be negative")
      .max(20, "Wind speed must be <= 20 m/s")
      .default(0)
      .describe("Wind speed at 1.1m height in m/s"),
  })
  .strict()

// ── Thermal Lag ─────────────────────────────────────────────

export const thermalLagParamsSchema = z
  .object({
    ambientTemp: z
      .number()
      .min(-20, "Ambient temperature must be >= -20°C")
      .max(60, "Ambient temperature must be <= 60°C")
      .describe("Outdoor ambient temperature in °C"),
    uValue: z
      .number()
      .min(0.1, "U-value must be > 0")
      .max(10, "U-value must be <= 10 W/m²·K")
      .describe("Overall heat transfer coefficient in W/m²·K"),
    wallMass: z
      .number()
      .min(100, "Wall mass must be >= 100 kg")
      .max(500000, "Wall mass must be <= 500,000 kg")
      .describe("Thermal mass of walls in kg"),
    currentIndoorTemp: z
      .number()
      .min(-10, "Indoor temperature must be >= -10°C")
      .max(50, "Indoor temperature must be <= 50°C")
      .describe("Current indoor temperature in °C"),
    targetTemp: z
      .number()
      .min(-10, "Target temperature must be >= -10°C")
      .max(50, "Target temperature must be <= 50°C")
      .describe("Target indoor temperature in °C"),
    solarLoad: z
      .number()
      .min(0, "Solar load cannot be negative")
      .max(1000, "Solar load must be <= 1000 W/m²")
      .default(0)
      .describe("Solar heat gain in W/m²"),
    surfaceArea: z
      .number()
      .min(1, "Surface area must be >= 1 m²")
      .max(100000, "Surface area must be <= 100,000 m²")
      .describe("Building envelope surface area in m²"),
  })
  .strict()

// ── Cargo Decay ─────────────────────────────────────────────

export const cargoDecayParamsSchema = z
  .object({
    currentInternalTemp: z
      .number()
      .min(-40, "Internal temperature must be >= -40°C")
      .max(20, "Internal temperature must be <= 20°C")
      .describe("Current cargo internal temperature in °C"),
    ambientRoadTemp: z
      .number()
      .min(-20, "Road temperature must be >= -20°C")
      .max(70, "Road temperature must be <= 70°C")
      .describe("Ambient road/air temperature in °C"),
    insulationRValue: z
      .number()
      .min(0.5, "R-value must be >= 0.5")
      .max(20, "R-value must be <= 20")
      .describe("Insulation R-value in ft²·°F·h/BTU"),
    doorOpenEvents: z
      .number()
      .int("Door open events must be an integer")
      .min(0, "Door open events cannot be negative")
      .max(50, "Door open events must be <= 50")
      .default(0)
      .describe("Number of door open events in the elapsed period"),
    timeElapsed: z
      .number()
      .min(0, "Time elapsed cannot be negative")
      .max(480, "Time elapsed must be <= 480 minutes (8 hours)")
      .describe("Time elapsed in minutes"),
    setpointTemp: z
      .number()
      .min(-40, "Setpoint must be >= -40°C")
      .max(20, "Setpoint must be <= 20°C")
      .describe("Cargo temperature setpoint in °C"),
  })
  .strict()

// ── Peak Demand ─────────────────────────────────────────────

const timeRangeSchema = z.object({
  start: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  end: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
})

export const peakDemandParamsSchema = z
  .object({
    currentLoad: z
      .number()
      .min(0, "Current load cannot be negative")
      .max(100000, "Current load must be <= 100,000 kW")
      .describe("Current electrical load in kW"),
    forecastedAmbientTemp: z
      .number()
      .min(-20, "Forecasted temperature must be >= -20°C")
      .max(60, "Forecasted temperature must be <= 60°C")
      .describe("Forecasted ambient temperature in °C"),
    thermalLag: z
      .number()
      .min(0, "Thermal lag cannot be negative")
      .max(480, "Thermal lag must be <= 480 minutes")
      .describe("Building thermal lag in minutes"),
    activeSystems: z
      .number()
      .int("Active systems must be an integer")
      .min(0, "Active systems cannot be negative")
      .max(100, "Active systems must be <= 100")
      .describe("Number of active HVAC systems"),
    tariffPeakWindow: timeRangeSchema.describe("Peak tariff window (HH:MM-HH:MM)"),
  })
  .strict()

// ── ROI ─────────────────────────────────────────────────────

export const roiParamsSchema = z
  .object({
    assetId: z
      .string()
      .min(1, "Asset ID is required")
      .describe("MongoDB ObjectId of the asset"),
    period: z
      .enum(["7d", "30d", "90d", "1y"], {
        errorMap: () => ({ message: "Period must be 7d, 30d, 90d, or 1y" }),
      })
      .default("30d")
      .describe("ROI calculation period"),
  })
  .strict()

export type WbgtParamsInput = z.infer<typeof wbgtParamsSchema>
export type ThermalLagParamsInput = z.infer<typeof thermalLagParamsSchema>
export type CargoDecayParamsInput = z.infer<typeof cargoDecayParamsSchema>
export type PeakDemandParamsInput = z.infer<typeof peakDemandParamsSchema>
export type RoiParamsInput = z.infer<typeof roiParamsSchema>
