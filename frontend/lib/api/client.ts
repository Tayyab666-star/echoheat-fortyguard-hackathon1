const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

async function fetchAPI<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(error.error ?? `API error: ${res.status}`)
  }

  return res.json()
}

// ── Alerts ──────────────────────────────────────────────────

export async function fetchAlerts(filter?: string, search?: string) {
  const params = new URLSearchParams()
  if (filter && filter !== "all") params.set("filter", filter)
  if (search) params.set("search", search)
  const qs = params.toString()
  return fetchAPI<{ alerts: import("@shared/types").AlertData[]; total: number }>(
    `/api/v1/alerts${qs ? `?${qs}` : ""}`
  )
}

export async function fetchAlertDetail(id: string) {
  return fetchAPI<{
    alert: import("@shared/types").AlertData
    snapshot: import("@shared/types").SensorSnapshot | undefined
    executionLog: import("@shared/types").ExecutionLogEntry[]
  }>(`/api/v1/alerts/${id}`)
}

export async function executeAlertAction(id: string) {
  return fetchAPI<{ success: boolean; message: string; executedAt: string }>(
    `/api/v1/alerts/${id}/execute`,
    { method: "POST" }
  )
}

export async function dismissAlert(id: string) {
  return fetchAPI<{ success: boolean; message: string; dismissedAt: string }>(
    `/api/v1/alerts/${id}/dismiss`,
    { method: "POST" }
  )
}

export async function markAllAlertsRead() {
  return fetchAPI<{ success: boolean; message: string; markedAt: string }>(
    "/api/v1/alerts/mark-all-read",
    { method: "POST" }
  )
}

// ── Fleet ───────────────────────────────────────────────────

export async function fetchVehicles() {
  return fetchAPI<{ vehicles: import("@shared/types").Vehicle[]; total: number }>("/api/v1/assets?type=vehicle")
}

export async function fetchFleetStatus() {
  return fetchAPI<{ metrics: import("@shared/types").FleetStatusMetric[] }>("/api/v1/assets/status")
}

export async function rerouteVehicle(id: string) {
  return fetchAPI<{ success: boolean; message: string }>(`/api/v1/assets/${id}/reroute`, { method: "POST" })
}

export async function precoolVehicle(id: string) {
  return fetchAPI<{ success: boolean; message: string }>(`/api/v1/assets/${id}/precool`, { method: "POST" })
}

// ── Facility ────────────────────────────────────────────────

export async function fetchChillers() {
  return fetchAPI<{ chillers: import("@shared/types").Chiller[]; total: number }>("/api/v1/assets?type=facility")
}

export async function fetchSchedule() {
  return fetchAPI<{ schedule: import("@shared/types").ScheduleItem[] }>("/api/v1/thermal-engine/schedule")
}

export async function fetchDemandCurves() {
  return fetchAPI<{ baseline: number[]; optimized: number[] }>("/api/v1/analytics/demand-curve")
}

// ── Safety ──────────────────────────────────────────────────

export async function fetchComplianceLogs() {
  return fetchAPI<{ logs: import("@shared/types").LogEntry[]; total: number }>("/api/v1/analytics/compliance")
}

export async function fetchDispatchAlerts() {
  return fetchAPI<{ alerts: import("@shared/types").DispatchAlert[]; total: number }>("/api/v1/alerts?status=pending")
}

export async function fetchSites() {
  return fetchAPI<{ sites: import("@shared/types").Site[] }>("/api/v1/assets?type=site")
}

// ── Dashboard / Analytics ───────────────────────────────────

export async function fetchFeedEntries() {
  return fetchAPI<{ entries: import("@shared/types").FeedEntry[]; total: number }>("/api/v1/alerts?limit=10")
}

export async function fetchThermalZones() {
  return fetchAPI<{ zones: import("@shared/types").ThermalZone[] }>("/api/v1/assets/zones")
}

export async function fetchMonthlySavings() {
  return fetchAPI<import("@shared/types").MonthlySavings>("/api/v1/analytics/roi")
}

export async function fetchIncidentData() {
  return fetchAPI<import("@shared/types").IncidentData>("/api/v1/analytics/alerts/trends")
}

export async function fetchROISegments() {
  return fetchAPI<{
    segments: import("@shared/types").SegmentROI[]
    totalCost: string
    totalAvoided: string
    blendedROI: string
  }>("/api/v1/analytics/roi")
}

export async function fetchKPIData() {
  return fetchAPI<{ kpi: import("@shared/types").KPIData[] }>("/api/v1/analytics/overview")
}
