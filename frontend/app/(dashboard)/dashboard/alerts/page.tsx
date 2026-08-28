"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  AlertTriangle,
  Flame,
  Info,
  CheckCircle2,
  MapPin,
  Clock,
  ChevronDown,
  Loader2,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CardTitle, Caption } from "@/components/ui/echo/Text"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

type Severity = "CRITICAL" | "WARNING" | "INFO" | "RESOLVED"
type AlertType = "PRE_COOL" | "ROUTE_RISK" | "OSHA_BREACH" | "FACILITY_PEAK"
type AlertStatus = "executed" | "pending" | "dismissed"

interface AlertData {
  id: string
  severity: Severity
  type: AlertType
  asset: string
  location: string
  message: string
  plainMessage: string
  timestamp: string
  status: AlertStatus
  actions: { label: string; variant: "primary" | "ghost" | "orange" | "blue" }[]
}

// ── Plain English Labels ─────────────────────────────────────

const SEVERITY_LABELS: Record<Severity, { text: string; icon: LucideIcon; color: string; bg: string }> = {
  CRITICAL: { text: "URGENT \u2014 Act immediately", icon: AlertTriangle, color: "text-danger", bg: "bg-danger/15" },
  WARNING: { text: "CAUTION \u2014 Needs attention soon", icon: Flame, color: "text-primary", bg: "bg-primary/15" },
  INFO: { text: "INFO \u2014 Good to know", icon: Info, color: "text-info", bg: "bg-info/15" },
  RESOLVED: { text: "RESOLVED \u2014 Issue fixed", icon: CheckCircle2, color: "text-success", bg: "bg-success/15" },
}

const STATUS_LABELS: Record<AlertStatus, { text: string; color: string }> = {
  executed: { text: "EchoHeat already fixed this", color: "text-success" },
  pending: { text: "Waiting for your approval", color: "text-warning" },
  dismissed: { text: "You marked this as seen", color: "text-muted-foreground" },
}

const TYPE_LABELS: Record<AlertType, string> = {
  PRE_COOL: "Cooling",
  ROUTE_RISK: "Route Change",
  OSHA_BREACH: "Worker Safety",
  FACILITY_PEAK: "Building Energy",
}

type FilterTab = "all" | "urgent" | "action" | "fixed"

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "urgent", label: "Urgent" },
  { value: "action", label: "Needs Action" },
  { value: "fixed", label: "Fixed" },
]

// ── Mock Data (plain language) ───────────────────────────────

const MOCK_ALERTS: AlertData[] = [
  {
    id: "ALT-001",
    severity: "CRITICAL",
    type: "OSHA_BREACH",
    asset: "Truck KHI-04",
    location: "Zone C, Site 3 \u2014 NUST Rd",
    message: "WBGT threshold exceeded at 41.2\u00B0C. OSHA action level breached.",
    plainMessage: "The heat level at this location is dangerously high (41.2\u00B0C). Workers are at risk of heat stroke. EchoHeat is sending mandatory rest break alerts to all workers.",
    timestamp: "3 minutes ago",
    status: "pending",
    actions: [
      { label: "Send Rest Alert to Workers", variant: "orange" },
      { label: "Mark as Seen", variant: "ghost" },
    ],
  },
  {
    id: "ALT-002",
    severity: "CRITICAL",
    type: "ROUTE_RISK",
    asset: "Truck DX-12",
    location: "Route DXB-12 \u2014 Dubai Logistics Corridor",
    message: "Thermal corridor exceeding 44\u00B0C. Refrigerated cargo at risk.",
    plainMessage: "This truck\u2019s route is passing through an area that is 44\u00B0C (very hot). The frozen cargo inside could be damaged within 18 minutes. EchoHeat is changing the route now.",
    timestamp: "8 minutes ago",
    status: "pending",
    actions: [
      { label: "Approve Route Change", variant: "orange" },
      { label: "Mark as Seen", variant: "ghost" },
    ],
  },
  {
    id: "ALT-003",
    severity: "WARNING",
    type: "PRE_COOL",
    asset: "Truck KI-07",
    location: "Zone A \u2014 Distribution Hub A",
    message: "Pre-cool recommended before peak tariff window.",
    plainMessage: "It is a good idea to cool this truck down before the hot part of the day. If you approve now, you will save on electricity costs.",
    timestamp: "15 minutes ago",
    status: "pending",
    actions: [
      { label: "Approve Cooling", variant: "blue" },
      { label: "Mark as Seen", variant: "ghost" },
    ],
  },
  {
    id: "ALT-004",
    severity: "WARNING",
    type: "FACILITY_PEAK",
    asset: "Building HVAC-03",
    location: "Building B \u2014 Floor 3",
    message: "Peak demand window approaching. Current load 780 kW.",
    plainMessage: "Your electricity usage is about to spike because of the heat. EchoHeat can pre-cool the building now to avoid expensive peak-hour rates.",
    timestamp: "22 minutes ago",
    status: "pending",
    actions: [
      { label: "Start Pre-Cooling", variant: "blue" },
      { label: "Mark as Seen", variant: "ghost" },
    ],
  },
  {
    id: "ALT-005",
    severity: "INFO",
    type: "PRE_COOL",
    asset: "Truck KI-01",
    location: "Zone B \u2014 DHA",
    message: "Pre-cooling cycle completed. Internal temp stabilized at -22.1\u00B0C.",
    plainMessage: "Truck KI-01 has been cooled down to the right temperature and is ready for its next delivery. No action needed.",
    timestamp: "1 hour ago",
    status: "executed",
    actions: [
      { label: "Mark as Seen", variant: "ghost" },
    ],
  },
  {
    id: "ALT-006",
    severity: "RESOLVED",
    type: "ROUTE_RISK",
    asset: "Truck LH-05",
    location: "Route LHR-07 \u2014 Lahore Manufacturing Hub",
    message: "Route risk mitigated. Unit re-routed successfully.",
    plainMessage: "This truck was on a dangerous route but has been moved to a safer one. The delivery will arrive at 16:45. Problem solved.",
    timestamp: "2 hours ago",
    status: "executed",
    actions: [
      { label: "Mark as Seen", variant: "ghost" },
    ],
  },
  {
    id: "ALT-007",
    severity: "INFO",
    type: "FACILITY_PEAK",
    asset: "Building HVAC-01",
    location: "Building A \u2014 Main Hall",
    message: "Thermal mass charging initiated. Expected buffer: 2h 40min.",
    plainMessage: "The building\u2019s concrete floors are absorbing extra heat right now. This will keep the building cooler for the next 2 hours 40 minutes without using extra electricity.",
    timestamp: "3 hours ago",
    status: "executed",
    actions: [
      { label: "Mark as Seen", variant: "ghost" },
    ],
  },
]

