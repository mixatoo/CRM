import { describe, expect, it } from 'vitest'
import { SERVICE_CATEGORIES } from '@/domain/entities/trip'
import type { Trip } from '@/domain/entities'
import { buildTripItinerary } from '@/domain/trip/build-itinerary'
import type { TripService } from '@/domain/entities/trip-service'
import { buildItineraryDocumentData } from '@/features/trips/components/itinerary/ItineraryDocumentPreview'
import { itineraryDaysForExport } from '@/document-system/templates/itinerary-template'

const baseTrip: Trip = {
  id: 'TRP-1',
  reference: 'TRP-504567',
  name: 'Cairo Getaway',
  ownerName: 'Ops',
  branch: 'HQ',
  destination: 'Cairo',
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
  mainContactName: 'Ahmed Hassan',
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

describe('download-itinerary-pdf', () => {
  it('exports only days that have entries', () => {
    const services = [
      makeService({ id: 'S1', category: 'tour', name: 'Pyramids', startDate: '2026-06-01' }),
    ]
    const itinerary = buildTripItinerary(baseTrip, services)
    const exported = itineraryDaysForExport(itinerary.days)

    expect(exported).toHaveLength(1)
    expect(exported[0]?.label).toContain('Day 1')
    expect(exported[0]?.entries).toHaveLength(1)
  })

  it('builds document data for HTML PDF export', () => {
    const services = [
      makeService({ id: 'S1', category: 'tour', name: 'Pyramids', startDate: '2026-06-01' }),
      makeService({ id: 'S2', category: 'restaurant', name: 'Nile dinner', startDate: '2026-06-02' }),
      makeService({ id: 'S3', category: 'activity', name: 'Museum', startDate: '2026-06-03' }),
    ]
    const itinerary = buildTripItinerary(baseTrip, services)
    const doc = buildItineraryDocumentData(baseTrip, itinerary.days)

    expect(doc.trip.reference).toBe('TRP-504567')
    expect(doc.days).toHaveLength(3)
    expect(doc.days.reduce((sum, day) => sum + day.entries.length, 0)).toBe(3)
  })
})
