import type { FlightServiceDetailsFormValues } from '@/features/trips/schemas/flight-service.schema'

export interface FlightSegmentRowRef {
  passengerIndex: number
  ticketIndex: number
  segmentIndex: number
  rowNumber: number
  segmentId: string
}

export interface AnnotatedFlightSegmentRow extends FlightSegmentRowRef {
  isFirstPassengerOnPage: boolean
  passengerRowSpanOnPage: number
  isFirstTicketOnPage: boolean
  ticketRowSpanOnPage: number
  isSegmentIndented: boolean
}

export function annotateFlightPageRows(pageRows: FlightSegmentRowRef[]): AnnotatedFlightSegmentRow[] {
  const passengerCounts = new Map<number, number>()
  const ticketCounts = new Map<string, number>()
  const passengerFirstSeen = new Set<number>()
  const ticketFirstSeen = new Set<string>()

  for (const row of pageRows) {
    passengerCounts.set(row.passengerIndex, (passengerCounts.get(row.passengerIndex) ?? 0) + 1)
    const ticketKey = `${row.passengerIndex}-${row.ticketIndex}`
    ticketCounts.set(ticketKey, (ticketCounts.get(ticketKey) ?? 0) + 1)
  }

  return pageRows.map((row) => {
    const ticketKey = `${row.passengerIndex}-${row.ticketIndex}`
    const isFirstPassengerOnPage = !passengerFirstSeen.has(row.passengerIndex)
    if (isFirstPassengerOnPage) passengerFirstSeen.add(row.passengerIndex)

    const isFirstTicketOnPage = !ticketFirstSeen.has(ticketKey)
    if (isFirstTicketOnPage) ticketFirstSeen.add(ticketKey)

    const isSegmentIndented = row.segmentIndex > 0 || !isFirstTicketOnPage

    return {
      ...row,
      isFirstPassengerOnPage,
      passengerRowSpanOnPage: passengerCounts.get(row.passengerIndex) ?? 1,
      isFirstTicketOnPage,
      ticketRowSpanOnPage: ticketCounts.get(ticketKey) ?? 1,
      isSegmentIndented,
    }
  })
}

export function flattenFlightSegmentRows(
  passengers: FlightServiceDetailsFormValues['passengers'],
): FlightSegmentRowRef[] {
  const rows: FlightSegmentRowRef[] = []
  let rowNumber = 0

  passengers.forEach((passenger, passengerIndex) => {
    passenger.tickets.forEach((ticket, ticketIndex) => {
      ticket.segments.forEach((segment, segmentIndex) => {
        rowNumber += 1
        rows.push({
          passengerIndex,
          ticketIndex,
          segmentIndex,
          rowNumber,
          segmentId: segment.id,
        })
      })
    })
  })

  return rows
}

export function countPassengerSegments(
  passengers: FlightServiceDetailsFormValues['passengers'],
  passengerIndex: number,
): number {
  return passengers[passengerIndex]?.tickets.reduce((sum, ticket) => sum + ticket.segments.length, 0) ?? 0
}

export function firstSegmentRowForPassenger(
  rows: FlightSegmentRowRef[],
  passengerIndex: number,
): FlightSegmentRowRef | undefined {
  return rows.find((row) => row.passengerIndex === passengerIndex)
}

export function getCollapsiblePassengerIds(
  passengers: FlightServiceDetailsFormValues['passengers'],
): string[] {
  return passengers
    .filter((_, passengerIndex) => countPassengerSegments(passengers, passengerIndex) > 1)
    .map((passenger) => passenger.id)
}

export function filterCollapsedSegmentRows(
  rows: FlightSegmentRowRef[],
  passengers: FlightServiceDetailsFormValues['passengers'],
  collapsedPassengerIds: ReadonlySet<string>,
): FlightSegmentRowRef[] {
  if (collapsedPassengerIds.size === 0) return rows

  return rows.filter((row) => {
    const passengerId = passengers[row.passengerIndex]?.id
    if (!passengerId || !collapsedPassengerIds.has(passengerId)) return true
    const first = firstSegmentRowForPassenger(rows, row.passengerIndex)
    return first?.segmentId === row.segmentId
  })
}

export function withVisibleRowNumbers(rows: FlightSegmentRowRef[]): FlightSegmentRowRef[] {
  return rows.map((row, index) => ({ ...row, rowNumber: index + 1 }))
}

export function paginateFlightSegmentRows<T>(rows: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize
  return rows.slice(start, start + pageSize)
}

export function lastFlightSegmentRef(
  passengers: FlightServiceDetailsFormValues['passengers'],
): Pick<FlightSegmentRowRef, 'passengerIndex' | 'ticketIndex'> | null {
  const rows = flattenFlightSegmentRows(passengers)
  if (rows.length === 0) return null
  const last = rows[rows.length - 1]
  return { passengerIndex: last.passengerIndex, ticketIndex: last.ticketIndex }
}
