"use client"

import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useEffect } from "react"

interface ActiveRiskScoreProps {
  score?: number
}

export function ActiveRiskScore({ score = 78 }: ActiveRiskScoreProps) {
  const motionScore = useMotionValue(0)
  const displayScore = useTransform(motionScore, (v) => Math.round(v))

  useEffect(() => {
    const controls = animate(motionScore, score, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
    })
    return controls.stop
  }, [score, motionScore])

  const radius = 70
  const stroke = 8
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.08 }}
      className="col-span-full flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-surface-1/80 p-6 backdrop-blur-md lg:col-span-3"
    >
      <h3 className="font-mono text-sm font-semibold">Active Risk Score</h3>

      <div className="relative size-[180px]">
        <svg
          viewBox="0 0 160 160"
          className="size-full -rotate-90"
          aria-label={`Risk score: ${score} out of 100`}
          role="img"
        >
          <defs>
            <linearGradient id="risk-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="rgb(var(--primary))" />
              <stop offset="100%" stopColor="rgb(var(--danger))" />
            </linearGradient>
          </defs>

          {/* Track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="rgb(var(--surface-2))"
            strokeWidth={stroke}
          />

          {/* Progress */}
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="url(#risk-gradient)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>

        {/* Center score */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span className="font-mono text-5xl font-black tabular-nums">
            {displayScore}
          </motion.span>
          <span className="text-[10px] text-muted-foreground">/ 100</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <span className="rounded-md bg-danger/15 px-2 py-0.5 text-xs font-medium text-danger">
          High Risk
        </span>
        <span className="text-[11px] text-muted-foreground">
          4 sites above WBGT threshold
        </span>
      </div>
    </motion.div>
  )
}
