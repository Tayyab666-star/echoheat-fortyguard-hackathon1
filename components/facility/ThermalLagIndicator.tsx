"use client"

import { motion } from "framer-motion"
import { Timer } from "lucide-react"

interface ThermalLagIndicatorProps {
  lagHours?: number
  lagMinutes?: number
  uValue?: number
  solarLoad?: number
}

export function ThermalLagIndicator({
  lagHours = 2,
  lagMinutes = 40,
  uValue = 0.28,
  solarLoad = 847,
}: ThermalLagIndicatorProps) {
  const totalMinutes = lagHours * 60 + lagMinutes
  const maxMinutes = 4 * 60 // 4h max scale
  const fillPct = Math.min(100, (totalMinutes / maxMinutes) * 100)

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-surface-1/80 p-6 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Timer className="size-3.5" />
        </span>
        <h3 className="font-mono text-sm font-semibold">Thermal Mass Buffer</h3>
      </div>

      {/* Progress bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Structural Thermal Lag (t_lag)</span>
          <span className="font-mono font-bold text-primary tabular-nums">
            {lagHours}h {lagMinutes}min remaining
          </span>
        </div>

        <div className="relative h-3 w-full rounded-full bg-surface-2">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary/80 to-primary"
            initial={{ width: 0 }}
            animate={{ width: `${fillPct}%` }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          />
          {/* Tick marks */}
          {[1, 2, 3].map((h) => (
            <div
              key={h}
              className="absolute top-0 bottom-0 w-px bg-white/10"
              style={{ left: `${(h * 60 / maxMinutes) * 100}%` }}
            />
          ))}
        </div>

        {/* Scale labels */}
        <div className="flex justify-between text-[9px] text-muted-foreground font-mono">
          <span>0h</span>
          <span>1h</span>
          <span>2h</span>
          <span>3h</span>
          <span>4h</span>
        </div>
      </div>

      {/* Formula note */}
      <div className="rounded-lg border border-white/5 bg-surface-2/40 px-3 py-2">
        <p className="font-mono text-[10px] text-muted-foreground">
          U-value: {uValue} &middot; Solar Load: {solarLoad} W/m\u00B2 &middot; Mass: 420 m\u00B3 concrete
        </p>
      </div>
    </div>
  )
}
