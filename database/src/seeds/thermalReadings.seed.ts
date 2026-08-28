import mongoose from "mongoose"
import { ThermalReading } from "../models/ThermalReading.js"
import type { RiskLevel, WbgtCategory } from "../interfaces/thermalReading.js"
import type { SeedOrganization } from "./organizations.seed.js"
import type { SeedAsset } from "./assets.seed.js"

// ── Karachi diurnal temperature curve ──
// Peak at 14:00: 44-48°C, Low at 06:00: 28-32°C

function getAmbientTemp(hour: number): number {
  // Sinusoidal approximation: peak at hour 14, trough at hour 6
  const phase = ((hour - 14) / 24) * 2 * Math.PI
  const base = 38 // Average
  const amplitude = 8 // ±8°C swing
  return base + amplitude * Math.cos(phase)
}

function getHumidity(hour: number): number {
  // Inverse of temp curve - higher humidity at night
  const phase = ((hour - 6) / 24) * 2 * Math.PI
  const base = 55
  const amplitude = 20
  return Math.max(20, Math.min(95, base + amplitude * Math.cos(phase)))
}

function getSolarRadiation(hour: number): number {
  if (hour < 6 || hour > 18) return 0
  const peak = 950
  const phase = ((hour - 12) / 12) * Math.PI
  return Math.max(0, peak * Math.sin(phase))
}

function getWindSpeed(hour: number): number {
  const base = 3.5
  const amplitude = 2
  const phase = ((hour - 14) / 24) * 2 * Math.PI
  return Math.max(0.5, base + amplitude * Math.cos(phase))
}

// Stull formula approximation: WBGT ≈ 0.567 * T + 0.393 * e + 3.94
// where e = (humidity/100) * 6.105 * exp(17.27 * T / (237.7 + T))
function calculateWBGT(ambientTemp: number, humidity: number): number {
  const e = (humidity / 100) * 6.105 * Math.exp((17.27 * ambientTemp) / (237.7 + ambientTemp))
  const wbgt = 0.567 * ambientTemp + 0.393 * e + 3.94
  return Math.round(Math.max(0, Math.min(50, wbgt)) * 100) / 100
}

function getWbgtCategory(wbgt: number): WbgtCategory {
  if (wbgt < 25) return "safe"
  if (wbgt < 28) return "caution"
  if (wbgt < 30) return "warning"
  if (wbgt < 33) return "danger"
  return "extreme"
}

function getRiskLevel(wbgt: number): RiskLevel {
  if (wbgt < 25) return "minimal"
  if (wbgt < 28) return "low"
  if (wbgt < 30) return "moderate"
  if (wbgt < 33) return "high"
  return "extreme"
}

interface ThermalReadingDoc {
  asset: mongoose.Types.ObjectId
  organization: mongoose.Types.ObjectId
  assetType: "vehicle" | "site" | "facility"
  readingSource: "mock"
  environment: {
    ambientTemp: number
    wbgt: number
    humidity: number
    solarRadiation: number
    windSpeed: number
  }
  assetSpecific: {
    internalTemp?: number
    currentLoad?: number
    workerCount?: number
  }
  calculatedRisk: {
    riskLevel: RiskLevel
    wbgtCategory: WbgtCategory
    thermalLagMinutes: number
  }
  coordinates: {
    lat: number
    lng: number
    address: string
  }
  recordedAt: Date
}

const BATCH_SIZE = 1000
const DAYS = 30
const HOURS_PER_DAY = 24

export async function seedThermalReadings(
  organizations: SeedOrganization[],
  assets: SeedAsset[]
): Promise<void> {
  console.log("[Seed] Seeding thermal readings (30 days, hourly, batched)...")

  await ThermalReading.deleteMany({})

  const now = new Date()
  const startDate = new Date(now.getTime() - DAYS * 24 * 60 * 60 * 1000)

  const allReadings: ThermalReadingDoc[] = []

  for (const asset of assets) {
    for (let day = 0; day < DAYS; day++) {
      for (let hour = 0; hour < HOURS_PER_DAY; hour++) {
        const recordedAt = new Date(startDate.getTime() + (day * HOURS_PER_DAY + hour) * 3600000)
        const ambientTemp = Math.round(getAmbientTemp(hour) * 100) / 100
        const humidity = Math.round(getHumidity(hour) * 100) / 100
        const wbgt = calculateWBGT(ambientTemp, humidity)
        const solarRadiation = Math.round(getSolarRadiation(hour) * 100) / 100
        const windSpeed = Math.round(getWindSpeed(hour) * 100) / 100

        const reading: ThermalReadingDoc = {
          asset: asset._id,
          organization: asset.organization,
          assetType: asset.assetType,
          readingSource: "mock",
          environment: {
            ambientTemp,
            wbgt,
            humidity,
            solarRadiation,
            windSpeed,
          },
          assetSpecific: {},
          calculatedRisk: {
            riskLevel: getRiskLevel(wbgt),
            wbgtCategory: getWbgtCategory(wbgt),
            thermalLagMinutes: Math.floor(Math.random() * 15 + 5),
          },
          coordinates: {
            lat: asset._id.toHexString().length > 0 ? 24.8607 : 24.8607,
            lng: 67.0011,
            address: "Karachi, Sindh, Pakistan",
          },
          recordedAt,
        }

        if (asset.assetType === "vehicle") {
          reading.assetSpecific.internalTemp = Math.round((-19 + Math.random() * 4) * 100) / 100
        } else if (asset.assetType === "site") {
          reading.assetSpecific.workerCount = Math.floor(20 + Math.random() * 80)
        } else {
          reading.assetSpecific.currentLoad = Math.round((0.4 + Math.random() * 0.5) * 100) / 100
        }

        allReadings.push(reading)
      }
    }
  }

  console.log(`[Seed] Generated ${allReadings.length} readings, inserting in batches of ${BATCH_SIZE}...`)

  for (let i = 0; i < allReadings.length; i += BATCH_SIZE) {
    const batch = allReadings.slice(i, i + BATCH_SIZE)
    await ThermalReading.insertMany(batch, { ordered: false })
    const progress = Math.min(i + BATCH_SIZE, allReadings.length)
    process.stdout.write(`\r[Seed] Inserted ${progress}/${allReadings.length} readings`)
  }

  console.log("")
  console.log(`[Seed] Thermal readings seeded successfully`)
}
