import { db } from './db'
import type { User, AppSettings, Trip, ServiceCategoryCounts } from '@/domain/entities'
import { SERVICE_CATEGORIES } from '@/domain/entities'
import { DEMO_TRIP_ID } from '@/infrastructure/database/mocks/trip-services.mock'

const now = new Date().toISOString()

export const MOCK_TRIP_COUNT = 10
export const TRIPS_MOCK_VERSION = 1

export const ACCOUNT_MANAGER_NAMES = [
  'Ibrahim Mahmoud',
  'Mohamed Kaoud',
  'Mostafa Hameed',
  'Shaimaa Khaled',
  'Safaa Saad',
  'Yosra Yasser',
  'Hesham Ali',
  'Rola Moussa',
  'Essam Amer',
  'Amr Mekki',
  'Mohamed Ezz',
  'Mahmoud Dawood',
  'Mahmoud Hussien',
  'Mohamed Maher',
] as const

function accountManagerEmail(name: string, index: number) {
  if (index === 0) return 'admin@egyliere.com'
  const slug = name
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .trim()
    .replace(/\s+/g, '.')
  return `${slug}@egyliere.com`
}

function accountManagerInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
}

function accountManagerRole(index: number): User['role'] {
  if (index === 0) return 'admin'
  if (index === 1) return 'operations'
  if (index === 4) return 'management'
  return 'sales'
}

function buildAccountManagerUsers(): User[] {
  return ACCOUNT_MANAGER_NAMES.map((name, index) => ({
    id: `USR-${String(index + 1).padStart(3, '0')}`,
    name,
    email: accountManagerEmail(name, index),
    role: accountManagerRole(index),
    initials: accountManagerInitials(name),
    isActive: true,
    ...(index === 0 ? { lastLoginAt: now } : {}),
  }))
}

const SYSTEM_USERS: User[] = [
  {
    id: 'USR-015',
    name: 'Tarek Samy',
    email: 'finance@egyliere.com',
    role: 'finance',
    initials: 'TS',
    isActive: true,
  },
  {
    id: 'USR-016',
    name: 'Guest User',
    email: 'guest@egyliere.com',
    role: 'guest',
    initials: 'GU',
    isActive: true,
  },
  {
    id: 'USR-017',
    name: 'Read Only',
    email: 'readonly@egyliere.com',
    role: 'readonly',
    initials: 'RO',
    isActive: true,
  },
]

export const SEED_USERS: User[] = [...buildAccountManagerUsers(), ...SYSTEM_USERS]

const DEFAULT_SETTINGS: AppSettings = {
  id: 'SET-001',
  companyName: 'Egyliere',
  defaultCurrency: 'EGP',
  seededAt: now,
  tripsMockVersion: TRIPS_MOCK_VERSION,
}

const EMPTY_BREAKDOWN: ServiceCategoryCounts[] = SERVICE_CATEGORIES.map((category) => ({
  category,
  proposal: 0,
  confirmed: 0,
  canceled: 0,
}))

const DEMO_CLIENTS = [
  { name: 'Mohamed El-Sayed', email: 'm.elsayed@acme.com' },
  { name: 'Sarah Mitchell', email: 's.mitchell@globalco.com' },
  { name: 'Hassan Abdel Rahman', email: 'h.abdelrahman@nilecorp.com' },
  { name: 'Emily Carter', email: 'emily.carter@travelhub.com' },
  { name: 'Youssef Kamal', email: 'y.kamal@horizon.eg' },
  { name: 'Layla Mansour', email: 'layla.m@sunrise.com' },
  { name: 'James Porter', email: 'jporter@venture.io' },
  { name: 'Nour Hamed', email: 'nour.hamed@delta.eg' },
  { name: 'Fatima Al-Zahra', email: 'f.zahra@emirates.ae' },
  { name: 'David Cohen', email: 'd.cohen@medgroup.com' },
]

