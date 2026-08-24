"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const STEPS = [
  { path: "/onboarding/welcome", label: "Welcome" },
  { path: "/onboarding/connect", label: "Connect" },
  { path: "/onboarding/configure", label: "Configure" },
  { path: "/onboarding/pilot-ready", label: "Go Live" },
]

interface OnboardingShellProps {
  children: React.ReactNode
  stepIndex: number
  nextHref?: string
  prevHref?: string
  hideNav?: boolean
}

export function OnboardingShell({
  children,
  stepIndex,
  nextHref,
  prevHref,
  hideNav = false,
}: OnboardingShellProps) {
  const router = useRouter()
  const progress = ((stepIndex + 1) / STEPS.length) * 100

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      {/* Animated gradient mesh background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-950/40 via-zinc-950 to-black" />
        <motion.div
          className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-orange-500/[0.04] blur-[120px]"
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-1/4 -right-1/4 h-[500px] w-[500px] rounded-full bg-orange-600/[0.03] blur-[100px]"
          animate={{
            x: [0, -30, 20, 0],
            y: [0, 20, -40, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="h-1 w-full bg-surface-2">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-center gap-8 px-6 py-4">
          {STEPS.map((step, i) => (
            <div
              key={step.path}
              className={cn(
                "flex items-center gap-2 text-xs font-medium transition-colors",
                i <= stepIndex ? "text-primary" : "text-muted-foreground/50"
              )}
            >
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full border text-[10px] font-bold",
                  i < stepIndex
                    ? "border-primary bg-primary text-primary-foreground"
                    : i === stepIndex
                      ? "border-primary text-primary"
                      : "border-muted-foreground/30 text-muted-foreground/50"
                )}
              >
                {i < stepIndex ? "\u2713" : i + 1}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <motion.div
        key={stepIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 w-full max-w-xl px-6"
      >
        {children}
      </motion.div>

      {/* Bottom navigation */}
      {!hideNav && (
        <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-6">
          {prevHref ? (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
              onClick={() => router.push(prevHref)}
            >
              <ArrowLeft className="size-3.5" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {nextHref && (
            <Button
              size="sm"
              className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => router.push(nextHref)}
            >
              Continue
              <ArrowRight className="size-3.5" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
