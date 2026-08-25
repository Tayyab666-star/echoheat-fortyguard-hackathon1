import { cn } from "@/lib/utils"

type StatusType =
  | "active"
  | "inactive"
  | "warning"
  | "critical"
  | "success"
  | "pending"
  | "executed"
  | "dismissed"
  | "online"
  | "offline"

interface StatusPillProps extends React.ComponentProps<"span"> {
  status: StatusType
  animated?: boolean
}

const STATUS_CONFIG: Record<StatusType, { dot: string; badge: string; label: string }> = {
  active:    { dot: "bg-success",  badge: "border-success/30 bg-success/10 text-success",  label: "Active" },
  inactive:  { dot: "bg-muted-foreground", badge: "border-border bg-surface-2 text-muted-foreground", label: "Inactive" },
  warning:   { dot: "bg-warning",  badge: "border-warning/30 bg-warning/10 text-warning",  label: "Warning" },
  critical:  { dot: "bg-danger",   badge: "border-danger/30 bg-danger/10 text-danger",     label: "Critical" },
  success:   { dot: "bg-success",  badge: "border-success/30 bg-success/10 text-success",  label: "Success" },
  pending:   { dot: "bg-warning",  badge: "border-warning/30 bg-warning/10 text-warning",  label: "Pending" },
  executed:  { dot: "bg-success",  badge: "border-success/30 bg-success/10 text-success",  label: "Executed" },
  dismissed: { dot: "bg-muted-foreground", badge: "border-border bg-surface-2 text-muted-foreground", label: "Dismissed" },
  online:    { dot: "bg-success",  badge: "border-success/30 bg-success/10 text-success",  label: "Online" },
  offline:   { dot: "bg-danger",   badge: "border-danger/30 bg-danger/10 text-danger",     label: "Offline" },
}

export function StatusPill({ status, animated = false, className, ...props }: StatusPillProps) {
  const cfg = STATUS_CONFIG[status]

  return (
    <span
      data-slot="status-pill"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        cfg.badge,
        className
      )}
      {...props}
    >
      <span className="relative flex size-1.5">
        {animated && (
          <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", cfg.dot)} />
        )}
        <span className={cn("relative inline-flex size-1.5 rounded-full", cfg.dot)} />
      </span>
      {cfg.label}
    </span>
  )
}
