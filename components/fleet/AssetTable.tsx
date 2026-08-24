"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Snowflake, Route } from "lucide-react"

type VehicleStatus = "PRE-COOLING" | "AT RISK" | "COMPLIANT" | "REROUTING"

interface Vehicle {
  id: string
  route: string
  cargoType: string
  internalTemp: string
  status: VehicleStatus
}

const VEHICLES: Vehicle[] = [
  { id: "KI-01", route: "KHI-01", cargoType: "Pharma", internalTemp: "-22.1\u00B0C", status: "COMPLIANT" },
  { id: "KI-04", route: "KHI-04", cargoType: "Dairy", internalTemp: "-16.3\u00B0C", status: "AT RISK" },
  { id: "KI-07", route: "KHI-07", cargoType: "Seafood", internalTemp: "-19.8\u00B0C", status: "PRE-COOLING" },
  { id: "LH-02", route: "LHR-03", cargoType: "Vaccines", internalTemp: "-24.0\u00B0C", status: "COMPLIANT" },
  { id: "DX-09", route: "DXB-12", cargoType: "Meat", internalTemp: "-14.7\u00B0C", status: "REROUTING" },
  { id: "KI-11", route: "KHI-09", cargoType: "Frozen Goods", internalTemp: "-18.5\u00B0C", status: "COMPLIANT" },
  { id: "LH-05", route: "LHR-07", cargoType: "Produce", internalTemp: "-12.1\u00B0C", status: "AT RISK" },
  { id: "DX-03", route: "DXB-05", cargoType: "Beverages", internalTemp: "-20.4\u00B0C", status: "COMPLIANT" },
]

const STATUS_CONFIG: Record<VehicleStatus, { className: string; pulse: boolean }> = {
  "PRE-COOLING": { className: "border-info/30 bg-info/10 text-info", pulse: true },
  "AT RISK": { className: "border-primary/30 bg-primary/10 text-primary", pulse: true },
  COMPLIANT: { className: "border-success/30 bg-success/10 text-success", pulse: false },
  REROUTING: { className: "border-warning/30 bg-warning/10 text-warning", pulse: true },
}

function ActionButton({ vehicle, onClick }: { vehicle: Vehicle; onClick: () => void }) {
  const [state, setState] = React.useState<"idle" | "loading" | "done">("idle")

  const handleClick = React.useCallback(() => {
    if (state !== "idle") return
    setState("loading")
    setTimeout(() => {
      setState("done")
      setTimeout(() => setState("idle"), 2000)
    }, 1200)
  }, [state])

  if (vehicle.status === "COMPLIANT") {
    return (
      <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground" onClick={onClick}>
        <Route className="size-3" />
        View Route
      </Button>
    )
  }

  return (
    <Button
      size="sm"
      className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
      onClick={handleClick}
      disabled={state !== "idle"}
    >
      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
            <Snowflake className="size-3" />
            Trigger Pre-Cool
          </motion.span>
        )}
        {state === "loading" && (
          <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
            <span className="size-3 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
            Executing
          </motion.span>
        )}
        {state === "done" && (
          <motion.span key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
            <svg className="size-3.5" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Executed
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  )
}

interface AssetTableProps {
  onSelectVehicle?: (vehicle: Vehicle) => void
}

export function AssetTable({ onSelectVehicle }: AssetTableProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-surface-1/80 backdrop-blur-md">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead>Vehicle ID</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Internal Temp</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {VEHICLES.map((v) => {
            const cfg = STATUS_CONFIG[v.status]
            return (
              <TableRow
                key={v.id}
                className="cursor-pointer border-white/5"
                onClick={() => onSelectVehicle?.(v)}
              >
                <TableCell className="font-mono font-bold">{v.id}</TableCell>
                <TableCell className="font-mono text-muted-foreground">{v.route}</TableCell>
                <TableCell>{v.cargoType}</TableCell>
                <TableCell className="font-mono tabular-nums">{v.internalTemp}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn("border gap-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase", cfg.className)}
                  >
                    {cfg.pulse && (
                      <span className="relative flex size-1.5">
                        <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", v.status === "AT RISK" || v.status === "REROUTING" ? "bg-current" : "bg-current")} />
                        <span className="relative inline-flex size-1.5 rounded-full bg-current" />
                      </span>
                    )}
                    {v.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <ActionButton vehicle={v} onClick={() => onSelectVehicle?.(v)} />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
