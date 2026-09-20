import { db } from '@/infrastructure/database/db'
import { tripTotalSelling, type Trip } from '@/domain/entities'
import type { Invoice, InvoiceStatus } from '@/domain/entities/invoice'
import { generateId } from '@/shared/utils/cn'
import { INVOICE_SEED_VERSION } from '@/infrastructure/database/bootstrap-versions'

export { INVOICE_SEED_VERSION }

const STATUS_CYCLE: InvoiceStatus[] = ['draft', 'pending', 'sent', 'paid', 'sent', 'pending', 'sent', 'paid']

function daysAgo(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

function dueIn(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function buildInvoiceForTrip(trip: Trip, index: number): Invoice {
  const status = STATUS_CYCLE[index % STATUS_CYCLE.length]
  const total = Math.max(tripTotalSelling(trip), trip.totalCost || 25_000)
  const taxRate = 14
  const subtotal = Math.round((total / (1 + taxRate / 100)) * 100) / 100
  const taxAmount = Math.round((total - subtotal) * 100) / 100
  const issuedAt = daysAgo(index * 4 + 2)
  const amountPaid = status === 'paid' ? total : status === 'sent' ? Math.round(total * 0.4) : 0

  return {
    id: generateId('INV'),
    tripId: trip.id,
    number: `INV-2026-${String(200 + index).padStart(3, '0')}`,
    status,
    clientName: trip.mainContactName ?? 'Client',
    clientEmail: trip.mainContactEmail,
    currency: trip.currency,
    lineItems: [
      {
        id: generateId('LINE'),
        description: `${trip.name} — travel services`,
        quantity: 1,
        unitAmount: subtotal,
        amount: subtotal,
        currency: trip.currency,
      },
    ],
    subtotal,
    taxRate,
    taxAmount,
    total,
    amountPaid,
    issuedAt,
    dueDate: dueIn(status === 'paid' ? -5 : index % 3 === 0 ? -3 : index % 2 === 0 ? 4 : 18),
    createdAt: issuedAt,
    updatedAt: issuedAt,
  }
}

export async function ensureInvoiceSeed() {
  const settings = await db.settings.get('SET-001')
  const version = settings?.invoiceSeedVersion ?? 0
  const trips = await db.trips.orderBy('updatedAt').reverse().toArray()
  if (trips.length === 0) return

  const existing = await db.invoices.toArray()
  const invoicedTripIds = new Set(existing.map((invoice) => invoice.tripId))
  const missingTrips = trips.filter((trip) => !invoicedTripIds.has(trip.id))

  if (missingTrips.length > 0) {
    const startIndex = existing.length
    await db.invoices.bulkAdd(
      missingTrips.map((trip, offset) => buildInvoiceForTrip(trip, startIndex + offset)),
    )
  } else if (existing.length > 0 && version >= INVOICE_SEED_VERSION) {
    return
  }

  if (settings) await db.settings.update('SET-001', { invoiceSeedVersion: INVOICE_SEED_VERSION })
}
