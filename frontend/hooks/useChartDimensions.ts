"use client"

import { useRef, useState, useEffect, type RefObject } from "react"

interface ChartDimensions {
  width: number
  height: number
}

export function useChartDimensions(ref: RefObject<HTMLDivElement | null>): ChartDimensions {
  const [dimensions, setDimensions] = useState<ChartDimensions>({ width: 0, height: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        const { width, height } = entry.contentRect
        setDimensions({ width, height })
      }
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])

  return dimensions
}

export function useBreakpoint(): "mobile" | "tablet" | "desktop" {
  const [bp, setBp] = useState<"mobile" | "tablet" | "desktop">("desktop")

  useEffect(() => {
    function check() {
      const w = window.innerWidth
      if (w < 640) setBp("mobile")
      else if (w < 1024) setBp("tablet")
      else setBp("desktop")
    }
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  return bp
}
