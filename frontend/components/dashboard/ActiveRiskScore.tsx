"use client"

import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useEffect } from "react"
import Link from "next/link"
import { CardTitle, Caption, DataLabel } from "@/components/ui/echo/Text"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface ActiveRiskScoreProps {
  score?: number
}

function getRiskLabel(score: number): { label: string; color: string; bg: string } {
  if (score <= 30) return { label: "All Good", color: "text-success", bg: "bg-success/15" }
  if (score <= 60) return { label: "Be Careful", color: "text-warning", bg: "bg-warning/15" }
  if (score <= 80) return { label: "Act Now", color: "text-primary", bg: "bg-primary/15" }
  return { label: "Emergency", color: "text-danger", bg: "bg-danger/15" }
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

  const risk = getRiskLabel(score)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.08 }}
      className="col-span-full flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-surface-1/80 p-4 sm:p-6 backdrop-blur-md lg:col-span-3"
    >
      <CardTitle>Overall Risk Level</CardTitle>

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
          <motion.span
            className="font-black font-mono text-text-primary tabular-nums"
            style={{ fontSize: "var(--text-display)" }}
          >
            {displayScore}
          </motion.span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <span className={`rounded-md ${risk.bg} px-3 py-1 text-xs font-bold ${risk.color}`}>
          {risk.label}
        </span>
        <Caption>
          4 locations need attention right now
        </Caption>
        <Link href="/dashboard/alerts">
          <Button size="sm" className="mt-1 gap-1.5 text-xs">
            See What To Do <ArrowRight className="size-3" />
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}
