import { db } from '@/infrastructure/database/db'
import { SERVICE_CATEGORIES, type Trip, type TripStage } from '@/domain/entities'
import type { ServiceCategoryCounts } from '@/domain/entities'
import type { Client } from '@/domain/entities/client'
import { clientPrimaryLabel } from '@/domain/entities/client'
import { contactNameForClient } from '@/infrastructure/database/complete-client-enrichment'
import { ACCOUNT_MANAGER_NAMES } from '@/infrastructure/database/seed'

export const CLIENT_OPERATIONAL_SEED_VERSION = 1

const EMPTY_BREAKDOWN: ServiceCategoryCounts[] = SERVICE_CATEGORIES.map((category) => ({
  category,
  proposal: 0,
  confirmed: 0,
  canceled: 0,
}))

const TRIP_BLUEPRINTS: Array<{
  name: string
  destination: string
  branch: string
  tripType: string
}> = [
  { name: 'Nile Cruise Experience', destination: 'Luxor & Aswan', branch: 'Luxor', tripType: 'Leisure' },
  { name: 'Cairo City Break', destination: 'Cairo & Giza', branch: 'Cairo', tripType: 'Leisure' },
  { name: 'Red Sea Diving Week', destination: 'Hurghada', branch: 'Hurghada', tripType: 'Leisure' },
  { name: 'Corporate Retreat', destination: 'Sharm El Sheikh', branch: 'Sharm El Sheikh', tripType: 'Corporate' },
  { name: 'Desert Safari Adventure', destination: 'Bahariya Oasis', branch: 'Bahariya Oasis', tripType: 'Group' },
  { name: 'Alexandria Heritage Tour', destination: 'Alexandria', branch: 'Alexandria', tripType: 'Leisure' },
  { name: 'MICE Conference Package', destination: 'Cairo', branch: 'Cairo', tripType: 'MICE' },
  { name: 'Luxury Honeymoon Escape', destination: 'Aswan', branch: 'Aswan', tripType: 'Leisure' },
]

const ACTIVE_STAGES: TripStage[] = [
  'draft',
  'proposal',
  'negotiation',
  'confirmed',
  'upcoming',
  'active',
  'recent',
  'closed',
]

function maxTripReference(trips: Trip[]): number {
  return trips.reduce((max, trip) => {
    const match = trip.reference.match(/^(\d+)$/)
    if (!match) return max
    return Math.max(max, Number.parseInt(match[1], 10))
  }, 504_576)
}

function stageForClient(client: Client, index: number, tripIndex: number): TripStage {
  if (client.status === 'blocked') return 'lost'
  if (client.status === 'inactive') return tripIndex === 0 ? 'closed' : 'lost'
  return ACTIVE_STAGES[(index + tripIndex) % ACTIVE_STAGES.length]
}

function tripsTargetForClient(client: Client): number {
  if (client.status === 'blocked') return 1
  if (client.customerTier === 'strategic' || client.customerTier === 'platinum') return 2
  return 1
}

