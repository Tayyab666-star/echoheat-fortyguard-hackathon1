"use client"

import * as React from "react"
import {
  Users,
  Send,
  MoreHorizontal,
  Shield,
  Truck,
  HardHat,
  Building2,
  Crown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/lib/toast"

const ROLE_CONFIG = {
  Admin: { icon: Crown, color: "text-warning" },
  "Fleet Manager": { icon: Truck, color: "text-info" },
  "Safety Director": { icon: HardHat, color: "text-success" },
  "Facility Manager": { icon: Building2, color: "text-primary" },
} as const

interface TeamMember {
  name: string
  email: string
  initials: string
  role: keyof typeof ROLE_CONFIG
  lastActive: string
}

const TEAM: TeamMember[] = [
  { name: "Ahmed Raza", email: "ahmed@fortyguard.com", initials: "AR", role: "Admin", lastActive: "Just now" },
  { name: "Sarah Chen", email: "sarah@fortyguard.com", initials: "SC", role: "Fleet Manager", lastActive: "2 hours ago" },
  { name: "Omar Patel", email: "omar@fortyguard.com", initials: "OP", role: "Safety Director", lastActive: "5 hours ago" },
  { name: "Fatima Al-Hussein", email: "fatima@fortyguard.com", initials: "FA", role: "Facility Manager", lastActive: "Yesterday" },
]

export function TeamSettings() {
  const { toast } = useToast()
  const [inviteEmail, setInviteEmail] = React.useState("")

  const handleInvite = () => {
    if (!inviteEmail) return
    toast(`Invitation sent to ${inviteEmail}`)
    setInviteEmail("")
  }

  return (
    <div className="space-y-6">
      {/* Team Members */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-primary" />
          <h3 className="text-sm font-semibold">Team Members</h3>
          <Badge variant="secondary" className="ml-1 text-[10px]">{TEAM.length}</Badge>
        </div>

        <div className="space-y-2">
          {TEAM.map((member) => {
            const roleCfg = ROLE_CONFIG[member.role]
            const RoleIcon = roleCfg.icon
            return (
              <div
                key={member.email}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface-1/60 px-4 py-3 backdrop-blur-sm transition-colors hover:bg-surface-1"
              >
                <Avatar size="sm">
                  <AvatarFallback>{member.initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{member.name}</p>
                  <p className="text-[11px] text-muted-foreground">{member.email}</p>
                </div>
                <Badge
                  variant="outline"
                  className={`gap-1 text-[10px] ${roleCfg.color}`}
                >
                  <RoleIcon className="size-3" />
                  {member.role}
                </Badge>
                <span className="hidden text-[10px] text-muted-foreground sm:block">
                  {member.lastActive}
                </span>
                <Button variant="ghost" size="sm" className="size-8 p-0">
                  <MoreHorizontal className="size-4" />
                </Button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Invite */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Send className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">Invite Team Member</h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Send an email invitation to join the EchoHeat dashboard
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface-1/60 p-4 backdrop-blur-sm">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex-1 space-y-1">
              <Label htmlFor="invite-email" className="text-xs">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                className="h-9 text-sm"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleInvite}
                className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="size-3.5" />
                Send Invite
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
