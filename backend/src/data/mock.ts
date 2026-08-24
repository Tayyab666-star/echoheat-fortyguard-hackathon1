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
} from "../../../shared/types"

// ── Alerts ──────────────────────────────────────────────────

export const ALERTS: AlertData[] = [
  {
    id: "ALT-001",
    severity: "CRITICAL",
    type: "OSHA_BREACH",
    asset: "KI-04",
    location: "Zone C, Site 3 \u2014 NUST Rd",
    message: "WBGT threshold exceeded at 41.2\u00B0C. OSHA action level breached. Mandatory rest enforcement required for all exposed crews.",
    timestamp: "3m ago",
    status: "pending",
    actions: [
      { label: "Dispatch Rest Alert", variant: "orange" },
      { label: "Log to Procore", variant: "ghost" },
    ],
  },
  {
    id: "ALT-002",
    severity: "CRITICAL",
    type: "ROUTE_RISK",
    asset: "DX-12",
    location: "Route DXB-12 \u2014 Dubai Logistics Corridor",
    message: "Thermal corridor Alpha exceeding 44\u00B0C ambient. Refrigerated cargo at risk of SLA breach within 18 minutes.",
    timestamp: "8m ago",
    status: "pending",
    actions: [
      { label: "Re-sequence Now", variant: "orange" },
      { label: "View Route", variant: "ghost" },
    ],
  },
  {
    id: "ALT-003",
    severity: "WARNING",
    type: "PRE_COOL",
    asset: "KI-07",
    location: "Zone A \u2014 Distribution Hub A",
    message: "Pre-cool recommended for Unit KI-07 before peak tariff window. Expected to save 340 kW peak demand if initiated by 14:00.",
    timestamp: "15m ago",
    status: "pending",
    actions: [
      { label: "Approve Pre-Cool", variant: "blue" },
      { label: "Dismiss", variant: "ghost" },
    ],
  },
  {
    id: "ALT-004",
    severity: "WARNING",
    type: "FACILITY_PEAK",
    asset: "HVAC-03",
    location: "Building B \u2014 Floor 3",
    message: "Peak demand window approaching. Current load 780 kW, projected to exceed 900 kW tariff threshold by 15:30.",
    timestamp: "22m ago",
    status: "pending",
    actions: [
      { label: "Execute Pre-Cool", variant: "blue" },
      { label: "View Schedule", variant: "ghost" },
    ],
  },
  {
    id: "ALT-005",
    severity: "INFO",
    type: "PRE_COOL",
    asset: "KI-01",
    location: "Zone B \u2014 DHA",
    message: "Pre-cooling cycle completed for Unit KI-01. Internal temperature stabilized at -22.1\u00B0C. System ready for dispatch.",
    timestamp: "1h ago",
    status: "executed",
    actions: [{ label: "View Details", variant: "ghost" }],
  },
  {
    id: "ALT-006",
    severity: "RESOLVED",
    type: "ROUTE_RISK",
    asset: "LH-05",
    location: "Route LHR-07 \u2014 Lahore Manufacturing Hub",
    message: "Route risk mitigated. Unit LH-05 successfully re-routed via thermal corridor Beta. ETA updated to 16:45.",
    timestamp: "2h ago",
    status: "executed",
    actions: [{ label: "View Route", variant: "ghost" }],
  },
  {
    id: "ALT-007",
    severity: "INFO",
    type: "FACILITY_PEAK",
    asset: "HVAC-01",
    location: "Building A \u2014 Main Hall",
    message: "Thermal mass charging initiated. Concrete slab absorbing excess heat load. Expected buffer: 2h 40min.",
    timestamp: "3h ago",
    status: "executed",
    actions: [{ label: "View Schedule", variant: "ghost" }],
  },
]

export const SENSOR_SNAPSHOTS: Record<string, SensorSnapshot> = {
  "ALT-001": {
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
  },
}

export const EXECUTION_LOGS: Record<string, ExecutionLogEntry[]> = {
  "ALT-001": [
    { time: "14:32:01", event: "Alert triggered by WBGT sensor KI-C-04" },
    { time: "14:32:03", event: "FortyGuard risk assessment: 87/100" },
    { time: "14:32:05", event: "Dispatching rest alert to foreman Ahmad R." },
    { time: "14:32:08", event: "SMS + push notification sent" },
    { time: "14:32:12", event: "Foreman acknowledged: confirmed" },
    { time: "14:32:15", event: "OSHA compliance log auto-generated" },
  ],
}

