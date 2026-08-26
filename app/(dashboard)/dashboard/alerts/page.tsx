"use client"

import * as React from "react"
import { motion } from "framer-motion"

import { AlertFeedHeader } from "@/components/alerts/AlertFeedHeader"
import { AlertTimeline } from "@/components/alerts/AlertTimeline"
import { AlertDetailDialog } from "@/components/alerts/AlertDetailDialog"
import type { AlertData } from "@/components/alerts/AlertCard"

const MOCK_ALERTS: AlertData[] = [
  {
    id: "ALT-001",
    severity: "CRITICAL",
    type: "OSHA_BREACH",
    asset: "KI-04",
    location: "Zone C, Site 3 — NUST Rd",
    message: "WBGT threshold exceeded at 41.2\u00B0C. OSHA action level breached. Mandatory rest enforcement required for all exposed crews.",
    timestamp: "3m ago",
    status: "pending",
    actions: [
      { label: "Dispatch Rest Alert", variant: "orange" },
      { label: "Log to Procore", variant: "ghost" },
    ],
  },
  {
    id: "ALT-002",
    severity: "CRITICAL",
    type: "ROUTE_RISK",
    asset: "DX-12",
    location: "Route DXB-12 — Dubai Logistics Corridor",
    message: "Thermal corridor Alpha exceeding 44\u00B0C ambient. Refrigerated cargo at risk of SLA breach within 18 minutes.",
    timestamp: "8m ago",
    status: "pending",
    actions: [
      { label: "Re-sequence Now", variant: "orange" },
      { label: "View Route", variant: "ghost" },
    ],
  },
  {
    id: "ALT-003",
    severity: "WARNING",
    type: "PRE_COOL",
    asset: "KI-07",
    location: "Zone A — Distribution Hub A",
    message: "Pre-cool recommended for Unit KI-07 before peak tariff window. Expected to save 340 kW peak demand if initiated by 14:00.",
    timestamp: "15m ago",
    status: "pending",
    actions: [
      { label: "Approve Pre-Cool", variant: "blue" },
      { label: "Dismiss", variant: "ghost" },
    ],
  },
  {
    id: "ALT-004",
    severity: "WARNING",
    type: "FACILITY_PEAK",
    asset: "HVAC-03",
    location: "Building B — Floor 3",
    message: "Peak demand window approaching. Current load 780 kW, projected to exceed 900 kW tariff threshold by 15:30.",
    timestamp: "22m ago",
    status: "pending",
    actions: [
      { label: "Execute Pre-Cool", variant: "blue" },
      { label: "View Schedule", variant: "ghost" },
    ],
  },
  {
    id: "ALT-005",
    severity: "INFO",
    type: "PRE_COOL",
    asset: "KI-01",
    location: "Zone B — DHA",
    message: "Pre-cooling cycle completed for Unit KI-01. Internal temperature stabilized at -22.1\u00B0C. System ready for dispatch.",
    timestamp: "1h ago",
    status: "executed",
    actions: [
      { label: "View Details", variant: "ghost" },
    ],
  },
  {
    id: "ALT-006",
    severity: "RESOLVED",
    type: "ROUTE_RISK",
    asset: "LH-05",
    location: "Route LHR-07 — Lahore Manufacturing Hub",
    message: "Route risk mitigated. Unit LH-05 successfully re-routed via thermal corridor Beta. ETA updated to 16:45.",
    timestamp: "2h ago",
    status: "executed",
    actions: [
      { label: "View Route", variant: "ghost" },
    ],
  },
  {
    id: "ALT-007",
    severity: "INFO",
    type: "FACILITY_PEAK",
    asset: "HVAC-01",
    location: "Building A — Main Hall",
    message: "Thermal mass charging initiated. Concrete slab absorbing excess heat load. Expected buffer: 2h 40min.",
    timestamp: "3h ago",
    status: "executed",
    actions: [
      { label: "View Schedule", variant: "ghost" },
    ],
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

export default function AlertsPage() {
  const [filter, setFilter] = React.useState<"all" | "critical" | "warning" | "executed" | "pending">("all")
  const [search, setSearch] = React.useState("")
  const [selectedAlert, setSelectedAlert] = React.useState<AlertData | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const filtered = React.useMemo(() => {
    return MOCK_ALERTS.filter((a) => {
      if (filter === "critical" && a.severity !== "CRITICAL") return false
      if (filter === "warning" && a.severity !== "WARNING") return false
      if (filter === "executed" && a.status !== "executed") return false
      if (filter === "pending" && a.status !== "pending") return false
      if (search) {
        const q = search.toLowerCase()
        return (
          a.asset.toLowerCase().includes(q) ||
          a.message.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [filter, search])

  const handleDetails = React.useCallback((alert: AlertData) => {
    setSelectedAlert(alert)
    setDialogOpen(true)
  }, [])

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4"
    >
      <motion.div variants={item}>
        <AlertFeedHeader
          activeFilter={filter}
          onFilterChange={setFilter}
          searchQuery={search}
          onSearchChange={setSearch}
        />
      </motion.div>

      <motion.div variants={item}>
        <AlertTimeline alerts={filtered} onDetails={handleDetails} />
      </motion.div>

      <AlertDetailDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        alert={selectedAlert}
      />
    </motion.div>
  )
}
