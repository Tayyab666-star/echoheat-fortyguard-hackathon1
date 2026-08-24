"use client"

import { MapPin, Thermometer, Droplets, Wind } from "lucide-react"

const FLOATING_STATS = [
  { icon: Thermometer, label: "Ambient", value: "42.1\u00B0C", color: "text-danger" },
  { icon: Droplets, label: "WBGT", value: "33.8\u00B0C", color: "text-warning" },
  { icon: Wind, label: "TRU Internal", value: "-18.2\u00B0C", color: "text-info" },
]

export function RouteHeatMap() {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-surface-2/60">
      {/* Map background */}
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20">
        <MapPin className="size-20" />
      </div>

      {/* Simulated heat corridors */}
      <div className="absolute top-[22%] left-[18%] size-24 rounded-full bg-danger/25 blur-3xl" />
      <div className="absolute top-[40%] left-[45%] size-20 rounded-full bg-warning/20 blur-3xl" />
      <div className="absolute top-[55%] left-[70%] size-16 rounded-full bg-success/15 blur-3xl" />

      {/* Route line hint */}
      <svg className="absolute inset-0 size-full" viewBox="0 0 800 450" aria-hidden="true">
        <path
          d="M 120 320 Q 280 280 350 200 Q 420 120 520 160 Q 620 200 700 140"
          fill="none"
          stroke="rgb(var(--primary))"
          strokeWidth="2.5"
          strokeDasharray="6 4"
          opacity="0.5"
        />
        <circle cx="120" cy="320" r="5" fill="rgb(var(--primary))" opacity="0.8" />
        <circle cx="700" cy="140" r="5" fill="rgb(var(--success))" opacity="0.8" />
      </svg>

      {/* Floating stat pills — top right */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5">
        {FLOATING_STATS.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-background/70 px-2.5 py-1.5 text-[11px] backdrop-blur-md"
            >
              <Icon className={`size-3 ${stat.color}`} />
              <span className="text-muted-foreground">{stat.label}</span>
              <span className={`font-mono font-bold tabular-nums ${stat.color}`}>
                {stat.value}
              </span>
            </div>
          )
        })}
      </div>

      {/* Bottom route metadata bar */}
      <div className="absolute bottom-0 inset-x-0 flex items-center gap-3 border-t border-white/10 bg-background/70 px-4 py-2.5 text-xs backdrop-blur-md">
        <span className="rounded-md bg-primary/15 px-2 py-0.5 font-mono text-xs font-bold text-primary">
          #KHI-07
        </span>
        <span className="text-muted-foreground">Next Stop:</span>
        <span className="font-medium">Distribution Hub A</span>
        <span className="ml-auto font-mono text-muted-foreground">ETA 14:32</span>
      </div>
    </div>
  )
}
