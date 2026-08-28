/**
 * WBGT (Wet Bulb Globe Temperature) Calculator
 * Converted from data-analyst-work/analyst-pipeline/wbgt_calc.py
 * Based on Stull 2011 wet-bulb approximation
 */

export interface WBGTInput {
  dryBulbTemp: number      // Ambient temperature in °C
  relativeHumidity: number // Relative humidity in %
  solarRadiation: number   // Solar radiation in W/m²
  windSpeed: number        // Wind speed in m/s
}

export interface WBGTOutput {
  wbgt: number
  heatStressCategory: string
  workRestRatio: string
  riskLevel: 'safe' | 'caution' | 'warning' | 'danger' | 'extreme'
}

/**
 * Calculate WBGT using Stull 2011 wet-bulb approximation
 * Formula: WBGT = 0.567 × T + 0.393 × e + 3.94 + 0.001 × solar - 0.05 × wind
 */
export function calculateWBGT(input: WBGTInput): WBGTOutput {
  const { dryBulbTemp, relativeHumidity, solarRadiation, windSpeed } = input

  // Calculate vapor pressure (e) from temperature and humidity
  const e = (relativeHumidity / 100) * 6.105 * Math.exp((17.27 * dryBulbTemp) / (237.7 + dryBulbTemp))

  // WBGT calculation (Stull 2011 simplified)
  let wbgt = 0.567 * dryBulbTemp + 0.393 * e + 3.94
  wbgt = wbgt + 0.001 * solarRadiation - 0.05 * windSpeed

  const roundedWbgt = Math.round(wbgt * 100) / 100

  // Determine heat stress category and risk level
  let heatStressCategory: string
  let workRestRatio: string
  let riskLevel: WBGTOutput['riskLevel']

  if (roundedWbgt < 26.7) {
    heatStressCategory = 'Safe'
    workRestRatio = 'No restrictions'
    riskLevel = 'safe'
  } else if (roundedWbgt < 29.4) {
    heatStressCategory = 'Caution'
    workRestRatio = '45/15 (45 min work, 15 min rest)'
    riskLevel = 'caution'
  } else if (roundedWbgt < 32.2) {
    heatStressCategory = 'Warning'
    workRestRatio = '30/30 (30 min work, 30 min rest)'
    riskLevel = 'warning'
  } else if (roundedWbgt < 35.0) {
    heatStressCategory = 'Danger'
    workRestRatio = '15/45 (15 min work, 45 min rest)'
    riskLevel = 'danger'
  } else {
    heatStressCategory = 'Extreme Danger'
    workRestRatio = '10/50 (10 min work, 50 min rest)'
    riskLevel = 'extreme'
  }

  return {
    wbgt: roundedWbgt,
    heatStressCategory,
    workRestRatio,
    riskLevel,
  }
}
