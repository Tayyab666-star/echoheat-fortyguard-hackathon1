"use client"

import { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const AVOIDED_LOSS = [
  142000, 158000, 165000, 178000, 192000, 188000,
  195000, 201000, 187000, 174000, 156000, 148000,
]

const ECHOHEAT_COST = [
  12800, 13200, 13800, 14200, 14800, 14500,
  15200, 15600, 14800, 13900, 13100, 12600,
]

const W = 800
const H = 320
const PAD = { top: 24, right: 24, bottom: 40, left: 64 }
const CHART_W = W - PAD.left - PAD.right
const CHART_H = H - PAD.top - PAD.bottom
const MAX_VAL = 220000
const BAR_GROUP_W = CHART_W / 12
const BAR_W = BAR_GROUP_W * 0.3
const BAR_GAP = 4

function scaleY(val: number) {
  return PAD.top + (1 - val / MAX_VAL) * CHART_H
}

function formatCurrency(val: number): string {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`
  if (val >= 1000) return `$${Math.round(val / 1000)}k`
  return `$${val}`
}

interface TooltipState {
  x: number
  y: number
  month: string
  avoided: number
  cost: number
}

export function SavingsBarChart() {
  const ref = useRef<SVGSVGElement>(null)
  const [visible, setVisible] = useState(false)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

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

  function handleBarEnter(e: React.MouseEvent, monthIdx: number) {
    const svg = ref.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * W
    const y = ((e.clientY - rect.top) / rect.height) * H
    setTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top - 8,
      month: MONTHS[monthIdx],
      avoided: AVOIDED_LOSS[monthIdx],
      cost: ECHOHEAT_COST[monthIdx],
    })
  }

  const totalSavings = AVOIDED_LOSS.reduce((a, b) => a + b, 0) - ECHOHEAT_COST.reduce((a, b) => a + b, 0)

  return (
    <div className="relative rounded-2xl border border-border bg-surface-1/80 p-4 sm:p-6 backdrop-blur-md">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-mono text-sm font-semibold">Monthly Savings — Avoided Loss vs EchoHeat Cost</h3>
        <span className="flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">
          <DollarSign className="size-3" />
          {formatCurrency(totalSavings)} net annual savings
        </span>
      </div>

      <div className="overflow-x-auto">
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full min-w-[400px] sm:min-w-[500px]"
        aria-label="Monthly savings bar chart"
        role="img"
        onMouseLeave={() => setTooltip(null)}
        onTouchEnd={() => setTimeout(() => setTooltip(null), 2000)}
      >
        <defs>
          <linearGradient id="bar-avoided" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(var(--primary))" stopOpacity="0.9" />
            <stop offset="100%" stopColor="rgb(var(--primary))" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="bar-cost" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(87, 87, 96)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="rgb(63, 63, 70)" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 50000, 100000, 150000, 200000].map((val) => (
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
              {formatCurrency(val)}
            </text>
          </g>
        ))}

        {/* Baseline */}
        <line
          x1={PAD.left}
          y1={scaleY(0)}
          x2={W - PAD.right}
          y2={scaleY(0)}
          stroke="rgb(var(--border))"
          strokeWidth="1"
        />

        {/* Bar groups */}
        {MONTHS.map((month, i) => {
          const groupX = PAD.left + i * BAR_GROUP_W + BAR_GROUP_W * 0.15
          const avoidedH = (AVOIDED_LOSS[i] / MAX_VAL) * CHART_H
          const costH = (ECHOHEAT_COST[i] / MAX_VAL) * CHART_H
          const baseY = scaleY(0)

          return (
            <g key={month} onMouseEnter={(e) => handleBarEnter(e, i)}>
              {/* Avoided Loss bar */}
              <motion.rect
                x={groupX}
                y={baseY}
                width={BAR_W}
                height={0}
                fill="url(#bar-avoided)"
                rx="3"
                animate={visible ? { y: baseY - avoidedH, height: avoidedH } : {}}
                transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
                className="cursor-pointer"
              />

              {/* EchoHeat Cost bar */}
              <motion.rect
                x={groupX + BAR_W + BAR_GAP}
                y={baseY}
                width={BAR_W}
                height={0}
                fill="url(#bar-cost)"
                rx="3"
                animate={visible ? { y: baseY - costH, height: costH } : {}}
                transition={{ duration: 0.6, delay: i * 0.05 + 0.1, ease: "easeOut" }}
                className="cursor-pointer"
              />

              {/* X-axis label */}
              <text
                x={groupX + BAR_W + BAR_GAP / 2}
                y={H - 12}
                textAnchor="middle"
                className="fill-muted-foreground"
                fontSize="9"
              >
                {month}
              </text>
            </g>
          )
        })}

        {/* Legend */}
        <g transform={`translate(${W - 200}, ${PAD.top})`}>
          <rect x="0" y="0" width="10" height="10" rx="2" fill="url(#bar-avoided)" />
          <text x="14" y="9" className="fill-muted-foreground" fontSize="9">Avoided Loss</text>
          <rect x="80" y="0" width="10" height="10" rx="2" fill="url(#bar-cost)" />
          <text x="94" y="9" className="fill-muted-foreground" fontSize="9">EchoHeat Cost</text>
        </g>
      </svg>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg border border-border bg-surface-2 px-3 py-2 shadow-lg"
          style={{ left: tooltip.x, top: tooltip.y, transform: "translate(-50%, -100%)" }}
        >
          <p className="text-[10px] font-bold text-foreground">{tooltip.month}</p>
          <p className="text-[10px] text-primary">Avoided: {formatCurrency(tooltip.avoided)}</p>
          <p className="text-[10px] text-muted-foreground">Cost: {formatCurrency(tooltip.cost)}</p>
        </div>
      )}
    </div>
  )
}
