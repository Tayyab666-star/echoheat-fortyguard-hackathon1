"use client"

import { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { MetricValue } from "@/components/ui/echo/Text"

const W = 120
const H = 36
const PAD = 4

interface KPITrendMiniProps {
  data: number[]
  color?: string
  label: string
  currentValue: string
  trend: { value: string; direction: "up" | "down" | "flat" }
}

function buildSparklinePath(data: number[]): string {
  if (data.length < 2) return ""
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const chartW = W - PAD * 2
  const chartH = H - PAD * 2

  return data
    .map((v, i) => {
      const x = PAD + (i / (data.length - 1)) * chartW
      const y = PAD + (1 - (v - min) / range) * chartH
      if (i === 0) return `M${x},${y}`
      const px = PAD + ((i - 1) / (data.length - 1)) * chartW
      const py = PAD + (1 - (data[i - 1] - min) / range) * chartH
      const cpx1 = px + (x - px) * 0.4
      const cpx2 = x - (x - px) * 0.4
      return `C${cpx1},${py} ${cpx2},${y} ${x},${y}`
    })
    .join(" ")
}

function buildAreaPath(data: number[]): string {
  const line = buildSparklinePath(data)
  const lastX = PAD + ((data.length - 1) / (data.length - 1)) * (W - PAD * 2)
  const firstX = PAD
  return `${line} L${lastX},${H} L${firstX},${H} Z`
}

const TREND_ICONS = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
}

const TREND_COLORS = {
  up: "text-success",
  down: "text-danger",
  flat: "text-muted-foreground",
}

export function KPITrendMini({
  data,
  color = "rgb(var(--primary))",
  label,
  currentValue,
  trend,
}: KPITrendMiniProps) {
  const ref = useRef<SVGSVGElement>(null)
  const [visible, setVisible] = useState(false)

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

  const TrendIcon = TREND_ICONS[trend.direction]
  const trendColor = TREND_COLORS[trend.direction]
  const linePath = buildSparklinePath(data)
  const areaPath = buildAreaPath(data)
  const gradientId = `spark-${label.replace(/\s/g, "")}`

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface-1/80 p-4 backdrop-blur-md">
      <p className="text-[10px] text-text-muted font-medium uppercase tracking-widest">{label}</p>

      <div className="flex items-end justify-between gap-2">
        <MetricValue>{currentValue}</MetricValue>

        <span className={cn("flex items-center gap-0.5 text-[10px] font-medium", trendColor)}>
          <TrendIcon className="size-3" />
          {trend.value}
        </span>
      </div>

      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-9"
        aria-label={`${label} trend: ${trend.value}`}
        role="img"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        <motion.path
          d={areaPath}
          fill={`url(#${gradientId})`}
          initial={{ opacity: 0 }}
          animate={visible ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        />

        <motion.path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={visible ? { pathLength: 1 } : {}}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
    </div>
  )
}
