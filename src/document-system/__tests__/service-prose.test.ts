import { describe, expect, it } from 'vitest'
import type { TripService } from '@/domain/entities/trip-service'
import {
  formatDetailRowsProse,
  formatInvoiceLineProse,
  formatTripServiceProse,
} from '@/document-system/content/service-prose'

describe('service prose', () => {
  it('formats restaurant service as a professional sentence', () => {
    const service = {
      id: 'S1',
      tripId: 'T1',
      lineNumber: 1,
      category: 'restaurant' as const,
      status: 'confirmed' as const,
      name: 'Harbor Lunch',
      startDate: '2026-08-01',
      cost: 100,
      currency: 'USD',
      createdAt: '',
      updatedAt: '',
      restaurantDetails: {
        venueName: 'Abou El Sid',
        mealType: 'Lunch',
        pax: 10,
        reservationTime: '12:30 PM',
        dietaryNotes: 'Fresh seafood',
      },
    } satisfies TripService

    const prose = formatTripServiceProse(service)
    expect(prose).toContain('Abou El Sid')
    expect(prose).toContain('10 guests')
    expect(prose).toContain('12:30 PM')
    expect(prose).not.toContain('Venue:')
    expect(prose).not.toContain('Meal:')
  })

  it('converts detail rows into prose without label prefixes', () => {
    const prose = formatDetailRowsProse(
      [
        { label: 'Venue', value: 'Abou El Sid' },
        { label: 'Date', value: '01 Aug 2026' },
        { label: 'Guests', value: '10 guests' },
        { label: 'Reservation', value: '12:30 PM' },
      ],
      'Window table requested.',
    )
    expect(prose).toContain('Abou El Sid')
    expect(prose).toContain('10 guests')
    expect(prose).not.toMatch(/Venue:/)
  })

  it('formats invoice line with title and prose detail', () => {
    const prose = formatInvoiceLineProse({
      description: 'Harbor Lunch',
      detailRows: [
        { label: 'Venue', value: 'Abou El Sid' },
        { label: 'Meal', value: 'Lunch' },
        { label: 'Guests', value: '10 guests' },
        { label: 'Reservation', value: '12:30 PM' },
      ],
    })
    expect(prose.startsWith('Harbor Lunch —')).toBe(true)
    expect(prose).not.toContain('Venue:')
  })
})
