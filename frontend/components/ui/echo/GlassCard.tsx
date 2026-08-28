"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useTheme } from "@/lib/theme"

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, hoverable = true, ...props }, ref) => {
    const { a11y } = useTheme()
    const reduced = a11y.reducedMotion

    if (!hoverable || reduced) {
      return (
        <div
          ref={ref}
          className={cn(
            "rounded-2xl border border-border bg-surface-1",
            "shadow-[var(--shadow-md)] backdrop-blur-sm",
            "transition-all duration-200",
            "hover:border-border-strong hover:shadow-[var(--shadow-lg)]",
            className
          )}
        >
          {children}
        </div>
      )
    }

    return (
      <motion.div
        ref={ref}
        whileHover={{ y: -2, boxShadow: "var(--shadow-lg)" }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(
          "rounded-2xl border border-border bg-surface-1",
          "shadow-[var(--shadow-md)] backdrop-blur-sm",
          "hover:border-border-strong",
          className
        )}
      >
        {children}
      </motion.div>
    )
  }
)
GlassCard.displayName = "GlassCard"

export { GlassCard }