// ── Fleet / Vehicles ────────────────────────────────────────

export const VEHICLES: Vehicle[] = [
  { id: "KI-01", route: "Route KHI-01", cargoType: "Pharma", internalTemp: -22.1, status: "COMPLIANT" },
  { id: "KI-04", route: "Route KHI-04", cargoType: "Dairy", internalTemp: -18.4, status: "AT RISK" },
  { id: "KI-07", route: "Route KHI-07", cargoType: "Seafood", internalTemp: -20.2, status: "PRE-COOLING" },
  { id: "LH-02", route: "Route LHR-02", cargoType: "Vaccines", internalTemp: -25.0, status: "COMPLIANT" },
  { id: "DX-09", route: "Route DXB-09", cargoType: "Meat", internalTemp: -17.8, status: "AT RISK" },
  { id: "KI-11", route: "Route KHI-11", cargoType: "Frozen Goods", internalTemp: -21.5, status: "COMPLIANT" },
  { id: "LH-05", route: "Route LHR-05", cargoType: "Produce", internalTemp: -19.3, status: "REROUTING" },
  { id: "DX-03", route: "Route DXB-03", cargoType: "Beverages", internalTemp: -20.8, status: "COMPLIANT" },
]

// ── Facility / Chillers ─────────────────────────────────────

export const CHILLERS: Chiller[] = [
  { id: "CU-1", name: "Chiller Unit 1", load: 72, status: "AT-LOAD", setpoint: 19, actual: 18.8 },
  { id: "CU-2", name: "Chiller Unit 2", load: 0, status: "IDLE", setpoint: 19, actual: 21.4 },
  { id: "CU-3", name: "Chiller Unit 3", load: 84, status: "AT-LOAD", setpoint: 19, actual: 19.2 },
  { id: "CU-4", name: "Chiller Unit 4", load: 45, status: "PRE-COOLING", setpoint: 19, actual: 20.1 },
  { id: "CU-5", name: "Chiller Unit 5", load: 0, status: "FAULT", setpoint: 19, actual: 24.7 },
  { id: "CU-6", name: "Chiller Unit 6", load: 38, status: "IDLE", setpoint: 19, actual: 19.6 },
]

export const SCHEDULE: ScheduleItem[] = [
  { id: "SCH-1", time: "06:00 AM", description: "Pre-cool all zones", savings: "Save $1,200", status: "completed", overrideable: true },
  { id: "SCH-2", time: "08:30 AM", description: "Chiller stage down", savings: "Save $800", status: "completed", overrideable: true },
  { id: "SCH-3", time: "11:00 AM", description: "Thermal mass charging", savings: "Save $2,400", status: "active", overrideable: false },
  { id: "SCH-4", time: "02:00 PM", description: "Peak shaving", savings: "Save $3,100", status: "upcoming", overrideable: true },
  { id: "SCH-5", time: "05:30 PM", description: "Cycle complete", savings: "Total: $7,500", status: "upcoming", overrideable: false },
]

export const BASELINE_DEMAND = [
  320, 310, 300, 295, 290, 310, 380, 520, 680, 780, 840, 870,
  890, 910, 920, 900, 850, 720, 600, 520, 460, 420, 380, 340,
]

export const OPTIMIZED_DEMAND = [
  320, 310, 300, 295, 285, 290, 340, 420, 500, 560, 580, 590,
  540, 520, 500, 510, 480, 440, 420, 400, 380, 360, 350, 340,
]

// ── Safety / Compliance ─────────────────────────────────────

export const COMPLIANCE_LOGS: LogEntry[] = [
  { id: "LOG-1", timestamp: "06:00", wbgt: 28.7, action: "Pre-shift assessment completed", loggedTo: "Procore", auditStatus: "defensible" },
  { id: "LOG-2", timestamp: "08:30", wbgt: 31.2, action: "Hydration break enforced", loggedTo: "HammerTech", auditStatus: "defensible" },
  { id: "LOG-3", timestamp: "10:15", wbgt: 34.8, action: "Mandatory rest period initiated", loggedTo: "Procore", auditStatus: "defensible" },
  { id: "LOG-4", timestamp: "11:45", wbgt: 37.2, action: "Crew rotation executed", loggedTo: "Email", auditStatus: "defensible" },
  { id: "LOG-5", timestamp: "13:00", wbgt: 39.1, action: "Site shutdown recommended", loggedTo: "Procore", auditStatus: "pending" },
  { id: "LOG-6", timestamp: "14:30", wbgt: 40.5, action: "Emergency rest protocol activated", loggedTo: "HammerTech", auditStatus: "defensible" },
  { id: "LOG-7", timestamp: "15:45", wbgt: 41.2, action: "OSHA breach logged automatically", loggedTo: "Procore", auditStatus: "pending" },
]

