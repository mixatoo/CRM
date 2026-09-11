import type { Trip } from '@/domain/entities'
import type { TripService } from '@/domain/entities/trip-service'
import {
  computeInvoiceTotals,
  type Invoice,
  type InvoiceLineItem,
} from '@/domain/entities/invoice'
import { enrichLineItemFromService } from '@/features/trips/utils/invoice-document'
import { generateId } from '@/shared/utils/cn'

export interface CreateInvoiceInput {
  serviceIds: string[]
  issuedAt: string
  dueDate: string
  notes?: string
  taxRate?: number
  clientName?: string
  clientEmail?: string
}

import {
  computeDueDateFromPaymentTerm,
  type PaymentTerm,
} from '@/domain/entities/payment-term'

function addDays(isoDate: string, days: number): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return isoDate
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export function defaultInvoiceDueDate(trip: Trip, issuedAt?: string, paymentTerm?: PaymentTerm | null): string {
  const invoiceDate = (issuedAt ?? new Date().toISOString()).slice(0, 10)
  if (paymentTerm) {
    return computeDueDateFromPaymentTerm(invoiceDate, paymentTerm)
  }
  const base = trip.startDate ?? trip.bookingStartedAt
  return addDays(base.slice(0, 10), 14)
}

export function billableTripServices(services: TripService[]): TripService[] {
  return services.filter((service) => service.status !== 'canceled')
}

export function defaultSelectedServiceIds(services: TripService[]): string[] {
  return billableTripServices(services)
    .filter((service) => service.status === 'confirmed')
    .map((service) => service.id)
}

export function serviceToInvoiceLineItem(service: TripService): InvoiceLineItem {
  return enrichLineItemFromService(service, { id: generateId('LIN') })
}

export function formatInvoiceNumber(tripReference: string, sequence: number): string {
  return `${tripReference}-INV-${String(sequence).padStart(2, '0')}`
}

export function buildInvoiceDraft(
  trip: Trip,
  services: TripService[],
  input: CreateInvoiceInput,
  existingInvoiceCount: number,
): Omit<Invoice, 'id'> {
  const now = new Date().toISOString()
  const selected = billableTripServices(services).filter((service) => input.serviceIds.includes(service.id))
  const lineItems = selected.map(serviceToInvoiceLineItem)
  const taxRate = input.taxRate ?? 0
  const totals = computeInvoiceTotals(lineItems, taxRate)

  return {
    tripId: trip.id,
    number: formatInvoiceNumber(trip.reference, existingInvoiceCount + 1),
    status: 'draft',
    clientName: input.clientName?.trim() || trip.mainContactName || trip.name,
    clientEmail: input.clientEmail?.trim() || trip.mainContactEmail,
    currency: trip.currency,
    lineItems,
    subtotal: totals.subtotal,
    taxRate,
    taxAmount: totals.taxAmount,
    total: totals.total,
    amountPaid: 0,
    notes: input.notes?.trim() || undefined,
    issuedAt: input.issuedAt || now.slice(0, 10),
    dueDate: input.dueDate,
    createdAt: now,
    updatedAt: now,
  }
}
