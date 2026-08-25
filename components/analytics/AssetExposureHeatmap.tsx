"use client"

import { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const HOURS = Array.from({ length: 24 }, (_, i) => i)

const CELL_W = 28
const CELL_H = 20
const PAD_LEFT = 36
const PAD_TOP = 20
const GAP = 2

const W = PAD_LEFT + 24 * (CELL_W + GAP)
const H = PAD_TOP + 7 * (CELL_H + GAP) + 24

function generateHeatData(): number[][] {
  const data: number[][] = []
  for (let day = 0; day < 7; day++) {
    const row: number[] = []
    for (let hour = 0; hour < 24; hour++) {
      const isWorkday = day < 5
      const isPeak = hour >= 10 && hour <= 16
      const base = isWorkday ? (isPeak ? 36 : 30) : 26
      const noise = (Math.sin(day * 7 + hour * 3) * 2.5 + Math.cos(day * 2 + hour) * 1.5)
      row.push(Math.round((base + noise) * 10) / 10)
    }
    data.push(row)
  }
  return data
}

const HEAT_DATA = generateHeatData()

function getHeatColor(wbgt: number): string {
  if (wbgt < 28) return "bg-success/30"
  if (wbgt < 30) return "bg-success/50"
  if (wbgt < 32) return "bg-warning/40"
  if (wbgt < 34) return "bg-warning/60"
  if (wbgt < 36) return "bg-primary/50"
  if (wbgt < 38) return "bg-primary/70"
  if (wbgt < 40) return "bg-danger/50"
  return "bg-danger/70"
}

function getHeatColorHex(wbgt: number): string {
  if (wbgt < 28) return "rgb(34,197,94)"
  if (wbgt < 30) return "rgb(34,197,94)"
  if (wbgt < 32) return "rgb(234,179,8)"
  if (wbgt < 34) return "rgb(234,179,8)"
  if (wbgt < 36) return "rgb(249,115,22)"
  if (wbgt < 38) return "rgb(249,115,22)"
  if (wbgt < 40) return "rgb(239,68,68)"
  return "rgb(239,68,68)"
}

const ASSET_COUNTS: Record<string, number> = {
  low: 4,
  mid: 12,
  high: 28,
}

function getAssetCount(wbgt: number): number {
  if (wbgt < 32) return ASSET_COUNTS.low
  if (wbgt < 36) return ASSET_COUNTS.mid
  return ASSET_COUNTS.high
}

interface TooltipState {
  x: number
  y: number
  day: string
  hour: number
  wbgt: number
  assets: number
}

export function AssetExposureHeatmap() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  function formatHour(h: number): string {
    if (h === 0) return "12AM"
    if (h === 12) return "12PM"
    return h > 12 ? `${h - 12}PM` : `${h}AM`
  }

  return (
    <div className="relative rounded-2xl border border-border bg-surface-1/80 p-4 sm:p-6 backdrop-blur-md">
      <h3 className="font-mono text-sm font-semibold mb-4">Asset Exposure Heatmap — WBGT by Hour</h3>

      <div ref={ref} className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[400px] sm:min-w-[600px]"
          aria-label="Asset exposure heatmap showing WBGT temperatures across days and hours"
          role="img"
        >
          {/* Hour labels */}
          {HOURS.filter((h) => h % 3 === 0).map((h) => (
            <text
              key={h}
              x={PAD_LEFT + h * (CELL_W + GAP) + CELL_W / 2}
              y={PAD_TOP - 6}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize="8"
            >
              {formatHour(h)}
            </text>
          ))}

          {/* Day labels + cells */}
          {DAYS.map((day, dayIdx) => (
            <g key={day}>
              <text
                x={PAD_LEFT - 6}
                y={PAD_TOP + dayIdx * (CELL_H + GAP) + CELL_H / 2 + 3}
                textAnchor="end"
                className="fill-muted-foreground"
                fontSize="9"
              >
                {day}
              </text>

              {HOURS.map((hour, hourIdx) => {
                const wbgt = HEAT_DATA[dayIdx][hourIdx]
                const x = PAD_LEFT + hourIdx * (CELL_W + GAP)
                const y = PAD_TOP + dayIdx * (CELL_H + GAP)
                const delay = (dayIdx * 24 + hourIdx) * 0.003

                return (
                  <motion.rect
                    key={`${dayIdx}-${hourIdx}`}
                    x={x}
                    y={y}
                    width={CELL_W}
                    height={CELL_H}
                    rx="3"
                    className={cn("cursor-pointer transition-opacity", getHeatColor(wbgt))}
                    initial={{ opacity: 0 }}
                    animate={visible ? { opacity: 1 } : {}}
                    transition={{ duration: 0.3, delay }}
                    onMouseEnter={(e) => {
                      const svgEl = e.currentTarget.closest("svg")
                      if (!svgEl) return
                      const svgRect = svgEl.getBoundingClientRect()
                      const cellRect = e.currentTarget.getBoundingClientRect()
                      setTooltip({
                        x: cellRect.left - svgRect.left + CELL_W / 2,
                        y: cellRect.top - svgRect.top - 8,
                        day,
                        hour,
                        wbgt,
                        assets: getAssetCount(wbgt),
                      })
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                )
              })}
            </g>
          ))}

          {/* Color scale legend */}
          <g transform={`translate(${PAD_LEFT}, ${H - 18})`}>
            {[
              { color: "rgb(34,197,94)", label: "<28°C" },
              { color: "rgb(234,179,8)", label: "32°C" },
              { color: "rgb(249,115,22)", label: "36°C" },
              { color: "rgb(239,68,68)", label: "40°C+" },
            ].map((item, i) => (
              <g key={i} transform={`translate(${i * 72}, 0)`}>
                <rect x="0" y="0" width="12" height="8" rx="2" fill={item.color} opacity="0.7" />
                <text x="16" y="7" className="fill-muted-foreground" fontSize="8">{item.label}</text>
              </g>
            ))}
          </g>
        </svg>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg border border-border bg-surface-2 px-3 py-2 shadow-lg"
          style={{ left: tooltip.x, top: tooltip.y, transform: "translate(-50%, -100%)" }}
        >
          <p className="text-[10px] font-bold text-foreground">{tooltip.day} at {formatHour(tooltip.hour)}</p>
          <p className="text-[10px] text-primary">WBGT: {tooltip.wbgt}\u00B0C</p>
          <p className="text-[10px] text-muted-foreground">{tooltip.assets} assets exposed</p>
        </div>
      )}
    </div>
  )
}
