"use client"

import * as React from "react"
import { motion } from "framer-motion"

interface TimeBlock {
  start: number // hours from 6AM (0-12)
  duration: number // hours
  type: "work" | "rest"
}

const SHIFT_BLOCKS: TimeBlock[] = [
  { start: 0, duration: 0.5, type: "work" },
  { start: 0.5, duration: 1.5, type: "rest" },
  { start: 2, duration: 0.5, type: "work" },
  { start: 2.5, duration: 1.5, type: "rest" },
  { start: 4, duration: 0.5, type: "work" },
  { start: 4.5, duration: 1.5, type: "rest" },
  { start: 6, duration: 0.5, type: "work" },
  { start: 6.5, duration: 1.5, type: "rest" },
  { start: 8, duration: 0.5, type: "work" },
  { start: 8.5, duration: 1.5, type: "rest" },
  { start: 10, duration: 0.5, type: "work" },
  { start: 10.5, duration: 1.5, type: "rest" },
]

const SHIFT_START = 6 // 6 AM
const SHIFT_END = 18 // 6 PM
const TOTAL_HOURS = SHIFT_END - SHIFT_START

function formatHour(h: number) {
  const hr = Math.floor(h)
  const min = Math.round((h - hr) * 60)
  const period = hr >= 12 ? "PM" : "AM"
  const hr12 = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr
  return `${hr12}:${min.toString().padStart(2, "0")} ${period}`
}

export function WorkRestSchedule() {
  const [currentTime, setCurrentTime] = React.useState(() => {
    const now = new Date()
    return now.getHours() + now.getMinutes() / 60
  })

  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setCurrentTime(now.getHours() + now.getMinutes() / 60)
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const currentOffset = Math.max(0, Math.min(1, (currentTime - SHIFT_START) / TOTAL_HOURS))

  // Find next rest block
  const nextRest = SHIFT_BLOCKS.find(
    (b) => b.type === "rest" && b.start > currentTime - SHIFT_START
  )
  const restMinutesLeft = nextRest
    ? Math.max(0, Math.round((nextRest.start - (currentTime - SHIFT_START)) * 60))
    : 0

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-surface-1/80 p-4 sm:p-6 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-sm font-semibold">Work / Rest Schedule</h3>
        <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-surface-2 px-2.5 py-1 text-[11px] font-medium">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
          </span>
          Next Mandatory Rest In:{" "}
          <span className="font-mono font-bold text-warning">
            {String(Math.floor(restMinutesLeft / 60)).padStart(2, "0")}:
            {String(restMinutesLeft % 60).padStart(2, "0")}
          </span>
        </span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Hour labels */}
        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
          {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => (
            <span key={i} className="font-mono">
              {formatHour(SHIFT_START + i)}
            </span>
          ))}
        </div>

        {/* Block track */}
        <div className="relative h-8 rounded-full bg-surface-2 overflow-hidden border border-white/5">
          {SHIFT_BLOCKS.map((block, i) => {
            const left = (block.start / TOTAL_HOURS) * 100
            const width = (block.duration / TOTAL_HOURS) * 100
            return (
              <motion.div
                key={i}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                style={{ left: `${left}%`, width: `${width}%` }}
                className={`absolute inset-y-0 origin-left ${
                  block.type === "work"
                    ? "bg-success/60"
                    : "bg-primary/40"
                }`}
              />
            )
          })}

          {/* Current time marker */}
          <motion.div
            className="absolute top-0 bottom-0 w-0.5 bg-foreground z-10"
            initial={{ left: "0%" }}
            animate={{ left: `${currentOffset * 100}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 30 }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 size-2 rounded-full bg-foreground" />
          </motion.div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-success/60" /> Work
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-primary/40" /> Rest
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-0.5 bg-foreground rounded-full" /> Current Time
          </span>
        </div>
      </div>
    </div>
  )
}
