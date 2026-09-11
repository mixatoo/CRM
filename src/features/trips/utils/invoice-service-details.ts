import type { ServiceCategory } from '@/domain/entities/trip'
import { SERVICE_CATEGORY_LABELS } from '@/domain/entities/trip'
import type { InvoiceLineDetailRow, InvoiceLineItem } from '@/domain/entities/invoice'
import { deriveFlightServiceSummary } from '@/domain/flight/ticket'
import type { TripService } from '@/domain/entities/trip-service'
import { formatServiceCategory } from '@/domain/entities/trip-service'
import { formatDate } from '@/shared/utils/date-format'

export interface InvoiceLineDetails {
  rows: InvoiceLineDetailRow[]
  note?: string
}

function formatServiceDateRange(service: Pick<TripService, 'startDate' | 'endDate'>): string | undefined {
  if (!service.startDate) return undefined
  if (service.endDate && service.endDate !== service.startDate) {
    return `${formatDate(service.startDate)} – ${formatDate(service.endDate)}`
  }
  return formatDate(service.startDate)
}

function appendRow(rows: InvoiceLineDetailRow[], label: string, value?: string | null) {
  const text = value?.trim()
  if (text) rows.push({ label, value: text })
}

function finishDetails(rows: InvoiceLineDetailRow[], notes?: string): InvoiceLineDetails {
  return { rows, note: notes?.trim() || undefined }
}

function formatGuests(count: number): string | undefined {
  if (count <= 0) return undefined
  return count === 1 ? '1 guest' : `${count} guests`
}

function formatHours(hours: number): string | undefined {
  if (hours <= 0) return undefined
  return hours === 1 ? '1 hour' : `${hours} hours`
}

function formatNights(nights: number): string | undefined {
  if (nights <= 0) return undefined
  return nights === 1 ? '1 night' : `${nights} nights`
}

function formatRooms(rooms: number): string | undefined {
  if (rooms <= 0) return undefined
  return rooms === 1 ? '1 room' : `${rooms} rooms`
}

function appendHeader(rows: InvoiceLineDetailRow[], service: TripService) {
  appendRow(rows, 'Supplier', service.supplierName)
  appendRow(rows, 'Date', formatServiceDateRange(service))
}

function isRedundantWithName(serviceName: string, value?: string): boolean {
  if (!value?.trim()) return true
  const name = serviceName.toLowerCase()
  const candidate = value.trim().toLowerCase()
  return name.includes(candidate) || candidate.includes(name)
}

function appendTransfer(rows: InvoiceLineDetailRow[], pickup?: string, dropoff?: string) {
  const from = pickup?.trim()
  const to = dropoff?.trim()
  if (!from && !to) return
  if (from && to && from === to) {
    appendRow(rows, 'Transfer', from)
    return
  }
  appendRow(rows, 'Pickup', from)
  appendRow(rows, 'Drop-off', to)
}

function activitySummary(service: TripService): InvoiceLineDetails {
  const rows: InvoiceLineDetailRow[] = []
  const d = service.activityDetails
  if (!d) return finishDetails(rows)

  appendHeader(rows, service)
  if (!isRedundantWithName(service.name, d.activityType)) {
    appendRow(rows, 'Activity', d.activityType)
  }
  appendRow(rows, 'Duration', formatHours(d.durationHours))
  appendRow(rows, 'Guests', formatGuests(d.pax))
  appendTransfer(rows, d.pickupLocation, d.dropoffLocation)
  appendRow(rows, 'Confirmation', d.confirmationNumber)
  return finishDetails(rows, service.notes)
}

