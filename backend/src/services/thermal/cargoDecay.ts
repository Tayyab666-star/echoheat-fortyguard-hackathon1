/**
 * Cargo Temperature Decay Calculator
 * Converted from data-analyst-work/analyst-pipeline/kinetics.py
 * Q10 model for perishable goods temperature projection
 */

export interface CargoDecayInput {
  currentInternalTemp: number   // Current cargo temperature (°C)
  ambientRoadTemp: number       // Ambient road temperature (°C)
  doorOpenMinutes: number       // Time doors were open (minutes)
  q10?: number                  // Q10 coefficient (default 2.0)
}

export interface CargoDecayOutput {
  projectedTemp: number
  tempRise: number
  riskLevel: 'safe' | 'caution' | 'warning' | 'critical'
  recommendation: string
}

/**
 * Calculate cargo temperature decay using Q10 model
 * Formula: T_final = T_ambient - (T_ambient - T_initial) × exp(-k × t)
 */
export function calculateCargoDecay(input: CargoDecayInput): CargoDecayOutput {
  const { currentInternalTemp, ambientRoadTemp, doorOpenMinutes, q10 = 2.0 } = input

  // Q10 decay constant
  const k = 0.05 * q10

  // Project temperature after door open event
  const projectedTemp = ambientRoadTemp - (ambientRoadTemp - currentInternalTemp) * Math.exp(-k * doorOpenMinutes)
  const roundedProjected = Math.round(projectedTemp * 100) / 100

  // Calculate temperature rise
  const tempRise = roundedProjected - currentInternalTemp
  const roundedRise = Math.round(tempRise * 100) / 100

  // Risk assessment
  let riskLevel: CargoDecayOutput['riskLevel']
  let recommendation: string

  if (roundedRise < 2) {
    riskLevel = 'safe'
    recommendation = 'Temperature stable. No immediate action required.'
  } else if (roundedRise < 5) {
    riskLevel = 'caution'
    recommendation = 'Monitor temperature closely. Consider pre-cooling if available.'
  } else if (roundedRise < 8) {
    riskLevel = 'warning'
    recommendation = 'Significant temperature rise. Initiate pre-cooling immediately.'
  } else {
    riskLevel = 'critical'
    recommendation = 'Critical temperature excursion. Emergency cooling required.'
  }

  return {
    projectedTemp: roundedProjected,
    tempRise: roundedRise,
    riskLevel,
    recommendation,
  }
}