export const DISPATCH_ALERTS: DispatchAlert[] = [
  { id: "DA-1", foreman: "Ahmad R.", contact: "+92 300 1234567", contactType: "phone", message: "WBGT exceeds 39\u00B0C. Mandatory rest.", time: "14:32", confirmed: true },
  { id: "DA-2", foreman: "Bilal K.", contact: "+92 321 7654321", contactType: "phone", message: "Zone C crew rotation required.", time: "14:35", confirmed: true },
  { id: "DA-3", foreman: "Farhan M.", contact: "farhan@buildco.pk", contactType: "email", message: "Pre-shift assessment overdue.", time: "14:38", confirmed: false },
  { id: "DA-4", foreman: "Omar S.", contact: "+92 333 9876543", contactType: "phone", message: "Hydration break enforced.", time: "14:41", confirmed: true },
  { id: "DA-5", foreman: "Zain A.", contact: "zain@construct.pk", contactType: "email", message: "Site shutdown recommendation.", time: "14:44", confirmed: false },
]

export const SITES: Site[] = [
  { id: "SITE-A", name: "Site A", address: "NUST Rd, Islamabad", risk: "high" },
  { id: "SITE-B", name: "Site B", address: "DHA, Lahore", risk: "moderate" },
  { id: "SITE-C", name: "Site C", address: "Port Qasim, Karachi", risk: "critical" },
]

export const SHIFT_BLOCKS = [
  { start: 0, duration: 30, type: "work" as const },
  { start: 30, duration: 90, type: "rest" as const },
  { start: 120, duration: 30, type: "work" as const },
  { start: 150, duration: 90, type: "rest" as const },
  { start: 240, duration: 30, type: "work" as const },
  { start: 270, duration: 90, type: "rest" as const },
  { start: 360, duration: 30, type: "work" as const },
  { start: 390, duration: 90, type: "rest" as const },
  { start: 480, duration: 30, type: "work" as const },
  { start: 510, duration: 90, type: "rest" as const },
  { start: 600, duration: 30, type: "work" as const },
  { start: 630, duration: 90, type: "rest" as const },
]

// ── Live Feed ───────────────────────────────────────────────

export const FEED_ENTRIES: FeedEntry[] = [
  { id: "FE-1", timestamp: "14:32", type: "PRE_COOL", description: "Pre-cooling initiated for KI-07 at Zone A", status: "completed" },
  { id: "FE-2", timestamp: "14:28", type: "REROUTE", description: "Route DXB-12 re-sequencing in progress", status: "in-progress" },
  { id: "FE-3", timestamp: "14:15", type: "REST_DISPATCH", description: "Rest alert dispatched to Site C crews", status: "completed" },
  { id: "FE-4", timestamp: "14:02", type: "ALERT", description: "WBGT threshold exceeded at Zone C", status: "failed" },
  { id: "FE-5", timestamp: "13:45", type: "PRE_COOL", description: "Pre-cooling cycle complete for KI-01", status: "completed" },
  { id: "FE-6", timestamp: "13:30", type: "REROUTE", description: "Fleet reroute completed: LH-05 via corridor Beta", status: "completed" },
]

// ── Fleet Status ────────────────────────────────────────────

export const FLEET_STATUS_METRICS: FleetStatusMetric[] = [
  { label: "Total Active Vehicles", value: "50", badge: "Live", badgeColor: "text-success", sparkline: [42, 44, 46, 48, 50, 49, 50, 50] },
  { label: "Pre-Cooling Active", value: "12", badge: "Running", badgeColor: "text-primary", sparkline: [8, 10, 11, 12, 14, 13, 12, 12] },
  { label: "Routes Re-sequenced Today", value: "7", badge: "+2", badgeColor: "text-primary", sparkline: [3, 4, 5, 5, 6, 6, 7, 7] },
  { label: "SLA Breaches Avoided", value: "3", badge: "Good", badgeColor: "text-success", sparkline: [1, 1, 2, 2, 2, 3, 3, 3] },
]

// ── Thermal Zones ───────────────────────────────────────────

