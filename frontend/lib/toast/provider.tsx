"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Check, X, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Toast {
  id: string
  message: string
  type?: "success" | "error" | "info" | "warning"
}

interface ToastContextValue {
  toast: (message: string, type?: Toast["type"]) => void
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined)

const TOAST_STYLES: Record<NonNullable<Toast["type"]>, { icon: React.ElementType; iconBg: string; iconColor: string }> = {
  success: { icon: Check, iconBg: "bg-success/15", iconColor: "text-success" },
  error:   { icon: X, iconBg: "bg-danger/15", iconColor: "text-danger" },
  info:    { icon: Info, iconBg: "bg-info/15", iconColor: "text-info" },
  warning: { icon: AlertTriangle, iconBg: "bg-warning/15", iconColor: "text-warning" },
}

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map((t) => {
        const type = t.type ?? "success"
        const cfg = TOAST_STYLES[type]
        const Icon = cfg.icon

        return (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-center gap-3 rounded-xl border border-border px-4 py-3 shadow-[var(--shadow-md)] backdrop-blur-md animate-slide-up",
              "bg-surface-1/95 text-sm font-medium text-text-primary"
            )}
          >
            <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full", cfg.iconBg)}>
              <Icon className={cn("size-3.5", cfg.iconColor)} />
            </span>
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-text-primary"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])
  const [portalNode, setPortalNode] = React.useState<HTMLElement | null>(null)

  React.useEffect(() => {
    setPortalNode(document.body)
  }, [])

  const toast = React.useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Math.random().toString(36).slice(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {portalNode &&
        createPortal(
          <ToastContainer toasts={toasts} dismiss={dismiss} />,
          portalNode
        )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within a ToastProvider")
  return ctx
}
