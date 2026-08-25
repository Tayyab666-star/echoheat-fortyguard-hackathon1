"use client"

import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useEffect } from "react"
import { cn } from "@/lib/utils"
import { useBreakpoint } from "@/hooks/useChartDimensions"
import { CardTitle, MetricValue, Caption } from "@/components/ui/echo/Text"

interface WBGTGaugePanelProps {
  value?: number
  actionLevel?: number
}

function getWBGTColor(value: number): string {
  if (value < 26) return "rgb(var(--success))"
  if (value < 32) return "rgb(var(--warning))"
  if (value < 39) return "rgb(var(--primary))"
  return "rgb(var(--danger))"
}

function getWBGTLabel(value: number): string {
  if (value < 26) return "Safe"
  if (value < 32) return "Moderate"
  if (value < 39) return "High"
  return "Danger"
}

function getSectors() {
  return [
    { start: 0, end: 65, color: "rgb(var(--success))", label: "Safe <26\u00B0C" },
    { start: 65, end: 130, color: "rgb(var(--warning))", label: "Moderate 26\u201332\u00B0C" },
    { start: 130, end: 195, color: "rgb(var(--primary))", label: "High 32\u201339\u00B0C" },
    { start: 195, end: 260, color: "rgb(var(--danger))", label: "Danger >39\u00B0C" },
  ]
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 180) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`
}

export function WBGTGaugePanel({ value = 41.2, actionLevel = 32 }: WBGTGaugePanelProps) {
  const bp = useBreakpoint()

  const gaugeSize = bp === "mobile" ? 160 : bp === "tablet" ? 200 : 260
  const cx = 150
  const cy = 140
  const r = 110
  const maxAngle = 260

  const angle = (Math.min(value, 50) / 50) * maxAngle
  const color = getWBGTColor(value)
  const label = getWBGTLabel(value)
  const exceeded = value >= actionLevel

  const motionAngle = useMotionValue(0)
  const needleRotation = useTransform(motionAngle, (v) => v - 180)

  useEffect(() => {
    const controls = animate(motionAngle, angle, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      type: "tween",
    })
    return controls.stop
  }, [angle, motionAngle])

  const sectors = getSectors()

  return (
    <div className={cn(
      "flex flex-col gap-4 rounded-2xl border border-border bg-surface-1/80 p-4 sm:p-6 backdrop-blur-md",
      bp === "mobile" ? "items-center" : "items-center"
    )}>
      <div className="flex items-center justify-between w-full">
        <CardTitle>WBGT Gauge</CardTitle>
        {exceeded && (
          <span className="rounded-md bg-danger/15 px-2 py-0.5 text-[10px] font-bold uppercase text-danger animate-pulse-heat">
            OSHA EXCEEDED
          </span>
        )}
      </div>

      {/* Mobile: large hero value above gauge */}
      {bp === "mobile" && (
        <div className="flex flex-col items-center gap-1">
          <MetricValue style={{ color, fontSize: "var(--text-display)" }}>
            {value.toFixed(1)}\u00B0C
          </MetricValue>
          <span className={cn(
            "rounded-md px-3 py-1 text-sm font-bold uppercase",
            exceeded ? "bg-danger/15 text-danger" : "bg-success/15 text-success"
          )}>
            Status: {exceeded ? "EXCEEDED" : "SAFE"}
          </span>
        </div>
      )}

      {/* Gauge SVG */}
      <div className="relative" style={{ width: gaugeSize, height: gaugeSize * 0.65 }}>
        <svg viewBox="0 0 300 170" className="w-full h-full" role="img" aria-label={`WBGT: ${value} degrees Celsius`}>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Sectors */}
          {sectors.map((s, i) => (
            <path
              key={i}
              d={arcPath(cx, cy, r, s.start + 180, s.end + 180)}
              fill="none"
              stroke={s.color}
              strokeWidth="18"
              strokeLinecap="round"
              opacity={0.3}
            />
          ))}

          {/* Active arc */}
          <motion.path
            d={arcPath(cx, cy, r, 180, 180 + angle)}
            fill="none"
            stroke={color}
            strokeWidth="18"
            strokeLinecap="round"
            filter="url(#glow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Tick marks */}
          {[0, 10, 20, 30, 40, 50].map((temp) => {
            const tickAngle = (temp / 50) * maxAngle
            const outer = polarToCartesian(cx, cy, r + 14, tickAngle + 180)
            const inner = polarToCartesian(cx, cy, r + 8, tickAngle + 180)
            return (
              <g key={temp}>
                <line x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y} stroke="rgb(var(--muted-foreground))" strokeWidth="1" />
                <text x={outer.x} y={outer.y - 6} textAnchor="middle" className="fill-muted-foreground" fontSize="8">
                  {temp}
                </text>
              </g>
            )
          })}

          {/* Needle */}
          <motion.g style={{ rotate: needleRotation, transformOrigin: `${cx}px ${cy}px` }}>
            <line x1={cx} y1={cy} x2={cx - r + 20} y2={cy} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx={cx} cy={cy} r="5" fill={color} />
            <circle cx={cx} cy={cy} r="2" fill="rgb(var(--background))" />
          </motion.g>
        </svg>
      </div>

      {/* Desktop/Tablet: info below gauge */}
      {bp !== "mobile" && (
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-baseline gap-1.5">
            <Caption>Current WBGT:</Caption>
            <MetricValue style={{ color, fontSize: "var(--text-heading2)" }}>
              {value.toFixed(1)}\u00B0C
            </MetricValue>
          </div>

          {exceeded && (
            <span className="rounded-md bg-danger/10 px-2 py-0.5 text-xs font-semibold text-danger">
              OSHA Action Level: EXCEEDED
            </span>
          )}

          <div className="rounded-lg border border-border bg-surface-2/60 px-3 py-2 text-xs">
            <span className="text-muted-foreground">Work/Rest Ratio: </span>
            <span className="font-mono font-bold text-warning">10 min work</span>
            <span className="text-muted-foreground"> / </span>
            <span className="font-mono font-bold text-danger">50 min rest required</span>
          </div>
        </div>
      )}

      {/* Mobile: compact info below gauge */}
      {bp === "mobile" && (
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="rounded-lg border border-border bg-surface-2/60 px-3 py-2 text-xs">
            <span className="font-mono font-bold text-warning">10 min work</span>
            <span className="text-muted-foreground"> / </span>
            <span className="font-mono font-bold text-danger">50 min rest</span>
          </div>
        </div>
      )}
    </div>
  )
}
