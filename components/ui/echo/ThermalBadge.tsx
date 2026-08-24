import { cn } from "@/lib/utils"

type ThermalLevel = "safe" | "moderate" | "high" | "critical"

interface ThermalBadgeProps extends React.ComponentProps<"span"> {
  level: ThermalLevel
  value: number | string
  unit?: string
}

const LEVEL_CONFIG: Record<ThermalLevel, { dot: string; badge: string; pulse: boolean }> = {
  safe: {
    dot: "bg-success",
    badge: "border-success/30 bg-success/10 text-success",
    pulse: false,
  },
  moderate: {
    dot: "bg-warning",
    badge: "border-warning/30 bg-warning/10 text-warning",
    pulse: false,
  },
  high: {
    dot: "bg-primary",
    badge: "border-primary/30 bg-primary/10 text-primary",
    pulse: false,
  },
  critical: {
    dot: "bg-danger",
    badge: "border-danger/30 bg-danger/10 text-danger",
    pulse: true,
  },
}

export function ThermalBadge({ level, value, unit = "\u00B0C", className, ...props }: ThermalBadgeProps) {
  const cfg = LEVEL_CONFIG[level]

  return (
    <span
      data-slot="thermal-badge"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        cfg.badge,
        className
      )}
      {...props}
    >
      <span className="relative flex size-1.5">
        {cfg.pulse && (
          <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", cfg.dot)} />
        )}
        <span className={cn("relative inline-flex size-1.5 rounded-full", cfg.dot)} />
      </span>
      <span className="font-mono text-xs font-bold tabular-nums">{value}</span>
      {unit && <span className="text-[10px] opacity-70">{unit}</span>}
    </span>
  )
}
