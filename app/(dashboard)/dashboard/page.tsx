"use client"

import * as React from "react"
import { Thermometer, Zap, Fuel, FileText } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

import { ThermalAlertMap } from "@/components/dashboard/ThermalAlertMap"
import { ActiveRiskScore } from "@/components/dashboard/ActiveRiskScore"
import { FleetStatusCard } from "@/components/dashboard/FleetStatusCard"
import { MetricCard } from "@/components/dashboard/MetricCard"
import { LiveActionFeed } from "@/components/dashboard/LiveActionFeed"

const METRICS = [
  {
    label: "Avg WBGT",
    value: "31.2",
    unit: "\u00B0C",
    delta: "+2.4\u00B0C vs yesterday",
    deltaType: "danger" as const,
    icon: Thermometer,
    color: "text-danger",
  },
  {
    label: "Peak Demand Saved",
    value: "1.8",
    unit: "GWh",
    delta: "+12% vs yesterday",
    deltaType: "success" as const,
    icon: Zap,
    color: "text-primary",
  },
  {
    label: "OSHA Logs Filed",
    value: "4",
    unit: "today",
    delta: "On track",
    deltaType: "neutral" as const,
    icon: FileText,
    color: "text-muted-foreground",
  },
  {
    label: "TRU Fuel Saved",
    value: "340",
    unit: "gal",
    delta: "+8% vs average",
    deltaType: "success" as const,
    icon: Fuel,
    color: "text-success",
  },
]

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

function ScrollIndicatorDots({ count, activeIndex }: { count: number; activeIndex: number }) {
  return (
    <div className="flex justify-center gap-1.5 pt-1 sm:hidden">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "size-1.5 rounded-full transition-all duration-300",
            i === activeIndex ? "bg-accent w-4" : "bg-border-strong"
          )}
        />
      ))}
    </div>
  )
}

export default function OverviewPage() {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [activeDot, setActiveDot] = React.useState(0)

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    function handleScroll() {
      const scrollLeft = el!.scrollLeft
      const cardWidth = 220 + 12 // min-w + gap
      const idx = Math.round(scrollLeft / cardWidth)
      setActiveDot(Math.min(METRICS.length - 1, Math.max(0, idx)))
    }

    el.addEventListener("scroll", handleScroll, { passive: true })
    return () => el.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4"
    >
      {/* ═══ Row 1: Map + Risk + Fleet ═══ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-6 lg:grid-cols-12">
        <motion.div variants={item} className="sm:col-span-6 lg:col-span-7">
          <ThermalAlertMap />
        </motion.div>

        <motion.div variants={item} className="sm:col-span-3 lg:col-span-3">
          <ActiveRiskScore score={78} />
        </motion.div>

        <motion.div variants={item} className="sm:col-span-3 lg:col-span-2">
          <FleetStatusCard />
        </motion.div>
      </div>

      {/* ═══ Row 2: Metric Cards ═══ */}
      {/* Mobile: horizontal scroll strip with edge-to-edge bleed */}
      <div className="sm:hidden">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory -mx-4 px-4 scrollbar-hide"
        >
          {METRICS.map((metric) => (
            <div key={metric.label} className="min-w-[180px] snap-start flex-shrink-0">
              <MetricCard
                label={metric.label}
                value={metric.value}
                unit={metric.unit}
                delta={metric.delta}
                deltaType={metric.deltaType}
                icon={metric.icon}
                color={metric.color}
              />
            </div>
          ))}
        </div>
        <ScrollIndicatorDots count={METRICS.length} activeIndex={activeDot} />
      </div>

      {/* Tablet+: responsive grid */}
      <div className="hidden grid-cols-2 gap-4 sm:grid lg:grid-cols-4">
        {METRICS.map((metric) => (
          <motion.div key={metric.label} variants={item}>
            <MetricCard
              label={metric.label}
              value={metric.value}
              unit={metric.unit}
              delta={metric.delta}
              deltaType={metric.deltaType}
              icon={metric.icon}
              color={metric.color}
            />
          </motion.div>
        ))}
      </div>

      {/* ═══ Row 3: Live Feed ═══ */}
      <motion.div variants={item}>
        <LiveActionFeed />
      </motion.div>
    </motion.div>
  )
}
