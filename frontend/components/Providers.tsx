"use client"

import * as React from "react"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/lib/theme/provider"
import { ToastProvider } from "@/lib/toast/provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useThemeShortcut } from "@/hooks/useThemeShortcut"

function ThemeShortcutBinder() {
  useThemeShortcut()
  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ToastProvider>
          <TooltipProvider>
            <ThemeShortcutBinder />
            {children}
          </TooltipProvider>
        </ToastProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
