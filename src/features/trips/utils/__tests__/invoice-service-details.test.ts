import { describe, expect, it } from 'vitest'
import type { TripService } from '@/domain/entities/trip-service'
import {
  formatInvoiceLineDetails,
  parseInvoiceLineDetails,
  tripServiceDetailDetails,
  tripServiceDetailSummary,
  normalizeInvoiceDetailSummary,
} from '@/features/trips/utils/invoice-service-details'

function baseService(overrides: Partial<TripService> = {}): TripService {
  return {
    id: 'SRV-1',
    tripId: 'TRP-1',
    lineNumber: 1,
    category: 'activity',
    status: 'proposal',
    name: 'Desert safari — white dunes',
    supplierName: 'Desert Adventures Co.',
    startDate: '2026-03-20',
    cost: 310,
    selling: 366,
    currency: 'EGP',
    notes: 'Half-day desert experience with dune bashing.',
    activityDetails: {
      activityType: 'Desert safari',
      durationHours: 6,
      pax: 4,
      pickupLocation: 'Marriott Cairo',
      dropoffLocation: 'Marriott Cairo',
      confirmationNumber: 'ACT-2026-0142',
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('tripServiceDetailSummary', () => {
  it('builds structured rows for activity services', () => {
    const details = tripServiceDetailDetails(baseService())

    expect(details.rows).toEqual([
      { label: 'Supplier', value: 'Desert Adventures Co.' },
      { label: 'Date', value: '20 Mar 2026' },
      { label: 'Duration', value: '6 hours' },
      { label: 'Guests', value: '4 guests' },
      { label: 'Transfer', value: 'Marriott Cairo' },
      { label: 'Confirmation', value: 'ACT-2026-0142' },
    ])
    expect(details.note).toBe('Half-day desert experience with dune bashing.')
    expect(tripServiceDetailSummary(baseService())).not.toContain('·')
  })

  it('formats lodging rows', () => {
    const details = tripServiceDetailDetails(
      baseService({
        category: 'lodging',
        name: 'Four Seasons Nile Plaza — 2 nights',
        supplierName: 'Four Seasons Nile Plaza',
        startDate: '2026-03-24',
        endDate: '2026-03-26',
        notes: undefined,
        activityDetails: undefined,
        lodgingDetails: {
          propertyName: 'Four Seasons Nile Plaza',
          roomType: 'Deluxe Nile View',
          boardBasis: 'Bed & breakfast',
          rooms: 2,
          nights: 2,
          confirmationNumber: 'HTL-77301',
        },
      }),
    )

    expect(formatInvoiceLineDetails(details)).toContain('Property: Four Seasons Nile Plaza')
    expect(formatInvoiceLineDetails(details)).toContain('Dates: 24 Mar 2026 – 26 Mar 2026')
    expect(formatInvoiceLineDetails(details)).toContain('Confirmation: HTL-77301')
  })

  it('parses legacy summaries into rows', () => {
    const parsed = parseInvoiceLineDetails(
      normalizeInvoiceDetailSummary(
        'Supplier: Desert Adventures Co. · 20 Mar 2026 · 6 hours · 4 guests',
      ),
    )

    expect(parsed.rows).toEqual([
      { label: 'Supplier', value: 'Desert Adventures Co.' },
      { label: 'Details', value: '20 Mar 2026\n6 hours\n4 guests' },
    ])
  })
})
