"use client"

import { motion } from "framer-motion"

const METRICS = [
  {
    label: "Total Active Vehicles",
    value: 50,
    badge: null as null,
    sparkline: [32, 38, 42, 45, 48, 50, 49, 50],
  },
  {
    label: "Pre-Cooling Active",
    value: 12,
    badge: { text: "Active", color: "bg-success/15 text-success" },
    sparkline: [4, 6, 8, 10, 9, 11, 12, 12],
  },
  {
    label: "Routes Re-sequenced Today",
    value: 7,
    badge: { text: "Today", color: "bg-primary/15 text-primary" },
    sparkline: [1, 2, 3, 4, 5, 6, 7, 7],
  },
  {
    label: "SLA Breaches Avoided",
    value: 3,
    badge: { text: "Saved", color: "bg-info/15 text-info" },
    sparkline: [0, 1, 1, 2, 2, 3, 3, 3],
  },
]

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 64
  const h = 20
  const step = w / (data.length - 1)

  const points = data
    .map((v, i) => {
      const x = i * step
      const y = h - ((v - min) / range) * h
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-5 w-16 shrink-0"
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke="rgb(var(--primary))"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function FleetStatusCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.16 }}
      className="col-span-full flex flex-col gap-4 rounded-2xl border border-border bg-surface-1/80 p-4 sm:p-6 backdrop-blur-md lg:col-span-3"
    >
      <h3 className="font-mono text-sm font-semibold">Fleet Status</h3>

      <div className="flex flex-col gap-3">
        {METRICS.map((metric) => (
          <div
            key={metric.label}
            className="flex items-center justify-between gap-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-muted-foreground">
                {metric.label}
              </p>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="font-mono text-lg font-bold tabular-nums">
                  {metric.value}
                </span>
                {metric.badge && (
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${metric.badge.color}`}
                  >
                    {metric.badge.text}
                  </span>
                )}
              </div>
            </div>
            <Sparkline data={metric.sparkline} />
          </div>
        ))}
      </div>
    </motion.div>
  )
}
