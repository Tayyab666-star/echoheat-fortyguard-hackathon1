"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useTheme } from "@/lib/theme"

interface FlashUpdateProps {
  children: React.ReactNode
  trigger: unknown
  className?: string
}

export function FlashUpdate({ children, trigger, className }: FlashUpdateProps) {
  const { a11y } = useTheme()
  const reduced = a11y.reducedMotion
  const [flash, setFlash] = React.useState(false)

  React.useEffect(() => {
    if (reduced || trigger === undefined) return
    setFlash(true)
    const timer = setTimeout(() => setFlash(false), 600)
    return () => clearTimeout(timer)
  }, [trigger, reduced])

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      animate={
        flash
          ? {
              backgroundColor: [
                "var(--accent-primary-glow)",
                "transparent",
              ],
            }
          : {}
      }
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
