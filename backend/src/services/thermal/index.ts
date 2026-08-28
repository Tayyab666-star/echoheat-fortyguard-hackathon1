/**
 * Thermal Service Index
 * Re-exports thermal calculation functions from data analyst's work
 * Used by thermalEngine.service.ts as utility functions
 */

export { calculateWBGT, type WBGTInput, type WBGTOutput } from './wbgt.js'
export { calculateThermalLag, calculateQ10Decay, type ThermalLagInput, type ThermalLagOutput, type Q10DecayInput, type Q10DecayOutput } from './thermalLag.js'
export { calculateCargoDecay, type CargoDecayInput, type CargoDecayOutput } from './cargoDecay.js'
