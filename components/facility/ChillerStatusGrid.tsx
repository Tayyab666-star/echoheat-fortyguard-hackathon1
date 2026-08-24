"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Snowflake, Zap, AlertTriangle, Pause } from "lucide-react"

type ChillerStatus = "PRE-COOLING" | "IDLE" | "AT-LOAD" | "FAULT"

interface Chiller {
  id: string
  name: string
  load: number
  status: ChillerStatus
  setpoint: number
  actual: number
}

const CHILLERS: Chiller[] = [
  { id: "CU-1", name: "Chiller 1", load: 72, status: "AT-LOAD", setpoint: 19, actual: 19.4 },
  { id: "CU-2", name: "Chiller 2", load: 58, status: "AT-LOAD", setpoint: 19, actual: 18.8 },
  { id: "CU-3", name: "Chiller 3", load: 0, status: "IDLE", setpoint: 19, actual: 22.1 },
  { id: "CU-4", name: "Chiller 4", load: 35, status: "PRE-COOLING", setpoint: 19, actual: 20.3 },
  { id: "CU-5", name: "Chiller 5", load: 84, status: "AT-LOAD", setpoint: 19, actual: 19.1 },
  { id: "CU-6", name: "Chiller 6", load: 0, status: "FAULT", setpoint: 19, actual: 24.7 },
]

const STATUS_CONFIG: Record<ChillerStatus, { icon: typeof Zap; color: string; bg: string; pulse: boolean }> = {
  "PRE-COOLING": { icon: Snowflake, color: "text-info", bg: "bg-info/15", pulse: true },
  IDLE: { icon: Pause, color: "text-muted-foreground", bg: "bg-surface-2", pulse: false },
  "AT-LOAD": { icon: Zap, color: "text-primary", bg: "bg-primary/15", pulse: true },
  FAULT: { icon: AlertTriangle, color: "text-danger", bg: "bg-danger/15", pulse: false },
}

function loadGradient(load: number): string {
  if (load < 40) return "bg-success"
  if (load < 65) return "bg-warning"
  if (load < 85) return "bg-primary"
  return "bg-danger"
}

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const cardVariant = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
}

export function ChillerStatusGrid() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-surface-1/80 p-4 sm:p-6 backdrop-blur-md">
      <h3 className="font-mono text-sm font-semibold">Chiller Status</h3>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {CHILLERS.map((chiller) => {
          const cfg = STATUS_CONFIG[chiller.status]
          const Icon = cfg.icon
          return (
            <motion.div
              key={chiller.id}
              variants={cardVariant}
              animate={cfg.pulse ? { boxShadow: ["0 0 0 0 rgba(249,115,22,0)", "0 0 12px 2px rgba(249,115,22,0.12)", "0 0 0 0 rgba(249,115,22,0)"] } : {}}
              transition={cfg.pulse ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" } : undefined}
              className="flex flex-col gap-3 rounded-xl border border-white/10 bg-surface-2/40 p-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn("flex size-7 items-center justify-center rounded-md", cfg.bg, cfg.color)}>
                    <Icon className="size-3.5" />
                  </span>
                  <div>
                    <p className="text-xs font-medium">{chiller.name}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">{chiller.id}</p>
                  </div>
                </div>
                <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase", cfg.bg, cfg.color)}>
                  {chiller.status}
                </span>
              </div>

              {/* Load bar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground">Load</span>
                  <span className="font-mono text-xs font-bold tabular-nums">{chiller.load}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-surface-2">
                  <motion.div
                    className={cn("h-full rounded-full", loadGradient(chiller.load))}
                    initial={{ width: 0 }}
                    animate={{ width: `${chiller.load}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Setpoint vs Actual */}
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">Setpoint</span>
                <span className="font-mono font-bold">{chiller.setpoint}\u00B0C</span>
                <span className="text-muted-foreground">Actual</span>
                <span className={cn(
                  "font-mono font-bold",
                  Math.abs(chiller.actual - chiller.setpoint) > 2 ? "text-danger" : "text-foreground"
                )}>
                  {chiller.actual}\u00B0C
                </span>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
