"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Slider } from "@/components/ui/slider"

interface ThresholdConfig {
  id: string
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  format: (v: number) => string
}

const THRESHOLDS: ThresholdConfig[] = [
  {
    id: "wbgt",
    label: "WBGT Alert Threshold",
    value: 32,
    min: 28,
    max: 42,
    step: 0.5,
    unit: "\u00B0C",
    format: (v) => `${v}\u00B0C`,
  },
  {
    id: "lead",
    label: "Pre-cool Lead Time",
    value: 45,
    min: 15,
    max: 120,
    step: 5,
    unit: "min",
    format: (v) => `${v} min`,
  },
  {
    id: "variance",
    label: "Cargo Temp Variance Tolerance",
    value: 2,
    min: 0.5,
    max: 5,
    step: 0.5,
    unit: "\u00B0C",
    format: (v) => `\u00B1${v}\u00B0C`,
  },
]

export function ConfigureStep() {
  const [values, setValues] = React.useState<Record<string, number>>(
    Object.fromEntries(THRESHOLDS.map((t) => [t.id, t.value]))
  )

  function handleChange(id: string, val: number) {
    setValues((prev) => ({ ...prev, [id]: val }))
  }

  const wbgt = values.wbgt
  const lead = values.lead

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h2 className="text-2xl font-black text-foreground">Configure Thresholds</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Fine-tune when EchoHeat takes autonomous action.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {THRESHOLDS.map((threshold, i) => (
          <motion.div
            key={threshold.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.35 }}
            className="flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                {threshold.label}
              </label>
              <span className="font-mono text-sm font-bold text-primary tabular-nums">
                {threshold.format(values[threshold.id])}
              </span>
            </div>

            <Slider
              value={[values[threshold.id]]}
              min={threshold.min}
              max={threshold.max}
              step={threshold.step}
              onValueChange={([v]: [number]) => handleChange(threshold.id, v)}
              className="w-full"
            />

            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{threshold.format(threshold.min)}</span>
              <span>{threshold.format(threshold.max)}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Live preview */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4"
      >
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Live Preview
        </p>
        <p className="text-sm text-foreground/90">
          EchoHeat will trigger pre-cooling{" "}
          <span className="font-mono font-bold text-primary">{lead} minutes</span>{" "}
          before WBGT exceeds{" "}
          <span className="font-mono font-bold text-primary">{wbgt}\u00B0C</span>.
          Cargo temperature will be maintained within{" "}
          <span className="font-mono font-bold text-primary">\u00B1{values.variance}\u00B0C</span>{" "}
          of target.
        </p>
      </motion.div>
    </div>
  )
}
