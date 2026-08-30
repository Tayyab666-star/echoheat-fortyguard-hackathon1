// backend/src/modules/thermalEngine/services/thermalEngine.service.ts
import { logger } from "../../../config/logger";
import { cacheService } from "../../../utils/cache.service";

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

export interface OptimalWindow {
  start: string;
  end: string;
}

export interface ThermalAssessmentInput {
  asset_id: string;
  vertical: "cold_chain" | "workforce_safety" | "commercial_facility";
  location?: { lat: number; lon: number };
  telemetry?: Record<string, any>;
}

export interface ThermalAssessmentResult {
  assessment_id: string;
  asset_id: string;
  vertical: string;
  risk_level: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  metrics: MicroclimateMetrics;
  optimal_window: OptimalWindow;
  recommendations: Array<{
    action: string;
    priority: "IMMEDIATE" | "SCHEDULED" | "INFORMATIONAL";
    target_system: string;
    payload: Record<string, any>;
    estimated_loss_prevented_usd: number;
  }>;
  evaluated_at: string;
}

export class ThermalEngineService {
  /**
   * Micro-WBGT calculation based on Stull natural wet bulb & radiant globe synthesis
   */
  public calculateMicroWBGT(
    tempDb: number,
    rh: number,
    solarRad: number,
    windSpeed: number = 2.0
  ): number {
    const t = tempDb;
    const tNw =
      t * Math.atan(0.151977 * Math.sqrt(rh + 8.313659)) +
      Math.atan(t + rh) -
      Math.atan(rh - 1.676331) +
      0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) -
      4.686035;