function buildTrip(
  index: number,
  overrides: Partial<Trip> & Pick<Trip, 'name' | 'reference' | 'stage' | 'ownerName'>,
): Trip {
  const created = new Date(Date.now() - index * 86_400_000).toISOString()
  return {
    id: `TRP-${overrides.reference}`,
    reference: overrides.reference,
    name: overrides.name,
    ownerName: overrides.ownerName,
    ownerId: overrides.ownerId ?? 'USR-001',
    branch: overrides.branch ?? 'HQ',
    destination: overrides.destination ?? overrides.branch ?? 'HQ',
    stage: overrides.stage,
    tripType: overrides.tripType ?? 'Corporate',
    currency: 'EGP',
    totalCost: overrides.totalCost ?? 0,
    totalCommission: overrides.totalCommission ?? 0,
    clientPaidAmount: overrides.clientPaidAmount ?? 0,
    supplierBalanceDue: overrides.supplierBalanceDue ?? 0,
    adults: overrides.adults ?? 2 + (index % 6),
    minors: overrides.minors ?? index % 3,
    bookingStartedAt: overrides.bookingStartedAt ?? '2026-01-15',
    startDate: overrides.startDate ?? overrides.bookingStartedAt ?? '2026-01-15',
    endDate: overrides.endDate,
    mainContactName: overrides.mainContactName ?? DEMO_CLIENTS[index % DEMO_CLIENTS.length].name,
    mainContactEmail: overrides.mainContactEmail ?? DEMO_CLIENTS[index % DEMO_CLIENTS.length].email,
    agentName: overrides.agentName ?? 'Ibrahim Mahmoud',
    agentEmail: overrides.agentEmail ?? 'ibrahim@egyliere.com',
    serviceBreakdown: overrides.serviceBreakdown ?? EMPTY_BREAKDOWN,
    createdAt: created,
    updatedAt: created,
  }
}

export const SEED_TRIPS: Trip[] = [
  buildTrip(0, {
    reference: '504567',
    name: 'Advanced Webinar Series — Cairo',
    ownerName: 'Ibrahim Mahmoud',
    ownerId: 'USR-001',
    stage: 'draft',
    tripType: 'Corporate',
    branch: 'HQ',
    destination: 'Cairo',
    totalCost: 18_450,
    totalCommission: 1_845,
    clientPaidAmount: 8_000,
    supplierBalanceDue: 5_200,
    adults: 12,
    bookingStartedAt: '2026-01-15',
    startDate: '2026-03-20',
    endDate: '2026-03-25',
  }),
  buildTrip(1, {
    reference: '504568',
    name: 'Nile Cruise — Luxor to Aswan',
    ownerName: 'Mohamed Kaoud',
    ownerId: 'USR-002',
    stage: 'confirmed',
    tripType: 'Leisure',
    branch: 'Luxor',
    destination: 'Luxor & Aswan',
    totalCost: 42_800,
    totalCommission: 5_136,
    clientPaidAmount: 42_800,
    supplierBalanceDue: 2_100,
    bookingStartedAt: '2026-02-01',
    startDate: '2026-04-10',
    endDate: '2026-04-17',
  }),
  buildTrip(2, {
    reference: '504569',
    name: 'Red Sea Diving Package',
    ownerName: 'Shaimaa Khaled',
    ownerId: 'USR-004',
    stage: 'proposal',
    tripType: 'Leisure',
    branch: 'Hurghada',
    destination: 'Hurghada',
    totalCost: 15_600,
    totalCommission: 1_872,
    clientPaidAmount: 5_000,
    supplierBalanceDue: 8_400,
    bookingStartedAt: '2026-02-10',
    startDate: '2026-05-05',
    endDate: '2026-05-12',
  }),
  buildTrip(3, {
    reference: '504570',
    name: 'Corporate Retreat — Sharm El Sheikh',
    ownerName: 'Safaa Saad',
    ownerId: 'USR-005',
    stage: 'upcoming',
    tripType: 'Corporate',
    branch: 'Sharm El Sheikh',
    destination: 'Sharm El Sheikh',
    totalCost: 68_500,
    totalCommission: 8_220,
    clientPaidAmount: 34_250,
    supplierBalanceDue: 25_000,
    adults: 24,
    bookingStartedAt: '2026-01-20',
    startDate: '2026-06-01',
    endDate: '2026-06-05',
  }),
  buildTrip(4, {
    reference: '504571',
    name: 'Desert Safari — Bahariya Oasis',
    ownerName: 'Ibrahim Mahmoud',
    ownerId: 'USR-001',
    stage: 'active',
    tripType: 'Group',
    branch: 'Bahariya Oasis',
    destination: 'Bahariya Oasis',
    totalCost: 9_200,
    totalCommission: 1_104,
    clientPaidAmount: 9_200,
    supplierBalanceDue: 0,
    bookingStartedAt: '2026-02-15',
    startDate: '2026-03-28',
    endDate: '2026-03-30',
  }),
  buildTrip(5, {
    reference: '504572',
    name: 'Alexandria City Break',
    ownerName: 'Mostafa Hameed',
    ownerId: 'USR-003',
    stage: 'recent',
    tripType: 'Leisure',
    branch: 'Alexandria',
    destination: 'Alexandria',
    totalCost: 7_400,
    totalCommission: 888,
    clientPaidAmount: 7_400,
    supplierBalanceDue: 0,
    bookingStartedAt: '2025-11-01',
    startDate: '2025-12-20',
    endDate: '2025-12-23',
  }),
  buildTrip(6, {
    reference: '504573',
    name: 'Aswan Heritage Tour',
    ownerName: 'Mohamed Kaoud',
    ownerId: 'USR-002',
    stage: 'confirmed',
    tripType: 'Group',
    branch: 'Aswan',
    destination: 'Aswan',
    totalCost: 22_300,
    totalCommission: 2_676,
    clientPaidAmount: 11_150,
    supplierBalanceDue: 9_500,
    adults: 8,
    bookingStartedAt: '2026-02-20',
    startDate: '2026-04-22',
    endDate: '2026-04-26',
  }),
  buildTrip(7, {
    reference: '504574',
    name: 'Giza Pyramids Group Tour',
    ownerName: 'Shaimaa Khaled',
    ownerId: 'USR-004',
    stage: 'negotiation',
    tripType: 'Group',
    branch: 'Giza',
    destination: 'Cairo & Giza',
    totalCost: 31_000,
    totalCommission: 3_720,
    clientPaidAmount: 0,
    supplierBalanceDue: 18_000,
    adults: 16,
    bookingStartedAt: '2026-03-01',
    startDate: '2026-07-10',
    endDate: '2026-07-14',
  }),
  buildTrip(8, {
    reference: '504575',
    name: 'Dahab Adventure Week',
    ownerName: 'Safaa Saad',
    ownerId: 'USR-005',
    stage: 'lost',
    lastPipelineStage: 'proposal',
    tripType: 'Leisure',
    branch: 'Dahab',
    destination: 'Dahab',
    totalCost: 12_800,
    totalCommission: 0,
    clientPaidAmount: 0,
    supplierBalanceDue: 0,
    bookingStartedAt: '2026-01-05',
    startDate: '2026-03-15',
    endDate: '2026-03-22',
  }),
  buildTrip(9, {
    reference: '504576',
    name: 'Suez Canal Transit Tour',
    ownerName: 'Ibrahim Mahmoud',
    ownerId: 'USR-001',
    stage: 'proposal',
    tripType: 'MICE',
    branch: 'Suez',
    destination: 'Suez',
    totalCost: 5_600,
    totalCommission: 672,
    clientPaidAmount: 2_800,
    supplierBalanceDue: 1_200,
    bookingStartedAt: '2026-03-05',
    startDate: '2026-08-01',
    endDate: '2026-08-02',
  }),
]

