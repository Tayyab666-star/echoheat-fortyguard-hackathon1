"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Globe,
  Palette,
  Link2,
  BellRing,
  Users,
  Key,
  Save,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/lib/toast"
import { PageTitle, CardTitle } from "@/components/ui/echo/Text"
import { AppearanceSettings } from "@/components/settings/AppearanceSettings"
import { GeneralSettings } from "@/components/settings/GeneralSettings"
import { IntegrationsSettings } from "@/components/settings/IntegrationsSettings"
import { AlertsSettings } from "@/components/settings/AlertsSettings"
import { TeamSettings } from "@/components/settings/TeamSettings"
import { ApiKeysSettings } from "@/components/settings/ApiKeysSettings"

const TABS = [
  { id: "general", label: "General", icon: Globe },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "integrations", label: "Integrations", icon: Link2 },
  { id: "alerts", label: "Alerts", icon: BellRing },
  { id: "team", label: "Team", icon: Users },
  { id: "api-keys", label: "API Keys", icon: Key },
] as const

type TabId = (typeof TABS)[number]["id"]

const fade = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
}

function SettingsTabContent({ tab }: { tab: TabId }) {
  switch (tab) {
    case "general":
      return <GeneralSettings />
    case "appearance":
      return <AppearanceSettings />
    case "integrations":
      return <IntegrationsSettings />
    case "alerts":
      return <AlertsSettings />
    case "team":
      return <TeamSettings />
    case "api-keys":
      return <ApiKeysSettings />
    default:
      return null
  }
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<TabId>("general")
  const [saved, setSaved] = React.useState(false)
  const { toast } = useToast()

  const handleSave = () => {
    setSaved(true)
    toast("Settings saved successfully")
    setTimeout(() => setSaved(false), 2000)
  }

  const activeTabMeta = TABS.find((t) => t.id === activeTab)

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <PageTitle>Settings</PageTitle>
          <p className="text-xs text-text-muted">Configure your EchoHeat platform preferences.</p>
        </div>
        <Button
          onClick={handleSave}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Save className="size-3.5" />
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      {/* Main layout: Sidebar tabs + Content */}
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
        {/* ── Desktop: Vertical Tab Strip ─────────────────────── */}
        <nav className="hidden w-56 shrink-0 lg:block" aria-label="Settings tabs">
          <ul className="space-y-0.5" role="list">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="flex-1 text-left">{tab.label}</span>
                    {isActive && <ChevronRight className="size-3.5 text-primary/60" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* ── Mobile: Horizontal Scroll Strip ─────────────────── */}
        <div className="scrollbar-thin flex gap-1 overflow-x-auto pb-1 lg:hidden">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                  isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-strong hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* ── Content Area ────────────────────────────────────── */}
        <div className="min-w-0 flex-1">
          <motion.div
            key={activeTab}
            variants={fade}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <div className="mb-4">
              <CardTitle>{activeTabMeta?.label}</CardTitle>
              <p className="mt-1 text-xs text-text-muted">
                {activeTab === "general" && "Manage organization details, locale, and display preferences."}
                {activeTab === "appearance" && "Customize the look and feel of your dashboard."}
                {activeTab === "integrations" && "Connect external services and manage data sources."}
                {activeTab === "alerts" && "Configure alert thresholds, sounds, and notification schedules."}
                {activeTab === "team" && "Manage team members, roles, and invitations."}
                {activeTab === "api-keys" && "Generate and manage API keys for programmatic access."}
              </p>
            </div>
            <SettingsTabContent tab={activeTab} />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
