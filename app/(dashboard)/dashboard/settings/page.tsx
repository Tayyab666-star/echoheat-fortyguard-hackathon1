"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Bell,
  Shield,
  Zap,
  Globe,
  Save,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

function SectionCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface-1/80 p-4 sm:p-6 backdrop-blur-md">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="size-4 text-primary" />
        </div>
        <h3 className="font-mono text-sm font-semibold">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

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

export default function SettingsPage() {
  const [saved, setSaved] = React.useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-mono text-lg font-bold">Settings</h2>
          <p className="text-xs text-muted-foreground">Configure your EchoHeat platform preferences.</p>
        </div>
        <Button onClick={handleSave} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Save className="size-3.5" />
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Notifications */}
        <motion.div variants={item}>
          <SectionCard icon={Bell} title="Notifications">
            <SettingRow label="Critical Alerts" description="Push + email for critical thermal events">
              <Switch defaultChecked />
            </SettingRow>
            <SettingRow label="Warning Alerts" description="In-app notification for warnings">
              <Switch defaultChecked />
            </SettingRow>
            <SettingRow label="Daily Digest" description="Summary email every morning at 6:00 AM">
              <Switch />
            </SettingRow>
            <SettingRow label="Weekly Analytics Report" description="PDF report sent every Monday">
              <Switch defaultChecked />
            </SettingRow>
          </SectionCard>
        </motion.div>

        {/* Safety Thresholds */}
        <motion.div variants={item}>
          <SectionCard icon={Shield} title="Safety Thresholds">
            <SettingRow label="WBGT Alert Level (°C)">
              <Select defaultValue="32">
                <SelectTrigger className="w-24" aria-label="WBGT alert level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="28">28°C</SelectItem>
                  <SelectItem value="30">30°C</SelectItem>
                  <SelectItem value="32">32°C</SelectItem>
                  <SelectItem value="34">34°C</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
            <SettingRow label="Max Continuous Work (min)">
              <Select defaultValue="45">
                <SelectTrigger className="w-24" aria-label="Max work duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">60 min</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
            <SettingRow label="OSHA Auto-Log" description="Automatically file OSHA 300/301 logs on breach">
              <Switch defaultChecked />
            </SettingRow>
          </SectionCard>
        </motion.div>

        {/* Facility */}
        <motion.div variants={item}>
          <SectionCard icon={Zap} title="Facility & HVAC">
            <SettingRow label="Pre-Cooling Offset (hours)">
              <Select defaultValue="4">
                <SelectTrigger className="w-24" aria-label="Pre-cooling offset">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 hrs</SelectItem>
                  <SelectItem value="3">3 hrs</SelectItem>
                  <SelectItem value="4">4 hrs</SelectItem>
                  <SelectItem value="6">6 hrs</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
            <SettingRow label="Peak Shaving Mode" description="Automatically reduce HVAC load during peak tariff windows">
              <Switch defaultChecked />
            </SettingRow>
            <SettingRow label="Auto Demand Response">
              <Switch defaultChecked />
            </SettingRow>
          </SectionCard>
        </motion.div>

        {/* General */}
        <motion.div variants={item}>
          <SectionCard icon={Globe} title="General">
            <div className="space-y-2">
              <Label htmlFor="org-name" className="text-xs">Organization Name</Label>
              <Input id="org-name" defaultValue="FortyGuard Industries" className="h-9 text-sm" />
            </div>
            <SettingRow label="Default Zone">
              <Select defaultValue="karachi">
                <SelectTrigger className="w-48" aria-label="Default zone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="karachi">Karachi Industrial Zone</SelectItem>
                  <SelectItem value="lahore">Lahore Manufacturing Hub</SelectItem>
                  <SelectItem value="dubai">Dubai Logistics Corridor</SelectItem>
                  <SelectItem value="riyadh">Riyadh Energy Complex</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
            <SettingRow label="Temperature Unit">
              <Select defaultValue="celsius">
                <SelectTrigger className="w-28" aria-label="Temperature unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="celsius">°C Celsius</SelectItem>
                  <SelectItem value="fahrenheit">°F Fahrenheit</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
          </SectionCard>
        </motion.div>
      </div>
    </motion.div>
  )
}
