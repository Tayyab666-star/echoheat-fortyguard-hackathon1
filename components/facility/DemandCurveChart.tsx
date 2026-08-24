"use client"

import { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DollarSign } from "lucide-react"

// 24-hour demand data (kW) — baseline vs optimized
const BASELINE = [
  320, 310, 300, 295, 290, 310, 380, 520, 680, 780, 840, 870,
  890, 910, 920, 900, 850, 720, 600, 520, 460, 420, 380, 340,
]
const OPTIMIZED = [
  320, 310, 300, 295, 285, 290, 340, 420, 500, 560, 580, 590,
  540, 520, 500, 510, 480, 440, 420, 400, 380, 360, 350, 340,
]

const W = 800
const H = 280
const PAD = { top: 24, right: 24, bottom: 36, left: 52 }
const CHART_W = W - PAD.left - PAD.right
const CHART_H = H - PAD.top - PAD.bottom

const MAX_KW = 1000
const HOURS = 24
const PEAK_START = 12
const PEAK_END = 18

function scaleX(hour: number) {
  return PAD.left + (hour / (HOURS - 1)) * CHART_W
}
function scaleY(kw: number) {
  return PAD.top + (1 - kw / MAX_KW) * CHART_H
}

function smoothPath(data: number[]) {
  return data
    .map((v, i) => {
      const x = scaleX(i)
      const y = scaleY(v)
      if (i === 0) return `M${x},${y}`
      const px = scaleX(i - 1)
      const py = scaleY(data[i - 1])
      const cpx1 = px + (x - px) * 0.4
      const cpx2 = x - (x - px) * 0.4
      return `C${cpx1},${py} ${cpx2},${y} ${x},${y}`
    })
    .join(" ")
}

function areaPath(data: number[]) {
  const line = smoothPath(data)
  const lastX = scaleX(data.length - 1)
  const firstX = scaleX(0)
  const bottom = scaleY(0)
  return `${line} L${lastX},${bottom} L${firstX},${bottom} Z`
}

export function DemandCurveChart() {
  const ref = useRef<SVGSVGElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const peakX1 = scaleX(PEAK_START)
  const peakX2 = scaleX(PEAK_END)

  // Savings region between curves during peak window
  const peakBaseline = BASELINE.slice(PEAK_START, PEAK_END + 1)
  const peakOptimized = OPTIMIZED.slice(PEAK_START, PEAK_END + 1)

  return (
    <div className="relative rounded-2xl border border-white/10 bg-surface-1/80 p-4 sm:p-6 backdrop-blur-md">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-mono text-sm font-semibold">Demand Curve — 24h</h3>
        <span className="flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">
          <DollarSign className="size-3" />
          $2,840 saved today
        </span>
      </div>

      <div className="overflow-x-auto">
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[500px]" aria-label="Demand curve chart showing baseline vs optimized" role="img">
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
            <line x1={PAD.left} y1={scaleY(kw)} x2={W - PAD.right} y2={scaleY(kw)} stroke="rgb(var(--border))" strokeWidth="0.5" strokeDasharray="4 4" />
            <text x={PAD.left - 8} y={scaleY(kw) + 3} textAnchor="end" className="fill-muted-foreground" fontSize="9">{kw}</text>
          </g>
        ))}

        {/* X-axis labels */}
        {[0, 4, 8, 12, 16, 20, 24].map((h) => (
          <text key={h} x={scaleX(Math.min(h, 23))} y={H - 8} textAnchor="middle" className="fill-muted-foreground" fontSize="9">
            {h === 0 ? "12AM" : h === 12 ? "12PM" : h === 24 ? "12AM" : h > 12 ? `${h - 12}PM` : `${h}AM`}
          </text>
        ))}

        {/* Peak tariff window */}
        <rect x={peakX1} y={PAD.top} width={peakX2 - peakX1} height={CHART_H} fill="url(#peak-region)" rx="4" />
        <text x={(peakX1 + peakX2) / 2} y={PAD.top + 14} textAnchor="middle" className="fill-danger/60" fontSize="8" fontWeight="600">
          PEAK TARIFF WINDOW
        </text>

        {/* Baseline path */}
        <motion.path
          d={smoothPath(BASELINE)}
          fill="none"
          stroke="rgb(113, 113, 122)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          initial={{ pathLength: 0 }}
          animate={visible ? { pathLength: 1 } : {}}
          transition={{ duration: 2, ease: "easeOut" }}
        />

        {/* Optimized area fill */}
        <motion.path
          d={areaPath(OPTIMIZED)}
          fill="url(#opt-fill)"
          initial={{ opacity: 0 }}
          animate={visible ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.8 }}
        />

        {/* Optimized path */}
        <motion.path
          d={smoothPath(OPTIMIZED)}
          fill="none"
          stroke="rgb(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={visible ? { pathLength: 1 } : {}}
          transition={{ duration: 2, delay: 0.4, ease: "easeOut" }}
        />

        {/* Legend */}
        <g transform={`translate(${W - 200}, ${PAD.top})`}>
          <line x1="0" y1="6" x2="16" y2="6" stroke="rgb(113, 113, 122)" strokeWidth="1.5" strokeDasharray="6 4" />
          <text x="20" y="9" className="fill-muted-foreground" fontSize="9">Baseline</text>
          <line x1="80" y1="6" x2="96" y2="6" stroke="rgb(var(--primary))" strokeWidth="2" />
          <text x="100" y="9" className="fill-muted-foreground" fontSize="9">EchoHeat</text>
        </g>
      </svg>
      </div>
    </div>
  )
}
