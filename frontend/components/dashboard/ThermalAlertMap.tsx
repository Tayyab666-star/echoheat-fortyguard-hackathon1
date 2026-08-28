"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { MapPin, AlertTriangle } from "lucide-react"
import { CardTitle, Caption, DataLabel } from "@/components/ui/echo/Text"
import { useTheme, useHeatOverlayColors } from "@/lib/theme"

interface FortyGuardError {
  code:
    | "API_KEY_MISSING"
    | "API_KEY_INVALID"
    | "CREDITS_EXHAUSTED"
    | "RATE_LIMITED"
    | "API_UNAVAILABLE"
    | "MOCK_MODE"
  error: string
  fallbackUsed: boolean
}

const ZONES = [
  { label: "Danger Zone", range: "Above 44.5\u00B0C", color: "bg-danger", count: 1 },
  { label: "Be Careful", range: "38\u201344\u00B0C", color: "bg-warning", count: 2 },
  { label: "Safe Area", range: "Below 38\u00B0C", color: "bg-success", count: 9 },
]

const ERROR_LABELS: Record<FortyGuardError["code"], string> = {
  API_KEY_MISSING: "Temperature data not connected",
  API_KEY_INVALID: "Temperature data connection error",
  CREDITS_EXHAUSTED: "Temperature data limit reached",
  RATE_LIMITED: "Temperature data limit reached",
  API_UNAVAILABLE: "Temperature data unavailable",
  MOCK_MODE: "Showing demo data (not live)",
}

export function ThermalAlertMap() {
  const { isDark, theme } = useTheme()
  const heatColors = useHeatOverlayColors()
  const [fortyGuardError, setFortyGuardError] = useState<FortyGuardError | null>(null)

  useEffect(() => {
    async function fetchFortyGuardStatus() {
      try {
        const res = await fetch("/api/v1/integrations/fortygard/snapshot?lat=25.2048&lng=55.2708&radiusMeters=500")
        const data = await res.json()

        if (data.status === "error" && data.fortyGuardCode) {
          setFortyGuardError({
            code: data.fortyGuardCode[0] as FortyGuardError["code"],
            error: data.message,
            fallbackUsed: data.fallbackUsed === "true",
          })
        } else {
          setFortyGuardError(null)
        }
      } catch {
        setFortyGuardError(null)
      }
    }

    fetchFortyGuardStatus()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative col-span-full flex min-h-[250px] flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface-1/80 p-4 sm:min-h-[320px] sm:p-6 backdrop-blur-md lg:col-span-6"
    >
      {/* FortyGuard Error Banner */}
      {fortyGuardError && (
        <div className="relative z-20 mb-3 flex items-start gap-3 rounded-xl border border-[var(--accent-warning)]/30 bg-[var(--accent-warning)]/10 p-3">
          <AlertTriangle className="mt-0.5 size-4 flex-shrink-0 text-warning" />
          <div>
            <p className="text-xs font-semibold text-warning">
              {ERROR_LABELS[fortyGuardError.code]}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {fortyGuardError.error}
              {fortyGuardError.fallbackUsed && " Showing synthetic data."}
            </p>
          </div>
        </div>
      )}

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