    const tG = tempDb + 0.014 * solarRad - 0.5 * Math.max(windSpeed, 0.5);
    const wbgt = 0.7 * tNw + 0.2 * tG + 0.1 * tempDb;
    return Number(wbgt.toFixed(2));
  }

  /**
   * Structural envelope thermal penetration lag (Fourier's Law)
   */
  public calculateThermalLag(
    thicknessM: number,
    diffusivity: number,
    periodHours: number = 24.0
  ): number {
    const periodSeconds = periodHours * 3600.0;
    const lagSeconds =
      (thicknessM / 2.0) * Math.sqrt(periodSeconds / (Math.PI * diffusivity));
    return Number((lagSeconds / 60.0).toFixed(1));
  }

  /**
   * Perishable cargo biological decay acceleration (Q10 rule)
   */
  public calculateQ10Spoilage(
    currentTemp: number,
    targetTemp: number,
    q10: number = 2.2
  ): number {
    const deltaT = Math.max(0, currentTemp - targetTemp);
    return Number(Math.pow(q10, deltaT / 10.0).toFixed(2));
  }

  /**
   * Projected reefer door-open thermal excursion during dock loading
   */
  public calculateReeferExcursion(
    fgTemp: number,
    openMinutes: number = 15,
    uVal: number = 0.35
  ): number {
    const delta = Math.max(0, fgTemp - -18.0);
    return Number((delta * uVal * (openMinutes / 10.0)).toFixed(2));
  }

  /**
   * Determines pre-cooling or rest schedule optimal operational window
   */
  public calculateOptimalWindow(
    leadMinutes: number = 45,
    durationMinutes: number = 60
  ): OptimalWindow {
    const now = Date.now();
    const startTime = new Date(now + leadMinutes * 60 * 1000).toISOString();
    const endTime = new Date(
      now + (leadMinutes + durationMinutes) * 60 * 1000
    ).toISOString();

    return {
      start: String(startTime),
      end: String(endTime),
    };
  }

  /**
   * Complete telemetry evaluation across domain verticals
   */
  public async evaluateAssetTelemetry(
    input: ThermalAssessmentInput
  ): Promise<ThermalAssessmentResult> {
    const cacheKey = `thermal:eval:${input.asset_id}:${input.vertical}`;
    const cached = await cacheService.get<ThermalAssessmentResult>(cacheKey);
    if (cached) return cached;

    const lat = input.location?.lat || 30.1575;
    const telemetry = input.telemetry || {};

    const baseAmbient = 37.0;
    const fortyguardTemp = Number(
      (baseAmbient + 5.2 + Math.abs(Math.sin(lat) * 3.5)).toFixed(1)
    );
    const solarRadiation = 850.0;
    const humidity = 45.0;

    const wbgt = this.calculateMicroWBGT(fortyguardTemp, humidity, solarRadiation);
    const tempDelta = Number((fortyguardTemp - baseAmbient).toFixed(1));

    let metrics: MicroclimateMetrics = {
      fortyguard_2m_temp_c: fortyguardTemp,
      macro_temp_c: baseAmbient,
      temp_delta_c: tempDelta,
      wbgt_c: wbgt,
      relative_humidity: humidity,
      solar_radiation_w_m2: solarRadiation,
      ...telemetry,
    };

    let riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL" = "LOW";
    const recommendations: ThermalAssessmentResult["recommendations"] = [];
    let leadTimeMinutes = 45;

    if (input.vertical === "cold_chain") {
      const tLag = this.calculateThermalLag(0.1, 1.2e-7);
      const q10 = this.calculateQ10Spoilage(
        telemetry.current_reefer_temp_c || -14.2,
        telemetry.target_cargo_temp_c || -18.0
      );
      const excursion = this.calculateReeferExcursion(fortyguardTemp, 15);

      metrics.thermal_lag_minutes = tLag;
      metrics.q10_decay_multiplier = q10;
      metrics.projected_door_open_excursion_c = excursion;
      leadTimeMinutes = Math.round(tLag);

      if (fortyguardTemp > 44.0 || excursion > 3.0) {
        riskLevel = "CRITICAL";
        recommendations.push({
          action: "TRIGGER_REEFER_PRECOOL",
          priority: "IMMEDIATE",
          target_system: "SAMSARA_API_V1",
          payload: {
            asset_id: input.asset_id,
            target_temp_c: -20.0,
            duration_minutes: tLag,
          },
          estimated_loss_prevented_usd: 150000,
        });
      } else if (fortyguardTemp > 40.0) {
        riskLevel = "MODERATE";
      }
    } else if (input.vertical === "workforce_safety") {
      const restMins = wbgt >= 32.2 ? 30 : 15;
      leadTimeMinutes = 15;

      if (wbgt >= 30.0) {
        riskLevel = wbgt >= 32.2 ? "CRITICAL" : "HIGH";
        recommendations.push({
          action: "DISPATCH_OSHA_BREAK",
          priority: "IMMEDIATE",
          target_system: "PROCORE_SAFETY_API",
          payload: {
            site_id: input.asset_id,
            wbgt_index: wbgt,
            mandated_rest_minutes: restMins,
          },
          estimated_loss_prevented_usd: 160000,
        });
      }
    } else {
      // commercial_facility
      const tLag = this.calculateThermalLag(0.3, 8.0e-7);
      const loadSpike = fortyguardTemp > 44.5 ? 57.5 : 12.0;

      metrics.thermal_lag_minutes = tLag;
      metrics.projected_hvac_load_spike_mw = loadSpike;
      leadTimeMinutes = 120;

      if (fortyguardTemp > 44.5) {
        riskLevel = "HIGH";
        recommendations.push({
          action: "ADJUST_HVAC_PRECOOL_SETPOINT",
          priority: "SCHEDULED",
          target_system: "BACNET_BMS_GATEWAY",
          payload: {
            facility_id: input.asset_id,
            new_chiller_setpoint_c: 5.0,
            lead_time_hours: 2.0,
          },
          estimated_loss_prevented_usd: 28000,
        });
      }
    }

    const optimalWindow = this.calculateOptimalWindow(leadTimeMinutes, 60);

    const result: ThermalAssessmentResult = {
      assessment_id: `eval_${Math.random().toString(36).substring(2, 9)}`,
      asset_id: input.asset_id,
      vertical: input.vertical,
      risk_level: riskLevel,
      metrics,
      optimal_window: {
        start: String(optimalWindow.start),
        end: String(optimalWindow.end),
      },
      recommendations,
      evaluated_at: new Date().toISOString(),
    };

    await cacheService.set(cacheKey, result, 120);
    logger.info(`[THERMAL ENGINE] Evaluated ${input.asset_id} with risk: ${riskLevel}`);

    return result;
  }
}

export const thermalEngineService = new ThermalEngineService();
