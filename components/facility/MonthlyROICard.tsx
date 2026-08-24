"use client"

import { motion } from "framer-motion"
import { TrendingDown, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricRow {
  label: string
  without: string
  with_: string
  delta?: string
  deltaType?: "savings" | "increase"
}

const METRICS: MetricRow[] = [
  { label: "Peak Demand Charges", without: "$18,400/mo", with_: "$12,100/mo", delta: "-34%", deltaType: "savings" },
  { label: "Chiller Failures (Annual)", without: "6 incidents", with_: "1 incident", delta: "-5 avoided", deltaType: "savings" },
  { label: "Energy Cost (Monthly)", without: "$42,800", with_: "$36,200", delta: "-15%", deltaType: "savings" },
  { label: "HVAC Maintenance", without: "$8,200/mo", with_: "$6,900/mo", delta: "-16%", deltaType: "savings" },
]

export function MonthlyROICard() {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface-1/80 p-6 backdrop-blur-md">
      <h3 className="font-mono text-sm font-semibold mb-4">Monthly ROI Comparison</h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Without EchoHeat */}
        <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-surface-2/40 p-4">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-danger/15 text-danger">
              <TrendingUp className="size-3" />
            </span>
            <span className="text-xs font-semibold text-muted-foreground">Without EchoHeat</span>
          </div>

          <div className="flex flex-col gap-2">
            {METRICS.map((m) => (
              <div key={m.label} className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">{m.label}</span>
                <span className="font-mono text-xs font-bold tabular-nums">{m.without}</span>
              </div>
            ))}
          </div>
        </div>

        {/* With EchoHeat */}
        <div className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-success/15 text-success">
              <TrendingDown className="size-3" />
            </span>
            <span className="text-xs font-semibold text-primary">With EchoHeat</span>
          </div>

          <div className="flex flex-col gap-2">
            {METRICS.map((m) => (
              <div key={m.label} className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">{m.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold tabular-nums text-primary">{m.with_}</span>
                  {m.delta && (
                    <span className="text-[9px] font-bold text-success">{m.delta}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Net savings */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="mt-4 flex items-center justify-between rounded-xl border border-primary/30 bg-primary/10 px-4 py-3"
      >
        <span className="text-xs font-semibold">Net Annual Savings</span>
        <span className="font-mono text-2xl font-black text-primary tabular-nums">
          $38,200 / year
        </span>
      </motion.div>
    </div>
  )
}
