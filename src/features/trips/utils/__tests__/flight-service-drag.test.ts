import { describe, expect, it } from 'vitest'
import { createEmptyFlightPassenger, createEmptyFlightSegment } from '@/domain/entities/trip-service-flight'
import { moveFlightSegmentByDrag, reorderFlightSegments, transferFlightSegmentAt } from '@/features/trips/utils/flight-service'

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

describe('reorderFlightSegments', () => {
  it('moves a segment within the same ticket', () => {
    const segments = [
      createEmptyFlightSegment({ flightNumber: '1' }),
      createEmptyFlightSegment({ flightNumber: '2' }),
      createEmptyFlightSegment({ flightNumber: '3' }),
    ]

    const next = reorderFlightSegments(segments, 0, 2)
    expect(next.map((segment) => segment.flightNumber)).toEqual(['2', '3', '1'])
  })
})

describe('transferFlightSegmentAt', () => {
  it('moves a segment to another passenger ticket', () => {
    const passengers = buildPassengers()
    const segmentId = passengers[0].tickets[0].segments[1].id

    const next = transferFlightSegmentAt(
      passengers,
      { passengerIndex: 0, ticketIndex: 0, segmentIndex: 1 },
      { passengerIndex: 1, ticketIndex: 0, segmentIndex: 0 },
      'one_way',
    )

    expect(next).not.toBeNull()
    expect(next![0].tickets[0].segments).toHaveLength(1)
    expect(next![1].tickets[0].segments).toHaveLength(2)
    expect(next![1].tickets[0].segments[0].id).toBe(segmentId)
  })

  it('blocks cross-passenger moves for round trip', () => {
    const passengers = buildPassengers()
    const next = transferFlightSegmentAt(
      passengers,
      { passengerIndex: 0, ticketIndex: 0, segmentIndex: 0 },
      { passengerIndex: 1, ticketIndex: 0, segmentIndex: 0 },
      'round_trip',
    )

    expect(next).toBeNull()
  })
})

describe('moveFlightSegmentByDrag', () => {
  it('reorders within the same ticket', () => {
    const passengers = buildPassengers()
    const next = moveFlightSegmentByDrag(
      passengers,
      { passengerIndex: 0, ticketIndex: 0, segmentIndex: 1 },
      { passengerIndex: 0, ticketIndex: 0, segmentIndex: 0 },
      'one_way',
    )

    expect(next).not.toBeNull()
    expect(next![0].tickets[0].segments.map((segment) => segment.flightNumber)).toEqual(['A2', 'A1'])
  })

  it('transfers across passengers on one-way trips', () => {
    const passengers = buildPassengers()
    const movedId = passengers[0].tickets[0].segments[0].id

    const next = moveFlightSegmentByDrag(
      passengers,
      { passengerIndex: 0, ticketIndex: 0, segmentIndex: 0 },
      { passengerIndex: 1, ticketIndex: 0, segmentIndex: 0 },
      'one_way',
    )

    expect(next).not.toBeNull()
    expect(next![1].tickets[0].segments.some((segment) => segment.id === movedId)).toBe(true)
  })
})
