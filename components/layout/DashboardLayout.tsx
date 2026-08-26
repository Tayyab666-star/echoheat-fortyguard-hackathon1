"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Flame, Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MobileBottomNav } from "@/components/layout/MobileBottomNav"
import { MobileHeader } from "@/components/layout/MobileHeader"
import { MobileDrawer } from "@/components/layout/MobileDrawer"
import { PageTransition } from "@/components/layout/PageTransition"
import { Caption, DataLabel } from "@/components/ui/echo/Text"
import {
  LayoutDashboard,
  Truck,
  HardHat,
  Building2,
  BellRing,
  BarChart3,
  Settings2,
  PanelLeftClose,
  PanelLeftOpen,
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

const SPRING = { type: "spring" as const, stiffness: 200, damping: 25 }

/* ═══════════════════════════════════════════════════════════
   DESKTOP SIDEBAR — Full or collapsed (lg+)
   ═══════════════════════════════════════════════════════════ */

function DesktopSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle: () => void
}) {
  const pathname = usePathname()

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={SPRING}
      className="fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-border bg-surface-1 lg:flex"
    >
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border px-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-glow">
          <Flame className="size-4 text-accent" />
        </span>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden whitespace-nowrap font-mono text-sm font-bold tracking-tight"
            >
              EchoHeat
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Main">
        <ul className="flex flex-col gap-0.5" role="list">
          {NAV_ITEMS.map((item, index) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <motion.li
                key={item.href}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...SPRING, delay: index * 0.03 }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    "border-l-2",
                    isActive
                      ? "border-accent bg-accent-glow text-accent"
                      : "border-transparent text-text-muted hover:bg-surface-hover hover:text-text-primary"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <AnimatePresence initial={false}>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {!collapsed && "badge" in item && item.badge != null && (
                    <span className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full bg-accent font-bold text-accent-foreground">
                      <DataLabel className="!text-[10px] !tracking-normal !uppercase-none">{item.badge}</DataLabel>
                    </span>
                  )}
                </Link>
              </motion.li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-border p-2">
        <button
          onClick={onToggle}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4 shrink-0" />
          ) : (
            <>
              <PanelLeftClose className="size-4 shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar size="sm">
            <AvatarFallback>OG</AvatarFallback>
          </Avatar>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="min-w-0 overflow-hidden"
              >
                <Caption className="font-medium">Operator</Caption>
                <DataLabel className="mt-1">Powered by FortyGuard API</DataLabel>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  )
}

/* ═══════════════════════════════════════════════════════════
   DESKTOP TOP BAR — sticky header (lg+)
   ═══════════════════════════════════════════════════════════ */

function DesktopTopBar({ pageTitle }: { pageTitle?: string }) {
  return (
    <header className="sticky top-0 z-30 hidden h-14 shrink-0 items-center gap-3 border-b border-border bg-surface-1/80 px-6 backdrop-blur-md lg:flex">
      <span className="truncate font-semibold text-text-primary" style={{ fontSize: "var(--text-heading3)" }}>
        {pageTitle ?? "Overview"}
      </span>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1">
          <span className="relative flex size-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-accent" />
          </span>
          <span className="whitespace-nowrap font-medium text-text-primary" style={{ fontSize: "var(--text-xs)" }}>LIVE</span>
        </div>

        <button
          className="relative flex size-8 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
          aria-label="Notifications (3 unread)"
        >
          <BellRing className="size-4" />
          <span className="absolute -top-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-accent font-bold text-accent-foreground">
            <DataLabel className="!text-[7px] !tracking-normal">3</DataLabel>
          </span>
        </button>

        <Avatar size="sm">
          <AvatarFallback>OG</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}

/* ═══════════════════════════════════════════════════════════
   DASHBOARD LAYOUT — Main orchestrator
   ═══════════════════════════════════════════════════════════ */

interface DashboardLayoutProps {
  children: React.ReactNode
  pageTitle?: string
  breadcrumbs?: string[]
}

export function DashboardLayout({
  children,
  pageTitle,
}: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* ═══ Mobile Components ═══ */}
      <MobileHeader
        onMenuOpen={() => setDrawerOpen(true)}
        notificationCount={3}
      />
      <MobileDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
      <MobileBottomNav />

      {/* ═══ Desktop Sidebar ═══ */}
      <DesktopSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((p) => !p)}
      />

      {/* ═══ Main Content ═══ */}
      <div
        className="flex min-h-screen flex-col transition-[margin] duration-300 pt-[56px] pb-[68px] lg:pt-0 lg:pb-0 lg:ml-[var(--sidebar-w)]"
        style={
          {
            "--sidebar-w": sidebarCollapsed ? "64px" : "240px",
          } as React.CSSProperties
        }
      >
        {/* Desktop top bar */}
        <DesktopTopBar pageTitle={pageTitle} />

        <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  )
}
