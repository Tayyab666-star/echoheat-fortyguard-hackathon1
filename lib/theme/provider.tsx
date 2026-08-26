"use client"

import * as React from "react"
import { type ThemeId, DEFAULT_THEME, THEMES } from "./config"

const PREFS_KEY = "echoheat-preferences"
const LEGACY_THEME_KEY = "echoheat-theme"
const LEGACY_A11Y_KEY = "echoheat-a11y"

export interface EchoHeatPreferences {
  theme: ThemeId
  reducedMotion: boolean
  highContrast: boolean
  fontSize: "small" | "medium" | "large"
  sidebarCollapsed: boolean
  lastUpdated: string
}

export type A11ySettings = Pick<EchoHeatPreferences, "reducedMotion" | "highContrast" | "fontSize">

const DEFAULT_PREFS: EchoHeatPreferences = {
  theme: DEFAULT_THEME,
  reducedMotion: false,
  highContrast: false,
  fontSize: "medium",
  sidebarCollapsed: false,
  lastUpdated: new Date().toISOString(),
}

interface ThemeContextValue {
  theme: ThemeId
  setTheme: (theme: ThemeId) => void
  isDark: boolean
  a11y: A11ySettings
  setA11y: (settings: Partial<A11ySettings>) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)

function readPreferences(): EchoHeatPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (THEMES.some((t) => t.id === parsed.theme)) {
        return { ...DEFAULT_PREFS, ...parsed }
      }
    }
  } catch { /* ignore */ }

  // Migrate from legacy keys
  try {
    const legacyTheme = localStorage.getItem(LEGACY_THEME_KEY) as ThemeId | null
    const legacyA11yRaw = localStorage.getItem(LEGACY_A11Y_KEY)
    const legacyA11y = legacyA11yRaw ? JSON.parse(legacyA11yRaw) : {}

    const prefs: EchoHeatPreferences = {
      ...DEFAULT_PREFS,
      theme: legacyTheme && THEMES.some((t) => t.id === legacyTheme) ? legacyTheme : DEFAULT_THEME,
      reducedMotion: legacyA11y.reduceMotion ?? false,
      highContrast: legacyA11y.highContrast ?? false,
      fontSize: legacyA11y.fontSize ?? "medium",
    }

    // Write to new key and clean up legacy
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
    localStorage.removeItem(LEGACY_THEME_KEY)
    localStorage.removeItem(LEGACY_A11Y_KEY)

    return prefs
  } catch { /* ignore */ }

  return DEFAULT_PREFS
}

function writePreferences(prefs: EchoHeatPreferences) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  } catch { /* ignore */ }
}

function applyA11ySettings(a11y: A11ySettings) {
  const root = document.documentElement

  root.classList.toggle("reduce-motion", a11y.reducedMotion)
  root.classList.toggle("high-contrast", a11y.highContrast)

  root.classList.remove("font-size-small", "font-size-large")
  if (a11y.fontSize === "small") root.classList.add("font-size-small")
  else if (a11y.fontSize === "large") root.classList.add("font-size-large")
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefsState] = React.useState<EchoHeatPreferences>(DEFAULT_PREFS)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    const loaded = readPreferences()
    setPrefsState(loaded)
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted) return
    document.documentElement.setAttribute("data-theme", prefs.theme)
  }, [prefs.theme, mounted])

  React.useEffect(() => {
    if (!mounted) return
    applyA11ySettings(prefs)
  }, [prefs.reducedMotion, prefs.highContrast, prefs.fontSize, mounted])

  React.useEffect(() => {
    if (!mounted) return
    writePreferences(prefs)
  }, [prefs, mounted])

  const setTheme = React.useCallback((t: ThemeId) => {
    setPrefsState((prev) => ({
      ...prev,
      theme: t,
      lastUpdated: new Date().toISOString(),
    }))
  }, [])

  const setA11y = React.useCallback((partial: Partial<A11ySettings>) => {
    setPrefsState((prev) => ({
      ...prev,
      ...partial,
      lastUpdated: new Date().toISOString(),
    }))
  }, [])

  const setSidebarCollapsed = React.useCallback((collapsed: boolean) => {
    setPrefsState((prev) => ({
      ...prev,
      sidebarCollapsed: collapsed,
      lastUpdated: new Date().toISOString(),
    }))
  }, [])

  const isDark = React.useMemo(() => {
    const cfg = THEMES.find((t) => t.id === prefs.theme)
    return cfg?.mode === "dark"
  }, [prefs.theme])

  const a11y: A11ySettings = React.useMemo(
    () => ({
      reducedMotion: prefs.reducedMotion,
      highContrast: prefs.highContrast,
      fontSize: prefs.fontSize,
    }),
    [prefs.reducedMotion, prefs.highContrast, prefs.fontSize]
  )

  return (
    <ThemeContext.Provider
      value={{
        theme: prefs.theme,
        setTheme,
        isDark,
        a11y,
        setA11y,
        sidebarCollapsed: prefs.sidebarCollapsed,
        setSidebarCollapsed,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider")
  return ctx
}
