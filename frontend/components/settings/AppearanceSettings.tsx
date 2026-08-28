"use client"

import * as React from "react"
import { Check, Sparkles, Eye, Type } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme, THEMES, type ThemeId } from "@/lib/theme"
import { useToast } from "@/lib/toast"
import type { A11ySettings } from "@/lib/theme"

/* ------------------------------------------------------------------ */
/*  Mini Dashboard Preview SVG — renders a tiny dashboard using the   */
/*  theme's own color palette                                         */
/* ------------------------------------------------------------------ */

function MiniPreview({ preview, isActive }: { preview: typeof THEMES[number]["preview"]; isActive: boolean }) {
  return (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full rounded-md"
      aria-hidden="true"
    >
      {/* Background */}
      <rect width="120" height="80" rx="4" fill={preview.bg} />

      {/* Sidebar */}
      <rect x="0" y="0" width="32" height="80" rx="4" fill={preview.sidebar} />
      {/* Sidebar lines */}
      <rect x="6" y="10" width="20" height="3" rx="1.5" fill={preview.muted} opacity="0.5" />
      <rect x="6" y="18" width="16" height="3" rx="1.5" fill={preview.muted} opacity="0.3" />
      <rect x="6" y="26" width="18" height="3" rx="1.5" fill={preview.muted} opacity="0.3" />
      <rect x="6" y="34" width="14" height="3" rx="1.5" fill={preview.muted} opacity="0.3" />

      {/* Active sidebar item */}
      <rect x="2" y="22" width="28" height="8" rx="2" fill={preview.card1} opacity="0.15" />
      <rect x="6" y="25" width="12" height="2" rx="1" fill={preview.card1} opacity="0.7" />

      {/* Top bar */}
      <rect x="32" y="0" width="88" height="14" rx="0" fill={preview.topbar} />
      <rect x="38" y="5" width="24" height="4" rx="2" fill={preview.text} opacity="0.4" />

      {/* Content cards */}
      <rect x="38" y="20" width="22" height="16" rx="3" fill={preview.card3} />
      <rect x="42" y="24" width="14" height="2.5" rx="1.25" fill={preview.card1} opacity="0.8" />
      <rect x="42" y="29" width="10" height="2" rx="1" fill={preview.muted} opacity="0.4" />

      <rect x="64" y="20" width="22" height="16" rx="3" fill={preview.card3} />
      <rect x="68" y="24" width="14" height="2.5" rx="1.25" fill={preview.card2} opacity="0.8" />
      <rect x="68" y="29" width="10" height="2" rx="1" fill={preview.muted} opacity="0.4" />

      <rect x="90" y="20" width="22" height="16" rx="3" fill={preview.card3} />
      <rect x="94" y="24" width="14" height="2.5" rx="1.25" fill={preview.card1} opacity="0.6" />
      <rect x="94" y="29" width="10" height="2" rx="1" fill={preview.muted} opacity="0.4" />

      {/* Bottom bar chart */}
      <rect x="38" y="42" width="74" height="30" rx="3" fill={preview.card3} opacity="0.6" />
      <rect x="44" y="60" width="6" height="8" rx="1.5" fill={preview.card1} opacity="0.7" />
      <rect x="54" y="54" width="6" height="14" rx="1.5" fill={preview.card1} opacity="0.8" />
      <rect x="64" y="50" width="6" height="18" rx="1.5" fill={preview.card1} opacity="0.9" />
      <rect x="74" y="56" width="6" height="12" rx="1.5" fill={preview.card2} opacity="0.7" />
      <rect x="84" y="48" width="6" height="20" rx="1.5" fill={preview.card1} opacity="1" />
      <rect x="94" y="58" width="6" height="10" rx="1.5" fill={preview.card1} opacity="0.6" />

      {/* Active indicator ring */}
      {isActive && (
        <rect
          x="0.5"
          y="0.5"
          width="119"
          height="79"
          rx="4.5"
          stroke={preview.card1}
          strokeWidth="2"
          fill="none"
        />
      )}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Theme Card                                                        */
/* ------------------------------------------------------------------ */

function ThemeCard({
  theme,
  isActive,
  onSelect,
}: {
  theme: typeof THEMES[number]
  isActive: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "group flex flex-col gap-2.5 rounded-xl border-2 p-3 transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isActive
          ? "border-primary bg-primary/5 shadow-md"
          : "border-border bg-surface-1 opacity-70 hover:opacity-100 hover:border-strong hover:scale-[1.03] active:scale-[0.98]"
      )}
      aria-label={`Select ${theme.label} theme`}
      aria-pressed={isActive}
    >
      {/* Mini preview */}
      <div className="aspect-[3/2] overflow-hidden rounded-lg border border-border/50 bg-background">
        <MiniPreview preview={theme.preview} isActive={isActive} />
      </div>

      {/* Label + check */}
      <div className="flex items-center gap-1.5">
        <span className="text-base leading-none">{theme.emoji}</span>
        <span className={cn(
          "text-xs font-medium",
          isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
        )}>
          {theme.label}
        </span>
        {isActive && (
          <span className="ml-auto flex size-4 items-center justify-center rounded-full bg-primary">
            <Check className="size-2.5 text-primary-foreground" strokeWidth={3} />
          </span>
        )}
      </div>
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Accessibility Option Row                                          */
/* ------------------------------------------------------------------ */

function A11yRow({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main AppearanceSettings Component                                 */
/* ------------------------------------------------------------------ */

export function AppearanceSettings() {
  const { theme, setTheme, a11y, setA11y } = useTheme()
  const { toast } = useToast()

  const activeTheme = THEMES.find((t) => t.id === theme)

  const handleSelect = React.useCallback(
    (id: ThemeId) => {
      setTheme(id)
      const found = THEMES.find((t) => t.id === id)
      if (found) {
        toast(`Theme changed to ${found.emoji} ${found.label}`)
      }
    },
    [setTheme, toast]
  )

  return (
    <div className="space-y-8">
      {/* ── Section 1: Theme Grid ────────────────────────────────── */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">Choose your theme</h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Select a visual style for your EchoHeat dashboard
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {THEMES.map((t) => (
            <ThemeCard
              key={t.id}
              theme={t}
              isActive={theme === t.id}
              onSelect={() => handleSelect(t.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Section 2: Active Theme Info ─────────────────────────── */}
      {activeTheme && (
        <div className="flex items-start gap-4 rounded-xl border border-border bg-surface-1/60 p-4 backdrop-blur-sm">
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-xl text-xl"
            style={{
              background: `linear-gradient(135deg, ${activeTheme.accent}22 0%, ${activeTheme.accent}44 100%)`,
              border: `2px solid ${activeTheme.accent}`,
            }}
          >
            {activeTheme.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{activeTheme.label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{activeTheme.description}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {activeTheme.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                >
                  <span className="size-1 rounded-full bg-primary" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Section 3: Accessibility Options ─────────────────────── */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Eye className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">Accessibility</h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Customize the interface to suit your needs
          </p>
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-surface-1/60 p-4 backdrop-blur-sm">
          <A11yRow
            label="Reduce motion"
            description="Disables animations and transitions throughout the interface"
          >
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={a11y.reducedMotion}
                onChange={(e) => setA11y({ reducedMotion: e.target.checked })}
              />
              <div className="h-5 w-9 rounded-full bg-surface-3 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-border after:bg-background after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-primary-foreground" />
            </label>
          </A11yRow>

          <div className="h-px bg-border" />

          <A11yRow
            label="High contrast mode"
            description="Increases border and text contrast for better visibility"
          >
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={a11y.highContrast}
                onChange={(e) => setA11y({ highContrast: e.target.checked })}
              />
              <div className="h-5 w-9 rounded-full bg-surface-3 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-border after:bg-background after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-primary-foreground" />
            </label>
          </A11yRow>

          <div className="h-px bg-border" />

          <A11yRow
            label="Font size"
            description="Adjust the base text size across the dashboard"
          >
            <div className="flex gap-1 rounded-lg border border-border bg-surface-2 p-0.5">
              {(["small", "medium", "large"] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setA11y({ fontSize: size })}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium capitalize transition-colors",
                    a11y.fontSize === size
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {size === "small" && <Type className="size-3" />}
                  {size}
                </button>
              ))}
            </div>
          </A11yRow>
        </div>
      </div>
    </div>
  )
}
