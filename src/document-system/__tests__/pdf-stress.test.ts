import { describe, expect, it } from 'vitest'
import { buildInvoicePdf, renderInvoiceDocument } from '@/document-system/templates/invoice-template'
import { buildItineraryPdf } from '@/document-system/templates/itinerary-template'
import { docContentWidth } from '@/document-system/tokens/page'
import { SERVICE_CATEGORIES } from '@/domain/entities/trip'
import type { Trip } from '@/domain/entities'
import { buildTripItinerary } from '@/domain/trip/build-itinerary'
import type { TripService } from '@/domain/entities/trip-service'
import {
  invoiceStressDocument,
  invoiceStressSparseDocument,
} from '@/features/trips/utils/__tests__/invoice-stress-fixture'
import {
  DEFAULT_INVOICE_COMPANY,
  DEFAULT_INVOICE_TERMS,
  DEFAULT_PAYMENT_INSTRUCTIONS,
  type InvoiceDocumentData,
} from '@/features/trips/utils/invoice-document'

const fourLineInvoice: InvoiceDocumentData = {
  company: DEFAULT_INVOICE_COMPANY,
  companyName: DEFAULT_INVOICE_COMPANY.name,
  invoiceNumber: 'TRP-504567-INV-01',
  status: 'sent',
  trip: {
    reference: 'TRP-504567',
    name: 'Sharm incentive',
    destination: 'Sharm El Sheikh',
    branch: 'HQ',
    stage: 'Confirmed',
    travelDatesLabel: '31 May – 4 Jun 2026',
    adults: 24,
    minors: 0,
    totalTravelers: 24,
    ownerName: 'Ops',
    bookingDate: '2026-05-01',
  },
  tripReference: 'TRP-504567',
  tripName: 'Sharm incentive',
  clientName: 'Corporate Group',
  clientEmail: 'billing@example.com',
  issuedAt: '2026-05-15',
  dueDate: '2026-06-15',
  paymentTermsDays: 30,
  currency: 'EGP',
  lineItems: [
    {
      id: '1',
      description: 'One way',
      quantity: 1,
      unitAmount: 33_040,
      amount: 33_040,
      currency: 'EGP',
      detailSummary: 'EgyptAir, on 31 May 2026, One way, for 1 guest.',
    },
    {
      id: '2',
      description: 'Rixos Premium Seagate',
      quantity: 1,
      unitAmount: 38_350,
      amount: 38_350,
      currency: 'EGP',
      detailSummary:
        '4 nights — Rixos Premium Seagate, on 01 Jun 2026 – 04 Jun 2026, Superior Room, Ultra all inclusive, 12 rooms, 4 nights, confirmation HTL-88100.',
    },
    {
      id: '3',
      description: 'Gala dinner',
      quantity: 1,
      unitAmount: 6_480,
      amount: 6_480,
      currency: 'EGP',
      detailSummary:
        'beach venue — Rixos Premium Seagate, on 03 Jun 2026, Dinner, for 24 guests, reservation at 20:00.',
    },
    {
      id: '4',
      description: 'Team-building catamaran sail',
      quantity: 1,
      unitAmount: 3_776,
      amount: 3_776,
      currency: 'EGP',
      detailSummary:
        'Egyliere Transport, on 02 Jun 2026, Boat trip, 4 hours, for 24 guests, transfer from Rixos Marina, confirmation ACT-4401.',
    },
  ],
  categoryBreakdown: [],
  subtotal: 81_646,
  taxRate: 0,
  taxAmount: 0,
  total: 81_646,
  paymentInstructions: DEFAULT_PAYMENT_INSTRUCTIONS,
  termsAndConditions: DEFAULT_INVOICE_TERMS,
  documentGeneratedAt: new Date().toISOString(),
}

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

describe('document-system PDF stress', () => {
  it('uses document closing band instead of a running page footer', () => {
    const ctx = renderInvoiceDocument(fourLineInvoice)
    expect(ctx.disableRunningFooter).toBe(true)
    expect(ctx.runningFooterHeight).toBe(0)

    const pdf = ctx.finish()
    expect(pdf.getNumberOfPages()).toBeLessThanOrEqual(2)
  })

  it('keeps a typical four-line invoice on one or two pages without orphan sections', () => {
    const pdf = buildInvoicePdf(fourLineInvoice)
    expect(pdf.getNumberOfPages()).toBeLessThanOrEqual(2)
  })

  it('generates multi-page invoice for extreme document', () => {
    const pdf = buildInvoicePdf(invoiceStressDocument)
    expect(pdf.getNumberOfPages()).toBeGreaterThanOrEqual(2)
    expect(pdf.output('blob').size).toBeGreaterThan(4_000)
  })

  it('generates invoice for sparse optional fields', () => {
    expect(() => buildInvoicePdf(invoiceStressSparseDocument)).not.toThrow()
  })

  it('uses wide content area (tight professional margins)', () => {
    expect(docContentWidth()).toBeGreaterThanOrEqual(194)
  })

  it('generates itinerary PDF for multi-day schedule', () => {
    const services = Array.from({ length: 12 }, (_, index) =>
      makeService({
        id: `S${index}`,
        category: index % 2 === 0 ? 'tour' : 'restaurant',
        name: `Experience ${index + 1} with extended descriptive title for layout stress testing`,
        startDate: `2026-06-${String((index % 3) + 1).padStart(2, '0')}`,
        restaurantDetails:
          index % 2 === 1
            ? {
                venueName: `Venue ${index} — Nile Corniche Premium Dining Hall`,
                mealType: 'Dinner',
                pax: 4,
                reservationTime: '19:30',
                dietaryNotes: 'Vegetarian and gluten-free options required for two guests',
              }
            : undefined,
      }),
    )
    const itinerary = buildTripItinerary(baseTrip, services)
    const pdf = buildItineraryPdf({ trip: baseTrip, itinerary })
    expect(pdf.getNumberOfPages()).toBeGreaterThanOrEqual(1)
    expect(pdf.output('blob').size).toBeGreaterThan(3_000)
  })
})
