"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Truck, HardHat, Server, Loader2, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

type ConnectionState = "idle" | "loading" | "connected"

interface Integration {
  id: string
  name: string
  icon: React.ReactNode
  iconBg: string
  description: string
  oauthLabel: string
  assetsFound?: number
}

const INTEGRATIONS: Integration[] = [
  {
    id: "samsara",
    name: "Samsara",
    icon: <Truck className="size-5" />,
    iconBg: "bg-info/15 text-info",
    description: "Connect for Fleet & Cold Chain",
    oauthLabel: "Connect via OAuth",
    assetsFound: 34,
  },
  {
    id: "procore",
    name: "Procore",
    icon: <HardHat className="size-5" />,
    iconBg: "bg-primary/15 text-primary",
    description: "Connect for Construction Safety",
    oauthLabel: "Connect via OAuth",
    assetsFound: 18,
  },
  {
    id: "bacnet",
    name: "BACnet Gateway",
    icon: <Server className="size-5" />,
    iconBg: "bg-muted-foreground/15 text-muted-foreground",
    description: "Manual setup for Facility HVAC",
    oauthLabel: "Connect via OAuth",
    assetsFound: 12,
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

export function ConnectIntegrationsStep() {
  const [states, setStates] = React.useState<Record<string, ConnectionState>>({
    samsara: "idle",
    procore: "idle",
    bacnet: "idle",
  })

  function handleConnect(id: string) {
    setStates((prev) => ({ ...prev, [id]: "loading" }))
    setTimeout(() => {
      setStates((prev) => ({ ...prev, [id]: "connected" }))
    }, 1800 + Math.random() * 800)
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h2 className="text-2xl font-black text-foreground">Connect Your Tools</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Link your existing platforms for autonomous thermal orchestration.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {INTEGRATIONS.map((integration, i) => {
          const state = states[integration.id]
          const isConnected = state === "connected"
          const isLoading = state === "loading"

          return (
            <motion.div
              key={integration.id}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: i * 0.1, duration: 0.35 }}
              className={cn(
                "flex items-center gap-4 rounded-xl border p-4 transition-colors",
                isConnected
                  ? "border-success/30 bg-success/5"
                  : "border-border bg-surface-hover hover:bg-surface-2"
              )}
            >
              <span
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-lg",
                  integration.iconBg
                )}
              >
                {integration.icon}
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{integration.name}</p>
                <p className="text-xs text-muted-foreground">{integration.description}</p>
              </div>

              <AnimatePresence mode="wait">
                {isConnected ? (
                  <motion.div
                    key="connected"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 text-xs text-success shrink-0"
                  >
                    <CheckCircle2 className="size-4" />
                    <span className="font-medium">
                      Connected &middot; {integration.assetsFound} assets found
                    </span>
                  </motion.div>
                ) : (
                  <motion.button
                    key="button"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    disabled={isLoading}
                    onClick={() => handleConnect(integration.id)}
                    className={cn(
                      "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors",
                      isLoading
                        ? "cursor-wait bg-primary/70 text-primary-foreground"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    {isLoading && <Loader2 className="size-3.5 animate-spin" />}
                    {isLoading ? "Connecting..." : integration.oauthLabel}
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
