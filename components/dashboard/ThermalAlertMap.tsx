"use client"

import { motion } from "framer-motion"
import { MapPin } from "lucide-react"
import { CardTitle, Caption, DataLabel } from "@/components/ui/echo/Text"
import { useTheme, useHeatOverlayColors } from "@/lib/theme"

const ZONES = [
  { label: "Critical", range: ">44.5\u00B0C", color: "bg-danger", count: 1 },
  { label: "Warning", range: "38\u201344\u00B0C", color: "bg-warning", count: 2 },
  { label: "Safe", range: "<38\u00B0C", color: "bg-success", count: 9 },
]

export function ThermalAlertMap() {
  const { isDark, theme } = useTheme()
  const heatColors = useHeatOverlayColors()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative col-span-full flex min-h-[250px] flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface-1/80 p-4 sm:min-h-[320px] sm:p-6 backdrop-blur-md lg:col-span-6"
    >
      {/* Map placeholder */}
      <div className="absolute inset-0 bg-surface-2/60">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/30">
          <MapPin className="size-16" />
        </div>
        {/* Theme-aware heat zones */}
        <div
          className="absolute top-[28%] left-[32%] size-20 rounded-full blur-2xl"
          style={{ backgroundColor: heatColors.criticalBg }}
        />
        <div
          className="absolute top-[45%] left-[55%] size-16 rounded-full blur-2xl"
          style={{ backgroundColor: heatColors.warningBg }}
        />
        <div
          className="absolute top-[60%] left-[25%] size-14 rounded-full blur-2xl"
          style={{ backgroundColor: heatColors.safeBg }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between">
        <CardTitle>Thermal Alert Map</CardTitle>
        <span className="rounded-md bg-surface-2 px-2 py-0.5 font-medium text-muted-foreground">
          <Caption>Mapbox {isDark ? "Dark" : "Light"} v11</Caption>
        </span>
      </div>

      {/* Bottom overlay */}
      <div className="relative z-10 flex flex-col gap-3">
        {/* Zone pills */}
        <div className="flex flex-wrap gap-2">
          {ZONES.map((zone) => (
            <span
              key={zone.label}
              className="flex items-center gap-1.5 rounded-full border border-border bg-surface-2/80 px-2.5 py-1 font-medium backdrop-blur-sm"
            >
              <span className={`size-1.5 rounded-full ${zone.color}`} />
              <span className="text-foreground"><Caption>{zone.label}</Caption></span>
              <span className="text-muted-foreground"><Caption>{zone.range}</Caption></span>
            </span>
          ))}
        </div>

        {/* Stat strip */}
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2 backdrop-blur-sm">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          <span className="font-medium"><Caption>3 Active Heat Corridors</Caption></span>
          <span className="text-muted-foreground">&middot;</span>
          <span className="text-muted-foreground"><Caption>12 Assets Exposed</Caption></span>
        </div>
      </div>
    </motion.div>
  )
}
