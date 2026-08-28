"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Flame } from "lucide-react"

const DOTS = [0, 1, 2]

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
