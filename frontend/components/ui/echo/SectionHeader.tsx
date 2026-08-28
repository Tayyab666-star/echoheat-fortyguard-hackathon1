import { cn } from "@/lib/utils"

interface SectionHeaderProps extends React.ComponentProps<"div"> {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function SectionHeader({ title, subtitle, action, className, ...props }: SectionHeaderProps) {
  return (
    <div
      data-slot="section-header"
      className={cn("flex items-center justify-between", className)}
      {...props}
    >
      <div className="flex flex-col gap-0.5">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
