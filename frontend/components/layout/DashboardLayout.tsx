"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Flame } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { MobileBottomNav } from "@/components/layout/MobileBottomNav"
import { MobileHeader } from "@/components/layout/MobileHeader"
import { MobileDrawer } from "@/components/layout/MobileDrawer"
import { PageTransition } from "@/components/layout/PageTransition"
import { EchoHeatSplashLoader } from "@/components/layout/EchoHeatSplashLoader"
import { useSession } from "next-auth/react"
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
  onLogoClick,
}: {
  collapsed: boolean
  onToggle: () => void
  onLogoClick: () => void
}) {
  const pathname = usePathname()
  const { session } = useSession()

  const userInitials = React.useMemo(() => {
    const name = session?.user?.name
    if (!name) return "EH"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }, [session?.user?.name])

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={SPRING}
      className="fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-border bg-surface-1 lg:flex"
    >
      {/* Logo */}
      <button
        onClick={onLogoClick}
        className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border px-4 cursor-pointer transition-colors hover:bg-surface-hover"
        aria-label="EchoHeat home"
      >
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
      </button>

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
                    <span className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </motion.li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-border p-2 space-y-3">
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
          <div className="size-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {userInitials}
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="min-w-0 overflow-hidden"
              >
                <p className="text-sm font-medium text-white leading-tight truncate">
                  {session?.user?.name || "User"}
                </p>
                <p className="text-xs text-[#71717A] leading-tight truncate mt-0.5">
                  {session?.user?.email || ""}
                </p>
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

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function DesktopTopBar({
  pageTitle,
  unreadCount,
  onMarkAllRead,
  recentAlerts,
}: {
  pageTitle?: string
  unreadCount: number
  onMarkAllRead: () => void
  recentAlerts: any[]
}) {
  const { session } = useSession()
  const router = useRouter()

  const userInitials = React.useMemo(() => {
    const name = session?.user?.name
    if (!name) return "EH"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }, [session?.user?.name])

  /* ── Notification Bell state ── */
  const [notifOpen, setNotifOpen] = React.useState(false)
  const bellRef = React.useRef<HTMLDivElement>(null)

  /* ── Avatar Dropdown state ── */
  const [avatarOpen, setAvatarOpen] = React.useState(false)
  const avatarRef = React.useRef<HTMLDivElement>(null)

  /* ── Click-outside handler ── */
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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

        {/* ═══ Notification Bell Dropdown ═══ */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => { setNotifOpen(!notifOpen); setAvatarOpen(false) }}
            className="relative p-2 rounded-xl hover:bg-surface-hover transition-colors"
            aria-label="Notifications"
          >
            <BellRing className="size-4 text-text-muted" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-orange-500 flex items-center justify-center text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 z-50 bg-[#18181B] border border-[rgba(63,63,70,0.6)] rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(63,63,70,0.4)]">
                <span className="text-sm font-semibold text-white">Notifications</span>
                <button onClick={onMarkAllRead} className="text-xs text-orange-500 hover:underline">
                  Mark all read
                </button>
              </div>

              {/* Alert list */}
              <div className="max-h-80 overflow-y-auto">
                {recentAlerts.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-[#71717A]">No new notifications</p>
                  </div>
                ) : (
                  recentAlerts.map((alert: any) => (
                    <div
                      key={alert._id}
                      className="px-4 py-3 hover:bg-[#27272A] transition-colors border-b border-[rgba(63,63,70,0.3)] cursor-pointer"
                      onClick={() => { router.push("/dashboard/alerts"); setNotifOpen(false) }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg flex-shrink-0">
                          {alert.severity === "critical" ? "\uD83D\uDD34" : alert.severity === "warning" ? "\uD83D\uDFE0" : "\uD83D\uDD35"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-white leading-tight line-clamp-2">
                            {alert.message}
                          </p>
                          <p className="text-[11px] text-[#71717A] mt-1">
                            {formatRelativeTime(alert.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-[rgba(63,63,70,0.4)]">
                <button
                  onClick={() => { router.push("/dashboard/alerts"); setNotifOpen(false) }}
                  className="text-xs text-orange-500 hover:underline w-full text-center"
                >
                  View all alerts &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ═══ Avatar Dropdown ═══ */}
        <div className="relative" ref={avatarRef}>
          <button
            onClick={() => { setAvatarOpen(!avatarOpen); setNotifOpen(false) }}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-surface-hover transition-colors"
          >
            <div className="size-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
              {userInitials}
            </div>
          </button>

          {avatarOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 z-50 bg-[#18181B] border border-[rgba(63,63,70,0.6)] rounded-2xl shadow-2xl overflow-hidden">
              {/* User info header */}
              <div className="px-4 py-4 border-b border-[rgba(63,63,70,0.4)]">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                    {userInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {session?.user?.name || "User"}
                    </p>
                    <p className="text-xs text-[#71717A] truncate">
                      {session?.user?.email || ""}
                    </p>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full mt-1 inline-block bg-orange-500/15 text-orange-400">
                      Fleet Manager
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="p-1">
                {[
                  { label: "My Profile", href: "/dashboard/settings?tab=profile" },
                  { label: "Settings", href: "/dashboard/settings" },
                  { label: "Notifications", href: "/dashboard/settings?tab=alerts" },
                  { label: "Help & Support", href: "/help" },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => { router.push(item.href); setAvatarOpen(false) }}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-[#D4D4D8] hover:bg-[#27272A] hover:text-white transition-colors text-left"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Logout */}
              <div className="p-1 border-t border-[rgba(63,63,70,0.4)]">
                <button
                  onClick={() => { window.location.href = "/api/auth/signout?callbackUrl=/" }}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
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
  const [splashOpen, setSplashOpen] = React.useState(false)
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [recentAlerts, setRecentAlerts] = React.useState<any[]>([])

  const handleSplashComplete = React.useCallback(() => {
    setSplashOpen(false)
  }, [])

  /* ── Fetch alerts + unread count ── */
  React.useEffect(() => {
    let cancelled = false
    let interval: ReturnType<typeof setInterval>

    async function fetchAlerts() {
      try {
        const res = await fetch("/api/v1/alerts/stats")
        if (res.ok) {
          const data = await res.json()
          if (!cancelled) {
            setUnreadCount(data.data?.pending ?? data.pending ?? 0)
          }
        }
      } catch { /* ignore */ }
    }

    async function fetchRecent() {
      try {
        const res = await fetch("/api/v1/alerts?limit=5&status=pending")
        if (res.ok) {
          const data = await res.json()
          if (!cancelled && data.data) {
            setRecentAlerts(data.data)
          }
        }
      } catch { /* ignore */ }
    }

    fetchAlerts()
    fetchRecent()
    interval = setInterval(() => {
      fetchAlerts()
      fetchRecent()
    }, 30000)

    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  function markAllRead() {
    fetch("/api/v1/alerts/mark-all-read", { method: "POST" })
      .then(() => setUnreadCount(0))
      .catch(() => setUnreadCount(0))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Splash Loader */}
      <EchoHeatSplashLoader open={splashOpen} onComplete={handleSplashComplete} />

      {/* ═══ Mobile Components ═══ */}
      <MobileHeader
        onMenuOpen={() => setDrawerOpen(true)}
        notificationCount={unreadCount}
        onLogoClick={() => setSplashOpen(true)}
      />
      <MobileDrawer open={drawerOpen} onOpenChange={setDrawerOpen} onLogoClick={() => setSplashOpen(true)} />
      <MobileBottomNav />

      {/* ═══ Desktop Sidebar ═══ */}
      <DesktopSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((p) => !p)}
        onLogoClick={() => setSplashOpen(true)}
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
        {/* ═══ Desktop top bar ═══ */}
        <DesktopTopBar
          pageTitle={pageTitle}
          unreadCount={unreadCount}
          onMarkAllRead={markAllRead}
          recentAlerts={recentAlerts}
        />

        <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  )
}
