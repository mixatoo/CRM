import { describe, expect, it } from 'vitest'
import type { Trip } from '@/domain/entities'
import { SERVICE_CATEGORIES } from '@/domain/entities/trip'
import { ITINERARY_UNSCHEDULED_DAY_KEY } from '@/domain/entities/trip-itinerary-note'
import type { TripService } from '@/domain/entities/trip-service'
import type { FlightServiceDetails } from '@/domain/flight/types'
import { buildTripItinerary } from '@/domain/trip/build-itinerary'

const baseTrip: Trip = {
  id: 'TRP-1',
  reference: 'TRP-001',
  name: 'Cairo escape',
  ownerName: 'Ops',
  branch: 'HQ',
  stage: 'confirmed',
  currency: 'USD',
  totalCost: 1000,
  totalCommission: 100,
  clientPaidAmount: 0,
  supplierBalanceDue: 0,
  adults: 2,
  minors: 0,
  bookingStartedAt: '2026-01-01',
  startDate: '2026-06-01',
  endDate: '2026-06-03',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
  serviceBreakdown: SERVICE_CATEGORIES.map((category) => ({
    category,
    proposal: 0,
    confirmed: 0,
    canceled: 0,
  })),
}

function makeService(overrides: Partial<TripService> & Pick<TripService, 'id' | 'category' | 'name'>): TripService {
  return {
    tripId: baseTrip.id,
    lineNumber: 1,
    status: 'confirmed',
    cost: 100,
    currency: 'USD',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    ...overrides,
  }
}

describe('buildTripItinerary', () => {
  it('groups services by trip day and sorts by time', () => {
    const services = [
      makeService({
        id: 'S1',
        category: 'restaurant',
        name: 'Nile dinner',
        startDate: '2026-06-02',
        restaurantDetails: {
          venueName: 'Boat',
          mealType: 'Dinner',
          pax: 2,
          reservationTime: '20:00',
          dietaryNotes: '',
        },
      }),
      makeService({
        id: 'S2',
        category: 'tour',
        name: 'Pyramids',
        startDate: '2026-06-02',
        tourDetails: {
          destination: 'Giza',
          durationHours: 4,
          pax: 2,
          pickupLocation: 'Hotel',
          language: 'English',
          guideIncluded: true,
        },
      }),
    ]

    const itinerary = buildTripItinerary(baseTrip, services)
    const day2 = itinerary.days.find((day) => day.dayKey === '2026-06-02')

    expect(itinerary.days).toHaveLength(3)
    expect(day2?.entries).toHaveLength(2)
    expect(day2?.entries[0]?.title).toContain('Pyramids')
    expect(day2?.entries[1]?.timeLabel).toBe('20:00')
  })

  it('expands flight segments onto departure days', () => {
    const services = [
      makeService({
        id: 'S-FLT',
        category: 'flight',
        name: 'International flights',
        flightDetails: {
          schemaVersion: 1,
          tripType: 'round_trip',
          passengers: [
            {
              id: 'P1',
              passengerName: 'John Smith',
              passengerType: 'adult',
              tickets: [
                {
                  id: 'T1',
                  passengerId: 'P1',
                  pnr: '',
                  ticketNumber: '',
                  airline: 'MS',
                  supplierName: 'GDS',
                  route: 'CAI-LHR',
                  cabinClass: 'Y',
                  status: 'issued',
                  segments: [
                    {
                      id: 'SEG1',
                      airline: 'MS',
                      flightNumber: '777',
                      departureAirport: 'CAI',
                      arrivalAirport: 'LHR',
                      departureDate: '2026-06-01',
                      departureTime: '09:30',
                      arrivalDate: '2026-06-01',
                      arrivalTime: '13:00',
                    },
                  ],
                  pricing: {
                    fare: 0,
                    taxes: 0,
                    airlineFees: 0,
                    supplierFees: 0,
                    agencyServiceFees: 0,
                    commission: 0,
                    clientDiscount: 0,
                    supplierCost: 0,
                    sellingPrice: 0,
                    profit: 0,
                    currency: 'USD',
                    exchangeRate: 1,
                  },
                  financials: {
                    supplierCost: 0,
                    sellingPrice: 0,
                    grossProfit: 0,
                    netProfit: 0,
                    clientReceivable: 0,
                    supplierPayable: 0,
                    amountCollected: 0,
                    amountOutstanding: 0,
                    amountPaidToSupplier: 0,
                    supplierOutstanding: 0,
                    currency: 'USD',
                    exchangeRate: 1,
                  },
                  transactions: [],
                  ledger: [],
                },
              ],
            },
          ],
        } as unknown as FlightServiceDetails,
      }),
    ]

    const itinerary = buildTripItinerary(baseTrip, services)
    const day1 = itinerary.days.find((day) => day.dayKey === '2026-06-01')

    expect(day1?.entries).toHaveLength(1)
    expect(day1?.entries[0]?.kind).toBe('flight-segment')
    expect(day1?.entries[0]?.title).toBe('MS 777')
    expect(day1?.entries[0]?.detail).toBe('John Smith')
  })

  it('flags empty days inside the trip window', () => {
    const services = [
      makeService({
        id: 'S1',
        category: 'activity',
        name: 'Museum',
        startDate: '2026-06-01',
      }),
    ]

    const itinerary = buildTripItinerary(baseTrip, services)
    const gaps = itinerary.days.filter((day) => day.isGap)

    expect(gaps).toHaveLength(2)
    expect(itinerary.stats.emptyDayCount).toBe(2)
  })

  it('places undated services in the unscheduled bucket', () => {
    const services = [
      makeService({
        id: 'S1',
        category: 'insurance',
        name: 'Travel cover',
      }),
    ]

    const itinerary = buildTripItinerary(baseTrip, services)
    const unscheduled = itinerary.days.find((day) => day.dayKey === ITINERARY_UNSCHEDULED_DAY_KEY)

    expect(unscheduled?.entries).toHaveLength(1)
    expect(itinerary.stats.unscheduledCount).toBe(1)
  })

  it('filters to confirmed services when requested', () => {
    const services = [
      makeService({ id: 'S1', category: 'tour', name: 'Confirmed tour', startDate: '2026-06-01', status: 'confirmed' }),
      makeService({ id: 'S2', category: 'tour', name: 'Draft tour', startDate: '2026-06-02', status: 'proposal' }),
    ]

    const itinerary = buildTripItinerary(baseTrip, services, [], { confirmedOnly: true })

    expect(itinerary.stats.serviceEntries).toBe(1)
    expect(itinerary.stats.proposalCount).toBe(1)
    expect(itinerary.insights.some((insight) => insight.id === 'proposal-services')).toBe(true)
  })
})
