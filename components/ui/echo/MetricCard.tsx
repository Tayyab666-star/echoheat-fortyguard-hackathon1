"use client"

import { type LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  label: string
  value: string
  unit?: string
  delta?: string
  deltaType?: "success" | "danger" | "neutral"
  icon: LucideIcon
  accentColor?: string
  loading?: boolean
}

export function MetricCard({
  label,
  value,
  unit,
  delta,
  deltaType = "neutral",
  icon: Icon,
  accentColor = "bg-primary",
  loading = false,
}: MetricCardProps) {
  if (loading) {
    return (
      <div
        data-slot="metric-card-skeleton"
        className="relative flex flex-col justify-between gap-4 overflow-hidden rounded-2xl border border-white/10 bg-surface-1/80 p-6 backdrop-blur-md"
      >
        <div className={cn("absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-surface-2", "animate-pulse")} />
        <div className="flex items-start justify-between">
          <div className="h-3 w-20 rounded bg-surface-2 animate-pulse" />
          <div className="size-8 rounded-lg bg-surface-2 animate-pulse" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <div className="h-9 w-16 rounded bg-surface-2 animate-pulse" />
          <div className="h-4 w-8 rounded bg-surface-2 animate-pulse" />
        </div>
        <div className="h-3 w-28 rounded bg-surface-2 animate-pulse" />
      </div>
    )
  }

  return (
    <motion.div
      data-slot="metric-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.24 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-surface-1/80 p-6 backdrop-blur-md"
    >
      {/* Accent left border */}
      <div className={cn("absolute left-0 top-0 h-full w-1 rounded-l-2xl", accentColor)} />

      <div className="flex items-start justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <span className="rounded-lg bg-surface-2 p-2 text-muted-foreground">
          <Icon className="size-4" />
        </span>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-3xl font-black tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-sm text-muted-foreground">{unit}</span>
        )}
      </div>

      {delta && (
        <span
          className={cn(
            "text-xs font-medium",
            deltaType === "success" && "text-success",
            deltaType === "danger" && "text-danger",
            deltaType === "neutral" && "text-muted-foreground"
          )}
        >
          {delta}
        </span>
      )}
    </motion.div>
  )
}
