"use client"

import * as React from "react"
import { AnimatePresence } from "framer-motion"
import { AlertCard, type AlertData } from "@/components/alerts/AlertCard"

interface AlertTimelineProps {
  alerts: AlertData[]
  onDetails?: (alert: AlertData) => void
}

function groupByDate(alerts: AlertData[]) {
  const groups: { date: string; label: string; items: AlertData[] }[] = []
  let current: { date: string; label: string; items: AlertData[] } | null = null

  for (const alert of alerts) {
    const dateKey = "Today"
    if (!current || current.date !== dateKey) {
      current = { date: dateKey, label: `Today \u00B7 August 22`, items: [] }
      groups.push(current)
    }
    current.items.push(alert)
  }

  return groups
}

export function AlertTimeline({ alerts, onDetails }: AlertTimelineProps) {
  const groups = React.useMemo(() => groupByDate(alerts), [alerts])

  return (
    <div className="flex flex-col gap-4">
      <AnimatePresence initial={false}>
        {groups.map((group) => (
          <div key={group.date} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <AnimatePresence initial={false}>
              {group.items.map((alert) => (
                <AlertCard key={alert.id} alert={alert} onDetails={onDetails} />
              ))}
            </AnimatePresence>
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
