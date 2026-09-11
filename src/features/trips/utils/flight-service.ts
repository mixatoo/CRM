import type { FlightPassenger, FlightSegment, FlightTicket, FlightTripType } from '@/domain/entities/trip-service-flight'
import { createEmptyFlightSegment, createEmptyFlightTicket, segmentDepartureTimestamp } from '@/domain/entities/trip-service-flight'

export interface FlightSegmentLocation {
  passengerIndex: number
  ticketIndex: number
  segmentIndex: number
}

export function validateFlightSegmentChronology(segments: FlightSegment[]): string | null {
  let previousTimestamp: number | null = null

  for (let index = 0; index < segments.length; index += 1) {
    const current = segmentDepartureTimestamp(segments[index])
    if (current == null) continue

    if (previousTimestamp != null && current < previousTimestamp) {
      return `Segment ${index + 1} cannot depart before the previous segment.`
    }

    previousTimestamp = current
  }

  return null
}

export function minSegmentCount(tripType: FlightTripType): number {
  if (tripType === 'round_trip') return 2
  return 1
}

export function maxSegmentCount(tripType: FlightTripType): number | null {
  if (tripType === 'round_trip') return 2
  return null
}

export function validateFlightSegmentCount(tripType: FlightTripType, count: number): string | null {
  const min = minSegmentCount(tripType)
  if (count < min) {
    if (tripType === 'one_way') {
      return 'Add at least one flight segment.'
    }
    return `Add at least ${min} flight segments.`
  }

  const max = maxSegmentCount(tripType)
  if (max != null && count > max) {
    return 'Round-trip tickets must have exactly two segments (outbound and return).'
  }

  return null
}

export function validateFlightPassengers(passengers: FlightPassenger[], tripType: FlightTripType): string | null {
  for (let passengerIndex = 0; passengerIndex < passengers.length; passengerIndex += 1) {
    const passenger = passengers[passengerIndex]
    const passengerLabel = passenger.passengerName.trim() || `Passenger ${passengerIndex + 1}`

    for (let ticketIndex = 0; ticketIndex < passenger.tickets.length; ticketIndex += 1) {
      const ticket = passenger.tickets[ticketIndex]
      const ticketLabel = ticket.pnr?.trim() || `ticket ${ticketIndex + 1}`

      const countError = validateFlightSegmentCount(tripType, ticket.segments.length)
      if (countError) {
        return `${passengerLabel} (${ticketLabel}): ${countError}`
      }

      const chronologyError = validateFlightSegmentChronology(ticket.segments)
      if (chronologyError) {
        return `${passengerLabel} (${ticketLabel}): ${chronologyError}`
      }
    }
  }

  return null
}

export function canAddFlightSegment(tripType: FlightTripType, count: number): boolean {
  const max = maxSegmentCount(tripType)
  if (max != null) return count < max
  return true
}

function clonePassengersForMutation(passengers: FlightPassenger[]): FlightPassenger[] {
  return passengers.map((passenger) => ({
    ...passenger,
    tickets: passenger.tickets.map((ticket) => ({
      ...ticket,
      segments: [...ticket.segments],
    })),
  }))
}

/** Append a segment to a passenger ticket, or null when the ticket is at its segment limit. */
export function appendFlightSegmentAt(
  passengers: FlightPassenger[],
  passengerIndex: number,
  ticketIndex: number,
): FlightPassenger[] | null {
  const next = clonePassengersForMutation(passengers)
  const ticket = next[passengerIndex]?.tickets[ticketIndex]
  if (!ticket) return null

  ticket.segments.push(createEmptyFlightSegment())
  return next
}

/** Duplicate a segment on the same ticket, inserted after the source row. */
export function cloneFlightSegmentAt(
  passengers: FlightPassenger[],
  passengerIndex: number,
  ticketIndex: number,
  segmentIndex: number,
  tripType: FlightTripType,
): FlightPassenger[] | null {
  const next = clonePassengersForMutation(passengers)
  const ticket = next[passengerIndex]?.tickets[ticketIndex]
  const source = ticket?.segments[segmentIndex]
  if (!ticket || !source) return null
  if (!canAddFlightSegment(tripType, ticket.segments.length)) return null

  const clone = createEmptyFlightSegment({
    airline: source.airline,
    flightNumber: source.flightNumber,
    departureAirport: source.departureAirport,
    arrivalAirport: source.arrivalAirport,
    departureDate: source.departureDate,
    departureTime: source.departureTime,
    arrivalDate: source.arrivalDate,
    arrivalTime: source.arrivalTime,
    cabinClass: source.cabinClass,
    segmentStatus: source.segmentStatus,
  })
  ticket.segments.splice(segmentIndex + 1, 0, clone)
  return next
}

