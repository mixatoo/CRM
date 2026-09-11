import { appContainer } from '@/app/container'
import { isClientBillingBlocked } from '@/domain/client/client-financial'
import type { Invoice } from '@/domain/entities/invoice'
import type { PaymentAllocation, PaymentAllocationInput } from '@/domain/entities/payment-allocation'
import {
  buildInvoicePatchesFromAllocations,
  buildInvoiceReversalPatches,
  normalizeAllocationInputs,
  validatePaymentAllocations,
} from '@/domain/payment/apply-payment-allocations'
import type { PaymentDirection, PaymentMethod, TripPayment } from '@/domain/entities/trip-payment'
import { logTripActivity, syncTripsFinancials } from '@/infrastructure/database/trip-sync'

export interface RecordReceiptInput {
  clientId: string
  tripId?: string
  direction: PaymentDirection
  method: PaymentMethod
  amount: number
  currency: string
  paidAt: string
  allocations?: PaymentAllocationInput[]
  /** @deprecated Prefer allocations */
  invoiceId?: string
  reference?: string
  counterpartyName?: string
  notes?: string
  actorName?: string
  /** When set, allocated invoices must all belong to this trip (trip workspace). */
  restrictToTripId?: string
}

function resolveAllocations(input: RecordReceiptInput): PaymentAllocationInput[] {
  if (input.allocations && input.allocations.length > 0) {
    return normalizeAllocationInputs(input.allocations)
  }
  if (input.invoiceId) {
    return [{ invoiceId: input.invoiceId, amount: input.amount }]
  }
  return []
}

async function loadInvoicesForAllocations(allocations: PaymentAllocationInput[]): Promise<Map<string, Invoice>> {
  const invoicesById = new Map<string, Invoice>()
  const results = await Promise.all(
    [...new Set(allocations.map((row) => row.invoiceId))].map((id) => appContainer.uow.invoices.findById(id)),
  )
  for (const invoice of results) {
    if (invoice) invoicesById.set(invoice.id, invoice)
  }
  return invoicesById
}

function allocationSummary(allocations: PaymentAllocation[], invoicesById: Map<string, Invoice>): string {
  if (allocations.length === 0) return ''
  return allocations
    .map((row) => {
      const number = invoicesById.get(row.invoiceId)?.number ?? row.invoiceId
      return `${number}: ${row.amount.toFixed(2)}`
    })
    .join(', ')
}

export async function recordReceipt(input: RecordReceiptInput): Promise<TripPayment> {
  if (input.amount <= 0) throw new Error('Amount must be greater than zero')

  const client = await appContainer.uow.clients.findById(input.clientId)
  if (!client) throw new Error('Client not found')

  if (isClientBillingBlocked(client) && input.direction === 'inbound') {
    throw new Error('This account is blocked and cannot accept client payments.')
  }

  const allocations = resolveAllocations(input)
  const invoicesById = await loadInvoicesForAllocations(allocations)

  if (input.direction === 'inbound' && allocations.length > 0) {
    validatePaymentAllocations(input.amount, allocations, invoicesById)

    if (input.restrictToTripId) {
      for (const invoice of invoicesById.values()) {
        if (invoice.tripId !== input.restrictToTripId) {
          throw new Error('All allocated invoices must belong to this trip.')
        }
      }
    }

    for (const invoice of invoicesById.values()) {
      const trip = await appContainer.uow.trips.findById(invoice.tripId)
      if (!trip || trip.clientId !== input.clientId) {
        throw new Error('Allocated invoices must belong to this client.')
      }
    }
  }

  const tripIdsFromInvoices = [...new Set([...invoicesById.values()].map((invoice) => invoice.tripId))]
  const anchorTripId = input.tripId ?? tripIdsFromInvoices[0]

  const now = new Date().toISOString()
  const legacyInvoiceId = allocations.length === 1 ? allocations[0]!.invoiceId : undefined

  const payment = await appContainer.uow.payments.create({
    clientId: input.clientId,
    tripId: anchorTripId,
    invoiceId: legacyInvoiceId,
    direction: input.direction,
    method: input.method,
    status: 'confirmed',
    amount: input.amount,
    currency: input.currency,
    reference: input.reference?.trim() || undefined,
    counterpartyName: input.counterpartyName?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    paidAt: input.paidAt,
    createdAt: now,
    updatedAt: now,
  })

  let createdAllocations: PaymentAllocation[] = []
  if (input.direction === 'inbound' && allocations.length > 0) {
    createdAllocations = await appContainer.uow.paymentAllocations.createMany(payment.id, allocations)
    const patches = buildInvoicePatchesFromAllocations(allocations, invoicesById)
    await Promise.all(
      [...patches.entries()].map(([invoiceId, patch]) => appContainer.uow.invoices.update(invoiceId, patch)),
    )
  }

  const tripsToSync = new Set<string>()
  if (anchorTripId) tripsToSync.add(anchorTripId)
  for (const invoice of invoicesById.values()) tripsToSync.add(invoice.tripId)
  await syncTripsFinancials([...tripsToSync])

  const activityTripId = anchorTripId ?? tripIdsFromInvoices[0]
  if (activityTripId) {
    const summarySuffix =
      createdAllocations.length > 0
        ? ` → ${allocationSummary(createdAllocations, invoicesById)}`
        : ''
    await logTripActivity({
      tripId: activityTripId,
      type: 'payment',
      action: input.direction === 'inbound' ? 'client_payment' : 'supplier_payment',
      summary: `${input.direction === 'inbound' ? 'Client' : 'Supplier'} payment ${input.amount.toFixed(2)} ${input.currency}${summarySuffix}.`,
      actorName: input.actorName,
    })
  }

  return payment
}

export async function voidReceipt(paymentId: string): Promise<TripPayment> {
  const existing = await appContainer.uow.payments.findById(paymentId)
  if (!existing) throw new Error('Payment not found')
  if (existing.status === 'void') return existing

  const allocations = await appContainer.uow.paymentAllocations.findByPaymentId(paymentId)
  const legacyAllocations: PaymentAllocationInput[] =
    allocations.length > 0
      ? allocations.map((row) => ({ invoiceId: row.invoiceId, amount: row.amount }))
      : existing.invoiceId
        ? [{ invoiceId: existing.invoiceId, amount: existing.amount }]
        : []

  const invoicesById = await loadInvoicesForAllocations(legacyAllocations)
  const patches = buildInvoiceReversalPatches(legacyAllocations, invoicesById)

  await Promise.all(
    [...patches.entries()].map(([invoiceId, patch]) => appContainer.uow.invoices.update(invoiceId, patch)),
  )

  const updated = await appContainer.uow.payments.update(paymentId, {
    status: 'void',
    updatedAt: new Date().toISOString(),
  })

  await appContainer.uow.paymentAllocations.deleteByPaymentId(paymentId)

  const tripsToSync = new Set<string>()
  if (existing.tripId) tripsToSync.add(existing.tripId)
  for (const invoice of invoicesById.values()) tripsToSync.add(invoice.tripId)
  await syncTripsFinancials([...tripsToSync])

  return updated
}
