// lib/api.ts

export interface RemediationParams {
  assetId: string;
  vertical: "cold_chain" | "workforce_safety" | "commercial_facility";
  lat?: number;
  lon?: number;
  telemetry?: Record<string, any>;
}

export interface OrchestrationResult {
  success: boolean;
  telemetry: any;
  decision: {
    decision_id: string;
    action_type: string;
    status: string;
    system_target: string;
    tool_payload: Record<string, any>;
    executive_brief: string;
    estimated_loss_prevented_usd: number;
  };
  writeback: {
    execution_id: string;
    target_system: string;
    status: string;
    latency_ms: number;
    message: string;
  };
}

export async function handleAutonomousRemediation({
  assetId,
  vertical,
  lat = 30.1575,
  lon = 71.5249,
  telemetry = {}
}: RemediationParams): Promise<OrchestrationResult> {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://echoheat-fortyguard-hackathon1.onrender.com";

  try {
    const response = await fetch(`${backendUrl}/api/v1/orchestrate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        asset_id: assetId,
        vertical,
        lat,
        lon,
        telemetry: {
          current_reefer_temp_c: -14.2,
          target_cargo_temp_c: -18.0,
          shift_elapsed_hours: 4.5,
          chiller_setpoint_c: 6.5,
          ...telemetry,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: OrchestrationResult = await response.json();
    return data;
  } catch (error: any) {
    console.error("Failed to execute autonomous remediation:", error);
    throw error;
  }
}