// ── Alert Card Component ─────────────────────────────────────

function AlertCard({ alert }: { alert: AlertData }) {
  const [expanded, setExpanded] = React.useState(false)
  const sevConfig = SEVERITY_LABELS[alert.severity]
  const SevIcon = sevConfig.icon
  const statusConfig = STATUS_LABELS[alert.status]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "rounded-xl border border-border bg-surface-1/80 backdrop-blur-md p-4",
        alert.severity === "CRITICAL" && "border-l-4 border-l-danger"
      )}
    >
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("flex items-center gap-1.5 text-xs font-bold", sevConfig.color)}>
          <SevIcon className="size-3.5" />
          {alert.severity === "CRITICAL" && "URGENT"}
          {alert.severity === "WARNING" && "CAUTION"}
          {alert.severity === "INFO" && "INFO"}
          {alert.severity === "RESOLVED" && "RESOLVED"}
        </span>
        <span className="font-mono text-xs font-bold">{alert.asset}</span>
        <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="size-3" />
          {alert.timestamp}
        </span>
      </div>

      {/* Plain message */}
      <p className="mt-2 text-sm text-text-primary/90 leading-relaxed">
        {alert.plainMessage}
      </p>

      {/* Status line */}
      <div className="mt-2 flex items-center gap-1.5">
        <span className={cn("text-xs font-medium", statusConfig.color)}>
          {alert.status === "executed" && "\u2705"}
          {alert.status === "pending" && "\u23F3"}
          {alert.status === "dismissed" && "\uD83D\uDC41\uFE0F"}
          {" "}{statusConfig.text}
        </span>
      </div>

      {/* Location */}
      <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
        <MapPin className="size-3 shrink-0" />
        <span className="truncate">{alert.location}</span>
      </div>

      {/* Actions */}
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-surface-divider pt-3">
        {alert.actions.map((action) => (
          <Button
            key={action.label}
            size="sm"
            variant={action.variant === "ghost" ? "ghost" : "default"}
            className={cn(
              "gap-1.5 text-xs",
              action.variant === "orange" && "bg-primary text-primary-foreground hover:bg-primary/90",
              action.variant === "blue" && "bg-info text-white hover:bg-info/90",
              action.variant === "ghost" && "text-muted-foreground hover:text-foreground"
            )}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </motion.div>
  )
}

// ── Main Page ────────────────────────────────────────────────

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export default function AlertsPage() {
  const [filter, setFilter] = React.useState<FilterTab>("all")
  const [search, setSearch] = React.useState("")
  const [alerts, setAlerts] = React.useState<AlertData[]>(MOCK_ALERTS)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Attempt to fetch real alerts from API
  React.useEffect(() => {
    async function fetchAlerts() {
      setLoading(true)
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("echoheat-token") : null
        if (!token) {
          setLoading(false)
          return
        }
        const res = await fetch("/api/v1/alerts", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Failed to load")
        const json = await res.json()
        if (json.data && Array.isArray(json.data)) {
          setAlerts(json.data)
        }
      } catch {
        setError("Could not load alerts. Please refresh the page.")
      } finally {
        setLoading(false)
      }
    }
    fetchAlerts()
  }, [])

  const filtered = React.useMemo(() => {
    return alerts.filter((a) => {
      if (filter === "urgent" && a.severity !== "CRITICAL") return false
      if (filter === "action" && a.status !== "pending") return false
      if (filter === "fixed" && a.status !== "executed" && a.severity !== "RESOLVED") return false
      if (search) {
        const q = search.toLowerCase()
        return (
          a.asset.toLowerCase().includes(q) ||
          a.plainMessage.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [filter, search, alerts])

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col gap-3">
        <div>
          <CardTitle>What Needs Your Attention</CardTitle>
          <Caption className="mt-1 text-muted-foreground">
            EchoHeat has found these issues and is handling them.
          </Caption>
        </div>

        {/* Filter tabs + search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-1">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  filter === tab.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-2 text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:ml-auto sm:w-64">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search alerts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>
      </motion.div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-center text-sm text-danger">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-4xl">{"\uD83C\uDF89"}</span>
          <h3 className="mt-4 text-lg font-bold">No issues right now!</h3>
          <Caption className="mt-2 max-w-sm text-muted-foreground">
            EchoHeat is monitoring everything. You will be notified if anything needs attention.
          </Caption>
        </div>
      )}

      {/* Alert list */}
      <motion.div variants={item} className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {filtered.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
