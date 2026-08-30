// backend/src/services/kinetics.ts

export interface MicroclimateMetrics {
  fortyguard_2m_temp_c: number;
  macro_temp_c: number;
  temp_delta_c: number;
  wbgt_c: number;
  relative_humidity: number;
  solar_radiation_w_m2: number;
  thermal_lag_minutes?: number;
  q10_decay_multiplier?: number;
  projected_door_open_excursion_c?: number;
  projected_hvac_load_spike_mw?: number;
  [key: string]: any;
}

export class ThermalKineticsEngine {
  /**
   * Natural Wet-Bulb & Radiant WBGT synthesis at ground level (2m)
   */
  static calculateMicroWBGT(tempDb: number, rh: number, solarRad: number, windSpeed: number = 2.0): number {
    const t = tempDb;
    // Stull's equation approximation for natural wet bulb
    const tNw =
      t * Math.atan(0.151977 * Math.sqrt(rh + 8.313659)) +
      Math.atan(t + rh) -
      Math.atan(rh - 1.676331) +
      0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) -
      4.686035;

    // Black globe radiant temperature approximation
    const tG = tempDb + 0.014 * solarRad - 0.5 * Math.max(windSpeed, 0.5);
    const wbgt = 0.7 * tNw + 0.2 * tG + 0.1 * tempDb;
    return Number(wbgt.toFixed(2));
  }

  /**
   * Structural envelope thermal penetration lag
   */
  static calculateThermalLag(thicknessM: number, diffusivity: number, periodHours: number = 24.0): number {
    const periodSeconds = periodHours * 3600.0;
    const lagSeconds = (thicknessM / 2.0) * Math.sqrt(periodSeconds / (Math.PI * diffusivity));
    return Number((lagSeconds / 60.0).toFixed(1));
  }

  /**
   * Perishable cargo biological decay acceleration (Q10 rule)
   */
  static calculateQ10Spoilage(currentTemp: number, targetTemp: number, q10: number = 2.2): number {
    const deltaT = Math.max(0, currentTemp - targetTemp);
    return Number(Math.pow(q10, deltaT / 10.0).toFixed(2));
  }

  /**
   * Projected reefer door-open thermal excursion during dock loading
   */
  static calculateReeferExcursion(fgTemp: number, openMinutes: number = 15, uVal: number = 0.35): number {
    const delta = Math.max(0, fgTemp - -18.0);
    return Number((delta * uVal * (openMinutes / 10.0)).toFixed(2));
  }
}
