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
  color?: string
}

export function MetricCard({
  label,
  value,
  unit,
  delta,
  deltaType = "neutral",
  icon: Icon,
  color = "text-primary",
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.24 }}
      className="col-span-full flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-surface-1/80 p-4 sm:p-6 backdrop-blur-md lg:col-span-3"
    >
      <div className="flex items-start justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <span className={cn("rounded-lg bg-surface-2 p-2", color)}>
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
