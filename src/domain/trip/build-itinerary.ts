import type { Trip } from '@/domain/entities'
import { SERVICE_CATEGORY_LABELS } from '@/domain/entities/trip'
import type { TripItineraryNote } from '@/domain/entities/trip-itinerary-note'
import { ITINERARY_UNSCHEDULED_DAY_KEY } from '@/domain/entities/trip-itinerary-note'
import { deriveCategoryServiceLabel } from '@/domain/entities/trip-service-category-details'
import type { TripService, TripServiceStatus } from '@/domain/entities/trip-service'
import { segmentDepartureTimestamp } from '@/domain/flight/ticket'
import { formatDate, formatDateParts, parseDateInput, toLocalIsoDate } from '@/shared/utils/date-format'

export type ItineraryEntryKind = 'service' | 'flight-segment' | 'note'

export interface ItineraryEntry {
  id: string
  kind: ItineraryEntryKind
  dayKey: string
  sortKey: number
  timeLabel?: string
  title: string
  subtitle?: string
  detail?: string
  status?: TripServiceStatus
  categoryLabel?: string
  serviceId?: string
  serviceHref?: string
  noteId?: string
}

export interface ItineraryDay {
  dayKey: string
  label: string
  weekday?: string
  dayNumber?: number
  entries: ItineraryEntry[]
  isGap: boolean
}

export type ItineraryInsightTone = 'info' | 'warning' | 'success'

export interface ItineraryInsight {
  id: string
  tone: ItineraryInsightTone
  title: string
  detail: string
  href?: string
  hrefLabel?: string
}

export interface BuildItineraryOptions {
  confirmedOnly?: boolean
  includeCanceled?: boolean
}

export interface TripItinerary {
  days: ItineraryDay[]
  insights: ItineraryInsight[]
  stats: {
    scheduledDays: number
    totalEntries: number
    serviceEntries: number
    noteEntries: number
    confirmedCount: number
    proposalCount: number
    unscheduledCount: number
    emptyDayCount: number
    missingDateCount: number
  }
}

function toDayKey(value?: string | null): string | null {
  const date = parseDateInput(value)
  if (!date) return null
  return toLocalIsoDate(date)
}

