import { cn } from "@/lib/utils"

interface GlassCardProps extends React.ComponentProps<"div"> {
  padding?: "none" | "sm" | "md" | "lg"
}

const PADDING_MAP = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
}

export function GlassCard({ children, className, padding = "md", ...props }: GlassCardProps) {
  return (
    <div
      data-slot="glass-card"
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl",
        PADDING_MAP[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