export function canRemoveFlightSegment(tripType: FlightTripType, count: number): boolean {
  return count > minSegmentCount(tripType)
}

export function canReorderFlightSegments(tripType: FlightTripType, count: number): boolean {
  if (count <= 1) return false
  return tripType === 'one_way' || tripType === 'multi_city' || tripType === 'round_trip'
}

export function canRemoveFlightPassenger(count: number): boolean {
  return count > 1
}

export function canRemoveFlightTicket(count: number): boolean {
  return count > 1
}

export function canRemoveFlightTicketAt(
  passengers: FlightPassenger[],
  passengerIndex: number,
  ticketIndex: number,
): boolean {
  const passenger = passengers[passengerIndex]
  const ticket = passenger?.tickets[ticketIndex]
  if (!passenger || !ticket) return false

  if (canRemoveFlightTicket(passenger.tickets.length)) return true
  if (ticket.segments.length > 1) return true
  if (canRemoveFlightPassenger(passengers.length)) return true

  return false
}

export function removeFlightTicketAt(
  passengers: FlightPassenger[],
  passengerIndex: number,
  ticketIndex: number,
  tripType: FlightTripType,
): FlightPassenger[] {
  if (!canRemoveFlightTicketAt(passengers, passengerIndex, ticketIndex)) {
    return passengers
  }

  const next = clonePassengersForMutation(passengers)
  const passenger = next[passengerIndex]
  if (!passenger) return passengers

  passenger.tickets.splice(ticketIndex, 1)

  if (passenger.tickets.length === 0) {
    if (canRemoveFlightPassenger(next.length)) {
      next.splice(passengerIndex, 1)
    } else {
      passenger.tickets.push(createEmptyFlightTicket(passenger.id, tripType))
    }
  }

  return next.length > 0 ? next : passengers
}

export function moveFlightSegment(
  segments: FlightSegment[],
  fromIndex: number,
  direction: 'up' | 'down',
): FlightSegment[] {
  const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
  return reorderFlightSegments(segments, fromIndex, toIndex)
}

export function reorderFlightSegments(
  segments: FlightSegment[],
  fromIndex: number,
  toIndex: number,
): FlightSegment[] {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= segments.length || toIndex >= segments.length) {
    return segments
  }

  const next = [...segments]
  const [item] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, item)
  return next
}

function cleanupPassengerAfterSegmentRemoval(
  passengers: FlightPassenger[],
  passengerIndex: number,
  tripType: FlightTripType,
): FlightPassenger[] {
  const passenger = passengers[passengerIndex]
  if (!passenger || passenger.tickets.length > 0) return passengers

  if (canRemoveFlightPassenger(passengers.length)) {
    passengers.splice(passengerIndex, 1)
    return passengers
  }

  passenger.tickets.push(createEmptyFlightTicket(passenger.id, tripType))
  return passengers
}

export function transferFlightSegmentAt(
  passengers: FlightPassenger[],
  from: FlightSegmentLocation,
  to: FlightSegmentLocation,
  tripType: FlightTripType,
): FlightPassenger[] | null {
  if (from.passengerIndex === to.passengerIndex && from.ticketIndex === to.ticketIndex) {
    return null
  }

  if (tripType === 'round_trip') return null

  const next = clonePassengersForMutation(passengers)
  const sourceTicket = next[from.passengerIndex]?.tickets[from.ticketIndex]
  const targetTicket = next[to.passengerIndex]?.tickets[to.ticketIndex]
  if (!sourceTicket || !targetTicket) return null

  const sourceCountAfter = sourceTicket.segments.length - 1
  const targetCountAfter = targetTicket.segments.length + 1

  if (sourceCountAfter > 0) {
    const sourceErr = validateFlightSegmentCount(tripType, sourceCountAfter)
    if (sourceErr) return null
  }

  const targetErr = validateFlightSegmentCount(tripType, targetCountAfter)
  if (targetErr) return null

  const [segment] = sourceTicket.segments.splice(from.segmentIndex, 1)
  if (!segment) return null

  const insertAt = Math.min(Math.max(0, to.segmentIndex), targetTicket.segments.length)
  targetTicket.segments.splice(insertAt, 0, segment)

  if (sourceTicket.segments.length === 0) {
    next[from.passengerIndex].tickets.splice(from.ticketIndex, 1)
  }

  cleanupPassengerAfterSegmentRemoval(next, from.passengerIndex, tripType)
  return next.length > 0 ? next : null
}

