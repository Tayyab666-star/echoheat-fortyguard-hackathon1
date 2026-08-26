"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { useTheme } from "@/lib/theme"

const REDUCED_VARIANTS = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

const DEFAULT_VARIANTS = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

const TRANSITION = {
  duration: 0.2,
  ease: [0.4, 0, 0.2, 1],
}

const REDUCED_TRANSITION = {
  duration: 0.05,
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { a11y } = useTheme()
  const reduced = a11y.reducedMotion

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={reduced ? REDUCED_VARIANTS : DEFAULT_VARIANTS}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={reduced ? REDUCED_TRANSITION : TRANSITION}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
