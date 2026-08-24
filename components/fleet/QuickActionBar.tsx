"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Snowflake, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export function QuickActionBar() {
  const [preCoolState, setPreCoolState] = React.useState<"idle" | "loading" | "done">("idle")

  const handleBulkPreCool = React.useCallback(() => {
    if (preCoolState !== "idle") return
    setPreCoolState("loading")
    setTimeout(() => {
      setPreCoolState("done")
      setTimeout(() => setPreCoolState("idle"), 2000)
    }, 1500)
  }, [preCoolState])

  return (
    <div className="sticky bottom-0 flex flex-col gap-2 border-t border-white/10 bg-background/80 p-4 backdrop-blur-md">
      <Button
        onClick={handleBulkPreCool}
        disabled={preCoolState !== "idle"}
        className="w-full gap-2 bg-gradient-to-r from-primary to-orange-600 text-primary-foreground shadow-lg shadow-primary/20 hover:from-primary/90 hover:to-orange-600/90"
      >
        <AnimatePresence mode="wait">
          {preCoolState === "idle" && (
            <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
              <Snowflake className="size-4" />
              Bulk Pre-Cool All AT RISK
            </motion.span>
          )}
          {preCoolState === "loading" && (
            <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              Executing Pre-Cool...
            </motion.span>
          )}
          {preCoolState === "done" && (
            <motion.span key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
              <svg className="size-4" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Pre-Cool Executed
            </motion.span>
          )}
        </AnimatePresence>
      </Button>

      <Button variant="outline" className="w-full gap-2">
        <Download className="size-4" />
        Export SLA Report
      </Button>
    </div>
  )
}
