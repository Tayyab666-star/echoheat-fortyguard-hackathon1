"use client"

import * as React from "react"
import { motion } from "framer-motion"

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

  const handleSelectVehicle = React.useCallback((vehicle: typeof selectedVehicle) => {
    setSelectedVehicle(vehicle)
    setDrawerOpen(true)
  }, [])

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="flex h-auto min-h-[calc(100vh-3.5rem)] flex-col gap-4 md:h-[calc(100vh-3.5rem)] md:flex-row"
    >
      {/* Left panel — 60% */}
      <motion.div variants={item} className="min-h-[300px] min-w-0 overflow-y-auto md:flex-1 md:min-h-0">
        <RouteHeatMap />
      </motion.div>

      {/* Right panel — 40% */}
      <motion.div
        variants={item}
        className="flex w-full flex-col border-t border-white/10 md:max-w-[40%] md:border-l md:border-t-0"
      >
        <div className="flex-1 overflow-y-auto p-4">
          <AssetTable onSelectVehicle={handleSelectVehicle} />
        </div>
        <QuickActionBar />
      </motion.div>

      {/* Detail Drawer */}
      <AssetDetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        vehicle={selectedVehicle}
      />
    </motion.div>
  )
}
