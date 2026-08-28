/**
 * Thermal Lag Calculator
 * Converted from data-analyst-work/analyst-pipeline/kinetics.py
 * Calculates building thermal lag and pre-cool timing
 */

export interface ThermalLagInput {
  uValue: number           // Overall heat transfer coefficient (W/m²·K)
  thermalMass: number      // Thermal mass of walls (kg)
  deltaTOutside: number    // Temperature difference outside (°C)
}

export interface ThermalLagOutput {
  lagHours: number
  lagMinutes: number
  explanation: string
}

/**
 * Calculate thermal lag based on U-value, thermal mass, and temperature delta
 * Formula: lag_hours = (thermal_mass / u_value) × 0.1 × delta_t_outside
 */
export function calculateThermalLag(input: ThermalLagInput): ThermalLagOutput {
  const { uValue, thermalMass, deltaTOutside } = input

  // Thermal lag calculation (from kinetics.py)
  const lagHours = (thermalMass / uValue) * 0.1 * deltaTOutside
  const roundedLagHours = Math.round(lagHours * 100) / 100

  // Convert to minutes for display
  const lagMinutes = Math.round(lagHours * 60)

  // Generate explanation based on lag duration
  let explanation: string
  if (roundedLagHours < 1) {
    explanation = `Low thermal lag (${roundedLagHours}h). Building responds quickly to temperature changes.`
  } else if (roundedLagHours < 3) {
    explanation = `Moderate thermal lag (${roundedLagHours}h). Pre-cooling recommended before peak hours.`
  } else if (roundedLagHours < 6) {
    explanation = `High thermal lag (${roundedLagHours}h). Excellent thermal mass for peak shaving.`
  } else {
    explanation = `Very high thermal lag (${roundedLagHours}h). Exceptional thermal mass storage capacity.`
  }

  return {
    lagHours: roundedLagHours,
    lagMinutes,
    explanation,
  }
}

export interface Q10DecayInput {
  initialTemp: number      // Initial cargo temperature (°C)
  ambientTemp: number      // Ambient temperature (°C)
  doorOpenMinutes: number  // Time doors were open (minutes)
  q10?: number             // Q10 coefficient (default 2.0)
}

export interface Q10DecayOutput {
  recoveryTemp: number
  riskLevel: 'safe' | 'caution' | 'warning' | 'critical'
}

/**
 * Q10 decay model for cargo temperature recovery
 * Formula: recovery = ambient - (ambient - initial) × exp(-k × time)
 */
export function calculateQ10Decay(input: Q10DecayInput): Q10DecayOutput {
  const { initialTemp, ambientTemp, doorOpenMinutes, q10 = 2.0 } = input

  // Q10 decay constant
  const k = 0.05 * q10

  // Recovery temperature calculation
  const recoveryTemp = ambientTemp - (ambientTemp - initialTemp) * Math.exp(-k * doorOpenMinutes)
  const roundedRecovery = Math.round(recoveryTemp * 100) / 100

  // Risk assessment based on temperature rise
  const tempRise = roundedRecovery - initialTemp
  let riskLevel: Q10DecayOutput['riskLevel']

  if (tempRise < 2) {
    riskLevel = 'safe'
  } else if (tempRise < 5) {
    riskLevel = 'caution'
  } else if (tempRise < 8) {
    riskLevel = 'warning'
  } else {
    riskLevel = 'critical'
  }

  return {
    recoveryTemp: roundedRecovery,
    riskLevel,
  }
}
