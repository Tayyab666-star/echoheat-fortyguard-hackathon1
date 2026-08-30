"use client";

import React, { useState } from "react";
import { handleAutonomousRemediation, OrchestrationResult } from "@/lib/api";

interface ActionTriggerProps {
  assetId: string;
  vertical?: "cold_chain" | "workforce_safety" | "commercial_facility";
}

export const AutonomousActionButton: React.FC<ActionTriggerProps> = ({
  assetId,
  vertical = "cold_chain",
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
    } catch (err: any) {
      setError(err.message || "Failed to dispatch mitigation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl text-white">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-sm text-slate-200">Autonomous Mitigation Agent</h4>
          <p className="text-xs text-slate-400">Target: {assetId}</p>
        </div>
        <button
          onClick={onExecute}
          disabled={loading}
          className="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-50 transition-colors"
        >
          {loading ? "Agent Reasoning..." : "Dispatch Mitigation"}
        </button>
      </div>

      {error && (
        <div className="p-2 text-xs bg-red-950 border border-red-800 text-red-200 rounded">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-2 p-3 bg-slate-950 border border-emerald-800/60 rounded-lg space-y-2 text-xs">
          <div className="flex justify-between items-center text-emerald-400 font-semibold">
            <span>✅ {result.writeback.status}</span>
            <span>+{result.writeback.latency_ms} ms</span>
          </div>
          <p className="text-slate-300">{result.decision.executive_brief}</p>
          <div className="flex justify-between pt-1 border-t border-slate-800 text-slate-400 font-mono">
            <span>Target: {result.decision.system_target}</span>
            <span className="text-emerald-400 font-bold">
              Protected: ${result.decision.estimated_loss_prevented_usd.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

async function handleAutonomousRemediation(assetId: string, vertical: string) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const res = await fetch(`${backendUrl}/api/v1/orchestrate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      asset_id: assetId,
      vertical: vertical, // 'cold_chain' | 'workforce_safety' | 'commercial_facility'
      lat: 30.1575,
      lon: 71.5249,
      telemetry: { current_reefer_temp_c: -14.2, target_cargo_temp_c: -18.0 }
    })
  });
  const data = await res.json();
  console.log("Agent Decision:", data.decision);
  console.log("Writeback Result:", data.writeback);
}

"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { DoorOpen, Fuel, Thermometer, Timer } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"

interface AssetDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle?: {
    id: string
    route: string
    cargoType: string
    internalTemp: string
    status: string
  } | null
}

const TEMP_DATA = [ -22, -21.5, -20, -19.2, -18.8, -19.5, -20.1, -19.8 ]

const STATS = [
  { icon: DoorOpen, label: "Door Opens Today", value: "3" },
  { icon: Fuel, label: "Fuel Burn", value: "142 gal" },
  { icon: Thermometer, label: "Setpoint vs Actual", value: "-20 / -19.8\u00B0C" },
  { icon: Timer, label: "Lag Time", value: "4.2 min" },
]

function TempChart({ data }: { data: number[] }) {
  const w = 400
  const h = 120
  const pad = 16

  const min = Math.min(...data) - 2
  const max = Math.max(...data) + 2
  const range = max - min || 1

  const points = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * (w - pad * 2),
    y: pad + (1 - (v - min) / range) * (h - pad * 2),
  }))

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ")
  const area = `${line} L${points[points.length - 1].x},${h - pad} L${points[0].x},${h - pad} Z`

  const labels = ["8h", "7h", "6h", "5h", "4h", "3h", "2h", "Now"]

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" aria-label="Temperature over past 8 hours" role="img">
      <defs>
        <linearGradient id="temp-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--primary))" stopOpacity="0.3" />
          <stop offset="100%" stopColor="rgb(var(--primary))" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((pct) => (
        <line
          key={pct}
          x1={pad}
          y1={pad + pct * (h - pad * 2)}
          x2={w - pad}
          y2={pad + pct * (h - pad * 2)}
          stroke="rgb(var(--border))"
          strokeWidth="0.5"
          strokeDasharray="4 4"
        />
      ))}

      {/* Area fill */}
      <motion.path
        d={area}
        fill="url(#temp-area)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      />

      {/* Line */}
      <motion.path
        d={line}
        fill="none"
        stroke="rgb(var(--primary))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      {/* Data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="rgb(var(--primary))" />
      ))}

      {/* X-axis labels */}
      {labels.map((label, i) => (
        <text
          key={label}
          x={pad + (i / (labels.length - 1)) * (w - pad * 2)}
          y={h - 2}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize="9"
        >
          {label}
        </text>
      ))}
    </svg>
  )
}

export function AssetDetailDrawer({ open, onOpenChange, vehicle }: AssetDetailDrawerProps) {
  if (!vehicle) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <SheetTitle className="font-mono text-lg">{vehicle.id}</SheetTitle>
            <Badge variant="outline" className="border-border bg-surface-2 text-[10px] font-mono">
              {vehicle.route}
            </Badge>
          </div>
          <SheetDescription>
            {vehicle.cargoType} &middot; {vehicle.internalTemp}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-5 px-4 pb-4">
          {/* Temperature Timeline */}
          <div className="rounded-xl border border-border bg-surface-1 p-4">
            <p className="mb-3 text-xs font-medium text-muted-foreground">
              Internal Temp — Past 8 Hours
            </p>
            <TempChart data={TEMP_DATA} />
          </div>

          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {STATS.map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="flex flex-col gap-1 rounded-lg border border-border bg-surface-1 p-3"
                >
                  <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Icon className="size-3" />
                    {stat.label}
                  </span>
                  <span className="font-mono text-sm font-bold">{stat.value}</span>
                </div>
              )
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Button className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              Force Pre-Cool
            </Button>
            <Button variant="outline" className="w-full gap-2">
              Re-sequence Route
            </Button>
            <Button variant="destructive" className="w-full gap-2">
              Flag for Review
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
