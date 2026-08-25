"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

import { RouteHeatMap } from "@/components/fleet/RouteHeatMap"
import { AssetTable } from "@/components/fleet/AssetTable"
import { AssetDetailDrawer } from "@/components/fleet/AssetDetailDrawer"
import { QuickActionBar } from "@/components/fleet/QuickActionBar"

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export default function FleetPage() {
  const [selectedVehicle, setSelectedVehicle] = React.useState<{
    id: string
    route: string
    cargoType: string
    internalTemp: string
    status: string
  } | null>(null)
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [mobileTab, setMobileTab] = React.useState<"map" | "assets">("map")

  const handleSelectVehicle = React.useCallback((vehicle: typeof selectedVehicle) => {
    setSelectedVehicle(vehicle)
    setDrawerOpen(true)
  }, [])

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4"
    >
      {/* Mobile: tab switcher */}
      <div className="flex gap-1 rounded-lg border border-border bg-surface-2 p-0.5 sm:hidden">
        <button
          onClick={() => setMobileTab("map")}
          className={cn(
            "flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors",
            mobileTab === "map"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Map View
        </button>
        <button
          onClick={() => setMobileTab("assets")}
          className={cn(
            "flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors",
            mobileTab === "assets"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Assets
        </button>
      </div>

      {/* Mobile: single view */}
      <div className="sm:hidden">
        {mobileTab === "map" ? (
          <div className="min-h-[300px]">
            <RouteHeatMap />
          </div>
        ) : (
          <AssetTable onSelectVehicle={handleSelectVehicle} />
        )}
      </div>

      {/* Tablet+: split layout */}
      <div className="hidden flex-col gap-4 sm:flex-row sm:h-[calc(100vh-8rem)]">
        {/* Left panel — 60% */}
        <motion.div variants={item} className="min-h-[300px] min-w-0 overflow-y-auto sm:flex-1 sm:min-h-0">
          <RouteHeatMap />
        </motion.div>

        {/* Right panel — 40% */}
        <motion.div
          variants={item}
          className="flex w-full flex-col border-t border-border sm:max-w-[40%] sm:border-l sm:border-t-0"
        >
          <div className="flex-1 overflow-y-auto p-4">
            <AssetTable onSelectVehicle={handleSelectVehicle} />
          </div>
          <QuickActionBar />
        </motion.div>
      </div>

      {/* Detail Drawer */}
      <AssetDetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        vehicle={selectedVehicle}
      />
    </motion.div>
  )
}
