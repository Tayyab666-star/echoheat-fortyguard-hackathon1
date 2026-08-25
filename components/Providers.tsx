"use client"

import * as React from "react"
import { ThemeProvider } from "@/lib/theme/provider"
import { ToastProvider } from "@/lib/toast/provider"
import { TooltipProvider } from "@/components/ui/tooltip"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <TooltipProvider>{children}</TooltipProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
