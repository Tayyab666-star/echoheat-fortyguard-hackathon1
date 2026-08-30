"use client";

import React, { useState } from "react";
import { Zap, ShieldCheck, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import { handleAutonomousRemediation, OrchestrationResult } from "@/lib/api";

export interface AutonomousActionButtonProps {
  assetId: string;
  vertical?: "cold_chain" | "workforce_safety" | "commercial_facility";
  label?: string;
  onSuccess?: (result: OrchestrationResult) => void;
  className?: string;
}

export const AutonomousActionButton: React.FC<AutonomousActionButtonProps> = ({
  assetId,
  vertical = "cold_chain",
  label = "Dispatch Autonomous Mitigation",
  onSuccess,
  className = "",
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OrchestrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onExecute = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await handleAutonomousRemediation({
        assetId,
        vertical,
        lat: 30.1575,
        lon: 71.5249,
      });
      setResult(data);
      if (onSuccess) onSuccess(data);
    } catch (err: any) {
      console.error("[AUTONOMOUS REMEDIATION ERROR]:", err);
      setError(err.message || "Failed to contact Gemini agent backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      <button
        onClick={onExecute}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-xs uppercase tracking-wider text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 transition-all shadow-md active:scale-[0.98] cursor-pointer"
      >
        {loading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-white" />
            <span>Agent Reasoning (Gemini Flash)...</span>
          </>
        ) : (
          <>
            <Zap className="w-4 h-4 text-amber-200 fill-amber-200" />
            <span>{label}</span>
          </>
        )}
      </button>

      {error && (
        <div className="flex items-start gap-2 p-2.5 bg-red-950/80 border border-red-800 rounded-lg text-red-200 text-xs">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="p-3.5 bg-slate-900 border border-emerald-500/40 rounded-lg space-y-2 text-xs shadow-inner">
          <div className="flex items-center justify-between font-semibold text-emerald-400 border-b border-slate-800 pb-1.5">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {result.writeback.status}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              +{result.writeback.latency_ms}ms
            </span>
          </div>

          <p className="text-slate-300 leading-relaxed text-[11px]">
            {result.decision.executive_brief}
          </p>

          <div className="flex justify-between items-center pt-1 text-[11px] font-mono">
            <span className="text-slate-400">Target: {result.decision.system_target}</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              ${result.decision.estimated_loss_prevented_usd.toLocaleString()} Protected
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
