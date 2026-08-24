"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  Snowflake,
  Route,
  Truck,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

type ActionStatus = "completed" | "in-progress" | "failed"
type ActionType = "PRE_COOL" | "REROUTE" | "REST_DISPATCH" | "ALERT"

interface FeedEntry {
  id: string
  timestamp: string
  type: ActionType
  description: string
  status: ActionStatus
}

const ACTION_CONFIG: Record<
  ActionType,
  { icon: LucideIcon; color: string; label: string }
> = {
  PRE_COOL: {
    icon: Snowflake,
    color: "text-info",
    label: "Pre-Cool",
  },
  REROUTE: {
    icon: Route,
    color: "text-primary",
    label: "Reroute",
  },
  REST_DISPATCH: {
    icon: Truck,
    color: "text-success",
    label: "Dispatch",
  },
  ALERT: {
    icon: AlertTriangle,
    color: "text-danger",
    label: "Alert",
  },
}

const STATUS_STYLES: Record<ActionStatus, string> = {
  completed: "border-success/30 bg-success/10 text-success",
  "in-progress": "border-primary/30 bg-primary/10 text-primary",
  failed: "border-danger/30 bg-danger/10 text-danger",
}

const MOCK_FEED: FeedEntry[] = [
  {
    id: "1",
    timestamp: "2m ago",
    type: "PRE_COOL",
    description: "Unit KI-04 pre-cooling initiated, target 22\u00B0C",
    status: "completed",
  },
  {
    id: "2",
    timestamp: "5m ago",
    type: "REROUTE",
    description: "Route DX-12 re-routed via thermal corridor Alpha",
    status: "in-progress",
  },
  {
    id: "3",
    timestamp: "8m ago",
    type: "REST_DISPATCH",
    description: "Backup unit KI-09 dispatched to Bay 7",
    status: "completed",
  },
  {
    id: "4",
    timestamp: "12m ago",
    type: "ALERT",
    description: "WBGT threshold exceeded at Zone C, Site 3",
    status: "failed",
  },
  {
    id: "5",
    timestamp: "15m ago",
    type: "PRE_COOL",
    description: "Unit LH-02 pre-cooling cycle complete",
    status: "completed",
  },
  {
    id: "6",
    timestamp: "18m ago",
    type: "REROUTE",
    description: "Fleet reroute: 4 units shifted to Corridor Beta",
    status: "completed",
  },
]

function FeedItem({ entry }: { entry: FeedEntry }) {
  const config = ACTION_CONFIG[entry.type]
  const Icon = config.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.25 }}
      className="flex items-start gap-3 rounded-lg border border-white/5 bg-surface-2/40 px-3 py-2.5"
    >
      <span
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-surface-2",
          config.color
        )}
      >
        <Icon className="size-3.5" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium">{entry.description}</p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          {entry.timestamp}
        </p>
      </div>

      <Badge
        variant="outline"
        className={cn(
          "shrink-0 border px-1.5 py-0 text-[9px] font-semibold uppercase",
          STATUS_STYLES[entry.status]
        )}
      >
        {entry.status.replace("-", " ")}
      </Badge>
    </motion.div>
  )
}

export function LiveActionFeed() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.32 }}
      className="col-span-full flex flex-col gap-3 rounded-2xl border border-white/10 bg-surface-1/80 p-4 sm:p-6 backdrop-blur-md lg:col-span-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-sm font-semibold">Live Action Feed</h3>
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-primary" />
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence initial={false}>
          <div className="flex flex-col gap-2">
            {MOCK_FEED.map((entry) => (
              <FeedItem key={entry.id} entry={entry} />
            ))}
          </div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
