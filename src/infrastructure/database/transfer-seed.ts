import { db } from '@/infrastructure/database/db'
import type { Transfer, TransferKind, TransferStage } from '@/domain/entities/transfer'
import { generateId } from '@/shared/utils/cn'

export const TRANSFERS_DIRECTORY_VERSION = 1

type SeedTransfer = {
  kind: TransferKind
  stage: TransferStage
  pickupLocation: string
  dropoffLocation: string
  serviceDate?: string
  serviceTime?: string
  vehicleType?: string
  vehiclePlate?: string
  driverName?: string
  passengerCount: number
  passengerNames?: string
  currency: string
  sellingPrice: number
  supplierCost: number
  notes?: string
  preferredSupplierNames?: string[]
}

const SEED_TRANSFERS: SeedTransfer[] = [
  {
    kind: 'airport_transfer',
    stage: 'confirmed',
    pickupLocation: 'Cairo International Airport (CAI)',
    dropoffLocation: 'Four Seasons Nile Plaza',
    serviceDate: '2026-04-12',
    serviceTime: '14:30',
    vehicleType: 'Mercedes S-Class',
    vehiclePlate: 'CAI-1204',
    driverName: 'Ahmed Farouk',
    passengerCount: 2,
    passengerNames: 'Karim Hassan, Nadia Hassan',
    currency: 'USD',
    sellingPrice: 85,
    supplierCost: 45,
    notes: 'Meet-and-greet with name board at arrivals.',
    preferredSupplierNames: ['Cairo Limousine Services', 'Egyliere Transport'],
  },
  {
    kind: 'airport_transfer',
    stage: 'upcoming',
    pickupLocation: 'Steigenberger Hurghada',
    dropoffLocation: 'Hurghada International Airport (HRG)',
    serviceDate: '2026-05-03',
    serviceTime: '08:00',
    vehicleType: 'Mercedes V-Class',
    vehiclePlate: 'HRG-8821',
    driverName: 'Mostafa Said',
    passengerCount: 4,
    passengerNames: 'Family group — 2 adults, 2 children',
    currency: 'USD',
    sellingPrice: 55,
    supplierCost: 28,
    preferredSupplierNames: ['Hurghada Airport Transfers', 'Red Sea Shuttle'],
  },
  {
    kind: 'point_to_point',
    stage: 'active',
    pickupLocation: 'Marriott Mena House',
    dropoffLocation: 'Giza Pyramids Visitor Center',
    serviceDate: '2026-03-22',
    serviceTime: '09:15',
    vehicleType: 'Cadillac Escalade',
    vehiclePlate: 'GIZ-4410',
    driverName: 'Youssef Nabil',
    passengerCount: 3,
    passengerNames: 'VIP guests',
    currency: 'USD',
    sellingPrice: 120,
    supplierCost: 70,
    notes: 'Wait-and-return included for 3 hours.',
    preferredSupplierNames: ['Egyliere Transport', 'Fleet Masters Egypt'],
  },
  {
    kind: 'disposal',
    stage: 'proposal',
    pickupLocation: 'Kempinski Nile Hotel',
    dropoffLocation: 'Full-day Cairo disposal',
    serviceDate: '2026-06-10',
    serviceTime: '08:00',
    vehicleType: 'Mercedes E-Class',
    passengerCount: 2,
    currency: 'USD',
    sellingPrice: 280,
    supplierCost: 160,
    notes: '8-hour disposal with English-speaking driver.',
    preferredSupplierNames: ['Cairo Limousine Services'],
  },
  {
    kind: 'multi_destination',
    stage: 'negotiation',
    pickupLocation: 'Luxor Temple',
    dropoffLocation: 'Valley of the Kings → Karnak',
    serviceDate: '2026-04-28',
    serviceTime: '07:30',
    vehicleType: 'Toyota Hiace',
    vehiclePlate: 'LXR-2201',
    driverName: 'Hassan Ali',
    passengerCount: 8,
    passengerNames: 'Group tour',
    currency: 'USD',
    sellingPrice: 160,
    supplierCost: 95,
    preferredSupplierNames: ['Nile Valley Coaches', 'Egyliere Transport'],
  },
  {
    kind: 'airport_transfer',
    stage: 'draft',
    pickupLocation: 'Sharm El Sheikh Airport (SSH)',
    dropoffLocation: 'Rixos Premium Seagate',
    serviceDate: '2026-07-01',
    serviceTime: '22:45',
    vehicleType: 'Mercedes Sprinter',
    passengerCount: 6,
    currency: 'USD',
    sellingPrice: 95,
    supplierCost: 50,
    preferredSupplierNames: ['Red Sea Shuttle'],
  },
  {
    kind: 'point_to_point',
    stage: 'recent',
    pickupLocation: 'Sofitel Legend Old Cataract',
    dropoffLocation: 'Aswan High Dam',
    serviceDate: '2026-02-14',
    serviceTime: '10:00',
    vehicleType: 'BMW 5 Series',
    vehiclePlate: 'ASW-1099',
    driverName: 'Omar Khaled',
    passengerCount: 2,
    currency: 'USD',
    sellingPrice: 70,
    supplierCost: 38,
    preferredSupplierNames: ['Egyliere Transport'],
  },
  {
    kind: 'airport_transfer',
    stage: 'closed',
    pickupLocation: 'JW Marriott Cairo',
    dropoffLocation: 'Cairo International Airport (CAI)',
    serviceDate: '2026-01-18',
    serviceTime: '05:30',
    vehicleType: 'Mercedes S-Class',
    vehiclePlate: 'CAI-9912',
    driverName: 'Mahmoud Tarek',
    passengerCount: 1,
    passengerNames: 'Early departure',
    currency: 'USD',
    sellingPrice: 90,
    supplierCost: 48,
    notes: 'Closed after successful drop-off.',
    preferredSupplierNames: ['Cairo Limousine Services', 'Fleet Masters Egypt'],
  },
]

