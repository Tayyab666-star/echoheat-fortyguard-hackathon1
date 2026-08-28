"use client"

import * as React from "react"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface ColumnDef<T> {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> extends React.ComponentProps<"div"> {
  columns: ColumnDef<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  loading?: boolean
  emptyIcon?: React.ReactNode
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  loading = false,
  emptyIcon,
  className,
  ...props
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div
        data-slot="data-table-skeleton"
        className={cn(
          "overflow-hidden rounded-xl border border-border bg-surface-1",
          className
        )}
        {...props}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              {columns.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  <div className="h-3 w-16 rounded bg-surface-2 animate-pulse" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i} className="border-border/50 hover:bg-transparent">
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    <div
                      className={cn(
                        "h-3 rounded bg-surface-2 animate-pulse",
                        i % 2 === 0 ? "w-20" : "w-28"
                      )}
                      style={{ animationDelay: `${i * 80}ms` }}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div
        data-slot="data-table-empty"
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface-1 py-16",
          className
        )}
        {...props}
      >
        {emptyIcon && <div className="text-muted-foreground">{emptyIcon}</div>}
        <p className="text-sm text-muted-foreground">No data</p>
      </div>
    )
  }

  return (
    <div
      data-slot="data-table"
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-surface-1",
        className
      )}
      {...props}
    >
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn("text-[10px] font-semibold uppercase tracking-wider", col.className)}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIdx) => (
            <TableRow
              key={rowIdx}
              className={cn(
                "border-border/50 transition-colors",
                onRowClick && "cursor-pointer hover:bg-surface-hover"
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <TableCell key={col.key} className={col.className}>
                  {col.render ? col.render(row) : String(row[col.key] ?? "")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
