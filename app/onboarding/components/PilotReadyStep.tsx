"use client"

import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const CAPABILITIES = [
  "Fleet Thermal Monitoring",
  "Autonomous Pre-Cool Execution",
  "OSHA Compliance Logging",
]

export function PilotReadyStep() {
  const router = useRouter()
  const ref = useRef<SVGSVGElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="flex flex-col items-center gap-10 text-center">
      {/* Animated checkmark */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <svg
          ref={ref}
          viewBox="0 0 80 80"
          className="size-20"
          aria-label="Setup complete"
          role="img"
        >
          <motion.circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="rgb(var(--success))"
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={visible ? { pathLength: 1 } : {}}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <motion.path
            d="M24 40 L35 51 L56 30"
            fill="none"
            stroke="rgb(var(--success))"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={visible ? { pathLength: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
          />
        </svg>
      </motion.div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="flex flex-col gap-2"
      >
        <h2 className="text-3xl font-black text-foreground">
          You&apos;re Live on EchoHeat
        </h2>
        <p className="text-sm text-muted-foreground">
          Your thermal orchestration engine is active and monitoring.
        </p>
      </motion.div>

      {/* Capability pills */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="flex flex-wrap items-center justify-center gap-2"
      >
        {CAPABILITIES.map((cap) => (
          <span
            key={cap}
            className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success"
          >
            <span className="size-1.5 rounded-full bg-success" />
            {cap}
          </span>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        <Button
          size="lg"
          className="gap-2 bg-primary text-primary-foreground px-8 text-sm font-semibold hover:bg-primary/90"
          onClick={() => router.push("/dashboard")}
        >
          Go to Dashboard
          <ArrowRight className="size-4" />
        </Button>
      </motion.div>
    </div>
  )
}