function formatTransferReference(sequence: number): string {
  return `TRF-${String(sequence).padStart(4, '0')}`
}

function parseReferenceSequence(reference: string): number {
  const match = reference.match(/^TRF-(\d+)$/i)
  return match ? Number.parseInt(match[1], 10) : 0
}

async function maxReferenceSequence(): Promise<number> {
  const transfers = await db.transfers.toArray()
  return transfers.reduce((max, transfer) => Math.max(max, parseReferenceSequence(transfer.reference)), 0)
}

function buildTransfer(
  seed: SeedTransfer,
  referenceSequence: number,
  ageIndex: number,
  trip?: { id: string; reference: string; clientName?: string },
  supplier?: { id: string; displayName: string },
): Transfer {
  const now = new Date(Date.now() - ageIndex * 3_600_000).toISOString()
  return {
    id: generateId('TRF'),
    reference: formatTransferReference(referenceSequence),
    kind: seed.kind,
    stage: seed.stage,
    lastPipelineStage: seed.stage === 'closed' || seed.stage === 'lost' ? 'recent' : undefined,
    tripId: trip?.id,
    tripReference: trip?.reference,
    clientName: trip?.clientName,
    supplierId: supplier?.id,
    supplierName: supplier?.displayName,
    pickupLocation: seed.pickupLocation,
    dropoffLocation: seed.dropoffLocation,
    serviceDate: seed.serviceDate,
    serviceTime: seed.serviceTime,
    vehicleType: seed.vehicleType,
    vehiclePlate: seed.vehiclePlate,
    driverName: seed.driverName,
    passengerCount: seed.passengerCount,
    passengerNames: seed.passengerNames,
    currency: seed.currency,
    sellingPrice: seed.sellingPrice,
    supplierCost: seed.supplierCost,
    notes: seed.notes,
    createdAt: now,
    updatedAt: now,
  }
}

async function resolveTripLinks() {
  const trips = await db.trips.orderBy('updatedAt').reverse().limit(12).toArray()
  const clients = await db.clients.toArray()
  const clientsById = new Map(clients.map((client) => [client.id, client.displayName]))

  return trips.map((trip) => ({
    id: trip.id,
    reference: trip.reference,
    clientName: (trip.clientId ? clientsById.get(trip.clientId) : undefined) ?? trip.mainContactName,
  }))
}

async function resolveSupplier(preferredNames?: string[]) {
  if (!preferredNames?.length) return undefined
  const suppliers = await db.suppliers.toArray()
  const byName = new Map(suppliers.map((supplier) => [supplier.displayName.trim().toLowerCase(), supplier]))
  for (const name of preferredNames) {
    const match = byName.get(name.trim().toLowerCase())
    if (match) return { id: match.id, displayName: match.displayName }
  }
  const transport = suppliers.find((supplier) => supplier.category === 'transport' && supplier.status === 'active')
  return transport ? { id: transport.id, displayName: transport.displayName } : undefined
}

async function seedAllTransfers(): Promise<void> {
  const trips = await resolveTripLinks()
  const transfers: Transfer[] = []

  for (let index = 0; index < SEED_TRANSFERS.length; index += 1) {
    const seed = SEED_TRANSFERS[index]
    const trip = trips[index % Math.max(trips.length, 1)]
    const supplier = await resolveSupplier(seed.preferredSupplierNames)
    transfers.push(buildTransfer(seed, index + 1, index, trips.length > 0 ? trip : undefined, supplier))
  }

  await db.transfers.bulkAdd(transfers)
}

export async function ensureTransfersDirectory(): Promise<void> {
  const settings = await db.settings.get('SET-001')
  const version = settings?.transfersDirectoryVersion ?? 0
  const count = await db.transfers.count()

  if (count === 0) {
    await seedAllTransfers()
  } else if (version < TRANSFERS_DIRECTORY_VERSION && count < SEED_TRANSFERS.length) {
    const existing = await db.transfers.toArray()
    const existingKeys = new Set(
      existing.map((transfer) => `${transfer.pickupLocation}|${transfer.dropoffLocation}|${transfer.serviceDate ?? ''}`),
    )
    const trips = await resolveTripLinks()
    let nextRef = await maxReferenceSequence()
    const toAdd: Transfer[] = []

    for (let index = 0; index < SEED_TRANSFERS.length; index += 1) {
      const seed = SEED_TRANSFERS[index]
      const key = `${seed.pickupLocation}|${seed.dropoffLocation}|${seed.serviceDate ?? ''}`
      if (existingKeys.has(key)) continue
      nextRef += 1
      const trip = trips[index % Math.max(trips.length, 1)]
      const supplier = await resolveSupplier(seed.preferredSupplierNames)
      toAdd.push(buildTransfer(seed, nextRef, existing.length + toAdd.length, trips.length > 0 ? trip : undefined, supplier))
    }

    if (toAdd.length > 0) await db.transfers.bulkAdd(toAdd)
  }

  if (settings && version < TRANSFERS_DIRECTORY_VERSION) {
    await db.settings.update('SET-001', { transfersDirectoryVersion: TRANSFERS_DIRECTORY_VERSION })
  }
}

export async function nextTransferReference(): Promise<string> {
  const next = (await maxReferenceSequence()) + 1
  return formatTransferReference(next)
}
