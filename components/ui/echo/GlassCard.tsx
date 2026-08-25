"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-border bg-surface-1",
        "shadow-[var(--shadow-md)] backdrop-blur-sm",
        "transition-all duration-200",
        "hover:border-border-strong hover:shadow-[var(--shadow-lg)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
GlassCard.displayName = "GlassCard"

export { GlassCard }
