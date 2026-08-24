"use client"

import { motion } from "framer-motion"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SegmentData {
  annualCost: string
  avoidedLoss: { label: string; value: string }[]
  netROI: string
}

const SEGMENTS: { key: string; label: string; data: SegmentData }[] = [
  {
    key: "cold_chain",
    label: "Cold Chain",
    data: {
      annualCost: "$142,800",
      avoidedLoss: [
        { label: "Cargo Loss Prevention", value: "$84,200" },
        { label: "Fuel Optimization", value: "$38,400" },
        { label: "SLA Breach Avoidance", value: "$52,600" },
        { label: "Vehicle Maintenance", value: "$18,200" },
      ],
      netROI: "14.6x",
    },
  },
  {
    key: "construction",
    label: "Construction",
    data: {
      annualCost: "$96,400",
      avoidedLoss: [
        { label: "OSHA Penalty Avoidance", value: "$120,000" },
        { label: "Workers Comp Reduction", value: "$68,400" },
        { label: "Productivity Recovery", value: "$42,800" },
        { label: "Equipment Downtime", value: "$24,600" },
      ],
      netROI: "11.6x",
    },
  },
  {
    key: "facility",
    label: "Facility",
    data: {
      annualCost: "$186,200",
      avoidedLoss: [
        { label: "Peak Demand Shaving", value: "$94,200" },
        { label: "HVAC Longevity", value: "$32,800" },
        { label: "Thermal Mass Storage", value: "$28,400" },
        { label: "Occupant Comfort", value: "$14,200" },
      ],
      netROI: "2.8x",
    },
  },
]

const TOTAL_ANNUAL_COST = "$425,400"
const TOTAL_AVOIDED = "$618,600"
const BLENDED_ROI = "8.3x"

export function ROISummaryTable() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="rounded-2xl border border-white/10 bg-surface-1/80 p-4 sm:p-6 backdrop-blur-md"
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-mono text-sm font-semibold">ROI Summary — All Segments</h3>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Download className="size-3.5" />
          Export PDF Report
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10">
              <th className="pb-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Category
              </th>
              {SEGMENTS.map((seg) => (
                <th
                  key={seg.key}
                  className="pb-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {seg.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* Annual Cost row */}
            <tr className="border-b border-white/5">
              <td className="py-3 text-muted-foreground">Annual EchoHeat Cost</td>
              {SEGMENTS.map((seg) => (
                <td key={seg.key} className="py-3 text-right font-mono font-bold tabular-nums">
                  {seg.data.annualCost}
                </td>
              ))}
            </tr>

            {/* Separator */}
            <tr>
              <td colSpan={4} className="py-1">
                <div className="h-px bg-white/5" />
              </td>
            </tr>

            {/* Avoided Loss header */}
            <tr>
              <td colSpan={4} className="py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Avoided Loss (Itemized)
              </td>
            </tr>

            {/* Itemized rows */}
            {[0, 1, 2, 3].map((idx) => (
              <tr key={idx} className="border-b border-white/5">
                <td className="py-2 pl-4 text-muted-foreground">
                  {SEGMENTS[0].data.avoidedLoss[idx].label}
                </td>
                {SEGMENTS.map((seg) => (
                  <td key={seg.key} className="py-2 text-right font-mono tabular-nums">
                    {seg.data.avoidedLoss[idx].value}
                  </td>
                ))}
              </tr>
            ))}

            {/* Separator */}
            <tr>
              <td colSpan={4} className="py-1">
                <div className="h-px bg-white/5" />
              </td>
            </tr>

            {/* Net ROI row */}
            <tr className="border-b border-white/10">
              <td className="py-3 text-muted-foreground">Net ROI Multiplier</td>
              {SEGMENTS.map((seg) => (
                <td key={seg.key} className="py-3 text-right">
                  <span className="font-mono text-xl font-black text-primary tabular-nums">
                    {seg.data.netROI}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer summary */}
      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Total Cost: <span className="font-mono font-bold text-foreground">{TOTAL_ANNUAL_COST}</span></span>
            <span>Total Avoided: <span className="font-mono font-bold text-success">{TOTAL_AVOIDED}</span></span>
          </div>
          <p className="text-[10px] text-muted-foreground">Blended ROI across all EchoHeat verticals (12-month rolling)</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-3xl font-black text-primary tabular-nums">{BLENDED_ROI}</span>
          <span className="text-[10px] text-muted-foreground">blended<br />ROI</span>
        </div>
      </div>
    </motion.div>
  )
}
