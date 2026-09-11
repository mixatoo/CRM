import { describe, expect, it } from 'vitest'
import type { Client } from '@/domain/entities/client'
import type { Invoice } from '@/domain/entities/invoice'
import type { Trip } from '@/domain/entities/trip'
import type { TripService } from '@/domain/entities/trip-service'
import {
  buildClientActivitySeries,
  resolveClientDashboardAnalytics,
} from '@/features/clients/utils/client-dashboard-analytics'

const client = {
  billingAccount: 'cash',
  preferredCurrency: 'EGP',
  paymentCurrencies: ['EGP'],
} as Client

function trip(overrides: Partial<Trip> & Pick<Trip, 'id' | 'stage'>): Trip {
  return {
    reference: 'TRP-001',
    name: 'Trip',
    ownerName: 'Owner',
    branch: 'HQ',
    currency: 'EGP',
    totalCost: 10_000,
    totalSelling: 12_000,
    totalCommission: 2_000,
    clientPaidAmount: 5_000,
    supplierBalanceDue: 0,
    adults: 2,
    minors: 0,
    bookingStartedAt: '2025-06-15T00:00:00.000Z',
    serviceBreakdown: [],
    createdAt: '2025-06-01T00:00:00.000Z',
    updatedAt: '2025-06-15T00:00:00.000Z',
    ...overrides,
  }
}

describe('resolveClientDashboardAnalytics', () => {
  it('aggregates trip, invoice, booking, and financial metrics', () => {
    const trips = [
      trip({ id: 't1', stage: 'confirmed' }),
      trip({ id: 't2', stage: 'closed', clientPaidAmount: 12_000 }),
      trip({ id: 't3', stage: 'lost' }),
    ]

    const invoices: Invoice[] = [
      {
        id: 'inv-1',
        tripId: 't1',
        number: 'INV-1',
        status: 'paid',
        clientName: 'Client',
        currency: 'EGP',
        lineItems: [],
        subtotal: 1000,
        taxRate: 0,
        taxAmount: 0,
        total: 1000,
        amountPaid: 1000,
        issuedAt: '2025-06-01',
        dueDate: '2025-06-15',
        createdAt: '2025-06-01',
        updatedAt: '2025-06-01',
      },
      {
        id: 'inv-2',
        tripId: 't1',
        number: 'INV-2',
        status: 'sent',
        clientName: 'Client',
        currency: 'EGP',
        lineItems: [],
        subtotal: 500,
        taxRate: 0,
        taxAmount: 0,
        total: 500,
        amountPaid: 0,
        issuedAt: '2025-06-02',
        dueDate: '2025-06-16',
        createdAt: '2025-06-02',
        updatedAt: '2025-06-02',
      },
    ]

    const services: TripService[] = [
      {
        id: 's1',
        tripId: 't1',
        lineNumber: 1,
        category: 'flight',
        status: 'confirmed',
        name: 'Flight',
        cost: 1000,
        currency: 'EGP',
        createdAt: '2025-06-01',
        updatedAt: '2025-06-01',
      },
      {
        id: 's2',
        tripId: 't1',
        lineNumber: 2,
        category: 'lodging',
        status: 'canceled',
        name: 'Hotel',
        cost: 500,
        currency: 'EGP',
        createdAt: '2025-06-01',
        updatedAt: '2025-06-01',
      },
    ]

    const analytics = resolveClientDashboardAnalytics(client, trips, invoices, services)

    expect(analytics.openTrips).toBe(1)
    expect(analytics.closedTrips).toBe(1)
    expect(analytics.lostTrips).toBe(1)
    expect(analytics.winRatePercent).toBe(50)
    expect(analytics.closedInvoices).toBe(1)
    expect(analytics.openInvoices).toBe(1)
    expect(analytics.confirmedBookings).toBe(1)
    expect(analytics.cancelledBookings).toBe(1)
    expect(analytics.totalRevenue).toBe(24_000)
    expect(analytics.netProfit).toBe(4_000)
    expect(analytics.profitMarginPercent).toBeCloseTo(16.67, 1)
  })
})

describe('buildClientActivitySeries', () => {
  it('returns 12 monthly buckets including empty months', () => {
    const now = new Date()
    const recent = new Date(now.getFullYear(), now.getMonth(), 10).toISOString()
    const trips = [trip({ id: 't1', stage: 'closed', bookingStartedAt: recent })]
    const series = buildClientActivitySeries(trips, 'month', 'EGP')

    expect(series).toHaveLength(12)
    expect(series.some((point) => point.tripCount === 1)).toBe(true)
  })

  it('groups yearly activity by booking year', () => {
    const trips = [
      trip({ id: 't1', stage: 'closed', bookingStartedAt: '2024-03-01T00:00:00.000Z' }),
      trip({ id: 't2', stage: 'confirmed', bookingStartedAt: '2025-08-01T00:00:00.000Z' }),
    ]

    const series = buildClientActivitySeries(trips, 'year', 'EGP')

    expect(series).toEqual([
      expect.objectContaining({ key: '2024', tripCount: 1 }),
      expect.objectContaining({ key: '2025', tripCount: 1 }),
    ])
  })
})
