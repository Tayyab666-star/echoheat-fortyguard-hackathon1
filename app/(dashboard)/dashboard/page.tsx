"use client"

import { Thermometer, Zap, Fuel, FileText } from "lucide-react"
import { motion } from "framer-motion"

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
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export default function OverviewPage() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 md:grid-cols-12"
    >
      {/* Row 1: Map (6) + Risk Score (3) + Fleet Status (3) */}
      <motion.div variants={item} className="col-span-full lg:col-span-6">
        <ThermalAlertMap />
      </motion.div>

      <motion.div variants={item} className="col-span-full sm:col-span-6 lg:col-span-3">
        <ActiveRiskScore score={78} />
      </motion.div>

      <motion.div variants={item} className="col-span-full sm:col-span-6 lg:col-span-3">
        <FleetStatusCard />
      </motion.div>

      {/* Row 2: 4 Metric Cards (3 each) */}
      {METRICS.map((metric) => (
        <motion.div
          key={metric.label}
          variants={item}
          className="col-span-full sm:col-span-6 lg:col-span-3"
        >
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

      {/* Row 3: Live Action Feed (full width) */}
      <motion.div variants={item} className="col-span-full">
        <LiveActionFeed />
      </motion.div>
    </motion.div>
  )
}
