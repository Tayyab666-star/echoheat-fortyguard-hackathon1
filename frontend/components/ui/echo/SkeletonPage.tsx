import { cn } from "@/lib/utils"

interface SkeletonBlockProps {
  className?: string
}

function SkeletonBlock({ className }: SkeletonBlockProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-surface-1/80 backdrop-blur-md",
        className
      )}
    >
      <div className="skeleton h-full w-full" />
    </div>
  )
}

export function SkeletonPage({ className }: { className?: string }) {
  return (
    <div
      data-slot="skeleton-page"
      className={cn("grid grid-cols-1 gap-4 md:grid-cols-12", className)}
    >
      {/* Row 1: Map (6) + Risk Score (3) + Fleet Status (3) */}
      <SkeletonBlock className="col-span-full h-[360px] lg:col-span-6" />
      <SkeletonBlock className="col-span-full h-[360px] sm:col-span-6 lg:col-span-3" />
      <SkeletonBlock className="col-span-full h-[360px] sm:col-span-6 lg:col-span-3" />

      {/* Row 2: 4 Metric Cards */}
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonBlock key={i} className="col-span-full h-[140px] sm:col-span-6 lg:col-span-3" />
      ))}

      {/* Row 3: Live Action Feed (full width) */}
      <SkeletonBlock className="col-span-full h-[240px]" />
    </div>
  )
}
