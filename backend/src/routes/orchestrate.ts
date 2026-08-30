// backend/src/routes/orchestrate.ts
import { Router, Request, Response } from "express";
import { ThermalKineticsEngine, MicroclimateMetrics } from "../services/kinetics";
import { EchoHeatGeminiAgent, SystemExecutionDispatcher } from "../services/geminiAgent";

const router = Router();
const agent = new EchoHeatGeminiAgent();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { asset_id, vertical, lat, lon, telemetry = {} } = req.body;

    // FortyGuard 2m Synthetic/Ingested Microclimate
    const baseAmbient = 37.0;
    const fortyguardTemp = Number((baseAmbient + 5.2 + Math.abs(Math.sin(lat || 30.15) * 3.5)).toFixed(1));
    const solarRadiation = 850.0;
    const humidity = 45.0;

    // Physics Engine
    const wbgt = ThermalKineticsEngine.calculateMicroWBGT(fortyguardTemp, humidity, solarRadiation);
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

    if (vertical === "cold_chain") {
      metrics.thermal_lag_minutes = ThermalKineticsEngine.calculateThermalLag(0.1, 1.2e-7);
      metrics.q10_decay_multiplier = ThermalKineticsEngine.calculateQ10Spoilage(
        telemetry.current_reefer_temp_c || -14.2,
        telemetry.target_cargo_temp_c || -18.0
      );
      metrics.projected_door_open_excursion_c = ThermalKineticsEngine.calculateReeferExcursion(fortyguardTemp, 15);
    } else if (vertical === "commercial_facility") {
      metrics.thermal_lag_minutes = ThermalKineticsEngine.calculateThermalLag(0.3, 8.0e-7);
      metrics.projected_hvac_load_spike_mw = fortyguardTemp > 44.5 ? 57.5 : 12.0;
    }

    const payload = {
      site_or_asset_id: asset_id || "ASSET-01",
      vertical: vertical || "cold_chain",
      location: { lat, lon },
      metrics,
    };

    // Agentic Decision & Writeback
    const decision = await agent.evaluateTelemetry(payload);
    const writeback = await SystemExecutionDispatcher.execute(decision);

    return res.json({
      success: true,
      telemetry: payload,
      decision,
      writeback,
    });
  } catch (err: any) {
    console.error("Orchestration error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
