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
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useBreakpoint } from "@/hooks/useChartDimensions"

type Severity = "CRITICAL" | "WARNING" | "INFO" | "RESOLVED"
type AlertType = "PRE_COOL" | "ROUTE_RISK" | "OSHA_BREACH" | "FACILITY_PEAK"

export interface AlertData {
  id: string
  severity: Severity
  type: AlertType
  asset: string
  location: string
  message: string
  timestamp: string
  status: "executed" | "pending" | "dismissed"
  actions: { label: string; variant: "primary" | "ghost" | "orange" | "blue" }[]
}

const SEVERITY_CONFIG: Record<Severity, { icon: LucideIcon; color: string; border: string; glow: string }> = {
  CRITICAL: {
    icon: AlertTriangle,
    color: "text-danger",
    border: "border-l-4 border-l-danger",
    glow: "0 0 12px 2px rgba(239,68,68,0.15)",
  },
  WARNING: {
    icon: Flame,
    color: "text-primary",
    border: "border-l-4 border-l-primary",
    glow: "0 0 8px 1px rgba(249,115,22,0.1)",
  },
  INFO: {
    icon: Info,
    color: "text-info",
    border: "border-l-4 border-l-info",
    glow: "none",
  },
  RESOLVED: {
    icon: CheckCircle2,
    color: "text-success",
    border: "border-l-4 border-l-success",
    glow: "none",
  },
}

const TYPE_LABELS: Record<AlertType, { text: string; className: string }> = {
  PRE_COOL: { text: "Pre-Cool", className: "bg-info/15 text-info border-info/30" },
  ROUTE_RISK: { text: "Route Risk", className: "bg-primary/15 text-primary border-primary/30" },
  OSHA_BREACH: { text: "OSHA Breach", className: "bg-danger/15 text-danger border-danger/30" },
  FACILITY_PEAK: { text: "Facility Peak", className: "bg-warning/15 text-warning border-warning/30" },
}

const ACTION_STYLES: Record<string, string> = {
  primary: "bg-info text-text-on hover:bg-info/90",
  blue: "bg-info text-text-on hover:bg-info/90",
  orange: "bg-primary text-primary-foreground hover:bg-primary/90",
  ghost: "text-muted-foreground hover:text-foreground",
}

interface AlertCardProps {
  alert: AlertData
  onDetails?: (alert: AlertData) => void
}

export function AlertCard({ alert, onDetails }: AlertCardProps) {
  const [expanded, setExpanded] = React.useState(false)
  const bp = useBreakpoint()
  const isMobile = bp === "mobile"

  const cfg = SEVERITY_CONFIG[alert.severity]
  const Icon = cfg.icon
  const typeLabel = TYPE_LABELS[alert.type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={
        alert.severity === "CRITICAL"
          ? { opacity: 1, y: 0, boxShadow: [cfg.glow, "0 0 20px 4px rgba(239,68,68,0.25)", cfg.glow] }
          : { opacity: 1, y: 0, boxShadow: cfg.glow }
      }
      exit={{ opacity: 0, x: -16 }}
      transition={
        alert.severity === "CRITICAL"
          ? { duration: 0.25, boxShadow: { duration: 2.4, repeat: Infinity, ease: "easeInOut" } }
          : { duration: 0.25 }
      }
      className={cn(
        "rounded-xl border border-border bg-surface-1/80 backdrop-blur-md transition-colors",
        cfg.border,
        isMobile ? "p-3" : "flex flex-col gap-3 p-3 sm:p-4 hover:bg-surface-hover"
      )}
    >
      {/* ═══ MOBILE COLLAPSED VIEW ═══ */}
      {isMobile && (
        <>
          {/* Collapsed header — always visible */}
          <button
            onClick={() => setExpanded((p) => !p)}
            className="flex w-full items-center gap-2 text-left"
          >
            <Icon className={cn("size-4 shrink-0", cfg.color)} />
            <Badge variant="outline" className={cn("border px-1.5 py-0 text-[9px] font-bold uppercase shrink-0", typeLabel.className)}>
              {typeLabel.text}
            </Badge>
            <span className="font-mono text-xs font-bold shrink-0">{alert.asset}</span>
            <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
              <Clock className="size-3" />
              {alert.timestamp}
            </span>
            <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", expanded && "rotate-180")} />
          </button>

          {/* Collapsed message */}
          <p className="mt-1.5 text-sm text-text-primary/90 line-clamp-2">{alert.message}</p>

          {/* Expanded content */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-3 pt-2">
                  {/* Location */}
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <MapPin className="size-3 shrink-0" />
                    <span className="truncate">{alert.location}</span>
                  </div>

                  {/* Separator */}
                  <div className="h-px bg-surface-divider" />

                  {/* Actions — full width on mobile */}
                  <div className="flex flex-col gap-2">
                    {alert.actions.map((action) => (
                      <Button
                        key={action.label}
                        size="sm"
                        variant={action.variant === "ghost" ? "ghost" : "default"}
                        className={cn(
                          "w-full gap-1.5 text-xs",
                          ACTION_STYLES[action.variant]
                        )}
                      >
                        {action.label}
                      </Button>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-muted-foreground"
                      onClick={() => onDetails?.(alert)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* ═══ DESKTOP/TABLET VIEW ═══ */}
      {!isMobile && (
        <>
          {/* Top row */}
          <div className="flex flex-wrap items-center gap-2">
            <Icon className={cn("size-4 shrink-0", cfg.color)} />
            <Badge variant="outline" className={cn("border px-1.5 py-0 text-[9px] font-bold uppercase", typeLabel.className)}>
              {typeLabel.text}
            </Badge>
            <span className="font-mono text-xs font-bold">{alert.asset}</span>
            <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="size-3" />
              {alert.timestamp}
            </span>
          </div>

          {/* Message */}
          <p className="text-sm text-text-primary/90">{alert.message}</p>

          {/* Location */}
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{alert.location}</span>
          </div>

          {/* Bottom row */}
          <div className="flex flex-wrap items-center gap-2 border-t border-surface-divider pt-2">
            {alert.actions.map((action) => (
              <Button
                key={action.label}
                size="sm"
                variant={action.variant === "ghost" ? "ghost" : "default"}
                className={cn(
                  "gap-1.5 text-xs",
                  ACTION_STYLES[action.variant]
                )}
              >
                {action.label}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-xs text-muted-foreground"
              onClick={() => onDetails?.(alert)}
            >
              View Details
            </Button>
          </div>
        </>
      )}
    </motion.div>
  )
}
