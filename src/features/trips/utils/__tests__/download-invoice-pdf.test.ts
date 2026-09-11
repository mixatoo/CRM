import { describe, expect, it } from 'vitest'
import {
  DEFAULT_INVOICE_COMPANY,
  DEFAULT_INVOICE_TERMS,
  DEFAULT_PAYMENT_INSTRUCTIONS,
  type InvoiceDocumentData,
} from '@/features/trips/utils/invoice-document'
import { buildInvoicePdf } from '@/features/trips/utils/download-invoice-pdf'

const sample: InvoiceDocumentData = {
  company: DEFAULT_INVOICE_COMPANY,
  companyName: DEFAULT_INVOICE_COMPANY.name,
  invoiceNumber: '504567-INV-01',
  status: 'sent',
  trip: {
    reference: 'TRP-504567',
    name: 'Cairo Getaway',
    destination: 'Cairo',
    branch: 'HQ',
    stage: 'Confirmed',
    travelDatesLabel: 'Jul 1 – Jul 7, 2026',
    adults: 2,
    minors: 0,
    totalTravelers: 2,
    ownerName: 'Agent',
    bookingDate: '2026-06-01',
  },
  tripReference: 'TRP-504567',
  tripName: 'Cairo Getaway',
  clientName: 'Ahmed Hassan',
  clientEmail: 'ahmed@example.com',
  issuedAt: '2026-07-01',
  dueDate: '2026-07-15',
  paymentTermsDays: 14,
  currency: 'USD',
  lineItems: [
    {
      id: '1',
      description: 'Hotel',
      quantity: 1,
      unitAmount: 500,
      amount: 500,
      currency: 'USD',
    },
  ],
  categoryBreakdown: [],
  subtotal: 500,
  taxRate: 0,
  taxAmount: 0,
  total: 500,
  paymentInstructions: DEFAULT_PAYMENT_INSTRUCTIONS,
  termsAndConditions: DEFAULT_INVOICE_TERMS,
  documentGeneratedAt: new Date().toISOString(),
}

describe('buildInvoicePdf (programmatic fallback)', () => {
  it('generates a PDF without throwing', () => {
    expect(() => buildInvoicePdf(sample)).not.toThrow()
  })

  it('handles EGP currency', () => {
    expect(() => buildInvoicePdf({ ...sample, currency: 'EGP' })).not.toThrow()
  })
})
