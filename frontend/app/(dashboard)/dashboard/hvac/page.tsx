"use client"

import { motion } from "framer-motion"

import { DemandCurveChart } from "@/components/facility/DemandCurveChart"
import { ChillerStatusGrid } from "@/components/facility/ChillerStatusGrid"
import { PreCoolingSchedule } from "@/components/facility/PreCoolingSchedule"
import { ThermalLagIndicator } from "@/components/facility/ThermalLagIndicator"
import { MonthlyROICard } from "@/components/facility/MonthlyROICard"

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export default function FacilityPage() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4"
    >
      {/* Row 1: Demand Curve (full width) */}
      <motion.div variants={item}>
        <DemandCurveChart />
      </motion.div>

      {/* Row 2: Chiller Grid + Pre-Cooling Schedule */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <motion.div variants={item} className="col-span-full lg:col-span-7">
          <ChillerStatusGrid />
        </motion.div>

        <motion.div variants={item} className="col-span-full lg:col-span-5">
          <PreCoolingSchedule />
        </motion.div>
      </div>

      {/* Row 3: Thermal Lag + ROI */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <motion.div variants={item} className="col-span-full lg:col-span-5">
          <ThermalLagIndicator />
        </motion.div>

        <motion.div variants={item} className="col-span-full lg:col-span-7">
          <MonthlyROICard />
        </motion.div>
      </div>
    </motion.div>
  )
}
