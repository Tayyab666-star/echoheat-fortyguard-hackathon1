"use client"

import * as React from "react"
import {
  Key,
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/lib/toast"

interface ApiKey {
  id: string
  name: string
  key: string
  created: string
  lastUsed: string
  scopes: string[]
}

const MOCK_KEYS: ApiKey[] = [
  {
    id: "key_1",
    name: "Production Dashboard",
    key: "fg_prod_28x9k3m4821xxxx",
    created: "2026-01-15",
    lastUsed: "2 hours ago",
    scopes: ["read", "telemetry", "alerts"],
  },
  {
    id: "key_2",
    name: "Staging Environment",
    key: "fg_stg_9z7y3w1x4521xxxx",
    created: "2026-03-20",
    lastUsed: "5 days ago",
    scopes: ["read", "telemetry"],
  },
  {
    id: "key_3",
    name: "Mobile App SDK",
    key: "fg_mbl_p2q8r5t6v3n1xxxx",
    created: "2026-06-01",
    lastUsed: "Just now",
    scopes: ["read"],
  },
]

function KeyRow({ apiKey, onCopy }: { apiKey: ApiKey; onCopy: (key: string) => void }) {
  const [show, setShow] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const handleCopy = () => {
    onCopy(apiKey.key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-1/60 px-4 py-3 backdrop-blur-sm transition-colors hover:bg-surface-1">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-2">
        <Key className="size-4 text-muted-foreground" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{apiKey.name}</p>
          <div className="flex gap-1">
            {apiKey.scopes.map((s) => (
              <Badge key={s} variant="secondary" className="text-[9px] px-1.5 py-0">
                {s}
              </Badge>
            ))}
          </div>
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <code className="font-mono text-[11px] text-muted-foreground">
            {show ? apiKey.key : apiKey.key.replace(/.(?=.{8})/g, "*")}
          </code>
          <span className="text-[10px] text-muted-foreground">·</span>
          <span className="text-[10px] text-muted-foreground">Created {apiKey.created}</span>
          <span className="text-[10px] text-muted-foreground">·</span>
          <span className="text-[10px] text-muted-foreground">Last used {apiKey.lastUsed}</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className="size-7 p-0" onClick={() => setShow(!show)}>
          {show ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
        </Button>
        <Button variant="ghost" size="sm" className="size-7 p-0" onClick={handleCopy}>
          {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
        </Button>
        <Button variant="ghost" size="sm" className="size-7 p-0 text-muted-foreground hover:text-danger">
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}

export function ApiKeysSettings() {
  const { toast } = useToast()
  const [keys, setKeys] = React.useState(MOCK_KEYS)
  const [newKeyName, setNewKeyName] = React.useState("")
  const [generating, setGenerating] = React.useState(false)
  const [generatedKey, setGeneratedKey] = React.useState<string | null>(null)

  const handleGenerate = () => {
    if (!newKeyName) return
    setGenerating(true)
    // Simulate API call
    setTimeout(() => {
      const fakeKey = `fg_new_${Math.random().toString(36).slice(2, 14)}xxxx`
      const newKey: ApiKey = {
        id: `key_${Date.now()}`,
        name: newKeyName,
        key: fakeKey,
        created: new Date().toISOString().split("T")[0],
        lastUsed: "Never",
        scopes: ["read"],
      }
      setKeys((prev) => [newKey, ...prev])
      setGeneratedKey(fakeKey)
      setNewKeyName("")
      setGenerating(false)
      toast(`API key "${newKey.name}" created`)
    }, 1500)
  }

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key).catch(() => {})
  }

  return (
    <div className="space-y-6">
      {/* Generate New Key */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Key className="size-4 text-primary" />
          <h3 className="text-sm font-semibold">API Keys</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Manage API keys for programmatic access to EchoHeat
        </p>

        <div className="rounded-xl border border-border bg-surface-1/60 p-4 backdrop-blur-sm">
          <div className="space-y-2">
            <Label htmlFor="key-name" className="text-xs">Key Name</Label>
            <div className="flex gap-2">
              <Input
                id="key-name"
                placeholder="e.g., CI/CD Pipeline, Mobile App"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                className="h-9 flex-1 text-sm"
              />
              <Button
                onClick={handleGenerate}
                disabled={!newKeyName || generating}
                className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="size-3.5" />
                {generating ? "Generating..." : "Generate Key"}
              </Button>
            </div>
          </div>

          {/* Show generated key once */}
          {generatedKey && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 px-3 py-2">
              <Check className="size-4 text-success" />
              <code className="flex-1 font-mono text-xs text-foreground">{generatedKey}</code>
              <Button
                variant="ghost"
                size="sm"
                className="size-7 p-0"
                onClick={() => handleCopyKey(generatedKey)}
              >
                <Copy className="size-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Existing Keys */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground">
          Existing Keys ({keys.length})
        </p>
        <div className="space-y-2">
          {keys.map((key) => (
            <KeyRow key={key.id} apiKey={key} onCopy={handleCopyKey} />
          ))}
        </div>
      </div>
    </div>
  )
}
