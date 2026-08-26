"use client"

import { type LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { DataLabel, MetricValue, Caption } from "@/components/ui/echo/Text"

interface MetricCardProps {
  label: string
  value: string
  unit?: string
  delta?: string
  deltaType?: "success" | "danger" | "neutral"
  icon: LucideIcon
  color?: string
  className?: string
}

export function MetricCard({
  label,
  value,
  unit,
  delta,
  deltaType = "neutral",
  icon: Icon,
  color = "text-primary",
  className,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.24 }}
      className={cn(
        "flex flex-col justify-between gap-4 rounded-2xl border border-border bg-surface-1/80 p-4 sm:p-6 backdrop-blur-md",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <DataLabel>{label}</DataLabel>
        <span className={cn("rounded-lg bg-surface-2 p-2", color)}>
          <Icon className="size-4" />
        </span>
      </div>

      <div className="flex items-baseline gap-1.5">
        <MetricValue className="!text-2xl sm:!text-3xl">{value}</MetricValue>
        {unit && (
          <Caption>{unit}</Caption>
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
