"use client"

import * as React from "react"
import { Bell } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

const ZONES = [
  { value: "karachi", label: "Karachi Industrial Zone" },
  { value: "lahore", label: "Lahore Manufacturing Hub" },
  { value: "dubai", label: "Dubai Logistics Corridor" },
  { value: "riyadh", label: "Riyadh Energy Complex" },
]

interface TopbarProps {
  pageTitle?: string
  breadcrumbs?: string[]
  notificationCount?: number
  activeZone?: string
  onZoneChange?: (zone: string) => void
}

export function Topbar({
  pageTitle = "Overview",
  breadcrumbs = [],
  notificationCount = 3,
  activeZone = "karachi",
  onZoneChange,
}: TopbarProps) {
  const zoneLabel =
    ZONES.find((z) => z.value === activeZone)?.label ?? "Unknown Zone"

  return (
    <header
      data-slot="topbar"
      className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 border-b border-white/10 bg-zinc-950/80 px-6 backdrop-blur-md"
    >
      {/* ── Left: Title + Breadcrumbs ── */}
      <div className="flex items-center gap-2.5 min-w-0">
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb) => (
              <React.Fragment key={crumb}>
                <span className="truncate">{crumb}</span>
                <span className="text-border">/</span>
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="truncate text-sm font-semibold">{pageTitle}</h1>
      </div>

      {/* ── Center: Live Status Pill ── */}
      <div className="mx-auto flex items-center gap-2 rounded-full border border-white/10 bg-surface-2 px-3 py-1">
        <span className="relative flex size-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-primary" />
        </span>
        <span className="whitespace-nowrap text-xs font-medium">
          LIVE <span className="text-muted-foreground">&middot;</span>{" "}
          <span className="text-muted-foreground">{zoneLabel}</span>
        </span>
      </div>

      {/* ── Right: Zone Selector · Notifications · Avatar ── */}
      <div className="ml-auto flex items-center gap-3">
        <Select value={activeZone} onValueChange={onZoneChange}>
          <SelectTrigger size="sm" aria-label="Select zone">
            <SelectValue placeholder="Select zone" />
          </SelectTrigger>
          <SelectContent>
            {ZONES.map((zone) => (
              <SelectItem key={zone.value} value={zone.value}>
                {zone.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="h-6" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ""}`}
            >
              <Bell className="size-4" />
              {notificationCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 flex size-4 shrink-0 items-center justify-center rounded-full p-0 text-[9px] font-bold"
                >
                  {notificationCount}
                </Badge>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <span className="line-clamp-1">Thermal anomaly detected — Unit KI-04</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span className="line-clamp-1">Cold chain breach — Route DX-12</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span className="line-clamp-1">HVAC filter replacement due — Bay 7</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-6" />

        <Avatar size="sm">
          <AvatarFallback>OG</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
