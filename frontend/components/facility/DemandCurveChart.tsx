"use client"

import { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DollarSign } from "lucide-react"
import { useBreakpoint } from "@/hooks/useChartDimensions"
import { useTheme } from "@/lib/theme"
import { CardTitle, DataLabel } from "@/components/ui/echo/Text"

const BASELINE_24H = [
  320, 310, 300, 295, 290, 310, 380, 520, 680, 780, 840, 870,
  890, 910, 920, 900, 850, 720, 600, 520, 460, 420, 380, 340,
]
const OPTIMIZED_24H = [
  320, 310, 300, 295, 285, 290, 340, 420, 500, 560, 580, 590,
  540, 520, 500, 510, 480, 440, 420, 400, 380, 360, 350, 340,
]

const PAD = { top: 24, right: 24, bottom: 36, left: 52 }
const MAX_KW = 1000
const PEAK_START = 12
const PEAK_END = 18

function getChartConfig(breakpoint: "mobile" | "tablet" | "desktop") {
  switch (breakpoint) {
    case "mobile":
      return {
        W: 500,
        H: 180,
        hours: BASELINE_24H.slice(6, 18),
        baseline: BASELINE_24H.slice(6, 18),
        optimized: OPTIMIZED_24H.slice(6, 18),
        startHour: 6,
        xLabels: [6, 9, 12, 15, 18],
        labelEvery: 3,
        title: "Demand Curve — Last 12h",
      }
    case "tablet":
      return {
        W: 700,
        H: 220,
        hours: BASELINE_24H,
        baseline: BASELINE_24H,
        optimized: OPTIMIZED_24H,
        startHour: 0,
        xLabels: [0, 4, 8, 12, 16, 20, 24],
        labelEvery: 4,
        title: "Demand Curve — 24h",
      }
    default:
      return {
        W: 800,
        H: 280,
        hours: BASELINE_24H,
        baseline: BASELINE_24H,
        optimized: OPTIMIZED_24H,
        startHour: 0,
        xLabels: [0, 4, 8, 12, 16, 20, 24],
        labelEvery: 4,
        title: "Demand Curve — 24h",
      }
  }
}

function scaleX(hour: number, startHour: number, W: number) {
  const chartW = W - PAD.left - PAD.right
  return PAD.left + ((hour - startHour) / 17) * chartW
}

function scaleY(kw: number, H: number) {
  const chartH = H - PAD.top - PAD.bottom
  return PAD.top + (1 - kw / MAX_KW) * chartH
}

function smoothPath(data: number[], startHour: number, W: number, H: number) {
  return data
    .map((v, i) => {
      const x = scaleX(i + startHour, startHour, W)
      const y = scaleY(v, H)
      if (i === 0) return `M${x},${y}`
      const px = scaleX(i - 1 + startHour, startHour, W)
      const py = scaleY(data[i - 1], H)
      const cpx1 = px + (x - px) * 0.4
      const cpx2 = x - (x - px) * 0.4
      return `C${cpx1},${py} ${cpx2},${y} ${x},${y}`
    })
    .join(" ")
}

function areaPath(data: number[], startHour: number, W: number, H: number) {
  const line = smoothPath(data, startHour, W, H)
  const lastX = scaleX(data.length - 1 + startHour, startHour, W)
  const firstX = scaleX(startHour, startHour, W)
  const bottom = scaleY(0, H)
  return `${line} L${lastX},${bottom} L${firstX},${bottom} Z`
}

function formatHour(h: number): string {
  if (h === 0 || h === 24) return "12AM"
  if (h === 12) return "12PM"
  return h > 12 ? `${h - 12}PM` : `${h}AM`
}

