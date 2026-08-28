import mongoose from "mongoose"
import { VehicleAsset, SiteAsset, FacilityAsset } from "../models/Asset.js"
import type { SeedOrganization } from "./organizations.seed.js"
import type { SeedUser } from "./users.seed.js"

// Karachi / GCC region coordinates
const KARACHI_CENTER = { lat: 24.8607, lng: 67.0011 }

const KARACHI_VEHICLE_ROUTES = [
  { origin: "Port Qasim", dest: "SITE Karachi", lat: 24.8036, lng: 67.3286 },
  { origin: "Sindh Industrial", dest: "Tariq Road", lat: 24.8669, lng: 67.0314 },
  { origin: "SITE Area", dest: "Clifton", lat: 24.8109, lng: 67.0018 },
  { origin: "Saddar", dest: "North Nazimabad", lat: 24.8956, lng: 67.0238 },
  { origin: "Gulshan-e-Iqbal", dest: "PECHS", lat: 24.8855, lng: 67.0663 },
  { origin: "Korangi", dest: "Malir Cantt", lat: 24.8456, lng: 67.1842 },
  { origin: "Nazimabad", dest: "Defence", lat: 24.8228, lng: 67.0356 },
  { origin: "Federal B Area", dest: "Shahrah-e-Faisal", lat: 24.8620, lng: 67.0736 },
  { origin: "Orangi Town", dest: "Lyari", lat: 24.8737, lng: 66.9985 },
  { origin: "Baldia Town", dest: "Keamari", lat: 24.8415, lng: 66.9736 },
]

const CARGO_TYPES = [
  "Pharmaceuticals",
  "Frozen Seafood",
  "Dairy Products",
  "Meat (Chilled)",
  "Fresh Produce",
  "Beverages",
  "Vaccines",
  "Chemicals",
  "Blood Banks",
  "Ice Cream",
]

const VEHICLE_NAMES = [
  "Reefer Truck", "Cold Van", "Frost Hauler", "Arctic Mover",
  "Chill Express", "Frozen Freight", "Ice Hauler", "Cool Cargo",
  "Temp Controlled", "Cold Chain", "Frost Runner", "Arctic Van",
  "Chill Mover", "Cool Transit", "Frozen Express", "Ice Runner",
  "Deep Freeze", "Cold Express", "Frost Haul", "Arctic Express",
  "Chill Carrier", "Cool Hauler", "Frozen Van", "Ice Carrier",
  "Temp Runner", "Cold Haul", "Frost Transit", "Arctic Carrier",
  "Chill Van", "Cool Runner", "Frozen Hauler", "Ice Express",
  "Deep Cool", "Cold Runner", "Frost Express", "Arctic Hauler",
  "Chill Freight", "Cool Carrier", "Frozen Runner", "Ice Haul",
  "Temp Hauler", "Cold Carrier", "Frost Van", "Arctic Runner",
  "Chill Express", "Cool Van", "Frozen Carrier", "Ice Transit",
  "Deep Freeze 2", "Cold Chain Van",
]

const REEFER_MODELS = ["Carrier Vector 1550", "Thermo King SLXi-300", "Carrier Vector 8500", "Thermo King V-520"]

export interface SeedAsset {
  _id: mongoose.Types.ObjectId
  name: string
  assetType: "vehicle" | "site" | "facility"
  organization: mongoose.Types.ObjectId
  owner: mongoose.Types.ObjectId
}

