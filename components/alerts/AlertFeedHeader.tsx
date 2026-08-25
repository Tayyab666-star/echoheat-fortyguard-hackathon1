"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CardTitle } from "@/components/ui/echo/Text"

type Filter = "all" | "critical" | "warning" | "executed" | "pending"

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "critical", label: "Critical" },
  { value: "warning", label: "Warning" },
  { value: "executed", label: "Executed" },
  { value: "pending", label: "Pending" },
]

interface AlertFeedHeaderProps {
  activeFilter?: Filter
  onFilterChange?: (filter: Filter) => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
  onMarkAllRead?: () => void
}

export function AlertFeedHeader({
  activeFilter = "all",
  onFilterChange,
  searchQuery = "",
  onSearchChange,
  onMarkAllRead,
}: AlertFeedHeaderProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Top row: title + mark all read */}
      <div className="flex items-center justify-between">
        <CardTitle>Alert Feed</CardTitle>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={onMarkAllRead}>
          Mark All Read
        </Button>
      </div>

      {/* Filter pills + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => onFilterChange?.(f.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                activeFilter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-2 text-muted-foreground hover:bg-surface-hover hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:ml-auto sm:w-64">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>
    </div>
  )
}
