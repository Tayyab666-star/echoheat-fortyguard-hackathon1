"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import type { AlertData } from "@/components/alerts/AlertCard"

interface AlertDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  alert: AlertData | null
}

const MOCK_SNAPSHOT = {
  "sensor.reading.wbgt": 41.2,
  "sensor.reading.ambient": 42.1,
  "sensor.reading.humidity": 68,
  "asset.zone": "Zone C",
  "asset.region": "Karachi Industrial",
  "osha.action_level": 32,
  "osha.rest_ratio": "10/50",
  "fortyguard.risk_score": 87,
  "fortyguard.confidence": 0.94,
  "thermal.kinetics.t_lag": "2h 40m",
  "thermal.kinetics.heat_flux": 847,
}

const MOCK_EXEC_LOG = [
  { time: "14:32:01", event: "Alert triggered by WBGT sensor KI-C-04" },
  { time: "14:32:03", event: "FortyGuard risk assessment: 87/100" },
  { time: "14:32:05", event: "Dispatching rest alert to foreman Ahmad R." },
  { time: "14:32:08", event: "SMS + push notification sent" },
  { time: "14:32:12", event: "Foreman acknowledged: confirmed" },
  { time: "14:32:15", event: "OSHA compliance log auto-generated" },
]

export function AlertDetailDialog({ open, onOpenChange, alert }: AlertDetailDialogProps) {
  if (!alert) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono text-lg">{alert.asset} — {alert.type.replace("_", " ")}</DialogTitle>
          <DialogDescription>{alert.message}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          {/* Context */}
          <div>
            <h4 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Context</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-white/10 bg-surface-2/40 p-2">
                <span className="text-muted-foreground">Severity</span>
                <p className="font-bold">{alert.severity}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-surface-2/40 p-2">
                <span className="text-muted-foreground">Location</span>
                <p className="font-bold">{alert.location}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-surface-2/40 p-2">
                <span className="text-muted-foreground">Timestamp</span>
                <p className="font-mono font-bold">{alert.timestamp}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-surface-2/40 p-2">
                <span className="text-muted-foreground">Status</span>
                <p className="font-bold">{alert.status}</p>
              </div>
            </div>
          </div>

          <Separator className="bg-white/10" />

          {/* FortyGuard Data Snapshot */}
          <div>
            <h4 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">FortyGuard Data Snapshot</h4>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {Object.entries(MOCK_SNAPSHOT).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between rounded border border-white/5 bg-surface-2/30 px-2 py-1">
                  <span className="font-mono text-[10px] text-muted-foreground">{key}</span>
                  <span className="font-mono font-bold">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-white/10" />

          {/* Thermal Kinetics */}
          <div>
            <h4 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Thermal Kinetics Output</h4>
            <div className="rounded-lg border border-white/10 bg-surface-2/40 p-3 font-mono text-xs">
              <p>q = U × A × ΔT = 0.28 × 420 × (42.1 - 19.0) = <span className="text-primary font-bold">2,720 W</span></p>
              <p className="mt-1">t_lag = (ρ × c × V) / (U × A) = <span className="text-primary font-bold">9,600 s ≈ 2h 40m</span></p>
            </div>
          </div>

          <Separator className="bg-white/10" />

          {/* Action Execution Log */}
          <div>
            <h4 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action Execution Log</h4>
            <div className="flex flex-col gap-1">
              {MOCK_EXEC_LOG.map((entry, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="font-mono text-[10px] text-muted-foreground shrink-0">{entry.time}</span>
                  <span>{entry.event}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-white/10" />

          {/* Raw JSON */}
          <div>
            <h4 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Raw JSON Payload</h4>
            <pre className="overflow-x-auto rounded-lg border border-white/10 bg-surface-2 p-4 font-mono text-[10px] leading-relaxed text-muted-foreground">
{JSON.stringify({
  alert_id: alert.id,
  severity: alert.severity,
  type: alert.type,
  asset: alert.asset,
  location: alert.location,
  message: alert.message,
  timestamp: alert.timestamp,
  status: alert.status,
  sensor_data: MOCK_SNAPSHOT,
}, null, 2)}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
