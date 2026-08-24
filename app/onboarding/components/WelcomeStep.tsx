"use client"

import { motion } from "framer-motion"
import { Waves, Cpu, Zap } from "lucide-react"

const FEATURES = [
  {
    icon: Waves,
    label: "2m Hyperlocal Data",
    description: "Real-time thermal telemetry at 2-meter resolution",
  },
  {
    icon: Cpu,
    label: "Autonomous Execution",
    description: "Self-healing alerts with zero human intervention",
  },
  {
    icon: Zap,
    label: "Zero-Hardware Setup",
    description: "Plug into existing sensors — no proprietary devices",
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
}

export function WelcomeStep() {
  return (
    <div className="flex flex-col items-center gap-10 text-center">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center gap-3"
      >
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/15">
          <span className="font-mono text-2xl font-black text-primary">EH</span>
        </div>
        <h1 className="font-mono text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          EchoHeat
        </h1>
      </motion.div>

      {/* Headline */}
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="text-3xl font-black leading-tight tracking-tight text-foreground"
      >
        Your Thermal Orchestration
        <br />
        Engine is Ready
      </motion.h2>

      {/* Feature rows */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-4"
      >
        {FEATURES.map((feat) => (
          <motion.div
            key={feat.label}
            variants={fadeUp}
            className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-4"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <feat.icon className="size-5" />
            </span>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">{feat.label}</p>
              <p className="text-xs text-muted-foreground">{feat.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
