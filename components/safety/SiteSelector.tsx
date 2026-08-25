"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface Site {
  id: string
  name: string
  address: string
  risk: "low" | "moderate" | "high" | "critical"
}

const RISK_STYLES: Record<Site["risk"], { badge: string; underline: string }> = {
  low: { badge: "bg-success/15 text-success", underline: "border-success" },
  moderate: { badge: "bg-warning/15 text-warning", underline: "border-warning" },
  high: { badge: "bg-primary/15 text-primary", underline: "border-primary" },
  critical: { badge: "bg-danger/15 text-danger", underline: "border-danger" },
}

const SITES: Site[] = [
  { id: "a", name: "Site A", address: "NUST Rd", risk: "high" },
  { id: "b", name: "Site B", address: "DHA", risk: "moderate" },
  { id: "c", name: "Site C", address: "Port Qasim", risk: "critical" },
]

interface SiteSelectorProps {
  activeSite?: string
  onSelectSite?: (siteId: string) => void
}

export function SiteSelector({ activeSite = "c", onSelectSite }: SiteSelectorProps) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-border">
      {SITES.map((site) => {
        const isActive = site.id === activeSite
        const styles = RISK_STYLES[site.risk]
        return (
          <button
            key={site.id}
            onClick={() => onSelectSite?.(site.id)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap",
              "border-b-2 -mb-px",
              isActive
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-surface-hover"
            )}
            aria-selected={isActive}
            role="tab"
          >
            <span className="flex flex-col items-start gap-0.5">
              <span className="flex items-center gap-2">
                {site.name}
                <span className="text-muted-foreground">&mdash;</span>
                <span className="text-muted-foreground">{site.address}</span>
              </span>
            </span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase",
                styles.badge
              )}
            >
              {site.risk}
            </span>
          </button>
        )
      })}
    </div>
  )
}
