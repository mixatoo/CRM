import { appContainer } from '@/app/container'
import {
  assertClientWithinCreditLimit,
  resolveClientFinancialSummary,
} from '@/domain/client/client-financial'
import { resolveClientBillingAccount } from '@/domain/entities/client'
import { buildTripFinancialPatch } from '@/domain/trip/trip-financial-sync'
import type { TripActivityType } from '@/domain/entities/trip-activity'
import { db } from '@/infrastructure/database/db'
import { generateId } from '@/shared/utils/cn'

export async function syncTripFinancials(tripId: string): Promise<void> {
  const trip = await appContainer.uow.trips.findById(tripId)
  if (!trip) return

  const [services, invoices, payments] = await Promise.all([
    appContainer.uow.tripServices.findByTripId(tripId),
    appContainer.uow.invoices.findByTripId(tripId),
    appContainer.uow.payments.findByTripId(tripId),
  ])

  const patch = buildTripFinancialPatch(trip, services, invoices, payments)
  const updatedTrip = { ...trip, ...patch }

  if (trip.clientId) {
    const client = await appContainer.uow.clients.findById(trip.clientId)
    if (client && resolveClientBillingAccount(client) === 'credit' && (client.creditLimit ?? 0) > 0) {
      const linkedTrips = await db.trips.where('clientId').equals(trip.clientId).toArray()
      const beforeSummary = resolveClientFinancialSummary(client, linkedTrips)
      const tripsAfter = linkedTrips.map((row) => (row.id === tripId ? updatedTrip : row))
      const afterSummary = resolveClientFinancialSummary(client, tripsAfter)

      if (afterSummary.outstandingBalance > beforeSummary.outstandingBalance + 0.01) {
        assertClientWithinCreditLimit(client, tripsAfter)
      }
    }
  }

  await appContainer.uow.trips.update(tripId, patch)
}

export async function syncTripsFinancials(tripIds: string[]): Promise<void> {
  const unique = [...new Set(tripIds.filter(Boolean))]
  await Promise.all(unique.map((tripId) => syncTripFinancials(tripId)))
}

export async function logTripActivity(input: {
  tripId: string
  type: TripActivityType
  action: string
  summary: string
  actorName?: string
}): Promise<void> {
  const now = new Date().toISOString()
  await appContainer.uow.tripActivities.create({
    tripId: input.tripId,
    type: input.type,
    action: input.action,
    summary: input.summary,
    actorName: input.actorName,
    createdAt: now,
  })
}

export function activityId(): string {
  return generateId('ACT')
}
