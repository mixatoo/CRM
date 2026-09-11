import { db } from '@/infrastructure/database/db'
import type { TripActivityType } from '@/domain/entities/trip-activity'
import { generateId } from '@/shared/utils/cn'

export const ACTIVITY_SEED_VERSION = 1

const SEED_ACTIONS: Array<{
  type: TripActivityType
  action: string
  summary: string
  actorName?: string
  daysAgo: number
}> = [
  { type: 'trip', action: 'stage_changed', summary: 'Stage moved to Confirmed', actorName: 'Karim Hassan', daysAgo: 1 },
  { type: 'service', action: 'service_added', summary: 'Added flight service CAI → LXR', actorName: 'Nour El Din', daysAgo: 1 },
  { type: 'payment', action: 'payment_recorded', summary: 'Client receipt EGP 45,000 recorded', actorName: 'Finance Team', daysAgo: 2 },
  { type: 'invoice', action: 'invoice_sent', summary: 'Invoice INV-2024-018 sent to client', actorName: 'Karim Hassan', daysAgo: 2 },
  { type: 'client', action: 'client_linked', summary: 'Linked global client directory record', actorName: 'Nour El Din', daysAgo: 3 },
  { type: 'service', action: 'service_updated', summary: 'Updated hotel check-in dates', actorName: 'Operations', daysAgo: 3 },
  { type: 'trip', action: 'trip_updated', summary: 'Updated passenger counts and destination notes', actorName: 'Karim Hassan', daysAgo: 4 },
  { type: 'payment', action: 'payment_confirmed', summary: 'Supplier disbursement confirmed', actorName: 'Finance Team', daysAgo: 5 },
  { type: 'invoice', action: 'invoice_created', summary: 'Draft invoice created from services', actorName: 'Nour El Din', daysAgo: 5 },
  { type: 'service', action: 'service_confirmed', summary: 'Nile cruise marked as confirmed', actorName: 'Operations', daysAgo: 6 },
  { type: 'trip', action: 'stage_changed', summary: 'Stage moved to Upcoming', actorName: 'Karim Hassan', daysAgo: 7 },
  { type: 'payment', action: 'payment_recorded', summary: 'Partial client receipt logged', actorName: 'Finance Team', daysAgo: 8 },
  { type: 'service', action: 'service_added', summary: 'Added DMC day tour in Luxor', actorName: 'Nour El Din', daysAgo: 9 },
  { type: 'invoice', action: 'invoice_paid', summary: 'Invoice marked as paid in full', actorName: 'Finance Team', daysAgo: 10 },
  { type: 'trip', action: 'trip_created', summary: 'Trip workspace opened for new inquiry', actorName: 'Sales Desk', daysAgo: 11 },
]

function daysAgoIso(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

export async function ensureActivitySeed(): Promise<void> {
  const settings = await db.settings.get('SET-001')
  const version = settings?.activitySeedVersion ?? 0
  const count = await db.tripActivities.count()

  if (count > 0 && version >= ACTIVITY_SEED_VERSION) return

  const trips = await db.trips.orderBy('updatedAt').reverse().toArray()
  if (trips.length === 0) return

  if (count === 0) {
    const items = SEED_ACTIONS.map((seed, index) => {
      const trip = trips[index % trips.length]
      return {
        id: generateId('ACT'),
        tripId: trip.id,
        type: seed.type,
        action: seed.action,
        summary: seed.summary,
        actorName: seed.actorName,
        createdAt: daysAgoIso(seed.daysAgo),
      }
    })
    await db.tripActivities.bulkAdd(items)
  }

  if (settings) {
    await db.settings.update('SET-001', { activitySeedVersion: ACTIVITY_SEED_VERSION })
  }
}