export function moveFlightSegmentByDrag(
  passengers: FlightPassenger[],
  from: FlightSegmentLocation,
  to: FlightSegmentLocation,
  tripType: FlightTripType,
): FlightPassenger[] | null {
  if (from.passengerIndex === to.passengerIndex && from.ticketIndex === to.ticketIndex) {
    if (from.segmentIndex === to.segmentIndex) return null

    const ticket = passengers[from.passengerIndex]?.tickets[from.ticketIndex]
    if (!ticket || !canReorderFlightSegments(tripType, ticket.segments.length)) return null

    const next = clonePassengersForMutation(passengers)
    const segments = next[from.passengerIndex].tickets[from.ticketIndex].segments
    next[from.passengerIndex].tickets[from.ticketIndex].segments = reorderFlightSegments(
      segments,
      from.segmentIndex,
      to.segmentIndex,
    )
    return next
  }

  return transferFlightSegmentAt(passengers, from, to, tripType)
}

export function moveFlightTicket(
  tickets: FlightTicket[],
  fromIndex: number,
  direction: 'up' | 'down',
): FlightTicket[] {
  const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
  if (toIndex < 0 || toIndex >= tickets.length) return tickets

  const next = [...tickets]
  const [item] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, item)
  return next
}

export function moveFlightPassenger(
  passengers: FlightPassenger[],
  fromIndex: number,
  direction: 'up' | 'down',
): FlightPassenger[] {
  const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
  if (toIndex < 0 || toIndex >= passengers.length) return passengers

  const next = [...passengers]
  const [item] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, item)
  return next
}

export function removeFlightSegmentAt(
  passengers: FlightPassenger[],
  passengerIndex: number,
  ticketIndex: number,
  segmentIndex: number,
  tripType: FlightTripType,
): FlightPassenger[] {
  const next = passengers.map((passenger) => ({
    ...passenger,
    tickets: passenger.tickets.map((ticket) => ({
      ...ticket,
      segments: [...ticket.segments],
    })),
  }))

  const ticket = next[passengerIndex]?.tickets[ticketIndex]
  if (!ticket || !canRemoveFlightSegment(tripType, ticket.segments.length)) {
    return passengers
  }

  ticket.segments.splice(segmentIndex, 1)

  if (ticket.segments.length === 0) {
    next[passengerIndex].tickets.splice(ticketIndex, 1)
  }

  if (next[passengerIndex].tickets.length === 0 && canRemoveFlightPassenger(next.length)) {
    next.splice(passengerIndex, 1)
  }

  return next.length > 0 ? next : passengers
}

export function countFlightTableRows(passengers: FlightPassenger[]): {
  passengerCount: number
  ticketCount: number
  segmentCount: number
} {
  let ticketCount = 0
  let segmentCount = 0

  for (const passenger of passengers) {
    for (const ticket of passenger.tickets) {
      ticketCount += 1
      segmentCount += ticket.segments.length
    }
  }

  return { passengerCount: passengers.length, ticketCount, segmentCount }
}

export function clearAllFlightTableData(): FlightPassenger[] {
  return []
}

function isClearingAllFlightSegments(passengers: FlightPassenger[], segmentIds: Set<string>): boolean {
  if (segmentIds.size === 0) return false

  const allIds: string[] = []
  for (const passenger of passengers) {
    for (const ticket of passenger.tickets) {
      for (const segment of ticket.segments) {
        allIds.push(segment.id)
      }
    }
  }

  return allIds.length > 0 && allIds.every((id) => segmentIds.has(id))
}

export function removeFlightSegmentsByIds(
  passengers: FlightPassenger[],
  segmentIds: Set<string>,
  tripType: FlightTripType,
): FlightPassenger[] {
  if (segmentIds.size === 0) return passengers

  if (isClearingAllFlightSegments(passengers, segmentIds)) {
    return clearAllFlightTableData()
  }

  const rows = passengers.flatMap((passenger, passengerIndex) =>
    passenger.tickets.flatMap((ticket, ticketIndex) =>
      ticket.segments.map((segment, segmentIndex) => ({
        passengerIndex,
        ticketIndex,
        segmentIndex,
        segmentId: segment.id,
      })),
    ),
  )

  const toRemove = rows
    .filter((row) => segmentIds.has(row.segmentId))
    .sort(
      (a, b) =>
        b.passengerIndex - a.passengerIndex ||
        b.ticketIndex - a.ticketIndex ||
        b.segmentIndex - a.segmentIndex,
    )

  let next = passengers
  for (const row of toRemove) {
    next = removeFlightSegmentAt(next, row.passengerIndex, row.ticketIndex, row.segmentIndex, tripType)
  }

  return next
}
