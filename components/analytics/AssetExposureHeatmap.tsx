"use client"

import { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useHeatmapColors } from "@/lib/theme"
import { CardTitle, DataLabel } from "@/components/ui/echo/Text"

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

function getRiskLevel(wbgt: number): "safe" | "moderate" | "high" | "critical" {
  if (wbgt < 28) return "safe"
  if (wbgt < 32) return "safe"
  if (wbgt < 36) return "moderate"
  if (wbgt < 38) return "high"
  return "critical"
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
  const colors = useHeatmapColors()

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
      <CardTitle className="mb-4">Asset Exposure Heatmap — WBGT by Hour</CardTitle>

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
                const risk = getRiskLevel(wbgt)

                return (
                  <motion.rect
                    key={`${dayIdx}-${hourIdx}`}
                    x={x}
                    y={y}
                    width={CELL_W}
                    height={CELL_H}
                    rx="3"
                    fill={colors[risk]}
                    className="cursor-pointer"
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
              { color: colors.safeHex, label: "<28\u00B0C" },
              { color: colors.moderateHex, label: "32\u00B0C" },
              { color: colors.highHex, label: "36\u00B0C" },
              { color: colors.criticalHex, label: "40\u00B0C+" },
            ].map((item, i) => (
              <g key={i} transform={`translate(${i * 72}, 0)`}>
                <rect x="0" y="0" width="12" height="8" rx="2" fill={item.color} opacity="0.8" />
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
