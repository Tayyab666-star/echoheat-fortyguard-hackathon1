"use client"

import * as React from "react"
import { useTheme, THEMES } from "@/lib/theme"
import { cn } from "@/lib/utils"

interface ThemePreviewMiniProps {
  themeId?: string
  className?: string
  isActive?: boolean
}

/**
 * 200×130 SVG mini-dashboard preview using the theme's actual CSS colors.
 * Pure SVG — no real components rendered.
 */
export function ThemePreviewMini({
  themeId,
  className,
  isActive = false,
}: ThemePreviewMiniProps) {
  const { theme: currentTheme } = useTheme()
  const targetId = themeId ?? currentTheme

  const themeCfg = React.useMemo(
    () => THEMES.find((t) => t.id === targetId),
    [targetId]
  )

  if (!themeCfg) return null

  const p = themeCfg.preview

  return (
    <svg
      viewBox="0 0 200 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-full rounded-lg", className)}
      aria-hidden="true"
    >
      {/* Background */}
      <rect width="200" height="130" rx="8" fill={p.bg} />

      {/* Sidebar strip */}
      <rect width="40" height="130" rx="8" fill={p.sidebar} />
      <rect x="20" y="0" width="20" height="130" fill={p.sidebar} />

      {/* Sidebar nav dot (active) */}
      <circle cx="20" cy="30" r="4" fill={p.card1} />

      {/* Sidebar nav lines */}
      <rect x="10" y="50" width="20" height="3" rx="1.5" fill={p.muted} opacity="0.5" />
      <rect x="10" y="62" width="20" height="3" rx="1.5" fill={p.muted} opacity="0.3" />
      <rect x="10" y="74" width="16" height="3" rx="1.5" fill={p.muted} opacity="0.3" />

      {/* Top bar */}
      <rect x="40" y="0" width="160" height="22" fill={p.topbar} />
      <rect x="48" y="7" width="40" height="8" rx="2" fill={p.muted} opacity="0.4" />

      {/* Top bar avatar circle */}
      <circle cx="185" cy="11" r="5" fill={p.card1} />

      {/* Cards row 1 */}
      <rect x="48" y="30" width="70" height="35" rx="4" fill={p.card3} />
      <rect x="126" y="30" width="66" height="35" rx="4" fill={p.card3} />

      {/* Accent bar on first card */}
      <rect x="48" y="30" width="70" height="3" fill={p.card1} rx="2" />

      {/* Metric number placeholder */}
      <rect x="56" y="40" width="25" height="8" rx="2" fill={p.card1} opacity="0.8" />
      <rect x="56" y="52" width="40" height="4" rx="1" fill={p.muted} opacity="0.4" />

      {/* Second card metric */}
      <rect x="134" y="40" width="22" height="8" rx="2" fill={p.card2} opacity="0.8" />
      <rect x="134" y="52" width="36" height="4" rx="1" fill={p.muted} opacity="0.4" />

      {/* Cards row 2 (wide chart card) */}
      <rect x="48" y="73" width="144" height="40" rx="4" fill={p.card3} />

      {/* Chart title */}
      <rect x="56" y="81" width="60" height="4" rx="1" fill={p.muted} opacity="0.4" />

      {/* Mini bar chart */}
      <rect x="56" y="90" width="14" height="16" rx="2" fill={p.card1} opacity="0.4" />
      <rect x="74" y="86" width="14" height="20" rx="2" fill={p.card1} opacity="0.6" />
      <rect x="92" y="82" width="14" height="24" rx="2" fill={p.card1} opacity="0.8" />
      <rect x="110" y="88" width="14" height="18" rx="2" fill={p.card1} opacity="0.5" />
      <rect x="128" y="84" width="14" height="22" rx="2" fill={p.card2} opacity="0.7" />
      <rect x="146" y="92" width="14" height="14" rx="2" fill={p.card1} opacity="0.35" />
      <rect x="164" y="86" width="14" height="20" rx="2" fill={p.card1} opacity="0.6" />

      {/* Active indicator ring */}
      {isActive && (
        <rect
          x="1"
          y="1"
          width="198"
          height="128"
          rx="8"
          stroke={p.card1}
          strokeWidth="2.5"
          fill="none"
        />
      )}
    </svg>
  )
}