export async function seedAssets(
  organizations: SeedOrganization[],
  users: SeedUser[]
): Promise<SeedAsset[]> {
  console.log("[Seed] Seeding assets...")

  await VehicleAsset.deleteMany({})
  await SiteAsset.deleteMany({})
  await FacilityAsset.deleteMany({})

  const karachiOrg = organizations[0]!
  const dhaOrg = organizations[1]!

  const karachiFleetManager = users.find(
    (u) => u.organization.equals(karachiOrg._id) && u.role === "fleet_manager"
  )!
  const karachiSafetyDirector = users.find(
    (u) => u.organization.equals(karachiOrg._id) && u.role === "safety_director"
  )!
  const dhaFacilityManager = users.find(
    (u) => u.organization.equals(dhaOrg._id) && u.role === "facility_manager"
  )!
  const dhaAdmin = users.find(
    (u) => u.organization.equals(dhaOrg._id) && u.role === "admin"
  )!

  const allAssets: SeedAsset[] = []

  // ── 50 Vehicle Assets for Karachi Cold Logistics ──
  console.log("[Seed] Creating 50 vehicle assets...")
  const vehicleDocs = []
  for (let i = 0; i < 50; i++) {
    const id = new mongoose.Types.ObjectId()
    const route = KARACHI_VEHICLE_ROUTES[i % KARACHI_VEHICLE_ROUTES.length]!
    const latOffset = (Math.random() - 0.5) * 0.05
    const lngOffset = (Math.random() - 0.5) * 0.05
    const statuses = ["PRE-COOLING", "AT RISK", "COMPLIANT", "COMPLIANT", "COMPLIANT"] as const
    const status = statuses[i % statuses.length]
    const internalTemp = status === "PRE-COOLING" ? -18 - Math.random() * 3 : status === "AT RISK" ? -12 + Math.random() * 4 : -19 - Math.random() * 2
    const externalTemp = 35 + Math.random() * 10

    vehicleDocs.push({
      _id: id,
      organization: karachiOrg._id,
      owner: karachiFleetManager._id,
      assetType: "vehicle",
      name: `${VEHICLE_NAMES[i]!} #${String(i + 1).padStart(3, "0")}`,
      isActive: true,
      coordinates: { lat: route.lat + latOffset, lng: route.lng + lngOffset },
      tags: [status === "PRE-COOLING" ? "pre-cooling" : status === "AT RISK" ? "at-risk" : "compliant", "reefer"],
      lastHeartbeatAt: new Date(Date.now() - Math.random() * 3600000),
      vehicleData: {
        vehicleId: `KCL-${String(i + 1).padStart(4, "0")}`,
        licensePlate: `KHI-${String.fromCharCode(65 + (i % 26))}${String(i).padStart(3, "0")}`,
        currentRoute: {
          origin: route.origin,
          destination: route.dest,
          stops: [],
        },
        telematicsProvider: "mock",
        externalAssetId: "",
        cargo: {
          type: CARGO_TYPES[i % CARGO_TYPES.length]!,
          setpointTemp: -20,
          toleranceBand: 2,
        },
        reefer: {
          model: REEFER_MODELS[i % REEFER_MODELS.length]!,
          lastServiceDate: new Date(Date.now() - Math.random() * 90 * 86400000),
          insulationRValue: 12 + Math.random() * 8,
        },
        currentStatus: {
          internalTemp,
          externalTemp,
          doorOpenCount: Math.floor(Math.random() * 3),
          engineStatus: status === "PRE-COOLING" ? "running" : "off",
          location: { lat: route.lat + latOffset, lng: route.lng + lngOffset },
        },
      },
    })
    allAssets.push({ _id: id, name: `Vehicle #${i + 1}`, assetType: "vehicle", organization: karachiOrg._id, owner: karachiFleetManager._id })
  }
  await VehicleAsset.insertMany(vehicleDocs)
  console.log(`[Seed] Created 50 vehicle assets`)

  // ── 5 Site Assets (construction sites around Karachi) ──
  console.log("[Seed] Creating 5 site assets...")
  const siteData = [
    { name: "DHA Phase 5 Construction", address: "DHA Phase 5, Karachi", lat: 24.8036, lng: 67.0246, workers: 85 },
    { name: "Clifton Tower Project", address: "Clifton Block 2, Karachi", lat: 24.8109, lng: 67.0256, workers: 62 },
    { name: "Bahria Town Skylines", address: "Bahria Town Karachi", lat: 24.8456, lng: 67.0642, workers: 120 },
    { name: "PECHS Office Complex", address: "PECHS Block 6, Karachi", lat: 24.8669, lng: 67.0394, workers: 45 },
    { name: "Sindhi Muslim Society Redevelopment", address: "Sindhi Muslim Society, Karachi", lat: 24.8737, lng: 67.0314, workers: 70 },
  ]

  const siteDocs = siteData.map((s, idx) => {
    const id = new mongoose.Types.ObjectId()
    allAssets.push({ _id: id, name: s.name, assetType: "site", organization: dhaOrg._id, owner: dhaAdmin._id })
    return {
      _id: id,
      organization: dhaOrg._id,
      owner: dhaAdmin._id,
      assetType: "site",
      name: s.name,
      isActive: true,
      coordinates: { lat: s.lat, lng: s.lng },
      tags: ["construction", "outdoor"],
      lastHeartbeatAt: new Date(Date.now() - Math.random() * 1800000),
      siteData: {
        siteName: s.name,
        address: s.address,
        coordinates: { lat: s.lat, lng: s.lng },
        workerCount: s.workers,
        activeShift: { start: "06:00", end: "14:00" },
        projectManager: {
          name: `PM ${String.fromCharCode(65 + idx)} - ${s.name.split(" ")[0]}`,
          phone: `+92-300-${1000000 + idx}`,
        },
        compliancePlatform: "procore" as const,
        externalProjectId: `PROJ-${String(idx + 1).padStart(4, "0")}`,
        currentStatus: {
          wbgt: 26 + Math.random() * 8,
          alertLevel: idx < 2 ? "warning" : "safe",
          lastRestBreakAt: new Date(Date.now() - Math.random() * 7200000),
          loggedToProcore: true,
        },
      },
    }
  })
  await SiteAsset.insertMany(siteDocs)
  console.log(`[Seed] Created 5 site assets`)

  // ── 3 Facility Assets (commercial towers) ──
  console.log("[Seed] Creating 3 facility assets...")
  const facilityData = [
    {
      name: "DHA Commercial Tower A",
      address: "DHA Phase 2, Karachi",
      lat: 24.8165, lng: 67.0286,
      sqft: 125000,
      hvacs: [
        { id: "HVAC-A1", type: "chiller", capacity: 500, addr: "BACnet://10.0.1.10" },
        { id: "HVAC-A2", type: "ahu", capacity: 200, addr: "BACnet://10.0.1.11" },
      ],
    },
    {
      name: "Clifton Business Center",
      address: "Clifton Block 4, Karachi",
      lat: 24.8091, lng: 67.0220,
      sqft: 95000,
      hvacs: [
        { id: "HVAC-B1", type: "chiller", capacity: 350, addr: "BACnet://10.0.2.10" },
        { id: "HVAC-B2", type: "vrf", capacity: 150, addr: "BACnet://10.0.2.11" },
      ],
    },
    {
      name: "Gulshan-e-Iqbal Tech Park",
      address: "Gulshan-e-Iqbal Block 13-D, Karachi",
      lat: 24.8855, lng: 67.0663,
      sqft: 180000,
      hvacs: [
        { id: "HVAC-C1", type: "chiller", capacity: 800, addr: "BACnet://10.0.3.10" },
        { id: "HVAC-C2", type: "ahu", capacity: 300, addr: "BACnet://10.0.3.11" },
        { id: "HVAC-C3", type: "ahu", capacity: 300, addr: "BACnet://10.0.3.12" },
      ],
    },
  ]

  const facilityDocs = facilityData.map((f) => {
    const id = new mongoose.Types.ObjectId()
    allAssets.push({ _id: id, name: f.name, assetType: "facility", organization: dhaOrg._id, owner: dhaFacilityManager._id })
    return {
      _id: id,
      organization: dhaOrg._id,
      owner: dhaFacilityManager._id,
      assetType: "facility",
      name: f.name,
      isActive: true,
      coordinates: { lat: f.lat, lng: f.lng },
      tags: ["commercial", "hvac-monitored"],
      lastHeartbeatAt: new Date(Date.now() - Math.random() * 600000),
      facilityData: {
        facilityName: f.name,
        address: f.address,
        squareFootage: f.sqft,
        buildingEnvelope: {
          uValue: 0.35 + Math.random() * 0.2,
          roofType: "insulated-metal",
          glazingRatio: 0.3 + Math.random() * 0.2,
        },
        hvacSystems: f.hvacs.map((h) => ({
          systemId: h.id,
          type: h.type,
          capacity: h.capacity,
          bacnetAddress: h.addr,
        })),
        utilityAccount: {
          provider: "K-Electric",
          peakTariffWindow: { start: "14:00", end: "18:00" },
          baseRate: 18.5,
          peakRate: 32.75,
        },
        currentStatus: {
          currentLoad: 0.4 + Math.random() * 0.4,
          activePrecoolSessions: Math.floor(Math.random() * 2),
          demandSavingsToday: Math.round(Math.random() * 500 * 100) / 100,
        },
      },
    }
  })
  await FacilityAsset.insertMany(facilityDocs)
  console.log(`[Seed] Created 3 facility assets`)
  console.log(`[Seed] Total assets: ${allAssets.length} (50 vehicles + 5 sites + 3 facilities)`)

  return allAssets
}
