"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Phone, Mail, CheckCircle2, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface Alert {
  id: string
  foreman: string
  contact: string
  contactType: "phone" | "email"
  message: string
  time: string
  confirmed: boolean
}

const ALERTS: Alert[] = [
  { id: "1", foreman: "Ahmad R.", contact: "+92 300 1234567", contactType: "phone", message: "Mandatory rest enforced at Zone C. All crews stand down.", time: "14:32", confirmed: true },
  { id: "2", foreman: "Bilal K.", contact: "+92 321 7654321", contactType: "phone", message: "WBGT exceeded 39\u00B0C. Work/rest ratio adjusted to 10/50.", time: "13:15", confirmed: true },
  { id: "3", foreman: "Farhan M.", contact: "farhan@site.pk", contactType: "email", message: "Hydration break dispatched to all active crews.", time: "11:48", confirmed: false },
  { id: "4", foreman: "Omar S.", contact: "+92 333 9876543", contactType: "phone", message: "Monitoring interval increased to 15-minute cycles.", time: "10:22", confirmed: true },
  { id: "5", foreman: "Zain A.", contact: "zain@site.pk", contactType: "email", message: "Pre-shift assessment complete. Conditions moderate.", time: "09:05", confirmed: false },
]

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const cardVariant = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0 },
}

export function AlertDispatchPanel() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-1/80 p-4 sm:p-6 backdrop-blur-md">
      <h3 className="font-mono text-sm font-semibold">Alert Dispatch Log</h3>

      <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-2">
        {ALERTS.map((alert) => (
          <motion.div
            key={alert.id}
            variants={cardVariant}
            className={cn(
              "flex items-start gap-3 rounded-xl border bg-surface-2/40 p-3 transition-colors hover:bg-surface-hover",
              alert.confirmed ? "border-border/50" : "border-warning/20"
            )}
          >
            <span className={cn(
              "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md",
              alert.confirmed ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
            )}>
              {alert.contactType === "phone" ? (
                <Phone className="size-3.5" />
              ) : (
                <Mail className="size-3.5" />
              )}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">{alert.foreman}</span>
                <span className="text-[10px] text-muted-foreground">{alert.contact}</span>
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">
                {alert.message}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">{alert.time}</span>
                {alert.confirmed ? (
                  <span className="flex items-center gap-0.5 text-[10px] text-success">
                    <CheckCircle2 className="size-3" />
                    Confirmed
                  </span>
                ) : (
                  <span className="text-[10px] text-warning">Unconfirmed</span>
                )}
              </div>
            </div>

            {!alert.confirmed && (
              <Button variant="ghost" size="sm" className="shrink-0 gap-1 text-[10px] text-warning hover:text-warning">
                <RotateCcw className="size-3" />
                Resend
              </Button>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
