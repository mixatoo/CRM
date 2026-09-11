import { db } from '@/infrastructure/database/db'
import type { TripPayment } from '@/domain/entities/trip-payment'
import { generateId } from '@/shared/utils/cn'

export const FINANCE_SEED_VERSION = 2

function daysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

export async function ensureFinanceSeed(): Promise<void> {
  const settings = await db.settings.get('SET-001')
  const version = settings?.financeSeedVersion ?? 0
  if (version >= FINANCE_SEED_VERSION) {
    const paymentCount = await db.tripPayments.count()
    if (paymentCount > 0) return
  }

  const trips = await db.trips.orderBy('updatedAt').reverse().toArray()
  if (trips.length === 0) return

  const existing = await db.tripPayments.toArray()
  const tripsWithInbound = new Set(
    existing.filter((payment) => payment.direction === 'inbound').map((payment) => payment.tripId),
  )
  const missingTrips = trips.filter((trip) => !tripsWithInbound.has(trip.id))

  if (missingTrips.length === 0 && existing.length > 0 && version >= FINANCE_SEED_VERSION) {
    return
  }

  const toSeed: Omit<TripPayment, 'id'>[] = []

  for (const [index, trip] of missingTrips.entries()) {
    const inboundAmount =
      trip.clientPaidAmount > 0 ? trip.clientPaidAmount : Math.round(Math.max(trip.totalCost, 5_000) * 0.35)
    if (inboundAmount <= 0) continue

    const now = daysAgo(index * 3)
    toSeed.push({
      tripId: trip.id,
      direction: 'inbound',
      method: index % 2 === 0 ? 'bank_transfer' : 'card',
      status: 'confirmed',
      amount: inboundAmount,
      currency: trip.currency,
      reference: `RCPT-${trip.reference}`,
      counterpartyName: trip.mainContactName ?? 'Client',
      paidAt: now,
      createdAt: now,
      updatedAt: now,
    })

    if (trip.supplierBalanceDue > 0 && index % 2 === 0) {
      const outboundAt = daysAgo(index * 3 + 1)
      toSeed.push({
        tripId: trip.id,
        direction: 'outbound',
        method: 'bank_transfer',
        status: index === 0 ? 'recorded' : 'confirmed',
        amount: Math.min(trip.supplierBalanceDue, Math.round(trip.totalCost * 0.25)),
        currency: trip.currency,
        reference: `DISB-${trip.reference}`,
        counterpartyName: 'Supplier',
        paidAt: outboundAt,
        createdAt: outboundAt,
        updatedAt: outboundAt,
      })
    }
  }

  if (toSeed.length > 0) {
    await db.tripPayments.bulkAdd(toSeed.map((payment) => ({ ...payment, id: generateId('PAY') })))
  }

  if (settings) {
    await db.settings.update('SET-001', { financeSeedVersion: FINANCE_SEED_VERSION })
  }
}
