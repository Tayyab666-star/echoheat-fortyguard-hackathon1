"use client"

import * as React from "react"
import { BellRing, Volume2, Mail } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { useToast } from "@/lib/toast"

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

export function AlertsSettings() {
  const { toast } = useToast()
  const [wbgt, setWbgt] = React.useState([32])
  const [preCool, setPreCool] = React.useState([45])
  const [sound, setSound] = React.useState(true)
  const [digest, setDigest] = React.useState("daily")

  return (
    <div className="space-y-6">
      {/* WBGT Thresholds */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BellRing className="size-4 text-primary" />
          <h3 className="text-sm font-semibold">Alert Thresholds</h3>
        </div>

        <div className="space-y-5 rounded-xl border border-border bg-surface-1/60 p-4 backdrop-blur-sm">
          {/* WBGT Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs">WBGT Alert Threshold</Label>
              <span className="font-mono text-sm font-semibold text-primary">{wbgt[0]}°C</span>
            </div>
            <Slider
              value={wbgt}
              onValueChange={setWbgt}
              min={26}
              max={45}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>26°C (Conservative)</span>
              <span>45°C (Extreme)</span>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Pre-cool Lead Time */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Pre-cool Lead Time</Label>
              <span className="font-mono text-sm font-semibold text-primary">{preCool[0]} min</span>
            </div>
            <Slider
              value={preCool}
              onValueChange={setPreCool}
              min={15}
              max={120}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>15 min (Urgent)</span>
              <span>120 min (Early)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Volume2 className="size-4 text-primary" />
          <h3 className="text-sm font-semibold">Notification Preferences</h3>
        </div>

        <div className="space-y-3 rounded-xl border border-border bg-surface-1/60 p-4 backdrop-blur-sm">
          <SettingRow label="Alert Sound" description="Play a sound when critical alerts arrive">
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={sound}
                onChange={(e) => {
                  setSound(e.target.checked)
                  toast(`Alert sound ${e.target.checked ? "enabled" : "disabled"}`)
                }}
              />
              <div className="h-5 w-9 rounded-full bg-surface-3 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-border after:bg-background after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-primary-foreground" />
            </label>
          </SettingRow>

          <div className="h-px bg-border" />

          <SettingRow label="Email Digest" description="Receive a summary of alerts via email">
            <div className="flex gap-1 rounded-lg border border-border bg-surface-2 p-0.5">
              {(["daily", "weekly", "off"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setDigest(opt)
                    toast(`Email digest set to ${opt}`)
                  }}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium capitalize transition-colors ${
                    digest === opt
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </SettingRow>

          <div className="h-px bg-border" />

          <SettingRow label="Daily Digest" description="Summary email every morning at 6:00 AM">
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" className="peer sr-only" defaultChecked />
              <div className="h-5 w-9 rounded-full bg-surface-3 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-border after:bg-background after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-primary-foreground" />
            </label>
          </SettingRow>
        </div>
      </div>
    </div>
  )
}