export function DemandCurveChart() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [visible, setVisible] = useState(false)
  const [touchHour, setTouchHour] = useState<number | null>(null)
  const bp = useBreakpoint()

  const cfg = getChartConfig(bp)
  const { W, H, baseline, optimized, startHour, xLabels } = cfg
  const CHART_W = W - PAD.left - PAD.right
  const CHART_H = H - PAD.top - PAD.bottom

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const peakX1 = scaleX(PEAK_START, startHour, W)
  const peakX2 = scaleX(PEAK_END, startHour, W)

  function handleTouch(e: React.TouchEvent<SVGSVGElement>) {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const touch = e.touches[0]
    const xPct = (touch.clientX - rect.left) / rect.width
    const hour = Math.round(startHour + xPct * 17)
    setTouchHour(Math.max(startHour, Math.min(startHour + 17, hour)))
  }

  function handleTouchEnd() {
    setTimeout(() => setTouchHour(null), 1500)
  }

  const touchValue = touchHour !== null ? baseline[touchHour - startHour] : null

  return (
    <div className="relative rounded-2xl border border-border bg-surface-1/80 p-4 sm:p-6 backdrop-blur-md">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>{cfg.title}</CardTitle>
        <span className="flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success self-start">
          <DollarSign className="size-3" />
          <span className={bp === "mobile" ? "text-[10px]" : ""}>$2,840 saved today</span>
        </span>
      </div>

      <div className="overflow-x-auto">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ minHeight: bp === "mobile" ? 150 : bp === "tablet" ? 200 : 260 }}
          aria-label="Demand curve chart showing baseline vs optimized"
          role="img"
          onTouchMove={handleTouch}
          onTouchEnd={handleTouchEnd}
        >
          <defs>
            <linearGradient id="opt-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(var(--primary))" stopOpacity="0.15" />
              <stop offset="100%" stopColor="rgb(var(--primary))" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="peak-region" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(var(--danger))" stopOpacity="0.08" />
              <stop offset="100%" stopColor="rgb(var(--danger))" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 250, 500, 750, 1000].map((kw) => (
            <g key={kw}>
              <line
                x1={PAD.left}
                y1={scaleY(kw, H)}
                x2={W - PAD.right}
                y2={scaleY(kw, H)}
                stroke="rgb(var(--border))"
                strokeWidth="0.5"
                strokeDasharray="4 4"
              />
              <text
                x={PAD.left - 8}
                y={scaleY(kw, H) + 3}
                textAnchor="end"
                className="fill-muted-foreground"
                fontSize={bp === "mobile" ? "7" : "9"}
              >
                {kw}
              </text>
            </g>
          ))}

          {/* X-axis labels */}
          {xLabels.map((h) => (
            <text
              key={h}
              x={scaleX(Math.min(h, 23), startHour, W)}
              y={H - 8}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize={bp === "mobile" ? "7" : "9"}
            >
              {formatHour(h)}
            </text>
          ))}

          {/* Peak tariff window */}
          {startHour <= PEAK_START && (
            <>
              <rect x={peakX1} y={PAD.top} width={peakX2 - peakX1} height={CHART_H} fill="url(#peak-region)" rx="4" />
              {bp !== "mobile" && (
                <text x={(peakX1 + peakX2) / 2} y={PAD.top + 14} textAnchor="middle" className="fill-danger/60" fontSize="8" fontWeight="600">
                  PEAK TARIFF WINDOW
                </text>
              )}
            </>
          )}

          {/* Baseline path */}
          <motion.path
            d={smoothPath(baseline, startHour, W, H)}
            fill="none"
            stroke="rgb(var(--muted-foreground))"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            initial={{ pathLength: 0 }}
            animate={visible ? { pathLength: 1 } : {}}
            transition={{ duration: 2, ease: "easeOut" }}
          />

          {/* Optimized area fill */}
          <motion.path
            d={areaPath(optimized, startHour, W, H)}
            fill="url(#opt-fill)"
            initial={{ opacity: 0 }}
            animate={visible ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.8 }}
          />

          {/* Optimized path */}
          <motion.path
            d={smoothPath(optimized, startHour, W, H)}
            fill="none"
            stroke="rgb(var(--primary))"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={visible ? { pathLength: 1 } : {}}
            transition={{ duration: 2, delay: 0.4, ease: "easeOut" }}
          />

          {/* Touch tooltip */}
          {touchHour !== null && touchValue !== null && (
            <g>
              <line
                x1={scaleX(touchHour, startHour, W)}
                y1={PAD.top}
                x2={scaleX(touchHour, startHour, W)}
                y2={H - PAD.bottom}
                stroke="rgb(var(--accent-primary))"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <circle
                cx={scaleX(touchHour, startHour, W)}
                cy={scaleY(touchValue, H)}
                r="5"
                fill="rgb(var(--accent-primary))"
                stroke="rgb(var(--bg-surface-1))"
                strokeWidth="2"
              />
              <rect
                x={scaleX(touchHour, startHour, W) - 30}
                y={scaleY(touchValue, H) - 28}
                width="60"
                height="20"
                rx="4"
                fill="rgb(var(--bg-surface-2))"
                stroke="rgb(var(--border-default))"
                strokeWidth="1"
              />
              <text
                x={scaleX(touchHour, startHour, W)}
                y={scaleY(touchValue, H) - 14}
                textAnchor="middle"
                className="fill-text-primary"
                fontSize="9"
                fontWeight="bold"
              >
                {touchValue} kW
              </text>
            </g>
          )}

          {/* Legend */}
          {bp !== "mobile" && (
            <g transform={`translate(${W - 200}, ${PAD.top})`}>
              <line x1="0" y1="6" x2="16" y2="6" stroke="rgb(var(--muted-foreground))" strokeWidth="1.5" strokeDasharray="6 4" />
              <text x="20" y="9" className="fill-muted-foreground" fontSize="9">Baseline</text>
              <line x1="80" y1="6" x2="96" y2="6" stroke="rgb(var(--primary))" strokeWidth="2" />
              <text x="100" y="9" className="fill-muted-foreground" fontSize="9">EchoHeat</text>
            </g>
          )}
        </svg>
      </div>
    </div>
  )
}
