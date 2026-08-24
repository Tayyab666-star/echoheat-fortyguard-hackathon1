"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Calendar, Filter } from "lucide-react"

import { KPITrendMini } from "@/components/analytics/KPITrendMini"
import { SavingsBarChart } from "@/components/analytics/SavingsBarChart"
import { IncidentPreventionLine } from "@/components/analytics/IncidentPreventionLine"
import { AssetExposureHeatmap } from "@/components/analytics/AssetExposureHeatmap"
import { ROISummaryTable } from "@/components/analytics/ROISummaryTable"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const KPI_DATA = [
  {
    label: "Total Savings (YTD)",
    currentValue: "$2.14M",
    color: "rgb(var(--primary))",
    trend: { value: "+18% YoY", direction: "up" as const },
    data: [82, 88, 92, 98, 104, 112, 118, 126, 132, 140, 148, 156, 162, 170, 178, 184, 192, 198, 206, 212, 218, 224, 230, 236, 242, 248, 254, 260, 266, 272],
  },
  {
    label: "Incidents Prevented",
    currentValue: "284",
    color: "rgb(var(--success))",
    trend: { value: "+32% vs plan", direction: "up" as const },
    data: [4, 6, 8, 12, 18, 24, 32, 38, 44, 52, 58, 64, 72, 78, 86, 94, 102, 110, 118, 126, 136, 146, 156, 168, 178, 190, 202, 216, 232, 248],
  },
  {
    label: "Avg WBGT Reduction",
    currentValue: "4.2\u00B0C",
    color: "rgb(var(--warning))",
    trend: { value: "Stable", direction: "flat" as const },
    data: [3.1, 3.2, 3.4, 3.3, 3.5, 3.6, 3.8, 3.9, 4.0, 4.1, 4.0, 4.1, 4.2, 4.1, 4.2, 4.3, 4.2, 4.1, 4.2, 4.2, 4.3, 4.2, 4.1, 4.2, 4.2, 4.3, 4.2, 4.2, 4.1, 4.2],
  },
  {
    label: "Fleet Uptime",
    currentValue: "99.2%",
    color: "rgb(var(--success))",
    trend: { value: "+0.4% MoM", direction: "up" as const },
    data: [97.2, 97.4, 97.6, 97.8, 98.0, 98.1, 98.3, 98.4, 98.6, 98.7, 98.8, 98.9, 98.9, 99.0, 99.0, 99.1, 99.1, 99.1, 99.2, 99.2, 99.2, 99.2, 99.2, 99.2, 99.2, 99.2, 99.2, 99.2, 99.2, 99.2],
  },
]

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = React.useState("12m")
  const [segment, setSegment] = React.useState("all")

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6"
    >
      {/* Header: Filters */}
      <motion.div variants={item} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-muted-foreground" />
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger size="sm" className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="12m">Last 12 months</SelectItem>
                <SelectItem value="ytd">Year to date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <Select value={segment} onValueChange={setSegment}>
              <SelectTrigger size="sm" className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Segments</SelectItem>
                <SelectItem value="fleet">Fleet</SelectItem>
                <SelectItem value="safety">Safety</SelectItem>
                <SelectItem value="facility">Facility</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* KPI Strip */}
      <motion.div variants={item} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPI_DATA.map((kpi) => (
          <KPITrendMini
            key={kpi.label}
            label={kpi.label}
            currentValue={kpi.currentValue}
            color={kpi.color}
            trend={kpi.trend}
            data={kpi.data}
          />
        ))}
      </motion.div>

      {/* Charts: 2-column grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <motion.div variants={item} className="col-span-full lg:col-span-7">
          <SavingsBarChart />
        </motion.div>

        <motion.div variants={item} className="col-span-full lg:col-span-5">
          <IncidentPreventionLine />
        </motion.div>
      </div>

      {/* Heatmap: Full width */}
      <motion.div variants={item}>
        <AssetExposureHeatmap />
      </motion.div>

      {/* ROI Summary Table: Full width */}
      <motion.div variants={item}>
        <ROISummaryTable />
      </motion.div>
    </motion.div>
  )
}
