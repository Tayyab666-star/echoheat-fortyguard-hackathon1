"use client"

import * as React from "react"
import { useTheme, THEMES } from "@/lib/theme"
import { useToast } from "@/lib/toast"

/**
 * Keyboard shortcuts for theme switching:
 *   Ctrl/Cmd + Shift + T  → cycle through all 10 themes
 *   Ctrl/Cmd + Shift + L  → toggle dark ↔ arctic-light
 */
export function useThemeShortcut() {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey
      if (!isMod || !e.shiftKey) return

      if (e.key === "T" || e.key === "t") {
        e.preventDefault()
        const idx = THEMES.findIndex((t) => t.id === theme)
        const next = THEMES[(idx + 1) % THEMES.length]
        setTheme(next.id)
        toast(`Theme: ${next.label} ${next.emoji}`)
      }

      if (e.key === "L" || e.key === "l") {
        e.preventDefault()
        const current = THEMES.find((t) => t.id === theme)
        const isDark = current?.mode === "dark"
        const targetId = isDark ? "arctic-light" : "thermal-dark"
        const target = THEMES.find((t) => t.id === targetId)
        setTheme(targetId)
        if (target) {
          toast(`Theme: ${target.label} ${target.emoji}`)
        }
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [theme, setTheme, toast])
}
