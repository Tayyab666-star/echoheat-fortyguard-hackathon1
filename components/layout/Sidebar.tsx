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

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

function SidebarContent({ collapsed, onToggle, onNavigate }: SidebarProps & { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <>
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-white/10 px-4">
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
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        "border-l-2",
                        isActive
                          ? "border-primary bg-primary/10 text-orange-400"
                          : "border-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground"
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
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              </motion.li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-white/10 p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full justify-start gap-3 px-3 text-muted-foreground"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4 shrink-0" />
          ) : (
            <PanelLeftClose className="size-4 shrink-0" />
          )}
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </Button>

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
                <p className="truncate text-xs font-medium leading-none">Operator</p>
                <p className="mt-1 truncate text-[10px] text-muted-foreground">Powered by FortyGuard API</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
      className="fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-white/10 bg-surface-1 md:flex"
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
        className="fixed left-4 top-3 z-50 flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground md:hidden"
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
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={SPRING}
              className="fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col border-r border-white/10 bg-surface-1 md:hidden"
            >
              {/* Close button */}
              <div className="absolute right-3 top-3">
                <button
                  onClick={() => setOpen(false)}
                  className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground"
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
