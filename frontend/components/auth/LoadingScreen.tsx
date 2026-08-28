"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"

interface LoadingScreenProps {
  type: "initial" | "login" | "signup"
  userName?: string
  onComplete: () => void
}

const MESSAGES = {
  initial: [
    "Connecting to FortyGuard API...",
    "Loading hyperlocal thermal data...",
    "Initializing orchestration engine...",
    "Almost ready...",
  ],
  login: [
    "Authenticating your credentials...",
    "Loading your dashboard...",
    "Syncing asset data...",
    "Welcome back!",
  ],
  signup: [
    "Creating your account...",
    "Setting up your workspace...",
    "Connecting integrations...",
    "EchoHeat is ready for you!",
  ],
}

const CYCLE_MS = 1250
const TOTAL_MS = 5000
const TICK_MS = 100
const INCREMENT = (TICK_MS / TOTAL_MS) * 100

export function LoadingScreen({ type, userName, onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = React.useState(0)
  const [msgIndex, setMsgIndex] = React.useState(0)
  const messages = MESSAGES[type]

  React.useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + INCREMENT, 100))
    }, TICK_MS)

    const messageInterval = setInterval(() => {
      setMsgIndex((i) => Math.min(i + 1, messages.length - 1))
    }, CYCLE_MS)

    const completeTimeout = setTimeout(onComplete, TOTAL_MS)

    return () => {
      clearInterval(progressInterval)
      clearInterval(messageInterval)
      clearTimeout(completeTimeout)
    }
  }, [onComplete, messages.length])

  const greeting =
    type === "login"
      ? `Welcome back, ${userName}! \uD83D\uDC4B`
      : type === "signup"
        ? `Welcome to EchoHeat, ${userName}! \uD83C\uDF89`
        : null

  return (
    <motion.div
      key="loading-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-bg-base"
    >
      {/* Radial gradient ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[140px]" />
      </div>

      {/* Flame emoji with pulse */}
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="relative mb-6 text-6xl"
        style={{ filter: "drop-shadow(0 0 20px var(--accent))" }}
      >
        \uD83D\uDD25
      </motion.div>

      {/* Wordmark */}
      <h1 className="text-4xl font-black tracking-tight">
        <span className="text-text-primary">Echo</span>
        <span className="text-accent">Heat</span>
      </h1>

      {/* Subtitle */}
      <p className="mt-2 text-sm text-text-muted">
        Autonomous Thermal Orchestration Engine
      </p>

      {/* Personalized greeting */}
      {greeting && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-4 text-base font-medium text-text-primary"
        >
          {greeting}
        </motion.p>
      )}

      {/* Progress bar */}
      <div className="mt-8 w-64">
        <div className="flex items-center justify-between text-[11px] text-text-muted mb-1.5">
          <span>{progress >= 100 ? "Ready!" : "Loading..."}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-px w-full overflow-hidden rounded-full bg-surface-2">
          <motion.div
            className="h-full rounded-full bg-accent"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.15, ease: "linear" }}
          />
        </div>
      </div>

      {/* Cycling status message */}
      <div className="mt-5 h-5 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="text-sm text-text-muted"
          >
            {messages[msgIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Three pulsing dots */}
      <div className="mt-4 flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-1.5 rounded-full bg-accent"
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Footer */}
      <p className="absolute bottom-8 text-[11px] text-text-muted">
        Powered by{" "}
        <span className="font-semibold text-accent">FortyGuard API</span>
      </p>
    </motion.div>
  )
}