function cruiseSummary(service: TripService): InvoiceLineDetails {
  const rows: InvoiceLineDetailRow[] = []
  const d = service.cruiseDetails
  if (!d) return finishDetails(rows)

  appendRow(rows, 'Supplier', service.supplierName || d.vesselName)
  appendRow(rows, 'Dates', formatServiceDateRange(service))
  if (!isRedundantWithName(service.name, d.vesselName)) {
    appendRow(rows, 'Vessel', d.vesselName)
  }
  appendRow(rows, 'Cabin', d.cabinCategory)
  appendRow(rows, 'Board', d.boardBasis)
  appendRow(rows, 'Duration', formatNights(d.nights))
  if (d.embarkPort && d.disembarkPort) {
    appendRow(rows, 'Route', `${d.embarkPort} to ${d.disembarkPort}`)
  } else {
    appendRow(rows, 'Route', d.embarkPort || d.disembarkPort)
  }
  appendRow(rows, 'Confirmation', d.confirmationNumber)
  return finishDetails(rows, service.notes)
}

function lodgingSummary(service: TripService): InvoiceLineDetails {
  const rows: InvoiceLineDetailRow[] = []
  const d = service.lodgingDetails
  if (!d) return finishDetails(rows)

  appendRow(rows, 'Property', service.supplierName || d.propertyName)
  appendRow(rows, 'Dates', formatServiceDateRange(service))
  appendRow(rows, 'Room', d.roomType)
  appendRow(rows, 'Board', d.boardBasis)
  appendRow(rows, 'Rooms', formatRooms(d.rooms))
  appendRow(rows, 'Stay', formatNights(d.nights))
  appendRow(rows, 'Confirmation', d.confirmationNumber)
  return finishDetails(rows, service.notes)
}

function restaurantSummary(service: TripService): InvoiceLineDetails {
  const rows: InvoiceLineDetailRow[] = []
  const d = service.restaurantDetails
  if (!d) return finishDetails(rows)

  appendRow(rows, 'Venue', service.supplierName || d.venueName)
  appendRow(rows, 'Date', formatServiceDateRange(service))
  appendRow(rows, 'Meal', d.mealType)
  appendRow(rows, 'Guests', formatGuests(d.pax))
  appendRow(rows, 'Reservation', d.reservationTime)
  appendRow(rows, 'Dietary notes', d.dietaryNotes)
  return finishDetails(rows, service.notes)
}

function tourSummary(service: TripService): InvoiceLineDetails {
  const rows: InvoiceLineDetailRow[] = []
  const d = service.tourDetails
  if (!d) return finishDetails(rows)

  appendHeader(rows, service)
  if (!isRedundantWithName(service.name, d.destination)) {
    appendRow(rows, 'Destination', d.destination)
  }
  appendRow(rows, 'Duration', formatHours(d.durationHours))
  appendRow(rows, 'Guests', formatGuests(d.pax))
  appendRow(rows, 'Pickup', d.pickupLocation)
  appendRow(rows, 'Guide language', d.language)
  if (d.guideIncluded) appendRow(rows, 'Guide', 'Included')
  return finishDetails(rows, service.notes)
}

function insuranceSummary(service: TripService): InvoiceLineDetails {
  const rows: InvoiceLineDetailRow[] = []
  const d = service.insuranceDetails
  if (!d) return finishDetails(rows)

  appendRow(rows, 'Provider', service.supplierName)
  appendRow(rows, 'Plan', d.providerPlan)
  appendRow(rows, 'Policy type', d.policyType)
  appendRow(rows, 'Cover', d.coverageLevel)
  appendRow(rows, 'Insured', d.insuredPax > 0 ? `${d.insuredPax} guests` : undefined)
  appendRow(rows, 'Policy', d.policyNumber)
  return finishDetails(rows, service.notes)
}

function flightSummary(service: TripService): InvoiceLineDetails {
  const rows: InvoiceLineDetailRow[] = []
  const details = service.flightDetails
  if (!details) return finishDetails(rows)

  const summary = deriveFlightServiceSummary(details)
  const tripLabel =
    details.tripType === 'multi_city' ? 'Multi-city' : details.tripType === 'round_trip' ? 'Round trip' : 'One way'
  const passengerCount = details.passengers.length

  appendRow(rows, 'Carrier', service.supplierName || summary.supplierName)
  appendRow(rows, 'Dates', formatServiceDateRange({ startDate: summary.startDate, endDate: summary.endDate }))
  appendRow(rows, 'Trip type', tripLabel)
  appendRow(rows, 'Passengers', passengerCount > 0 ? formatGuests(passengerCount) : undefined)
  appendRow(rows, 'PNR', details.bookingPnr)
  return finishDetails(rows, service.notes)
}

