import mongoose from "mongoose"
import { Organization } from "../models/Organization.js"

export interface SeedOrganization {
  _id: mongoose.Types.ObjectId
  name: string
  slug: string
}

const organizations: SeedOrganization[] = [
  {
    _id: new mongoose.Types.ObjectId(),
    name: "Karachi Cold Logistics Co.",
    slug: "karachi-cold-logistics",
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: "DHA Commercial Properties",
    slug: "dha-commercial-properties",
  },
]

export async function seedOrganizations(): Promise<SeedOrganization[]> {
  console.log("[Seed] Seeding organizations...")

  await Organization.deleteMany({})

  const docs = organizations.map((org) => ({
    _id: org._id,
    name: org.name,
    slug: org.slug,
    plan: "enterprise" as const,
    billingEmail: `billing@${org.slug}.com`,
    subscriptionStatus: "active" as const,
    settings: {
      alertThresholds: { wbgt: 28, cargoTemp: -18, peakDemand: 100 },
      autoExecute: true,
    },
    assetCounts: { vehicles: 0, sites: 0, facilities: 0 },
  }))

  await Organization.insertMany(docs)

  console.log(`[Seed] Created ${docs.length} organizations`)
  for (const org of docs) {
    console.log(`  - ${org.name} (${org._id.toHexString()})`)
  }

  return organizations
}
