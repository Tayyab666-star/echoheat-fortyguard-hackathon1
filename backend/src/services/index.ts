import {
  ALERTS,
  SENSOR_SNAPSHOTS,
  EXECUTION_LOGS,
  VEHICLES,
  CHILLERS,
  SCHEDULE,
  BASELINE_DEMAND,
  OPTIMIZED_DEMAND,
  COMPLIANCE_LOGS,
  DISPATCH_ALERTS,
  SITES,
  SHIFT_BLOCKS,
  FEED_ENTRIES,
  FLEET_STATUS_METRICS,
  THERMAL_ZONES,
  MONTHLY_SAVINGS,
  INCIDENT_DATA,
  ROI_SEGMENTS,
  KPI_DATA,
} from "../data/mock"

import type {
  AlertData,
  Vehicle,
  Chiller,
  ScheduleItem,
  LogEntry,
  DispatchAlert,
  Site,
  FeedEntry,
  FleetStatusMetric,
  ThermalZone,
  SegmentROI,
  MonthlySavings,
  IncidentData,
  KPIData,
  SensorSnapshot,
  ExecutionLogEntry,
  AlertFilter,
} from "../../../shared/types"

// ── Alerts Service ──────────────────────────────────────────

export function getAlerts(filter?: AlertFilter, search?: string): AlertData[] {
  let results = [...ALERTS]

  if (filter && filter !== "all") {
    if (filter === "critical") results = results.filter((a) => a.severity === "CRITICAL")
    else if (filter === "warning") results = results.filter((a) => a.severity === "WARNING")
    else if (filter === "executed") results = results.filter((a) => a.status === "executed")
    else if (filter === "pending") results = results.filter((a) => a.status === "pending")
  }

  if (search) {
    const q = search.toLowerCase()
    results = results.filter(
      (a) =>
        a.asset.toLowerCase().includes(q) ||
        a.message.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q)
    )
  }

  return results
}

export function getAlertById(id: string): AlertData | undefined {
  return ALERTS.find((a) => a.id === id)
}

export function getSensorSnapshot(alertId: string): SensorSnapshot | undefined {
  return SENSOR_SNAPSHOTS[alertId]
}

export function getExecutionLog(alertId: string): ExecutionLogEntry[] {
  return EXECUTION_LOGS[alertId] ?? []
}

// ── Fleet Service ───────────────────────────────────────────

export function getVehicles(): Vehicle[] {
  return VEHICLES
}

export function getFleetStatusMetrics(): FleetStatusMetric[] {
  return FLEET_STATUS_METRICS
}

// ── Facility Service ────────────────────────────────────────

export function getChillers(): Chiller[] {
  return CHILLERS
}

export function getSchedule(): ScheduleItem[] {
  return SCHEDULE
}

export function getDemandCurves(): { baseline: number[]; optimized: number[] } {
  return { baseline: BASELINE_DEMAND, optimized: OPTIMIZED_DEMAND }
}

// ── Safety Service ──────────────────────────────────────────

export function getComplianceLogs(): LogEntry[] {
  return COMPLIANCE_LOGS
}

export function getDispatchAlerts(): DispatchAlert[] {
  return DISPATCH_ALERTS
}

export function getSites(): Site[] {
  return SITES
}

export function getShiftBlocks() {
  return SHIFT_BLOCKS
}

// ── Dashboard Service ───────────────────────────────────────

export function getFeedEntries(): FeedEntry[] {
  return FEED_ENTRIES
}

export function getThermalZones(): ThermalZone[] {
  return THERMAL_ZONES
}

// ── Analytics Service ───────────────────────────────────────

export function getMonthlySavings(): MonthlySavings {
  return MONTHLY_SAVINGS
}

export function getIncidentData(): IncidentData {
  return INCIDENT_DATA
}

export function getROISegments(): SegmentROI[] {
  return ROI_SEGMENTS
}

export function getKPIData(): KPIData[] {
  return KPI_DATA
}
