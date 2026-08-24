"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Snowflake, ArrowDown, Clock, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ScheduleItem {
  id: string
  time: string
  description: string
  savings: string
  status: "scheduled" | "executed"
  overrideable: boolean
}

const SCHEDULE: ScheduleItem[] = [
  { id: "1", time: "06:00 AM", description: "Pre-cool all zones to 19\u00B0C", savings: "Expected to save 340 kW peak demand", status: "scheduled", overrideable: true },
  { id: "2", time: "08:30 AM", description: "Chiller 3 & 4 stage down", savings: "Avoiding coincident peak", status: "scheduled", overrideable: true },
  { id: "3", time: "11:00 AM", description: "Thermal mass charging initiated", savings: "Storing 180 kWh in concrete slab", status: "scheduled", overrideable: true },
  { id: "4", time: "02:00 PM", description: "Peak shaving mode activated", savings: "Reducing grid draw by 280 kW", status: "scheduled", overrideable: false },
  { id: "5", time: "05:30 PM", description: "Pre-cool cycle complete", savings: "System returned to normal operation", status: "executed", overrideable: false },
]

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariant = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0 },
}

export function PreCoolingSchedule() {
  const [overrides, setOverrides] = React.useState<Set<string>>(new Set())

  const toggleOverride = React.useCallback((id: string) => {
    setOverrides((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-surface-1/80 p-4 sm:p-6 backdrop-blur-md">
      <h3 className="font-mono text-sm font-semibold">Pre-Cooling Schedule</h3>

      <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-0">
        {SCHEDULE.map((entry, i) => {
          const isOverridden = overrides.has(entry.id)
          return (
            <motion.div
              key={entry.id}
              variants={itemVariant}
              className="flex items-start gap-3 relative"
            >
              {/* Timeline connector */}
              <div className="flex flex-col items-center">
                <span className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full",
                  entry.status === "executed"
                    ? "bg-success/15 text-success"
                    : isOverridden
                      ? "bg-warning/15 text-warning"
                      : "bg-primary/15 text-primary"
                )}>
                  {entry.status === "executed" ? (
                    <CheckCircle2 className="size-3.5" />
                  ) : (
                    <Snowflake className="size-3.5" />
                  )}
                </span>
                {i < SCHEDULE.length - 1 && (
                  <div className="w-px flex-1 min-h-[24px] bg-white/10" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold tabular-nums">{entry.time}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "border px-1.5 py-0 text-[9px] font-semibold uppercase",
                      entry.status === "executed"
                        ? "border-success/30 bg-success/10 text-success"
                        : isOverridden
                          ? "border-warning/30 bg-warning/10 text-warning"
                          : "border-primary/30 bg-primary/10 text-primary"
                    )}
                  >
                    {entry.status === "executed" ? "Executed" : isOverridden ? "Overridden" : "Scheduled"}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs font-medium">{entry.description}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{entry.savings}</p>

                {entry.overrideable && entry.status !== "executed" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 h-6 gap-1 text-[10px] text-warning hover:text-warning"
                    onClick={() => toggleOverride(entry.id)}
                  >
                    <ArrowDown className="size-3" />
                    {isOverridden ? "Restore" : "Override"}
                  </Button>
                )}
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