function buildTripForClient(
  client: Client,
  clientIndex: number,
  tripIndex: number,
  reference: string,
): Trip {
  const blueprint = TRIP_BLUEPRINTS[(clientIndex + tripIndex) % TRIP_BLUEPRINTS.length]
  const stage = stageForClient(client, clientIndex, tripIndex)
  const ownerIndex = clientIndex % ACCOUNT_MANAGER_NAMES.length
  const ownerId = `USR-${String(ownerIndex + 1).padStart(3, '0')}`
  const baseCost = 8_000 + ((clientIndex * 1_317 + tripIndex * 2_503) % 62_000)
  const commission = Math.round(baseCost * (0.08 + (clientIndex % 5) * 0.02))
  const paidRatio = stage === 'closed' || stage === 'recent' || stage === 'active' ? 1 : stage === 'confirmed' || stage === 'upcoming' ? 0.5 : 0.2
  const clientPaidAmount = Math.round(baseCost * paidRatio)
  const supplierBalanceDue = Math.max(0, Math.round(baseCost * 0.35 - clientPaidAmount * 0.1))
  const month = String(((clientIndex + tripIndex) % 12) + 1).padStart(2, '0')
  const day = String(((clientIndex * 3 + tripIndex * 5) % 25) + 1).padStart(2, '0')
  const created = new Date(Date.now() - (clientIndex * 2 + tripIndex) * 86_400_000).toISOString()

  return {
    id: `TRP-${reference}`,
    reference,
    name: `${blueprint.name} — ${clientPrimaryLabel(client)}`,
    ownerName: ACCOUNT_MANAGER_NAMES[ownerIndex],
    ownerId,
    branch: blueprint.branch,
    destination: blueprint.destination,
    stage,
    lastPipelineStage: stage === 'lost' || stage === 'closed' ? 'proposal' : undefined,
    tripType: blueprint.tripType,
    currency: client.preferredCurrency ?? 'EGP',
    totalCost: baseCost,
    totalCommission: commission,
    clientPaidAmount,
    supplierBalanceDue,
    adults: 2 + (clientIndex % 8),
    minors: clientIndex % 3,
    bookingStartedAt: `2026-${month}-01`,
    startDate: `2026-${month}-${day}`,
    endDate: `2026-${month}-${String(Math.min(Number(day) + 4, 28)).padStart(2, '0')}`,
    mainContactName: contactNameForClient(client),
    mainContactEmail: client.email,
    clientId: client.id,
    agentName: ACCOUNT_MANAGER_NAMES[ownerIndex],
    agentEmail: ownerIndex === 0 ? 'admin@egyliere.com' : `${ACCOUNT_MANAGER_NAMES[ownerIndex].toLowerCase().replace(/\s+/g, '.')}@egyliere.com`,
    serviceBreakdown: EMPTY_BREAKDOWN,
    createdAt: created,
    updatedAt: created,
  }
}

async function ensureTripsForAllClients(): Promise<number> {
  const [clients, trips] = await Promise.all([db.clients.toArray(), db.trips.toArray()])
  if (clients.length === 0) return 0

  let nextRef = maxTripReference(trips) + 1
  const toAdd: Trip[] = []

  for (let clientIndex = 0; clientIndex < clients.length; clientIndex += 1) {
    const client = clients[clientIndex]
    const existing = trips.filter((trip) => trip.clientId === client.id).length
    const target = tripsTargetForClient(client)

    for (let tripIndex = existing; tripIndex < target; tripIndex += 1) {
      const reference = String(nextRef).padStart(6, '0')
      nextRef += 1
      toAdd.push(buildTripForClient(client, clientIndex, tripIndex, reference))
    }
  }

  if (toAdd.length > 0) {
    await db.trips.bulkAdd(toAdd)
  }

  const unlinked = trips.filter((trip) => !trip.clientId && trip.mainContactEmail)
  if (unlinked.length > 0) {
    const byEmail = new Map(
      clients
        .filter((c) => c.email?.trim())
        .map((c) => [c.email!.trim().toLowerCase(), c]),
    )
    await Promise.all(
      unlinked.map((trip) => {
        const client = byEmail.get(trip.mainContactEmail!.trim().toLowerCase())
        if (!client) return Promise.resolve()
        return db.trips.update(trip.id, {
          clientId: client.id,
          mainContactName: contactNameForClient(client),
          mainContactEmail: client.email,
          updatedAt: new Date().toISOString(),
        })
      }),
    )
  }

  return toAdd.length
}

export async function ensureClientOperationalSeed(): Promise<void> {
  const settings = await db.settings.get('SET-001')
  const version = settings?.clientOperationalSeedVersion ?? 0
  if (version >= CLIENT_OPERATIONAL_SEED_VERSION) return

  await ensureTripsForAllClients()

  if (settings) {
    await db.settings.update('SET-001', {
      clientOperationalSeedVersion: CLIENT_OPERATIONAL_SEED_VERSION,
      tripServicesMockVersion: 0,
      invoiceSeedVersion: 0,
      financeSeedVersion: 0,
    })
  }
}