export const THERMAL_ZONES: ThermalZone[] = [
  { label: "Critical", range: ">44.5\u00B0C", color: "text-danger", count: 1 },
  { label: "Warning", range: "38\u201344\u00B0C", color: "text-primary", count: 2 },
  { label: "Safe", range: "<38\u00B0C", color: "text-success", count: 9 },
]

// ── Analytics ───────────────────────────────────────────────

export const MONTHLY_SAVINGS: MonthlySavings = {
  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  avoidedLoss: [142000, 158000, 165000, 178000, 192000, 188000, 195000, 201000, 187000, 174000, 156000, 148000],
  echoheatCost: [12800, 13200, 13800, 14200, 14800, 14500, 15200, 15600, 14800, 13900, 13100, 12600],
}

export const INCIDENT_DATA: IncidentData = {
  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  withoutEchoHeat: [14, 18, 22, 28, 34, 38, 42, 40, 36, 28, 20, 16],
  withEchoHeat: [4, 5, 6, 7, 8, 9, 10, 9, 8, 6, 5, 4],
}

export const ROI_SEGMENTS: SegmentROI[] = [
  {
    key: "cold_chain",
    label: "Cold Chain",
    annualCost: "$142,800",
    avoidedLoss: [
      { label: "Cargo Loss Prevention", value: "$84,200" },
      { label: "Fuel Optimization", value: "$38,400" },
      { label: "SLA Breach Avoidance", value: "$52,600" },
      { label: "Vehicle Maintenance", value: "$18,200" },
    ],
    netROI: "14.6x",
  },
  {
    key: "construction",
    label: "Construction",
    annualCost: "$96,400",
    avoidedLoss: [
      { label: "OSHA Penalty Avoidance", value: "$120,000" },
      { label: "Workers Comp Reduction", value: "$68,400" },
      { label: "Productivity Recovery", value: "$42,800" },
      { label: "Equipment Downtime", value: "$24,600" },
    ],
    netROI: "11.6x",
  },
  {
    key: "facility",
    label: "Facility",
    annualCost: "$186,200",
    avoidedLoss: [
      { label: "Peak Demand Shaving", value: "$94,200" },
      { label: "HVAC Longevity", value: "$32,800" },
      { label: "Thermal Mass Storage", value: "$28,400" },
      { label: "Occupant Comfort", value: "$14,200" },
    ],
    netROI: "2.8x",
  },
]

export const KPI_DATA: KPIData[] = [
  {
    label: "Total Savings (YTD)",
    currentValue: "$2.14M",
    color: "rgb(var(--primary))",
    trend: { value: "+18% YoY", direction: "up" },
    data: [82, 88, 92, 98, 104, 112, 118, 126, 132, 140, 148, 156, 162, 170, 178, 184, 192, 198, 206, 212, 218, 224, 230, 236, 242, 248, 254, 260, 266, 272],
  },
  {
    label: "Incidents Prevented",
    currentValue: "284",
    color: "rgb(var(--success))",
    trend: { value: "+32% vs plan", direction: "up" },
    data: [4, 6, 8, 12, 18, 24, 32, 38, 44, 52, 58, 64, 72, 78, 86, 94, 102, 110, 118, 126, 136, 146, 156, 168, 178, 190, 202, 216, 232, 248],
  },
  {
    label: "Avg WBGT Reduction",
    currentValue: "4.2\u00B0C",
    color: "rgb(var(--warning))",
    trend: { value: "Stable", direction: "flat" },
    data: [3.1, 3.2, 3.4, 3.3, 3.5, 3.6, 3.8, 3.9, 4.0, 4.1, 4.0, 4.1, 4.2, 4.1, 4.2, 4.3, 4.2, 4.1, 4.2, 4.2, 4.3, 4.2, 4.1, 4.2, 4.2, 4.3, 4.2, 4.2, 4.1, 4.2],
  },
  {
    label: "Fleet Uptime",
    currentValue: "99.2%",
    color: "rgb(var(--success))",
    trend: { value: "+0.4% MoM", direction: "up" },
    data: [97.2, 97.4, 97.6, 97.8, 98.0, 98.1, 98.3, 98.4, 98.6, 98.7, 98.8, 98.9, 98.9, 99.0, 99.0, 99.1, 99.1, 99.1, 99.2, 99.2, 99.2, 99.2, 99.2, 99.2, 99.2, 99.2, 99.2, 99.2, 99.2, 99.2],
  },
]
