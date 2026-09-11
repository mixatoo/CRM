import type { Trip } from '@/domain/entities'
import { TRIP_STAGE_LABELS } from '@/domain/entities/trip'
import type { Invoice, InvoiceLineItem, InvoiceStatus } from '@/domain/entities/invoice'
import { computeInvoiceTotals } from '@/domain/entities/invoice'
import type { TripService } from '@/domain/entities/trip-service'
import { tripServiceSelling } from '@/features/trips/components/services/trip-service-financial'
import {
  categoryLabel,
  formatTravelDatesLabel,
  paymentTermsDays,
  tripServiceDetailDetails,
  formatInvoiceLineDetails,
  normalizeInvoiceDetailSummary,
  parseInvoiceLineDetails,
} from '@/features/trips/utils/invoice-service-details'
import { generateId } from '@/shared/utils/cn'
import { formatDate, parseDateInput } from '@/shared/utils/date-format'

export interface InvoiceCompanyProfile {
  name: string
  tagline: string
  /** Company logo — data URL or image URL for invoice header. */
  logoUrl?: string
  addressLine1: string
  addressLine2: string
  phone: string
  email: string
  website: string
  taxRegistration: string
  bankName: string
  bankAccountName: string
  accountNumber: string
  iban: string
  swift: string
}

export interface InvoiceTripSummary {
  reference: string
  name: string
  destination?: string
  branch: string
  stage: string
  tripType?: string
  startDate?: string
  endDate?: string
  travelDatesLabel: string
  adults: number
  minors: number
  totalTravelers: number
  ownerName: string
  agentName?: string
  agentEmail?: string
  bookingDate: string
}

export interface InvoiceCategoryBreakdown {
  category: string
  label: string
  count: number
  amount: number
}

