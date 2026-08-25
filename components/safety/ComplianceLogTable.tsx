"use client"

import { motion } from "framer-motion"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface LogEntry {
  id: string
  timestamp: string
  wbgt: string
  action: string
  loggedTo: string
  auditStatus: "defensible" | "pending"
}

const LOGS: LogEntry[] = [
  { id: "1", timestamp: "14:32", wbgt: "41.2\u00B0C", action: "Mandatory rest enforced", loggedTo: "Procore Daily Log", auditStatus: "defensible" },
  { id: "2", timestamp: "13:15", wbgt: "39.8\u00B0C", action: "Work/rest ratio adjusted to 10/50", loggedTo: "HammerTech", auditStatus: "defensible" },
  { id: "3", timestamp: "11:48", wbgt: "38.1\u00B0C", action: "Hydration break dispatched", loggedTo: "Email to Supervisor", auditStatus: "defensible" },
  { id: "4", timestamp: "10:22", wbgt: "35.6\u00B0C", action: "Monitoring interval increased", loggedTo: "Procore Daily Log", auditStatus: "defensible" },
  { id: "5", timestamp: "09:05", wbgt: "32.4\u00B0C", action: "Shift started under moderate conditions", loggedTo: "HammerTech", auditStatus: "defensible" },
  { id: "6", timestamp: "08:30", wbgt: "30.1\u00B0C", action: "Pre-shift WBGT assessment completed", loggedTo: "Procore Daily Log", auditStatus: "defensible" },
  { id: "7", timestamp: "07:15", wbgt: "28.7\u00B0C", action: "Site safety briefing logged", loggedTo: "Email to Supervisor", auditStatus: "pending" },
]

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const row = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0 },
}

/* ═══ Mobile Log Card ═══ */
function LogCard({ log }: { log: LogEntry }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-surface-2/30 p-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-xs font-bold text-primary">
        {log.timestamp}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium leading-tight">{log.action}</p>
        <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="font-mono font-bold text-foreground">{log.wbgt}</span>
          <span>·</span>
          <span>{log.loggedTo}</span>
        </div>
      </div>
      <Badge
        variant="outline"
        className={cn(
          "shrink-0 border px-1.5 py-0 text-[8px] font-semibold uppercase",
          log.auditStatus === "defensible"
            ? "border-success/30 bg-success/10 text-success"
            : "border-warning/30 bg-warning/10 text-warning"
        )}
      >
        {log.auditStatus === "defensible" ? "Defensible" : "Pending"}
      </Badge>
    </div>
  )
}

/* ═══ Main Component ═══ */
export function ComplianceLogTable() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-1/80 p-4 backdrop-blur-md sm:p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-sm font-semibold">OSHA Compliance Log</h3>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
          <Download className="size-3.5" />
          <span className="hidden sm:inline">Download PDF Audit Trail</span>
          <span className="sm:hidden">Export</span>
        </Button>
      </div>

      {/* Mobile: card list */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-2 sm:hidden">
        {LOGS.map((log) => (
          <motion.div key={log.id} variants={row}>
            <LogCard log={log} />
          </motion.div>
        ))}
      </motion.div>

      {/* Tablet+: table */}
      <div className="hidden overflow-x-auto rounded-xl border border-border sm:block">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead>Time</TableHead>
              <TableHead>WBGT</TableHead>
              <TableHead className="hidden md:table-cell">Action Taken</TableHead>
              <TableHead className="hidden lg:table-cell">Logged To</TableHead>
              <TableHead>Audit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <motion.tbody variants={stagger} initial="hidden" animate="show">
              {LOGS.map((log) => (
                <motion.tr
                  key={log.id}
                  variants={row}
                  className="border-border/50 hover:bg-surface-2/30 transition-colors"
                >
                  <TableCell className="font-mono text-xs tabular-nums">{log.timestamp}</TableCell>
                  <TableCell className="font-mono text-xs font-bold tabular-nums">{log.wbgt}</TableCell>
                  <TableCell className="text-xs hidden md:table-cell">{log.action}</TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{log.loggedTo}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "border gap-1 px-1.5 py-0 text-[9px] font-semibold uppercase",
                        log.auditStatus === "defensible"
                          ? "border-success/30 bg-success/10 text-success"
                          : "border-warning/30 bg-warning/10 text-warning"
                      )}
                    >
                      {log.auditStatus === "defensible" ? "Defensible" : "Pending"}
                    </Badge>
                  </TableCell>
                </motion.tr>
              ))}
            </motion.tbody>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
