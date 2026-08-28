"use client"

import * as React from "react"
import { motion, useSpring, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"
import { useTheme } from "@/lib/theme"

interface AnimatedNumberProps {
  value: number
  decimals?: number
  className?: string
  mono?: boolean
}

export function AnimatedNumber({
  value,
  decimals = 0,
  className,
  mono = true,
}: AnimatedNumberProps) {
  const { a11y } = useTheme()
  const reduced = a11y.reducedMotion

  const spring = useSpring(value, { stiffness: 100, damping: 20 })
  const display = useTransform(spring, (v) => v.toFixed(decimals))

  React.useEffect(() => {
    spring.set(value)
  }, [value, spring])

  if (reduced) {
    return (
      <span className={cn(mono && "font-mono tabular-nums", className)}>
        {value.toFixed(decimals)}
      </span>
    )
  }

  return (
    <motion.span className={cn(mono && "font-mono tabular-nums", className)}>
      {display}
    </motion.span>
  )
}