export interface InvoiceDocumentData {
  company: InvoiceCompanyProfile
  /** @deprecated Use company.name — kept for quick access */
  companyName: string
  invoiceNumber: string
  status?: InvoiceStatus
  trip: InvoiceTripSummary
  /** @deprecated Use trip.reference / trip.name */
  tripReference: string
  /** @deprecated Use trip.name */
  tripName: string
  clientName: string
  clientEmail?: string
  issuedAt: string
  dueDate: string
  paymentTermsDays: number
  currency: string
  lineItems: InvoiceLineItem[]
  categoryBreakdown: InvoiceCategoryBreakdown[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  amountPaid?: number
  balanceDue?: number
  notes?: string
  paymentInstructions: string
  termsAndConditions: string
  documentGeneratedAt: string
}

export const DEFAULT_INVOICE_COMPANY: InvoiceCompanyProfile = {
  name: 'Egyliere',
  tagline: 'Premium travel operations & client billing',
  addressLine1: '12 Nile Corniche, Garden City',
  addressLine2: 'Cairo, Egypt',
  phone: '+20 2 0000 0000',
  email: 'billing@egyliere.com',
  website: 'www.egyliere.com',
  taxRegistration: 'EG-TIN-000000000',
  bankName: 'National Bank of Egypt',
  bankAccountName: 'Egyliere Travel Operations',
  accountNumber: '00000000000000',
  iban: 'EG000000000000000000000000000',
  swift: 'NBEGEGCX',
}

export const DEFAULT_PAYMENT_INSTRUCTIONS =
  'Please reference the invoice number on all transfers. Partial payments are applied oldest invoice first unless otherwise agreed in writing.'

export const DEFAULT_INVOICE_TERMS =
  'All amounts are due by the stated due date. Late payments may incur finance charges. Travel services are subject to supplier terms, cancellation policies, and passport/visa requirements. Disputes must be raised within 7 days of invoice date.'

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function buildTripSummary(trip: Trip): InvoiceTripSummary {
  return {
    reference: trip.reference,
    name: trip.name,
    destination: trip.destination,
    branch: trip.branch,
    stage: TRIP_STAGE_LABELS[trip.stage],
    tripType: trip.tripType,
    startDate: trip.startDate,
    endDate: trip.endDate,
    travelDatesLabel: formatTravelDatesLabel(trip.startDate, trip.endDate, trip.bookingStartedAt),
    adults: trip.adults,
    minors: trip.minors,
    totalTravelers: trip.adults + trip.minors,
    ownerName: trip.ownerName,
    agentName: trip.agentName,
    agentEmail: trip.agentEmail,
    bookingDate: trip.bookingStartedAt.slice(0, 10),
  }
}

export function enrichLineItemFromService(service: TripService, base?: Partial<InvoiceLineItem>): InvoiceLineItem {
  const unitAmount = base?.unitAmount ?? tripServiceSelling(service)
  const quantity = base?.quantity ?? 1
  const details = tripServiceDetailDetails(service)
  return {
    id: base?.id ?? generateId('LIN'),
    serviceId: service.id,
    description: base?.description ?? service.name,
    quantity,
    unitAmount,
    amount: base?.amount ?? unitAmount * quantity,
    currency: base?.currency ?? service.currency,
    category: service.category,
    serviceStatus: service.status,
    lineNumber: service.lineNumber,
    supplierName: service.supplierName,
    serviceStartDate: service.startDate,
    serviceEndDate: service.endDate,
    detailRows: details.rows,
    detailNote: details.note,
    detailSummary: formatInvoiceLineDetails(details),
  }
}

export function previewLineItemsFromServices(
  services: TripService[],
  selectedIds: string[],
): InvoiceLineItem[] {
  return services
    .filter((service) => selectedIds.includes(service.id))
    .map((service) => enrichLineItemFromService(service))
}

function mergeLineItemWithService(line: InvoiceLineItem, service?: TripService): InvoiceLineItem {
  if (!service) {
    if (!line.detailSummary && !line.detailRows?.length) return line
    const parsed = line.detailRows?.length
      ? { rows: line.detailRows, note: line.detailNote }
      : parseInvoiceLineDetails(normalizeInvoiceDetailSummary(line.detailSummary ?? ''))
    return {
      ...line,
      detailRows: parsed.rows,
      detailNote: parsed.note,
      detailSummary: formatInvoiceLineDetails(parsed),
    }
  }
  const enriched = enrichLineItemFromService(service, line)
  return {
    ...enriched,
    id: line.id,
    description: line.description,
    quantity: line.quantity,
    unitAmount: line.unitAmount,
    amount: line.amount,
    currency: line.currency,
    detailRows: enriched.detailRows,
    detailNote: enriched.detailNote,
    detailSummary: enriched.detailSummary,
    category: line.category ?? enriched.category,
    serviceStatus: line.serviceStatus ?? enriched.serviceStatus,
    lineNumber: line.lineNumber ?? enriched.lineNumber,
    supplierName: line.supplierName ?? enriched.supplierName,
    serviceStartDate: line.serviceStartDate ?? enriched.serviceStartDate,
    serviceEndDate: line.serviceEndDate ?? enriched.serviceEndDate,
  }
}

export function buildCategoryBreakdown(lineItems: InvoiceLineItem[]): InvoiceCategoryBreakdown[] {
  const map = new Map<string, InvoiceCategoryBreakdown>()
  for (const line of lineItems) {
    const key = line.category ?? 'other'
    const label = line.category ? categoryLabel(line.category) : 'Other'
    const row = map.get(key) ?? { category: key, label, count: 0, amount: 0 }
    row.count += 1
    row.amount += line.amount
    map.set(key, row)
  }
  return [...map.values()].sort((a, b) => b.amount - a.amount)
}

function assembleDocument(
  trip: Trip,
  options: {
    invoiceNumber: string
    status?: InvoiceStatus
    clientName: string
    clientEmail?: string
    issuedAt: string
    dueDate: string
    lineItems: InvoiceLineItem[]
    taxRate: number
    notes?: string
    amountPaid?: number
    company?: InvoiceCompanyProfile
    paymentInstructions?: string
    termsAndConditions?: string
  },
): InvoiceDocumentData {
  const company = options.company ?? DEFAULT_INVOICE_COMPANY
  const totals = computeInvoiceTotals(options.lineItems, options.taxRate)
  const amountPaid = options.amountPaid ?? 0
  const balanceDue = Math.max(0, totals.total - amountPaid)
  const tripSummary = buildTripSummary(trip)
  const termsDays = paymentTermsDays(options.issuedAt, options.dueDate)

  return {
    company,
    companyName: company.name,
    invoiceNumber: options.invoiceNumber,
    status: options.status,
    trip: tripSummary,
    tripReference: trip.reference,
    tripName: trip.name,
    clientName: options.clientName,
    clientEmail: options.clientEmail,
    issuedAt: options.issuedAt,
    dueDate: options.dueDate,
    paymentTermsDays: termsDays,
    currency: trip.currency,
    lineItems: options.lineItems,
    categoryBreakdown: buildCategoryBreakdown(options.lineItems),
    subtotal: totals.subtotal,
    taxRate: options.taxRate,
    taxAmount: totals.taxAmount,
    total: totals.total,
    amountPaid,
    balanceDue,
    notes: options.notes,
    paymentInstructions: options.paymentInstructions ?? DEFAULT_PAYMENT_INSTRUCTIONS,
    termsAndConditions: options.termsAndConditions ?? DEFAULT_INVOICE_TERMS,
    documentGeneratedAt: new Date().toISOString(),
  }
}

export function buildInvoiceDocumentPreview(
  trip: Trip,
  options: {
    invoiceNumber: string
    status?: InvoiceStatus
    clientName: string
    clientEmail?: string
    issuedAt: string
    dueDate: string
    lineItems: InvoiceLineItem[]
    taxRate: number
    notes?: string
    amountPaid?: number
    companyName?: string
    services?: TripService[]
  },
): InvoiceDocumentData {
  const serviceMap = new Map((options.services ?? []).map((service) => [service.id, service]))
  const lineItems = options.lineItems.map((line) =>
    line.serviceId ? mergeLineItemWithService(line, serviceMap.get(line.serviceId)) : line,
  )

  const company = options.companyName
    ? { ...DEFAULT_INVOICE_COMPANY, name: options.companyName }
    : DEFAULT_INVOICE_COMPANY

  return assembleDocument(trip, { ...options, lineItems, company })
}

export function invoiceToDocumentData(
  invoice: Invoice,
  trip: Trip,
  options?: { companyName?: string; services?: TripService[] },
): InvoiceDocumentData {
  const serviceMap = new Map((options?.services ?? []).map((service) => [service.id, service]))
  const lineItems = invoice.lineItems.map((line) =>
    line.serviceId ? mergeLineItemWithService(line, serviceMap.get(line.serviceId)) : line,
  )

  const company = options?.companyName
    ? { ...DEFAULT_INVOICE_COMPANY, name: options.companyName }
    : DEFAULT_INVOICE_COMPANY

  return assembleDocument(trip, {
    invoiceNumber: invoice.number,
    status: invoice.status,
    clientName: invoice.clientName,
    clientEmail: invoice.clientEmail,
    issuedAt: invoice.issuedAt,
    dueDate: invoice.dueDate,
    lineItems,
    taxRate: invoice.taxRate,
    notes: invoice.notes,
    amountPaid: invoice.amountPaid,
    company,
  })
}

export function draftInvoiceNumber(trip: Trip, sequence: number): string {
  return `${trip.reference}-INV-${String(sequence).padStart(2, '0')}`
}

export function formatInvoiceLongDate(value?: string | Date | null, fallback = '—'): string {
  const date = parseDateInput(value)
  if (!date) return fallback
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export function companyBrandInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length >= 2) return `${words[0]![0]}${words[1]![0]}`.toUpperCase()
  return name.slice(0, 2).toUpperCase() || 'Co'
}

export function formatInvoiceAmountValue(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatInvoiceMoney(amount: number, currency: string): string {
  if (amount === 0) return `${currency} 0.00`
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatLineServiceDates(line: InvoiceLineItem): string {
  if (!line.serviceStartDate) return '—'
  if (line.serviceEndDate && line.serviceEndDate !== line.serviceStartDate) {
    return `${formatDate(line.serviceStartDate)} – ${formatDate(line.serviceEndDate)}`
  }
  return formatDate(line.serviceStartDate)
}
