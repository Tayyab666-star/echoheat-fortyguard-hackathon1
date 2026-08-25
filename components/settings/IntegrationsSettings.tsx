"use client"

import * as React from "react"
import {
  Link2,
  CheckCircle2,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Integration {
  id: string
  name: string
  description: string
  connected: boolean
  icon: string
  docsUrl?: string
  apiKey?: string
  quota?: { used: number; total: number }
}

const INTEGRATIONS: Integration[] = [
  {
    id: "samsara",
    name: "Samsara",
    description: "Fleet telematics and vehicle health monitoring",
    connected: true,
    icon: "\uD83D\uDE9B",
  },
  {
    id: "procore",
    name: "Procore",
    description: "Construction project management and safety logs",
    connected: true,
    icon: "\uD83C\uDFD7\uFE0F",
  },
  {
    id: "bacnet",
    name: "BACnet",
    description: "Building automation and HVAC control protocol",
    connected: false,
    docsUrl: "#",
    icon: "\uD83C\uDFED",
  },
  {
    id: "fortyguard",
    name: "FortyGuard API",
    description: "Thermal intelligence and heat risk scoring engine",
    connected: true,
    icon: "\uD83D\uDD25",
    apiKey: "fg_28x9k3m4821",
    quota: { used: 14200, total: 50000 },
  },
]

function IntegrationCard({ integration }: { integration: Integration }) {
  const [showKey, setShowKey] = React.useState(false)

  return (
    <div className="rounded-xl border border-border bg-surface-1/60 p-4 backdrop-blur-sm">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-lg">
          {integration.icon}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">{integration.name}</p>
            {integration.connected ? (
              <Badge variant="default" className="gap-1 bg-success/15 text-success border-success/20">
                <CheckCircle2 className="size-3" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                Not Connected
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{integration.description}</p>

          {/* API Key (FortyGuard only) */}
          {integration.apiKey && (
            <div className="mt-3 space-y-2">
              <Label className="text-[11px] text-muted-foreground">API Key</Label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={showKey ? integration.apiKey : integration.apiKey.replace(/.(?=.{4})/g, "*")}
                  className="h-8 w-48 font-mono text-xs"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-8 p-0"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </Button>
                <Button variant="ghost" size="sm" className="size-8 p-0">
                  <Copy className="size-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Quota (FortyGuard only) */}
          {integration.quota && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">API Quota</span>
                <span className="font-mono text-foreground">
                  {integration.quota.used.toLocaleString()} / {integration.quota.total.toLocaleString()}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-3">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${(integration.quota.used / integration.quota.total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action */}
        <div className="shrink-0">
          {integration.connected ? (
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-danger">
              Disconnect
            </Button>
          ) : (
            <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
              <Link2 className="size-3" />
              Connect
            </Button>
          )}
        </div>
      </div>

      {/* Setup guide link */}
      {!integration.connected && integration.docsUrl && (
        <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-surface-2/50 px-3 py-2 text-xs text-muted-foreground">
          <ExternalLink className="size-3" />
          <a href={integration.docsUrl} className="hover:text-foreground hover:underline">
            View setup guide for {integration.name}
          </a>
        </div>
      )}
    </div>
  )
}

export function IntegrationsSettings() {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <Link2 className="size-4 text-primary" />
          <h3 className="text-sm font-semibold">Connected Services</h3>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Manage external integrations and data sources
        </p>
      </div>

      <div className="space-y-3">
        {INTEGRATIONS.map((intg) => (
          <IntegrationCard key={intg.id} integration={intg} />
        ))}
      </div>
    </div>
  )
}
