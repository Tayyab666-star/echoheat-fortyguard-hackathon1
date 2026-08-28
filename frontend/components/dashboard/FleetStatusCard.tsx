"use client"

import { Truck } from "lucide-react"

interface StatRowProps {
  label: string
  value: string | number
  badge?: { text: string; variant: 'success' | 'warning' | 'info' | 'danger' }
}

function StatRow({ label, value, badge }: StatRowProps) {
  return (
    <div className="flex flex-col gap-1 py-2.5 border-b border-[rgba(63,63,70,0.3)] last:border-0 min-w-0">
      <span className="text-[11px] text-[#A1A1AA] font-medium leading-snug whitespace-normal break-words">
        {label}
      </span>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white leading-none tabular-nums">
          {value}
        </span>
        {badge && (
          <span className={`
            text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0
            ${badge.variant === 'success' ? 'bg-emerald-500/15 text-emerald-400' : ''}
            ${badge.variant === 'warning' ? 'bg-orange-500/15 text-orange-400' : ''}
            ${badge.variant === 'info'    ? 'bg-sky-500/15 text-sky-400'    : ''}
            ${badge.variant === 'danger'  ? 'bg-red-500/15 text-red-400'  : ''}
          `}>
            {badge.text}
          </span>
        )}
      </div>
    </div>
  )
}

export function FleetStatusCard() {
  return (
    <div className="
      bg-[#18181B] rounded-2xl border border-[rgba(63,63,70,0.6)]
      shadow-lg p-5
      flex flex-col h-full
      min-w-0
    ">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-orange-500/10">
          <Truck className="size-4 text-orange-400" />
        </div>
        <h3 className="text-sm font-semibold text-white">Truck Fleet Status</h3>
      </div>

      <StatRow label="Trucks on the road" value={50} />
      <StatRow
        label="Cooling in advance"
        value={12}
        badge={{ text: 'Running', variant: 'success' }}
      />
      <StatRow
        label="Routes changed today"
        value={7}
        badge={{ text: 'Today', variant: 'warning' }}
      />
      <StatRow
        label="Delivery problems avoided"
        value={3}
        badge={{ text: 'Saved', variant: 'info' }}
      />
    </div>
  )
}
