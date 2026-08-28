"use client"

import * as React from "react"
import { Bell, LogOut, Settings, User, ChevronDown } from "lucide-react"
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

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
  const { data: session } = useSession()
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const userName = session?.user?.name || 'User'
  const userEmail = session?.user?.email || ''
  const initials = userName.slice(0, 2).toUpperCase()

  const zoneLabel =
    ZONES.find((z) => z.value === activeZone)?.label ?? "Unknown Zone"

  // Close when clicking outside
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header
      data-slot="topbar"
      className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-surface-1/80 px-4 backdrop-blur-md sm:gap-4 sm:px-6"
    >
      {/* Spacer for mobile hamburger */}
      <div className="w-8 md:hidden" />

      {/* Left: Title + Breadcrumbs */}
      <div className="flex min-w-0 items-center gap-2.5">
        {breadcrumbs.length > 0 && (
          <nav className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb) => (
              <React.Fragment key={crumb}>
                <span className="truncate">{crumb}</span>
                <span className="text-border">/</span>
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="truncate font-semibold text-text-primary" style={{ fontSize: "var(--text-heading3)" }}>{pageTitle}</h1>
      </div>

      {/* Center: Live Status Pill — hidden on very small screens */}
      <div className="mx-auto hidden items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1 sm:flex">
        <span className="relative flex size-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-primary" />
        </span>
        <span className="whitespace-nowrap text-xs font-medium">
          LIVE <span className="text-muted-foreground">&middot;</span>{" "}
          <span className="text-muted-foreground">{zoneLabel}</span>
        </span>
      </div>

      {/* Right: Zone Selector · Notifications · Avatar */}
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {/* Zone selector — hidden on mobile, shown on sm+ */}
        <div className="hidden sm:block">
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
        </div>

        <Separator orientation="vertical" className="hidden h-6 sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
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

        {/* Avatar Button + Dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>

          {/* Avatar Button */}
          <button
            onClick={() => setOpen(!open)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              borderRadius: '10px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#27272A'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {/* Circle with initials */}
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#F97316',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 700,
            }}>
              {initials}
            </div>
            <ChevronDown size={12} color="#A1A1AA" />
          </button>

          {/* Dropdown Panel */}
          {open && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              width: '240px',
              background: '#18181B',
              border: '1px solid rgba(63,63,70,0.7)',
              borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
              zIndex: 1000,
              overflow: 'hidden',
            }}>

              {/* User info header */}
              <div style={{
                padding: '16px',
                borderBottom: '1px solid rgba(63,63,70,0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#F97316',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '14px',
                  flexShrink: 0,
                }}>
                  {initials}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
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
                    fontSize: '12px',
                    color: '#71717A',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {userEmail}
                  </p>
                </div>
              </div>

              {/* Menu items */}
              <div style={{ padding: '8px' }}>

                {/* My Profile */}
                <button
                  onClick={() => { router.push('/dashboard/settings'); setOpen(false) }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    color: '#D4D4D8',
                    fontSize: '13px',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#27272A'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <User size={15} color="#71717A" />
                  My Profile
                </button>

                {/* Settings */}
                <button
                  onClick={() => { router.push('/dashboard/settings'); setOpen(false) }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    color: '#D4D4D8',
                    fontSize: '13px',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#27272A'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Settings size={15} color="#71717A" />
                  Settings
                </button>

              </div>

              {/* Logout — red, separated */}
              <div style={{
                padding: '8px',
                borderTop: '1px solid rgba(63,63,70,0.5)',
              }}>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    color: '#F87171',
                    fontSize: '13px',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={15} color="#F87171" />
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
