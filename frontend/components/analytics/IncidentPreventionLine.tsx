"use client"

import { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Shield } from "lucide-react"
import { useTheme } from "@/lib/theme"
import { CardTitle, DataLabel } from "@/components/ui/echo/Text"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const INCIDENTS_WITHOUT = [14, 18, 22, 28, 34, 38, 42, 40, 36, 28, 20, 16]
const INCIDENTS_WITH = [4, 5, 6, 7, 8, 9, 10, 9, 8, 6, 5, 4]

const W = 800
const H = 300
const PAD = { top: 24, right: 24, bottom: 40, left: 48 }
const CHART_W = W - PAD.left - PAD.right
const CHART_H = H - PAD.top - PAD.bottom
const MAX_INCIDENTS = 50

function scaleX(monthIdx: number) {
  return PAD.left + (monthIdx / (MONTHS.length - 1)) * CHART_W
}

function scaleY(val: number) {
  return PAD.top + (1 - val / MAX_INCIDENTS) * CHART_H
}

function smoothPath(data: number[]): string {
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

function areaPath(data: number[]): string {
  const line = smoothPath(data)
  const lastX = scaleX(data.length - 1)
  const firstX = scaleX(0)
  const bottom = scaleY(0)
  return `${line} L${lastX},${bottom} L${firstX},${bottom} Z`
}

export function IncidentPreventionLine() {
  const ref = useRef<SVGSVGElement>(null)
  const [visible, setVisible] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const prevented = INCIDENTS_WITHOUT.reduce((a, b) => a + b, 0) - INCIDENTS_WITH.reduce((a, b) => a + b, 0)

  return (
    <div className="relative rounded-2xl border border-border bg-surface-1/80 p-4 sm:p-6 backdrop-blur-md">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Incident Prevention — With vs Without EchoHeat</CardTitle>
        <span className="flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">
          <Shield className="size-3" />
          {prevented} incidents prevented
        </span>
      </div>

      <div className="overflow-x-auto">
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full min-w-[400px] sm:min-w-[500px]"
        aria-label="Incident prevention line chart"
        role="img"
      >
        <defs>
          <linearGradient id="area-with" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(var(--success))" stopOpacity="0.15" />
            <stop offset="100%" stopColor="rgb(var(--success))" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 10, 20, 30, 40, 50].map((val) => (
          <g key={val}>
            <line
              x1={PAD.left}
              y1={scaleY(val)}
              x2={W - PAD.right}
              y2={scaleY(val)}
              stroke="rgb(var(--border))"
              strokeWidth="0.5"
              strokeDasharray="4 4"
            />
            <text
              x={PAD.left - 8}
              y={scaleY(val) + 3}
              textAnchor="end"
              className="fill-muted-foreground"
              fontSize="9"
            >
              {val}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {MONTHS.map((m, i) => (
          <text
            key={m}
            x={scaleX(i)}
            y={H - 12}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize="9"
          >
            {m}
          </text>
        ))}

        {/* Area fill under EchoHeat line */}
        <motion.path
          d={areaPath(INCIDENTS_WITH)}
          fill="url(#area-with)"
          initial={{ opacity: 0 }}
          animate={visible ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        />

        {/* Without EchoHeat line */}
        <motion.path
          d={smoothPath(INCIDENTS_WITHOUT)}
          fill="none"
          stroke="rgb(var(--text-muted))"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          initial={{ pathLength: 0 }}
          animate={visible ? { pathLength: 1 } : {}}
          transition={{ duration: 1.8, ease: "easeOut" }}
        />

        {/* With EchoHeat line */}
        <motion.path
          d={smoothPath(INCIDENTS_WITH)}
          fill="none"
          stroke="rgb(var(--success))"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={visible ? { pathLength: 1 } : {}}
          transition={{ duration: 1.8, delay: 0.3, ease: "easeOut" }}
        />

        {/* Data points on the EchoHeat line */}
        {INCIDENTS_WITH.map((v, i) => (
          <motion.circle
            key={i}
            cx={scaleX(i)}
            cy={scaleY(v)}
            r="3"
            fill="rgb(var(--success))"
            stroke="rgb(var(--surface-1))"
            strokeWidth="1.5"
            initial={{ opacity: 0, scale: 0 }}
            animate={visible ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.3, delay: 0.3 + i * 0.08 }}
          />
        ))}

        {/* Legend */}
        <g transform={`translate(${W - 220}, ${PAD.top})`}>
          <line x1="0" y1="6" x2="16" y2="6" stroke="rgb(var(--text-muted))" strokeWidth="1.5" strokeDasharray="6 4" />
          <text x="20" y="9" className="fill-muted-foreground" fontSize="9">Without EchoHeat</text>
          <line x1="110" y1="6" x2="126" y2="6" stroke="rgb(var(--success))" strokeWidth="2" />
          <text x="130" y="9" className="fill-muted-foreground" fontSize="9">With EchoHeat</text>
        </g>
      </svg>
      </div>
    </div>
  )
}
