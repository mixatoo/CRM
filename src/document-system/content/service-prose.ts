import type { InvoiceLineDetailRow } from '@/domain/entities/invoice'
import type { TripService } from '@/domain/entities/trip-service'
import { deriveCategoryServiceLabel } from '@/domain/entities/trip-service-category-details'
import { deriveFlightServiceSummary } from '@/domain/flight/ticket'
import { formatDate } from '@/shared/utils/date-format'
import { tripServiceDetailDetails } from '@/features/trips/utils/invoice-service-details'

function joinClauses(clauses: Array<string | false | null | undefined>): string {
  return clauses
    .filter((clause): clause is string => typeof clause === 'string' && clause.trim().length > 0)
    .map((clause) => clause.trim())
    .join(', ')
    .replace(/,\s*([.!?])/g, '$1')
}

function withPeriod(text: string): string {
  const trimmed = text.trim()
  if (!trimmed) return ''
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`
}

function formatGuests(count: number): string | undefined {
  if (count <= 0) return undefined
  return count === 1 ? '1 guest' : `${count} guests`
}

function serviceDatePhrase(service: Pick<TripService, 'startDate' | 'endDate'>): string | undefined {
  if (!service.startDate) return undefined
  if (service.endDate && service.endDate !== service.startDate) {
    return `from ${formatDate(service.startDate)} to ${formatDate(service.endDate)}`
  }
  return `on ${formatDate(service.startDate)}`
}

export function formatTripServiceProse(service: TripService): string {
  const title = deriveCategoryServiceLabel(service)
  const datePhrase = serviceDatePhrase(service)
  const supplier = service.supplierName?.trim()

  switch (service.category) {
    case 'restaurant': {
      const d = service.restaurantDetails
      if (!d) return withPeriod(joinClauses([title, datePhrase, supplier && `via ${supplier}`]))
      const venue = d.venueName.trim() || title
      const meal = d.mealType.trim()
      const guests = formatGuests(d.pax)
      return withPeriod(
        joinClauses([
          meal ? `${meal} at ${venue}` : venue,
          datePhrase,
          guests && `for ${guests}`,
          d.reservationTime.trim() && `reservation at ${d.reservationTime.trim()}`,
          d.dietaryNotes.trim(),
          supplier && supplier !== venue && `arranged through ${supplier}`,
        ]),
      )
    }
    case 'lodging': {
      const d = service.lodgingDetails
      if (!d) return withPeriod(joinClauses([title, datePhrase]))
      const property = d.propertyName.trim() || title
      const nights = d.nights > 0 ? `${d.nights} night${d.nights === 1 ? '' : 's'}` : undefined
      return withPeriod(
        joinClauses([
          `${property}`,
          d.roomType.trim() && `${d.roomType.trim()} room`,
          d.boardBasis.trim() && d.boardBasis.trim(),
          datePhrase,
          nights && `${nights} stay`,
          d.rooms > 0 && `${d.rooms} room${d.rooms === 1 ? '' : 's'}`,
          d.confirmationNumber.trim() && `confirmation ${d.confirmationNumber.trim()}`,
        ]),
      )
    }
    case 'tour': {
      const d = service.tourDetails
      if (!d) return withPeriod(joinClauses([title, datePhrase]))
      const destination = d.destination.trim() || title
      return withPeriod(
        joinClauses([
          `${destination} tour`,
          datePhrase,
          d.durationHours > 0 && `${d.durationHours}-hour experience`,
          formatGuests(d.pax) && `for ${formatGuests(d.pax)}`,
          d.pickupLocation.trim() && `pickup at ${d.pickupLocation.trim()}`,
          d.language.trim() && `${d.language.trim()} guide`,
          d.guideIncluded && 'professional guide included',
        ]),
      )
    }
    case 'activity': {
      const d = service.activityDetails
      if (!d) return withPeriod(joinClauses([title, datePhrase]))
      const activity = d.activityType.trim() || title
      const transfer =
        d.pickupLocation.trim() && d.dropoffLocation.trim()
          ? `transfer from ${d.pickupLocation.trim()} to ${d.dropoffLocation.trim()}`
          : d.pickupLocation.trim()
            ? `pickup at ${d.pickupLocation.trim()}`
            : undefined
      return withPeriod(
        joinClauses([
          activity,
          datePhrase,
          d.durationHours > 0 && `${d.durationHours}-hour activity`,
          formatGuests(d.pax) && `for ${formatGuests(d.pax)}`,
          transfer,
          d.confirmationNumber.trim() && `confirmation ${d.confirmationNumber.trim()}`,
        ]),
      )
    }
    case 'cruise': {
      const d = service.cruiseDetails
      if (!d) return withPeriod(joinClauses([title, datePhrase]))
      const vessel = d.vesselName.trim() || title
      const route =
        d.embarkPort.trim() && d.disembarkPort.trim()
          ? `sailing ${d.embarkPort.trim()} to ${d.disembarkPort.trim()}`
          : undefined
      return withPeriod(
        joinClauses([
          `${vessel} cruise`,
          d.cabinCategory.trim() && `${d.cabinCategory.trim()} cabin`,
          d.boardBasis.trim() && d.boardBasis.trim(),
          datePhrase,
          d.nights > 0 && `${d.nights}-night voyage`,
          route,
          d.confirmationNumber.trim() && `confirmation ${d.confirmationNumber.trim()}`,
        ]),
      )
    }
    case 'flight': {
      const details = service.flightDetails
      if (!details) return withPeriod(joinClauses([title, datePhrase]))
      const summary = deriveFlightServiceSummary(details)
      const tripLabel =
        details.tripType === 'multi_city'
          ? 'multi-city itinerary'
          : details.tripType === 'round_trip'
            ? 'round-trip flights'
            : 'one-way flights'
      const pax = details.passengers.length
      return withPeriod(
        joinClauses([
          title,
          tripLabel,
          summary.startDate &&
            `departing ${formatDate(summary.startDate)}${summary.endDate && summary.endDate !== summary.startDate ? ` through ${formatDate(summary.endDate)}` : ''}`,
          pax > 0 && `for ${formatGuests(pax)}`,
          details.bookingPnr?.trim() && `PNR ${details.bookingPnr.trim()}`,
          supplier && `issued via ${supplier}`,
        ]),
      )
    }
    case 'insurance': {
      const d = service.insuranceDetails
      if (!d) return withPeriod(joinClauses([title, datePhrase]))
      return withPeriod(
        joinClauses([
          d.providerPlan.trim() || title,
          d.policyType.trim() && `${d.policyType.trim()} coverage`,
          d.coverageLevel.trim() && d.coverageLevel.trim(),
          d.insuredPax > 0 && `covering ${formatGuests(d.insuredPax)}`,
          datePhrase,
          d.policyNumber.trim() && `policy ${d.policyNumber.trim()}`,
        ]),
      )
    }
    default:
      return withPeriod(joinClauses([title, datePhrase, supplier && `via ${supplier}`]))
  }
}

function detailRowToClause(row: InvoiceLineDetailRow): string | undefined {
  const label = row.label.trim().toLowerCase()
  const value = row.value.trim()
  if (!value) return undefined

  if (label === 'date' || label === 'dates') return value.startsWith('on ') || value.startsWith('from ') ? value : `on ${value}`
  if (label === 'guests' || label === 'insured' || label === 'passengers') {
    return value.startsWith('for ') ? value : `for ${value}`
  }
  if (label === 'duration' || label === 'stay') return value
  if (label === 'reservation') return `reservation at ${value}`
  if (label === 'pickup') return `pickup at ${value}`
  if (label === 'drop-off' || label === 'dropoff') return `drop-off at ${value}`
  if (label === 'transfer') return `transfer from ${value}`
  if (label === 'route') return value.includes(' to ') ? value : `route ${value}`
  if (label === 'confirmation' || label === 'policy') return `${label} ${value}`
  if (label === 'supplier' || label === 'carrier' || label === 'provider' || label === 'property' || label === 'venue') {
    return value
  }
  return value
}

export function formatDetailRowsProse(rows: InvoiceLineDetailRow[], note?: string): string {
  const clauses = rows.map(detailRowToClause).filter(Boolean)
  const body = joinClauses(clauses as string[])
  const noteText = note?.trim()
  if (!body && !noteText) return ''
  if (!noteText) return withPeriod(body)
  if (!body) return withPeriod(noteText)
  return withPeriod(`${body}. ${noteText}`)
}

export function formatInvoiceLineProse(line: {
  description: string
  detailRows?: InvoiceLineDetailRow[]
  detailNote?: string
  detailSummary?: string
}): string {
  const title = line.description.trim()
  if (line.detailRows && line.detailRows.length > 0) {
    const prose = formatDetailRowsProse(line.detailRows, line.detailNote)
    return prose ? `${title} — ${prose}` : title
  }
  if (line.detailSummary?.trim()) {
    const normalized = line.detailSummary.includes(':')
      ? formatDetailRowsProse(
          line.detailSummary
            .split(/\n|·/)
            .map((chunk) => {
              const colon = chunk.indexOf(':')
              if (colon <= 0) return { label: 'Details', value: chunk.trim() }
              return { label: chunk.slice(0, colon).trim(), value: chunk.slice(colon + 1).trim() }
            })
            .filter((row) => row.value),
          line.detailNote,
        )
      : line.detailSummary.trim()
    return normalized ? `${title} — ${normalized}` : title
  }
  if (line.detailNote?.trim()) return `${title} — ${withPeriod(line.detailNote.trim())}`
  return title
}

export function formatInvoiceLineProseFromService(service: TripService): string {
  const details = tripServiceDetailDetails(service)
  const prose = formatDetailRowsProse(details.rows, details.note ?? service.notes)
  const title = deriveCategoryServiceLabel(service)
  const rich = formatTripServiceProse(service)
  if (rich.length > title.length + 10) return rich
  return prose ? `${title} — ${prose}` : title
}