export async function seedDatabase(): Promise<void> {
  await db.transaction('rw', [db.users, db.settings, db.trips], async () => {
    await db.users.bulkAdd(SEED_USERS)
    await db.settings.add(DEFAULT_SETTINGS)
    await db.trips.bulkAdd(SEED_TRIPS)
  })
}

export async function seedTripsIfEmpty(): Promise<void> {
  const count = await db.trips.count()
  if (count === 0) await db.trips.bulkAdd(SEED_TRIPS)
}

export async function ensureDemoTrips(): Promise<void> {
  const existingIds = new Set(await db.trips.where('id').anyOf(SEED_TRIPS.map((trip) => trip.id)).primaryKeys())
  const missing = SEED_TRIPS.filter((trip) => !existingIds.has(trip.id))
  if (missing.length > 0) await db.trips.bulkAdd(missing)
}

/** Replace legacy 280-trip mock data with the current 10-trip seed set. */
export async function ensureTripsMockRefresh(): Promise<void> {
  const settings = await db.settings.get('SET-001')
  const storedVersion = settings?.tripsMockVersion ?? 0
  if (storedVersion >= TRIPS_MOCK_VERSION) return

  await db.transaction('rw', [db.trips, db.tripServices, db.settings], async () => {
    await db.trips.clear()
    await db.tripServices.clear()
    await db.trips.bulkAdd(SEED_TRIPS)
    if (settings) {
      await db.settings.update('SET-001', {
        tripsMockVersion: TRIPS_MOCK_VERSION,
        tripServicesMockVersion: 0,
      })
    }
  })
}

