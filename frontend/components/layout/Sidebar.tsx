"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Flame,
  LayoutDashboard,
  Truck,
  HardHat,
  Building2,
  BellRing,
  BarChart3,
  Settings2,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
} from "lucide-react"
import { useSession } from '@/hooks/useSession'

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard, tooltip: "Your main dashboard overview" },
  { href: "/dashboard/fleet", label: "Trucks & Deliveries", icon: Truck, tooltip: "Monitor your refrigerated trucks and delivery routes" },
  { href: "/dashboard/safety", label: "Worker Safety", icon: HardHat, tooltip: "Track heat safety for your workers on site" },
  { href: "/dashboard/hvac", label: "Buildings & Energy", icon: Building2, tooltip: "Manage building cooling and electricity costs" },
  { href: "/dashboard/alerts", label: "Issues & Alerts", icon: BellRing, badge: 3, tooltip: "Problems that need your attention" },
  { href: "/dashboard/analytics", label: "Reports & Savings", icon: BarChart3, tooltip: "See how much money EchoHeat is saving you" },
  { href: "/dashboard/settings", label: "Settings", icon: Settings2, tooltip: "Manage your account and preferences" },
]

const SPRING = { type: "spring" as const, stiffness: 200, damping: 25 }

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

function SidebarContent({ collapsed, onToggle, onNavigate }: SidebarProps & { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userName = session?.user?.name || 'User'
  const userEmail = session?.user?.email || ''
  const initials = userName.slice(0, 2).toUpperCase()

  return (
    <>
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border px-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15">
          <Flame className="size-4 text-primary" />
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
                role="listitem"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...SPRING, delay: index * 0.05 }}
              >
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      onClick={onNavigate}
                      title={item.tooltip}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        "border-l-2",
                        isActive
                          ? "border-primary bg-primary-glow text-primary"
                          : "border-transparent text-muted-foreground hover:bg-surface-hover hover:text-foreground"
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
                        <span className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right" sideOffset={8}>
                      {item.tooltip ?? item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              </motion.li>
            )
          })}
        </ul>
      </nav>

      {/* ── Bottom section ── */}
      <div style={{
        marginTop: 'auto',
        borderTop: '1px solid rgba(63,63,70,0.5)',
        paddingTop: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>

        {/* Collapse Button — its own separate element */}
        <button
          onClick={onToggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 12px',
            borderRadius: '10px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#A1A1AA',
            fontSize: '13px',
            width: '100%',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#27272A'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen size={16} />
          ) : (
            <PanelLeftClose size={16} />
          )}
          {!collapsed && <span>Collapse</span>}
        </button>

        {/* User Row — completely separate from collapse button above */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 12px',
          borderRadius: '10px',
        }}>

          {/* Avatar circle */}
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#F97316',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '11px',
            fontWeight: 700,
            flexShrink: 0,
          }}>
            {initials}
          </div>

          {/* Name + email — only visible when sidebar is expanded */}
          {!collapsed && (
            <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
              <p style={{
                margin: 0,
                fontSize: '13px',
                fontWeight: 600,
                color: '#FAFAFA',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {userName}
              </p>
              <p style={{
                margin: 0,
                fontSize: '11px',
                color: '#71717A',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {userEmail}
              </p>
            </div>
          )}
        </div>

        {/* NO "Powered by FortyGuard API" text here — removed permanently */}

      </div>
    </>
  )
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  return (
    <motion.aside
      data-slot="sidebar"
      animate={{ width: collapsed ? 64 : 240 }}
      transition={SPRING}
      className="fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-border bg-surface-1 md:flex"
    >
      <SidebarContent collapsed={collapsed} onToggle={onToggle} />
    </motion.aside>
  )
}

export function MobileSidebar() {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      {/* Hamburger button — visible on mobile only */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-3 z-50 flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground md:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      {/* Backdrop + drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-overlay backdrop-blur-sm md:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={SPRING}
              className="fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col border-r border-border bg-surface-1 md:hidden"
            >
              {/* Close button */}
              <div className="absolute right-3 top-3">
                <button
                  onClick={() => setOpen(false)}
                  className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                  aria-label="Close menu"
                >
                  <X className="size-4" />
                </button>
              </div>
              <SidebarContent collapsed={false} onToggle={() => setOpen(false)} onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
