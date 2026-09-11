import { db } from '@/infrastructure/database/db'
import { computeServiceBreakdown } from '@/domain/entities/trip-service'
import type { TripService } from '@/domain/entities/trip-service'
import { migrateFlightServiceDetails } from '@/domain/entities/trip-service-flight'
import {
  DEMO_TRIP_ID,
  mockServicesForTrip,
  TRIP_SERVICES_MOCK_VERSION,
} from '@/infrastructure/database/mocks/trip-services.mock'

let ensureTripServicesPromise: Promise<void> | null = null

async function syncTripBreakdowns(services: TripService[]) {
  const byTrip = new Map<string, TripService[]>()
  for (const service of services) {
    const list = byTrip.get(service.tripId) ?? []
    list.push(service)
    byTrip.set(service.tripId, list)
  }

  await Promise.all(
    Array.from(byTrip.entries()).map(([tripId, tripServices]) =>
      db.trips.update(tripId, {
        serviceBreakdown: computeServiceBreakdown(tripServices),
        updatedAt: new Date().toISOString(),
      }),
    ),
  )
}

async function markMockVersion() {
  const settings = await db.settings.get('SET-001')
  if (settings) {
    await db.settings.update('SET-001', { tripServicesMockVersion: TRIP_SERVICES_MOCK_VERSION })
    return
  }
  await db.settings.put({
    id: 'SET-001',
    companyName: 'Egyliere',
    defaultCurrency: 'EGP',
    tripServicesMockVersion: TRIP_SERVICES_MOCK_VERSION,
  })
}

/** Idempotent write — safe when init runs twice (e.g. React StrictMode). */
async function upsertTripServices(services: TripService[]) {
  if (services.length === 0) return
  await db.tripServices.bulkPut(services)
  await syncTripBreakdowns(services)
}

async function seedTripServices(): Promise<void> {
  const count = await db.tripServices.count()
  if (count > 0) return

  const trips = await db.trips.orderBy('reference').toArray()
  const services = trips.flatMap((trip, index) => mockServicesForTrip(trip, index))
  if (services.length === 0) return

  await db.transaction('rw', [db.tripServices, db.trips], async () => {
    await upsertTripServices(services)
  })
}

async function backfillMissingTripServices() {
  const trips = await db.trips.orderBy('reference').toArray()
  const missing: TripService[] = []

  const serviceCounts = await Promise.all(
    trips.map((trip) => db.tripServices.where('tripId').equals(trip.id).count()),
  )

  for (let index = 0; index < trips.length; index += 1) {
    if (serviceCounts[index]! > 0) continue
    missing.push(...mockServicesForTrip(trips[index]!, index))
  }

  if (missing.length === 0) return

  await db.transaction('rw', [db.tripServices, db.trips], async () => {
    await upsertTripServices(missing)
  })
}

async function ensureFlightDetailsBackfill() {
  const flightServices = await db.tripServices
    .filter((service) => service.category === 'flight' && Boolean(service.flightDetails))
    .toArray()
  const updates: TripService[] = []

  for (const service of flightServices) {
    if (!service.flightDetails) continue
    const migrated = migrateFlightServiceDetails(service.flightDetails)
    if (JSON.stringify(service.flightDetails) === JSON.stringify(migrated)) continue
    updates.push({
      ...service,
      flightDetails: migrated,
      updatedAt: new Date().toISOString(),
    })
  }

  if (updates.length === 0) return

  await db.tripServices.bulkPut(updates)
}

async function upgradeAllTripServices() {
  const settings = await db.settings.get('SET-001')
  const storedVersion = settings?.tripServicesMockVersion ?? 0
  if (storedVersion >= TRIP_SERVICES_MOCK_VERSION) return

  const trips = await db.trips.orderBy('reference').toArray()
  if (trips.length === 0) return

  const services = trips.flatMap((trip, index) => mockServicesForTrip(trip, index))

  await db.transaction('rw', [db.tripServices, db.trips, db.settings], async () => {
    await db.tripServices.clear()
    await upsertTripServices(services)
    await markMockVersion()
  })
}


/** Ensure a single trip has mock services (called when opening Services tab). */
export async function ensureTripServicesForTrip(tripId: string): Promise<number> {
  const existing = await db.tripServices.where('tripId').equals(tripId).count()
  if (existing > 0) return existing

  const trips = await db.trips.orderBy('reference').toArray()
  const tripIndex = trips.findIndex((trip) => trip.id === tripId)
  const trip = tripIndex >= 0 ? trips[tripIndex] : await db.trips.get(tripId)
  if (!trip) return 0

  const services = mockServicesForTrip(trip, Math.max(tripIndex, 0))

  await db.transaction('rw', [db.tripServices, db.trips], async () => {
    const countAfterRace = await db.tripServices.where('tripId').equals(tripId).count()
    if (countAfterRace > 0) return
    await upsertTripServices(services)
  })

  if (tripId === DEMO_TRIP_ID) {
    await markMockVersion()
  }

  return services.length
}

async function ensureTripServicesWork(): Promise<void> {
  const settings = await db.settings.get('SET-001')
  const storedVersion = settings?.tripServicesMockVersion ?? 0
  if (storedVersion >= TRIP_SERVICES_MOCK_VERSION) {
    const [tripCount, serviceCount] = await Promise.all([db.trips.count(), db.tripServices.count()])
    if (tripCount === 0 || serviceCount > 0) return
  }

  await seedTripServices()
  await backfillMissingTripServices()
  await ensureFlightDetailsBackfill()
  await upgradeAllTripServices()

  const tripCount = await db.trips.count()
  const serviceCount = await db.tripServices.count()
  if (tripCount > 0 && serviceCount === 0) {
    const trips = await db.trips.orderBy('reference').toArray()
    const services = trips.flatMap((trip, index) => mockServicesForTrip(trip, index))
    await db.transaction('rw', [db.tripServices, db.trips], async () => {
      await upsertTripServices(services)
    })
  }
}

export function ensureTripServices(): Promise<void> {
  if (!ensureTripServicesPromise) {
    ensureTripServicesPromise = ensureTripServicesWork()
      .catch((error) => {
        ensureTripServicesPromise = null
        console.error('[ensureTripServices] failed', error)
        throw error
      })
  }
  return ensureTripServicesPromise
}
