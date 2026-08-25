"use client"

import * as React from "react"
import { type ThemeId, DEFAULT_THEME, STORAGE_KEY, A11Y_STORAGE_KEY, THEMES } from "./config"

export interface A11ySettings {
  reduceMotion: boolean
  highContrast: boolean
  fontSize: "small" | "medium" | "large"
}

const DEFAULT_A11Y: A11ySettings = {
  reduceMotion: false,
  highContrast: false,
  fontSize: "medium",
}

interface ThemeContextValue {
  theme: ThemeId
  setTheme: (theme: ThemeId) => void
  a11y: A11ySettings
  setA11y: (settings: Partial<A11ySettings>) => void
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)

function applyA11ySettings(a11y: A11ySettings) {
  const root = document.documentElement

  root.classList.toggle("reduce-motion", a11y.reduceMotion)
  root.classList.toggle("high-contrast", a11y.highContrast)

  root.classList.remove("font-size-small", "font-size-large")
  if (a11y.fontSize === "small") root.classList.add("font-size-small")
  else if (a11y.fontSize === "large") root.classList.add("font-size-large")
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<ThemeId>(DEFAULT_THEME)
  const [a11y, setA11yState] = React.useState<A11ySettings>(DEFAULT_A11Y)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeId | null
    if (stored && THEMES.some((t) => t.id === stored)) {
      setThemeState(stored)
    }

    try {
      const storedA11y = localStorage.getItem(A11Y_STORAGE_KEY)
      if (storedA11y) {
        setA11yState({ ...DEFAULT_A11Y, ...JSON.parse(storedA11y) })
      }
    } catch { /* ignore */ }

    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted) return
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme, mounted])

  React.useEffect(() => {
    if (!mounted) return
    applyA11ySettings(a11y)
    localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(a11y))
  }, [a11y, mounted])

  const setTheme = React.useCallback((t: ThemeId) => {
    setThemeState(t)
  }, [])

  const setA11y = React.useCallback((partial: Partial<A11ySettings>) => {
    setA11yState((prev) => ({ ...prev, ...partial }))
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, a11y, setA11y }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider")
  return ctx
}
