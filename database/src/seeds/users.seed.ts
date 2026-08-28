import mongoose from "mongoose"
import { User } from "../models/User.js"
import type { UserRole } from "../interfaces/user.js"
import type { SeedOrganization } from "./organizations.seed.js"

export interface SeedUser {
  _id: mongoose.Types.ObjectId
  email: string
  password: string
  name: string
  role: UserRole
  organization: mongoose.Types.ObjectId
}

interface UserTemplate {
  role: UserRole
  namePrefix: string
  emailLocal: string
}

const userTemplates: UserTemplate[] = [
  { role: "admin", namePrefix: "Admin", emailLocal: "admin" },
  { role: "fleet_manager", namePrefix: "Fleet", emailLocal: "fleet" },
  { role: "safety_director", namePrefix: "Safety", emailLocal: "safety" },
  { role: "facility_manager", namePrefix: "Facility", emailLocal: "facility" },
]

const PLAIN_PASSWORD = "EchoHeat2024!"

export async function seedUsers(
  organizations: SeedOrganization[]
): Promise<SeedUser[]> {
  console.log("[Seed] Seeding users...")

  await User.deleteMany({})

  const users: SeedUser[] = []

  for (const org of organizations) {
    const slug = org.slug

    for (const tmpl of userTemplates) {
      users.push({
        _id: new mongoose.Types.ObjectId(),
        email: `${tmpl.emailLocal}@${slug}.com`,
        password: PLAIN_PASSWORD,
        name: `${tmpl.namePrefix} User - ${org.name}`,
        role: tmpl.role,
        organization: org._id,
      })
    }
  }

  const docs = users.map((u) => ({
    _id: u._id,
    email: u.email,
    password: u.password,
    name: u.name,
    role: u.role,
    organization: u.organization,
    onboardingComplete: true,
  }))

  await User.insertMany(docs)

  console.log(`[Seed] Created ${docs.length} users`)
  console.log("")
  console.log("┌─────────────────────────────────────────────────────────────────────────────┐")
  console.log("│                          USER CREDENTIALS TABLE                             │")
  console.log("├─────────────────────────┬──────────────────────────────────┬─────────────────┤")
  console.log("│ Role                    │ Email                            │ Password        │")
  console.log("├─────────────────────────┼──────────────────────────────────┼─────────────────┤")

  for (const u of users) {
    const role = u.role.padEnd(23)
    const email = u.email.padEnd(32)
    const pw = PLAIN_PASSWORD.padEnd(15)
    console.log(`│ ${role} │ ${email} │ ${pw} │`)
  }

  console.log("└─────────────────────────┴──────────────────────────────────┴─────────────────┘")
  console.log("")

  return users
}
