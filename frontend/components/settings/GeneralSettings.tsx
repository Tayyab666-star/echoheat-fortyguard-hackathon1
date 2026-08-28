"use client"

import * as React from "react"
import { Building2, Clock, Globe, Languages } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

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

export function GeneralSettings() {
  return (
    <div className="space-y-6">
      {/* Organization */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="size-4 text-primary" />
          <h3 className="text-sm font-semibold">Organization</h3>
        </div>
        <div className="space-y-3 rounded-xl border border-border bg-surface-1/60 p-4 backdrop-blur-sm">
          <div className="space-y-2">
            <Label htmlFor="org-name" className="text-xs">Organization Name</Label>
            <Input id="org-name" defaultValue="FortyGuard Industries" className="h-9 text-sm" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-id" className="text-xs">Organization ID</Label>
            <Input id="org-id" defaultValue="org_fg_28x9k3m" disabled className="h-9 text-sm font-mono text-xs" />
          </div>
        </div>
      </div>

      {/* Locale */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="size-4 text-primary" />
          <h3 className="text-sm font-semibold">Locale & Time</h3>
        </div>
        <div className="space-y-3 rounded-xl border border-border bg-surface-1/60 p-4 backdrop-blur-sm">
          <SettingRow label="Timezone">
            <Select defaultValue="asia-karachi">
              <SelectTrigger className="w-56" aria-label="Timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asia-karachi">Asia/Karachi (PKT +5)</SelectItem>
                <SelectItem value="asia-dubai">Asia/Dubai (GST +4)</SelectItem>
                <SelectItem value="asia-riyadh">Asia/Riyadh (AST +3)</SelectItem>
                <SelectItem value="europe-london">Europe/London (GMT +0)</SelectItem>
                <SelectItem value="america-new_york">America/New_York (EST -5)</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>

          <SettingRow label="Date Format">
            <Select defaultValue="dd-mm-yyyy">
              <SelectTrigger className="w-40" aria-label="Date format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>

          <SettingRow label="Time Format">
            <Select defaultValue="24h">
              <SelectTrigger className="w-32" aria-label="Time format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24-hour</SelectItem>
                <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
        </div>
      </div>

      {/* Language */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Languages className="size-4 text-primary" />
          <h3 className="text-sm font-semibold">Language</h3>
        </div>
        <div className="space-y-3 rounded-xl border border-border bg-surface-1/60 p-4 backdrop-blur-sm">
          <SettingRow label="Display Language">
            <Select defaultValue="en">
              <SelectTrigger className="w-44" aria-label="Language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ur" disabled>
                  Urdu <Badge variant="secondary" className="ml-2 text-[9px]">Coming Soon</Badge>
                </SelectItem>
                <SelectItem value="ar" disabled>
                  Arabic <Badge variant="secondary" className="ml-2 text-[9px]">Coming Soon</Badge>
                </SelectItem>
                <SelectItem value="zh" disabled>
                  Chinese <Badge variant="secondary" className="ml-2 text-[9px]">Coming Soon</Badge>
                </SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
        </div>
      </div>
    </div>
  )
}
