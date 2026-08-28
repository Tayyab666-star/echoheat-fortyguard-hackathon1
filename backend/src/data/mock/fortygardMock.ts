/**
 * FortyGuard Mock Data Generator
 * Converted from data-analyst-work/analyst-pipeline/telematics_sim.py
 * Generates synthetic FortyGuard readings for demo/fallback mode
 */

import type { FortyGuardReading } from '../../types/fortygard.types.js'

/**
 * Generate a diurnal (24-hour cycle) FortyGuard reading
 * Peak temperature at 2pm (14:00), lowest at 6am
 */
export function generateDiurnalReading(lat: number, lng: number): FortyGuardReading {
  const now = new Date()
  const hour = now.getHours() + now.getMinutes() / 60

  // Diurnal temperature curve: peak at 2pm, trough at 6am
  const baseTemp = 28
  const peakDelta = 18
  const curve = Math.sin(((hour - 6) / 24) * Math.PI)
  const temp = baseTemp + Math.max(0, peakDelta * curve) + (Math.random() - 0.5) * 2

  // Humidity inversely correlated with temperature
  const humidity = 35 + Math.random() * 15 + (temp < 30 ? 10 : -5)

  // Solar radiation: zero at night, peak at noon
  const solarRadiation = hour >= 7 && hour <= 18
    ? 400 + Math.random() * 600
    : 0

  // Wind speed: slight diurnal variation
  const windSpeed = 1 + Math.random() * 4 + Math.sin(hour * 0.5) * 1.5

  // Apparent temperature (feels-like)
  const apparentTemperature = temp + (humidity > 40 ? 2 : 0) + (solarRadiation > 500 ? 3 : 0)

  return {
    timestamp: now.toISOString(),
    location: { lat, lng },
    temperature_2m: Number(temp.toFixed(1)),
    relative_humidity: Number(Math.max(10, Math.min(100, humidity)).toFixed(1)),
    solar_radiation: Number(Math.max(0, solarRadiation).toFixed(0)),
    wind_speed: Number(Math.max(0, windSpeed).toFixed(1)),
    apparent_temperature: Number(apparentTemperature.toFixed(1)),
    precipitation: 0,
  }
}

/**
 * Generate a batch of mock telematics data
 * Based on data-analyst-work/data/raw/mock_telematics.csv structure
 */
export function generateMockTelematicsData(
  vehicleId: string,
  siteLat: number,
  siteLon: number,
  hour: number
) {
  const baseTemp = 32 + Math.sin(((hour - 6) / 24) * Math.PI) * 8
  const humidity = Math.max(10, Math.min(100, 60 - (baseTemp - 30) * 2 + (Math.random() - 0.5) * 10))
  const solarAngle = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI))
  const solarRadiation = solarAngle * 900 + (Math.random() - 0.5) * 100
  const windSpeed = 2 + Math.random() * 6 + Math.sin(hour * 0.5) * 2

  return {
    timestamp: new Date().toISOString(),
    vehicle_id: vehicleId,
    site_lat: siteLat,
    site_lon: siteLon,
    ambient_temp_c: Number(baseTemp.toFixed(1)),
    relative_humidity: Number(humidity.toFixed(1)),
    solar_radiation_wm2: Number(solarRadiation.toFixed(1)),
    wind_speed_ms: Number(windSpeed.toFixed(1)),
    reefer_internal_temp: Number((-20 + Math.random() * 5).toFixed(1)),
    door_open_minutes: Math.floor(Math.random() * 10),
  }
}
