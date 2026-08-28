import { cn } from "@/lib/utils"

interface LiveIndicatorProps extends React.ComponentProps<"span"> {
  label?: string
}

export function LiveIndicator({ label = "LIVE", className, ...props }: LiveIndicatorProps) {
  return (
    <span
      data-slot="live-indicator"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary",
        className
      )}
      {...props}
    >
      <span className="relative flex size-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-primary" />
      </span>
      {label}
    </span>
  )
}
