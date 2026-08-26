"use client"

import * as React from "react"
import { Flame, BellRing, Menu } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface MobileHeaderProps {
  onMenuOpen?: () => void
  notificationCount?: number
  onLogoClick?: () => void
}

export function MobileHeader({
  onMenuOpen,
  notificationCount = 3,
  onLogoClick,
}: MobileHeaderProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex h-[56px] items-center border-b border-border bg-surface-1/90 px-4 backdrop-blur-md lg:hidden"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      {/* Left: Hamburger */}
      <button
        onClick={onMenuOpen}
        className="flex size-8 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
        aria-label="Open navigation menu"
      >
        <Menu className="size-6" />
      </button>

      {/* Center: Logo */}
      <button
        onClick={onLogoClick}
        className="flex flex-1 items-center justify-center gap-1.5"
        aria-label="EchoHeat home"
      >
        <Flame className="size-5 text-accent" />
        <span className="text-lg font-bold text-accent">EchoHeat</span>
      </button>

      {/* Right: Bell + Avatar */}
      <div className="flex items-center gap-2">
        <button
          className="relative flex size-8 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
          aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ""}`}
        >
          <BellRing className="size-[18px]" />
          {notificationCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full p-0 text-[7px] font-bold"
            >
              {notificationCount}
            </Badge>
          )}
        </button>

        <Avatar size="sm" className="size-7">
          <AvatarFallback className="text-[10px]">OG</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