function eachDayInRange(start: string, end: string): string[] {
  const startDate = parseDateInput(start)
  const endDate = parseDateInput(end)
  if (!startDate || !endDate || endDate.getTime() < startDate.getTime()) return []

  const days: string[] = []
  const cursor = new Date(startDate)
  cursor.setHours(0, 0, 0, 0)
  const endTime = endDate.getTime()

  while (cursor.getTime() <= endTime) {
    days.push(toLocalIsoDate(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  return days
}

function formatDayLabel(dayKey: string, tripStart?: string) {
  if (dayKey === ITINERARY_UNSCHEDULED_DAY_KEY) {
    return { label: 'Not scheduled', weekday: undefined, dayNumber: undefined }
  }

  const parts = formatDateParts(dayKey)
  if (!parts.valid) {
    return { label: dayKey, weekday: undefined, dayNumber: undefined }
  }

  let dayNumber: number | undefined
  const tripStartDate = parseDateInput(tripStart)
  const dayDate = parseDateInput(dayKey)
  if (tripStartDate && dayDate) {
    const diff = Math.round((dayDate.getTime() - tripStartDate.getTime()) / 86_400_000)
    if (diff >= 0) dayNumber = diff + 1
  }

  return {
    label: `${parts.weekday}, ${parts.day} ${parts.month} ${parts.year}`,
    weekday: parts.weekday,
    dayNumber,
  }
}

function deriveServiceSubtitle(service: TripService): string {
  const parts: string[] = []

  switch (service.category) {
    case 'lodging': {
      const details = service.lodgingDetails
      if (details?.propertyName.trim()) parts.push(details.propertyName.trim())
      if (details?.roomType.trim()) parts.push(details.roomType.trim())
      if ((details?.nights ?? 0) > 0) parts.push(`${details!.nights} night${details!.nights === 1 ? '' : 's'}`)
      if (service.endDate) parts.push(`check-out ${formatDate(service.endDate)}`)
      break
    }
    case 'cruise': {
      const details = service.cruiseDetails
      if (details?.vesselName.trim()) parts.push(details.vesselName.trim())
      if (details?.embarkPort.trim() && details?.disembarkPort.trim()) {
        parts.push(`${details.embarkPort.trim()} → ${details.disembarkPort.trim()}`)
      }
      if ((details?.nights ?? 0) > 0) parts.push(`${details!.nights} night${details!.nights === 1 ? '' : 's'}`)
      break
    }
    case 'restaurant': {
      const details = service.restaurantDetails
      if (details?.venueName.trim()) parts.push(details.venueName.trim())
      if (details?.mealType.trim()) parts.push(details.mealType.trim())
      if ((details?.pax ?? 0) > 0) parts.push(`${details!.pax} pax`)
      break
    }
    case 'tour': {
      const details = service.tourDetails
      if (details?.destination.trim()) parts.push(details.destination.trim())
      if (details?.pickupLocation.trim()) parts.push(`pickup ${details.pickupLocation.trim()}`)
      if ((details?.durationHours ?? 0) > 0) parts.push(`${details!.durationHours}h`)
      if (details?.guideIncluded) parts.push('guide included')
      break
    }
    case 'activity': {
      const details = service.activityDetails
      if (details?.activityType.trim()) parts.push(details.activityType.trim())
      if (details?.pickupLocation.trim() && details?.dropoffLocation.trim()) {
        parts.push(`${details.pickupLocation.trim()} → ${details.dropoffLocation.trim()}`)
      } else if (details?.pickupLocation.trim()) {
        parts.push(`pickup ${details.pickupLocation.trim()}`)
      }
      if ((details?.durationHours ?? 0) > 0) parts.push(`${details!.durationHours}h`)
      break
    }
    case 'insurance': {
      const details = service.insuranceDetails
      if (details?.providerPlan.trim()) parts.push(details.providerPlan.trim())
      if (details?.policyNumber.trim()) parts.push(`#${details.policyNumber.trim()}`)
      break
    }
    case 'flight':
      break
  }

  if (service.startDate && service.endDate && service.startDate !== service.endDate) {
    parts.push(`${formatDate(service.startDate)} – ${formatDate(service.endDate)}`)
  } else if (service.startDate && service.category !== 'lodging' && service.category !== 'cruise') {
    parts.push(formatDate(service.startDate))
  }

  if (service.supplierName?.trim()) parts.push(service.supplierName.trim())

  return parts.filter(Boolean).join(' · ')
}

function deriveServiceTimeLabel(service: TripService): string | undefined {
  if (service.category === 'restaurant') {
    const time = service.restaurantDetails?.reservationTime.trim()
    return time || undefined
  }
  return undefined
}

function serviceDayKey(service: TripService): string {
  return toDayKey(service.startDate) ?? toDayKey(service.endDate) ?? ITINERARY_UNSCHEDULED_DAY_KEY
}

function serviceSortKey(service: TripService, timeLabel?: string): number {
  const dayKey = serviceDayKey(service)
  if (dayKey === ITINERARY_UNSCHEDULED_DAY_KEY) return Number.MAX_SAFE_INTEGER - 1

  const time = timeLabel?.trim() || '12:00'
  const parsed = new Date(`${dayKey}T${time}`)
  return Number.isNaN(parsed.getTime()) ? parseDateInput(dayKey)!.getTime() : parsed.getTime()
}

function expandFlightEntries(service: TripService, baseHref: string): ItineraryEntry[] {
  const passengers = service.flightDetails?.passengers ?? []
  const entries: ItineraryEntry[] = []

  for (const passenger of passengers) {
    for (const ticket of passenger.tickets ?? []) {
      for (const segment of ticket.segments ?? []) {
        const hasContent =
          segment.flightNumber.trim() ||
          segment.departureAirport.trim() ||
          segment.arrivalAirport.trim()
        if (!hasContent) continue

        const dayKey = toDayKey(segment.departureDate) ?? ITINERARY_UNSCHEDULED_DAY_KEY
        const airline = segment.airline.trim()
        const flightNo = segment.flightNumber.trim()
        const title = [airline, flightNo].filter(Boolean).join(' ') || deriveCategoryServiceLabel(service)
        const route = [segment.departureAirport.trim(), segment.arrivalAirport.trim()].filter(Boolean).join(' → ')

        entries.push({
          id: `flight:${service.id}:${segment.id}`,
          kind: 'flight-segment',
          dayKey,
          sortKey: segmentDepartureTimestamp(segment) ?? serviceSortKey(service, segment.departureTime),
          timeLabel: segment.departureTime.trim() || undefined,
          title,
          subtitle: route || undefined,
          detail: passenger.passengerName.trim() || undefined,
          status: service.status,
          categoryLabel: SERVICE_CATEGORY_LABELS.flight,
          serviceId: service.id,
          serviceHref: baseHref,
        })
      }
    }
  }

  return entries
}

function expandServiceEntry(service: TripService, baseHref: string): ItineraryEntry {
  const timeLabel = deriveServiceTimeLabel(service)
  return {
    id: `service:${service.id}`,
    kind: 'service',
    dayKey: serviceDayKey(service),
    sortKey: serviceSortKey(service, timeLabel),
    timeLabel,
    title: deriveCategoryServiceLabel(service),
    subtitle: deriveServiceSubtitle(service) || undefined,
    detail: service.notes?.trim() || undefined,
    status: service.status,
    categoryLabel: SERVICE_CATEGORY_LABELS[service.category],
    serviceId: service.id,
    serviceHref: baseHref,
  }
}

function noteEntry(note: TripItineraryNote): ItineraryEntry {
  const dayKey = note.dayKey || ITINERARY_UNSCHEDULED_DAY_KEY
  const sortKey =
    dayKey === ITINERARY_UNSCHEDULED_DAY_KEY
      ? Number.MAX_SAFE_INTEGER
      : serviceSortKey(
          {
            id: note.id,
            tripId: note.tripId,
            lineNumber: note.sortOrder,
            category: 'activity',
            status: 'confirmed',
            name: note.title,
            cost: 0,
            currency: '',
            startDate: dayKey,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
          },
          note.timeLabel,
        ) + note.sortOrder / 1000

  return {
    id: `note:${note.id}`,
    kind: 'note',
    dayKey,
    sortKey,
    timeLabel: note.timeLabel?.trim() || undefined,
    title: note.title,
    subtitle: note.body?.trim() || undefined,
    noteId: note.id,
  }
}

function filterServices(services: TripService[], options: BuildItineraryOptions) {
  return services.filter((service) => {
    if (!options.includeCanceled && service.status === 'canceled') return false
    if (options.confirmedOnly && service.status !== 'confirmed') return false
    return true
  })
}

function buildInsights(
  trip: Trip,
  allServices: TripService[],
  days: ItineraryDay[],
  baseHref: string,
): ItineraryInsight[] {
  const insights: ItineraryInsight[] = []

  if (!trip.startDate || !trip.endDate) {
    insights.push({
      id: 'missing-trip-dates',
      tone: 'warning',
      title: 'Trip dates are incomplete',
      detail: 'Set start and end dates on the trip to unlock day-by-day planning and gap detection.',
      href: `${baseHref}/dashboard`,
      hrefLabel: 'Open dashboard',
    })
  }

  if (allServices.length === 0) {
    insights.push({
      id: 'no-services',
      tone: 'info',
      title: 'No services yet',
      detail: 'Add flights, hotels, and tours in Services — they will appear here automatically.',
      href: `${baseHref}/services`,
      hrefLabel: 'Add services',
    })
    return insights
  }

  const proposalServices = allServices.filter((service) => service.status === 'proposal')
  if (proposalServices.length > 0) {
    insights.push({
      id: 'proposal-services',
      tone: 'warning',
      title: `${proposalServices.length} service${proposalServices.length === 1 ? '' : 's'} still in proposal`,
      detail: proposalServices
        .slice(0, 3)
        .map((service) => deriveCategoryServiceLabel(service))
        .join(' · ')
        .concat(proposalServices.length > 3 ? '…' : ''),
      href: `${baseHref}/services`,
      hrefLabel: 'Review services',
    })
  }

  const missingDates = allServices.filter(
    (service) => service.status !== 'canceled' && !service.startDate && !service.endDate && service.category !== 'flight',
  )
  if (missingDates.length > 0) {
    insights.push({
      id: 'missing-service-dates',
      tone: 'warning',
      title: `${missingDates.length} service${missingDates.length === 1 ? '' : 's'} missing dates`,
      detail: 'Assign start dates so items land on the correct day in the itinerary.',
      href: `${baseHref}/services`,
      hrefLabel: 'Fix schedules',
    })
  }

  const emptyDays = days.filter((day) => day.isGap)
  if (emptyDays.length > 0 && trip.startDate && trip.endDate) {
    insights.push({
      id: 'empty-days',
      tone: 'info',
      title: `${emptyDays.length} open day${emptyDays.length === 1 ? '' : 's'} in the trip window`,
      detail: 'Add activities or internal notes to fill gaps before sending the itinerary to the client.',
    })
  }

  const scheduledCount = days.filter((day) => day.dayKey !== ITINERARY_UNSCHEDULED_DAY_KEY && day.entries.length > 0).length
  if (scheduledCount > 0 && proposalServices.length === 0 && emptyDays.length === 0) {
    insights.push({
      id: 'itinerary-ready',
      tone: 'success',
      title: 'Itinerary looks complete',
      detail: 'All trip days have scheduled items and services are confirmed.',
    })
  }

  return insights
}

export function buildTripItinerary(
  trip: Trip,
  services: TripService[],
  notes: TripItineraryNote[] = [],
  options: BuildItineraryOptions = {},
): TripItinerary {
  const baseHref = `/trips/${trip.id}`
  const filtered = filterServices(services, options)
  const entries: ItineraryEntry[] = []

  for (const service of filtered) {
    const href = `${baseHref}/services/${service.id}`
    if (service.category === 'flight') {
      const flightEntries = expandFlightEntries(service, href)
      if (flightEntries.length > 0) {
        entries.push(...flightEntries)
      } else {
        entries.push(expandServiceEntry(service, href))
      }
    } else {
      entries.push(expandServiceEntry(service, href))
    }
  }

  for (const note of notes) {
    entries.push(noteEntry(note))
  }

  const entriesByDay = new Map<string, ItineraryEntry[]>()
  for (const entry of entries) {
    const bucket = entriesByDay.get(entry.dayKey) ?? []
    bucket.push(entry)
    entriesByDay.set(entry.dayKey, bucket)
  }

  for (const [, bucket] of entriesByDay) {
    bucket.sort((a, b) => a.sortKey - b.sortKey || a.title.localeCompare(b.title))
  }

  const tripDays =
    trip.startDate && trip.endDate ? eachDayInRange(trip.startDate, trip.endDate) : [...entriesByDay.keys()].filter((key) => key !== ITINERARY_UNSCHEDULED_DAY_KEY).sort()

  const days: ItineraryDay[] = tripDays.map((dayKey) => {
    const dayEntries = entriesByDay.get(dayKey) ?? []
    const { label, weekday, dayNumber } = formatDayLabel(dayKey, trip.startDate)
    return {
      dayKey,
      label,
      weekday,
      dayNumber,
      entries: dayEntries,
      isGap: dayEntries.length === 0,
    }
  })

  const unscheduled = entriesByDay.get(ITINERARY_UNSCHEDULED_DAY_KEY) ?? []
  if (unscheduled.length > 0) {
    const { label } = formatDayLabel(ITINERARY_UNSCHEDULED_DAY_KEY)
    days.push({
      dayKey: ITINERARY_UNSCHEDULED_DAY_KEY,
      label,
      entries: unscheduled,
      isGap: false,
    })
  }

  const serviceEntries = entries.filter((entry) => entry.kind !== 'note')
  const noteEntries = entries.filter((entry) => entry.kind === 'note')

  const stats = {
    scheduledDays: days.filter((day) => day.dayKey !== ITINERARY_UNSCHEDULED_DAY_KEY && day.entries.length > 0).length,
    totalEntries: entries.length,
    serviceEntries: serviceEntries.length,
    noteEntries: noteEntries.length,
    confirmedCount: filtered.filter((service) => service.status === 'confirmed').length,
    proposalCount: services.filter((service) => service.status === 'proposal').length,
    unscheduledCount: unscheduled.length,
    emptyDayCount: days.filter((day) => day.isGap).length,
    missingDateCount: services.filter(
      (service) => service.status !== 'canceled' && !service.startDate && !service.endDate && service.category !== 'flight',
    ).length,
  }

  const insights = buildInsights(trip, services, days, baseHref)

  return { days, insights, stats }
}
