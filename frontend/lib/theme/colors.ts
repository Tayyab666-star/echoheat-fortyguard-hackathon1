"use client"

import * as React from "react"
import { useTheme } from "./provider"

/**
 * Reads a CSS custom property from the document root.
 * Re-reads when theme changes (via re-render from useTheme).
 */
export function useThemeColor(varName: string): string {
  const { theme } = useTheme()
  const [value, setValue] = React.useState("")

  React.useEffect(() => {
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim()
    setValue(v)
  }, [varName, theme])

  return value
}

/**
 * Read multiple theme colors at once.
 */
export function useThemeColors(varNames: string[]): string[] {
  const { theme } = useTheme()
  const [values, setValues] = React.useState<string[]>(varNames.map(() => ""))

  React.useEffect(() => {
    const root = document.documentElement
    setValues(
      varNames.map((v) =>
        getComputedStyle(root).getPropertyValue(v).trim()
      )
    )
  }, [varNames, theme])

  return values
}

/**
 * Returns theme-aware heat overlay colors for map visualizations.
 */
export function useHeatOverlayColors() {
  const { isDark } = useTheme()

  return React.useMemo(() => {
    if (isDark) {
      return {
        critical: "#FF4444CC",
        warning: "#FF9900CC",
        safe: "#00CC44CC",
        criticalBg: "rgba(239,68,68,0.15)",
        warningBg: "rgba(234,179,8,0.15)",
        safeBg: "rgba(34,197,94,0.15)",
      }
    }
    return {
      critical: "#CC000099",
      warning: "#CC770099",
      safe: "#00990099",
      criticalBg: "rgba(185,28,28,0.12)",
      warningBg: "rgba(161,98,7,0.12)",
      safeBg: "rgba(21,128,61,0.12)",
    }
  }, [isDark])
}

/**
 * Returns theme-aware heatmap cell colors for risk grids.
 */
export function useHeatmapColors() {
  const { isDark } = useTheme()

  return React.useMemo(() => {
    if (isDark) {
      return {
        safe: "rgba(34, 197, 94, 0.15)",
        moderate: "rgba(234, 179, 8, 0.25)",
        high: "rgba(249, 115, 22, 0.4)",
        critical: "rgba(239, 68, 68, 0.6)",
        safeHex: "#22C55E",
        moderateHex: "#EAB308",
        highHex: "#F97316",
        criticalHex: "#EF4444",
      }
    }
    return {
      safe: "rgba(21, 128, 61, 0.2)",
      moderate: "rgba(161, 98, 7, 0.25)",
      high: "rgba(194, 65, 12, 0.35)",
      critical: "rgba(185, 28, 28, 0.5)",
      safeHex: "#15803D",
      moderateHex: "#A16207",
      highHex: "#C2410C",
      criticalHex: "#B91C1C",
    }
  }, [isDark])
}

/**
 * Returns the Mapbox style URL for the current theme.
 */
export function useMapboxStyle() {
  const { isDark } = useTheme()
  return isDark
    ? "mapbox://styles/mapbox/dark-v11"
    : "mapbox://styles/mapbox/light-v11"
}
