"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Flame, X } from "lucide-react"
import { motion, AnimatePresence, type PanInfo } from "framer-motion"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  LayoutDashboard,
  Truck,
  HardHat,
  Building2,
  BellRing,
  BarChart3,
  Settings2,
} from "lucide-react"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/fleet", label: "Fleet & Cold Chain", icon: Truck },
  { href: "/dashboard/safety", label: "Site Safety", icon: HardHat },
  { href: "/dashboard/hvac", label: "Facility HVAC", icon: Building2 },
  { href: "/dashboard/alerts", label: "Alert Feed", icon: BellRing, badge: 3 },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings2 },
] as const

const THEME_DOTS = [
  { id: "thermal-dark", color: "#F97316", label: "Thermal Dark" },
  { id: "arctic-light", color: "#0EA5E9", label: "Arctic Light" },
  { id: "midnight-blue", color: "#3B82F6", label: "Midnight Blue" },
  { id: "forest-ops", color: "#22C55E", label: "Forest Ops" },
  { id: "cyber-purple", color: "#A855F7", label: "Cyber Purple" },
] as const

const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 }

interface MobileDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLogoClick?: () => void
}

export function MobileDrawer({ open, onOpenChange, onLogoClick }: MobileDrawerProps) {
  const pathname = usePathname()
  const router = useRouter()
  const drawerRef = React.useRef<HTMLDivElement>(null)
  const startX = React.useRef(0)

  const handleDragEnd = React.useCallback(
    (_: unknown, info: PanInfo) => {
      if (info.offset.x < -80 || info.velocity.x < -200) {
        onOpenChange(false)
      }
    },
    [onOpenChange]
  )

  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = React.useCallback(
    (e: React.TouchEvent) => {
      const deltaX = e.changedTouches[0].clientX - startX.current
      if (deltaX < -80) {
        onOpenChange(false)
      }
    },
    [onOpenChange]
  )

  const handleThemeSwitch = React.useCallback((themeId: string) => {
    document.documentElement.setAttribute("data-theme", themeId)
    try {
      localStorage.setItem("echoheat-theme", themeId)
    } catch {}
  }, [])

  const handleNavigate = React.useCallback(
    (href: string) => {
      onOpenChange(false)
      router.push(href)
    },
    [onOpenChange, router]
  )

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-overlay backdrop-blur-sm lg:hidden"
            onClick={() => onOpenChange(false)}
          />

          {/* Drawer */}
          <motion.aside
            ref={drawerRef}
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={SPRING}
            drag="x"
            dragConstraints={{ left: -280, right: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="fixed left-0 top-0 z-50 flex h-full w-[280px] max-w-[85vw] flex-col border-r border-border-strong bg-surface-1 lg:hidden"
          >
            {/* Header */}
            <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-border px-4">
              <button
                onClick={() => { onOpenChange(false); onLogoClick?.() }}
                className="flex items-center gap-2"
                aria-label="EchoHeat home"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-accent-glow">
                  <Flame className="size-4 text-accent" />
                </span>
                <span className="font-mono text-sm font-bold tracking-tight text-text-primary">
                  EchoHeat
                </span>
              </button>
              <button
                onClick={() => onOpenChange(false)}
                className="flex size-8 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
                aria-label="Close menu"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* User Card */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-4">
              <Avatar className="size-10">
                <AvatarFallback className="bg-accent-glow text-sm font-bold text-accent">
                  OG
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-primary">
                  Operator
                </p>
                <p className="truncate text-sm text-text-muted">Field Manager</p>
                <p className="truncate text-xs text-accent">
                  FortyGuard Industries
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Main menu">
              <ul className="flex flex-col gap-0.5" role="list">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon

                  return (
                    <li key={item.href}>
                      <button
                        onClick={() => handleNavigate(item.href)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-r-lg px-4 py-3 text-sm font-medium transition-colors",
                          "border-l-2",
                          isActive
                            ? "border-accent bg-accent-glow text-accent"
                            : "border-transparent text-text-muted hover:bg-surface-hover hover:text-text-primary"
                        )}
                      >
                        <Icon className="size-[18px] shrink-0" />
                        <span className="flex-1 text-left">{item.label}</span>
                        {"badge" in item && item.badge != null && (
                          <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* Theme Quick Switch */}
            <div className="border-t border-border px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text-muted">
                  🎨 Theme
                </span>
                <Link
                  href="/dashboard/settings"
                  onClick={() => onOpenChange(false)}
                  className="text-[10px] font-medium text-accent hover:underline"
                >
                  See all →
                </Link>
              </div>
              <div className="mt-2 flex items-center gap-2">
                {THEME_DOTS.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeSwitch(theme.id)}
                    className="size-6 rounded-full border-2 border-border transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface-1"
                    style={{ backgroundColor: theme.color }}
                    aria-label={`Switch to ${theme.label} theme`}
                  />
                ))}
              </div>
            </div>

            {/* Bottom Section */}
            <div className="border-t border-border px-4 py-3">
              <button
                onClick={() => handleNavigate("/dashboard/settings")}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
              >
                <Settings2 className="size-[18px]" />
                <span>Settings</span>
              </button>
              <p className="mt-2 px-3 text-[10px] text-text-muted">
                Powered by FortyGuard API
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
