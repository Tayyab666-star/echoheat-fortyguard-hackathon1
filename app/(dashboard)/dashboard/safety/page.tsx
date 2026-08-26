"use client"

import * as React from "react"
import { motion } from "framer-motion"

import { SiteSelector } from "@/components/safety/SiteSelector"
import { WBGTGaugePanel } from "@/components/safety/WBGTGaugePanel"
import { WorkRestSchedule } from "@/components/safety/WorkRestSchedule"
import { ComplianceLogTable } from "@/components/safety/ComplianceLogTable"
import { AlertDispatchPanel } from "@/components/safety/AlertDispatchPanel"

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export default function SafetyPage() {
  const [activeSite, setActiveSite] = React.useState("c")

  return (
    <div className="flex flex-col gap-4">
      {/* Site selector tabs */}
      <SiteSelector activeSite={activeSite} onSelectSite={setActiveSite} />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 lg:grid-cols-12"
      >
        {/* Top row: Gauge + Work/Rest + Alerts */}
        <motion.div variants={item} className="col-span-full lg:col-span-4">
          <WBGTGaugePanel value={41.2} />
        </motion.div>

        <motion.div variants={item} className="col-span-full lg:col-span-5">
          <WorkRestSchedule />
        </motion.div>

        <motion.div variants={item} className="col-span-full lg:col-span-3">
          <AlertDispatchPanel />
        </motion.div>

        {/* Bottom row: Compliance Log (full width) */}
        <motion.div variants={item} className="col-span-full">
          <ComplianceLogTable />
        </motion.div>
      </motion.div>
    </div>
  )
}