export async function ensureTripClientNames(): Promise<void> {
  const trips = await db.trips.filter((trip) => !trip.mainContactName).toArray()
  if (trips.length === 0) return

  await Promise.all(
    trips.map((trip, index) => {
      const client = DEMO_CLIENTS[index % DEMO_CLIENTS.length]
      return db.trips.update(trip.id, {
        mainContactName: client.name,
        mainContactEmail: client.email,
      })
    }),
  )
}

const DEMO_TRIP_AMOUNTS: Pick<Trip, 'id' | 'totalCost' | 'totalCommission'> = {
  id: 'TRP-504567',
  totalCost: 18_450,
  totalCommission: 1_845,
}

export async function ensureTripDemoAmounts(): Promise<void> {
  const trip = await db.trips.get(DEMO_TRIP_ID)
  if (!trip || (trip.totalCost !== 0 && trip.totalCommission !== 0)) return
  await db.trips.update(DEMO_TRIP_AMOUNTS.id, {
    totalCost: DEMO_TRIP_AMOUNTS.totalCost,
    totalCommission: DEMO_TRIP_AMOUNTS.totalCommission,
    updatedAt: new Date().toISOString(),
  })
}

export async function ensureTripFinancialFields(): Promise<void> {
  const trips = await db.trips
    .filter(
      (trip) =>
        trip.clientPaidAmount == null ||
        trip.supplierBalanceDue == null ||
        (trip.id === DEMO_TRIP_AMOUNTS.id && (trip.clientPaidAmount ?? 0) === 0 && trip.totalCost > 0),
    )
    .toArray()
  if (trips.length === 0) return

  await Promise.all(
    trips.map((trip) => {
      const patch: Partial<Trip> = {}
      if (trip.clientPaidAmount == null) patch.clientPaidAmount = 0
      if (trip.supplierBalanceDue == null) patch.supplierBalanceDue = 0
      if (
        trip.id === DEMO_TRIP_AMOUNTS.id &&
        (trip.clientPaidAmount ?? 0) === 0 &&
        trip.totalCost > 0
      ) {
        patch.clientPaidAmount = 8_000
        patch.supplierBalanceDue = 5_200
      }
      if (Object.keys(patch).length === 0) return Promise.resolve()
      return db.trips.update(trip.id, { ...patch, updatedAt: new Date().toISOString() })
    }),
  )
}

const LEGACY_ADMIN_NAME = 'Karim Hassan'
const ADMIN_USER_ID = 'USR-001'
const ADMIN_NAME = 'Ibrahim Mahmoud'

export async function ensureAdminUserProfile(): Promise<void> {
  const user = await db.users.get(ADMIN_USER_ID)
  if (!user) return
  if (user.name === ADMIN_NAME && user.initials === 'IM') return
  await db.users.update(ADMIN_USER_ID, { name: ADMIN_NAME, initials: 'IM' })
}

export async function ensureAccountManagers(): Promise<void> {
  const users = [...buildAccountManagerUsers(), ...SYSTEM_USERS]
  const existingUsers = await db.users.bulkGet(users.map((user) => user.id))
  const usersChanged = users.some((user, index) => {
    const existing = existingUsers[index]
    return (
      !existing ||
      existing.name !== user.name ||
      existing.email !== user.email ||
      existing.role !== user.role ||
      existing.initials !== user.initials ||
      existing.isActive !== user.isActive
    )
  })

  if (usersChanged) {
    await db.users.bulkPut(users)
  }

  const ownerNameById = new Map(users.map((user) => [user.id, user.name]))
  const trips = await db.trips
    .filter((trip) => {
      if (!trip.ownerId) return false
      const ownerName = ownerNameById.get(trip.ownerId)
      return Boolean(ownerName && trip.ownerName !== ownerName)
    })
    .toArray()
  if (trips.length === 0) return

  await Promise.all(
    trips.map((trip) => {
      const ownerName = ownerNameById.get(trip.ownerId!)!
      return db.trips.update(trip.id, { ownerName, updatedAt: new Date().toISOString() })
    }),
  )
}

export async function ensureKarimHassanRenamed(): Promise<void> {
  const trips = await db.trips.filter((trip) => trip.ownerName === LEGACY_ADMIN_NAME).toArray()
  if (trips.length === 0) return
  await Promise.all(
    trips.map((trip) =>
      db.trips.update(trip.id, {
        ownerName: ADMIN_NAME,
        ownerId: ADMIN_USER_ID,
        updatedAt: new Date().toISOString(),
      }),
    ),
  )
}