function genericSummary(service: TripService): InvoiceLineDetails {
  const rows: InvoiceLineDetailRow[] = []
  appendHeader(rows, service)
  return finishDetails(rows, service.notes)
}

const SUMMARY_BUILDERS: Record<ServiceCategory, (service: TripService) => InvoiceLineDetails> = {
  activity: activitySummary,
  cruise: cruiseSummary,
  flight: flightSummary,
  insurance: insuranceSummary,
  lodging: lodgingSummary,
  restaurant: restaurantSummary,
  tour: tourSummary,
}

export function normalizeInvoiceDetailSummary(summary: string): string {
  if (!summary.includes('·')) return summary
  return summary
    .split(/\s*·\s*|\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n')
}

export function formatInvoiceLineDetails(details: InvoiceLineDetails): string {
  const lines = details.rows.map((row) => `${row.label}: ${row.value}`)
  if (details.note) {
    if (lines.length > 0) lines.push('')
    lines.push(details.note)
  }
  return lines.join('\n')
}

export function parseInvoiceLineDetails(summary: string): InvoiceLineDetails {
  const normalized = normalizeInvoiceDetailSummary(summary)
  const rows: InvoiceLineDetailRow[] = []
  const miscLines: string[] = []
  let note: string | undefined
  let noteStarted = false

  for (const chunk of normalized.split('\n')) {
    const line = chunk.trim()
    if (!line) {
      if (rows.length > 0 || miscLines.length > 0) noteStarted = true
      continue
    }

    if (noteStarted) {
      note = note ? `${note}\n${line}` : line
      continue
    }

    const colonIndex = line.indexOf(':')
    if (colonIndex > 0) {
      rows.push({
        label: line.slice(0, colonIndex).trim(),
        value: line.slice(colonIndex + 1).trim(),
      })
      continue
    }

    miscLines.push(line)
  }

  if (miscLines.length > 0) {
    rows.push({ label: 'Details', value: miscLines.join('\n') })
  }

  return { rows, note }
}

export function tripServiceDetailDetails(service: TripService): InvoiceLineDetails {
  return SUMMARY_BUILDERS[service.category]?.(service) ?? genericSummary(service)
}

export function tripServiceDetailSummary(service: TripService): string {
  return formatInvoiceLineDetails(tripServiceDetailDetails(service))
}

export function resolveInvoiceLineDetails(
  line: Pick<InvoiceLineItem, 'detailRows' | 'detailNote' | 'detailSummary'>,
): InvoiceLineDetails {
  if (line.detailRows && line.detailRows.length > 0) {
    return { rows: line.detailRows, note: line.detailNote }
  }
  if (line.detailSummary?.trim()) {
    return parseInvoiceLineDetails(line.detailSummary)
  }
  return { rows: [] }
}

export function categoryLabel(category: ServiceCategory): string {
  return SERVICE_CATEGORY_LABELS[category] ?? formatServiceCategory(category)
}

export function formatTravelDatesLabel(
  startDate?: string,
  endDate?: string,
  bookingStartedAt?: string,
): string {
  if (startDate && endDate && startDate !== endDate) {
    return `${formatDate(startDate)} – ${formatDate(endDate)}`
  }
  if (startDate) return formatDate(startDate)
  if (bookingStartedAt) return `Booked ${formatDate(bookingStartedAt)}`
  return 'Dates TBC'
}

export function paymentTermsDays(issuedAt: string, dueDate: string): number {
  const issued = new Date(issuedAt)
  const due = new Date(dueDate)
  if (Number.isNaN(issued.getTime()) || Number.isNaN(due.getTime())) return 14
  const diff = Math.round((due.getTime() - issued.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}
