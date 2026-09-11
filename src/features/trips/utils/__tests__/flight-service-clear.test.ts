import { describe, expect, it } from 'vitest'
import { createEmptyFlightPassenger, createEmptyFlightSegment } from '@/domain/entities/trip-service-flight'
import {
  clearAllFlightTableData,
  countFlightTableRows,
  removeFlightSegmentsByIds,
} from '@/features/trips/utils/flight-service'

function buildPassengers() {
  const passengerA = createEmptyFlightPassenger('one_way', { passengerName: 'Alice' }, 'EGP')
  const passengerB = createEmptyFlightPassenger('one_way', { passengerName: 'Bob' }, 'EGP')
  passengerA.tickets[0].segments = [
    createEmptyFlightSegment({ flightNumber: 'A1' }),
    createEmptyFlightSegment({ flightNumber: 'A2' }),
  ]
  passengerB.tickets[0].segments = [createEmptyFlightSegment({ flightNumber: 'B1' })]
  return [passengerA, passengerB]
}

describe('countFlightTableRows', () => {
  it('counts passengers, tickets, and segments', () => {
    expect(countFlightTableRows(buildPassengers())).toEqual({
      passengerCount: 2,
      ticketCount: 2,
      segmentCount: 3,
    })
  })
})

describe('clearAllFlightTableData', () => {
  it('returns an empty passenger list', () => {
    expect(clearAllFlightTableData()).toEqual([])
  })
})

describe('removeFlightSegmentsByIds', () => {
  it('clears the table when every segment is selected', () => {
    const passengers = buildPassengers()
    const allSegmentIds = new Set(
      passengers.flatMap((passenger) =>
        passenger.tickets.flatMap((ticket) => ticket.segments.map((segment) => segment.id)),
      ),
    )

    expect(removeFlightSegmentsByIds(passengers, allSegmentIds, 'one_way')).toEqual([])
  })
})
