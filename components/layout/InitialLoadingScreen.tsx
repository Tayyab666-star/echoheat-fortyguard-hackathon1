"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Flame } from "lucide-react"

export function InitialLoadingScreen() {
  const [visible, setVisible] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="initial-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-background"
        >
          {/* Glow */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[120px]" />
          </div>

          {/* Logo + spinner */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 140, damping: 14 }}
            className="relative flex flex-col items-center gap-5"
          >
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
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

          {/* Loading bar */}
          <div className="mt-10 w-48 overflow-hidden rounded-full bg-surface-2">
            <motion.div
              className="h-1 rounded-full bg-accent"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.8, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
