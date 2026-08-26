"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Flame } from "lucide-react"

interface EchoHeatSplashLoaderProps {
  open: boolean
  onComplete: () => void
}

const DURATION_SEC = 5
const DOTS = [0, 1, 2]

export function EchoHeatSplashLoader({ open, onComplete }: EchoHeatSplashLoaderProps) {
  const [elapsed, setElapsed] = React.useState(0)
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    if (!open) {
      setVisible(false)
      setElapsed(0)
      return
    }
    setVisible(true)
    setElapsed(0)
  }, [open])

  React.useEffect(() => {
    if (!visible) return
    if (elapsed >= DURATION_SEC) {
      onComplete()
      return
    }
    const id = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(id)
  }, [visible, elapsed, onComplete])

  const progress = (elapsed / DURATION_SEC) * 100

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
        >
          {/* Glow backdrop */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[120px]" />
          </div>

          {/* Logo */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 160, damping: 14, delay: 0.1 }}
            className="relative flex flex-col items-center gap-5"
          >
            <motion.span
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="flex size-20 items-center justify-center rounded-2xl bg-accent-glow shadow-lg shadow-accent/20"
            >
              <Flame className="size-10 text-accent" />
            </motion.span>

            <div className="text-center">
              <h1 className="font-mono text-2xl font-bold tracking-tight text-text-primary">
                EchoHeat
              </h1>
              <p className="mt-1 text-sm text-text-muted">Autonomous Thermal Orchestration</p>
            </div>
          </motion.div>

          {/* Loading dots */}
          <div className="mt-10 flex items-center gap-2">
            {DOTS.map((i) => (
              <motion.span
                key={i}
                className="size-2 rounded-full bg-accent"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-6 w-48 overflow-hidden rounded-full bg-surface-2">
            <motion.div
              className="h-1 rounded-full bg-accent"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>

          <p className="mt-3 font-mono text-xs text-text-muted">
            Loading systems... {elapsed}s / {DURATION_SEC}s
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
