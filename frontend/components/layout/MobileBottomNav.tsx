"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Truck,
  HardHat,
  Building2,
  BellRing,
} from "lucide-react"
import { cn } from "@/lib/utils"

const TAB_ITEMS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/fleet", label: "Fleet", icon: Truck },
  { href: "/dashboard/safety", label: "Safety", icon: HardHat },
  { href: "/dashboard/hvac", label: "Facility", icon: Building2 },
  { href: "/dashboard/alerts", label: "Alerts", icon: BellRing, badge: 3 },
] as const

const SPRING = { type: "spring" as const, stiffness: 300, damping: 25 }

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 block border-t border-border bg-surface-1/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Bottom navigation"
    >
      <div className="flex h-[60px] items-center justify-around px-1">
        {TAB_ITEMS.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex min-w-[48px] flex-col items-center justify-center gap-1 py-1",
                isActive ? "text-accent" : "text-text-muted"
              )}
            >
              {/* Active indicator line */}
              {isActive && (
                <motion.div
                  layoutId="bottomnav-indicator"
                  className="absolute -top-px left-1/2 h-[3px] w-6 -translate-x-1/2 rounded-full bg-accent"
                  transition={SPRING}
                />
              )}

              {/* Icon with spring scale */}
              <motion.div
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                transition={SPRING}
                className="relative"
              >
                <Icon className="size-5" />

                {/* Badge */}
                {"badge" in item && item.badge != null && (
                  <span className="absolute -top-1 -right-1.5 flex size-3.5 items-center justify-center rounded-full bg-accent text-[7px] font-bold text-accent-foreground">
                    {item.badge}
                  </span>
                )}
              </motion.div>

              {/* Label */}
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
