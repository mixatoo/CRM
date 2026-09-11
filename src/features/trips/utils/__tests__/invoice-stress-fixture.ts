import type { InvoiceLineItem } from '@/domain/entities/invoice'
import {
  DEFAULT_INVOICE_COMPANY,
  DEFAULT_INVOICE_TERMS,
  DEFAULT_PAYMENT_INSTRUCTIONS,
  type InvoiceDocumentData,
} from '@/features/trips/utils/invoice-document'

const LONG =
  'International Luxury Boutique Resort & Spa — Grand Nile View Presidential Suite Wing with Private Butler Service'

function stressLine(index: number, overrides?: Partial<InvoiceLineItem>): InvoiceLineItem {
  return {
    id: `stress-line-${index}`,
    description: `${LONG} — Desert Safari Experience Package Tier ${index + 1}`,
    quantity: index % 3 === 0 ? 12 : 1,
    unitAmount: 1_250_000.55 + index * 99_999.99,
    amount: (1_250_000.55 + index * 99_999.99) * (index % 3 === 0 ? 12 : 1),
    currency: index % 2 === 0 ? 'USD' : 'EGP',
    detailRows: [
      {
        label: 'Supplier',
        value:
          'Desert Adventures International Holdings & Tourism Services Cooperative — Cairo Regional Operations Division',
      },
      { label: 'Date', value: '20 March 2026 through 28 March 2026 (extended shoulder season)' },
      { label: 'Duration', value: '14 hours including transfers and multi-stop sightseeing' },
      { label: 'Guests', value: '24 guests across 3 families and 2 corporate delegations' },
      {
        label: 'Transfer',
        value:
          'Marriott Cairo Hotel & Convention Center, 6th of October Bridge Approach, Garden City District',
      },
      { label: 'Confirmation', value: `ACT-2026-ULTRA-LONG-CONFIRMATION-CODE-${index}` },
    ],
    detailNote:
      'Half-day desert experience with dune bashing, camel ride, traditional Bedouin dinner, stargazing astronomy session, and premium photography package with licensed guide.',
    detailSummary: '',
    ...overrides,
  }
}

export const invoiceStressDocument: InvoiceDocumentData = {
  company: {
    ...DEFAULT_INVOICE_COMPANY,
    name: 'Egyliere Premium Travel Operations & International Destination Management Services LLC',
    tagline:
      'Enterprise-grade travel operations, client billing, supplier coordination, and destination logistics across MENA and Europe',
    addressLine1:
      'Building 12, Nile Corniche Business Complex, Garden City Administrative District, Downtown Cairo Governorate',
    addressLine2: 'Arab Republic of Egypt — Postal Code 11519 — Near Tahrir Square Cultural Quarter',
    bankAccountName:
      'Egyliere Premium Travel Operations & International Destination Management Services LLC',
    email: 'billing.corporate.accounts.receivable@egyliere-international-operations.example.com',
    phone: '+20 2 0000 0000 ext. 4421 — Corporate Billing Desk',
    website: 'www.egyliere-premium-international-travel-operations.example.com',
    taxRegistration: 'EG-TIN-000000000-INTERNATIONAL-BILLING-UNIT',
  },
  companyName: 'Egyliere Premium Travel Operations',
  invoiceNumber: 'TRP-504567-INV-2026-ULTRA-LONG-SEQUENCE-00042',
  status: 'sent',
  trip: {
    reference: 'TRP-504567-INTL-MEGA-ITINERARY-2026-Q3',
    name: 'Grand Mediterranean & Nile Heritage Explorer — Multi-Country Cultural Immersion Program',
    destination:
      'Cairo, Giza, Luxor, Aswan, Alexandria, Sharm El Sheikh, Hurghada, and Saint Catherine Monastery Region',
    branch: 'Cairo Headquarters — International Corporate Sales Division',
    stage: 'Confirmed — Awaiting Final Supplier Confirmations',
    tripType: 'Luxury Multi-Destination Corporate Incentive',
    startDate: '2026-07-01',
    endDate: '2026-08-15',
    travelDatesLabel: '1 July 2026 – 15 August 2026 (46 nights across 8 destinations)',
    adults: 48,
    minors: 12,
    totalTravelers: 60,
    ownerName: 'Mohamed Ibrahim Al-Rashidi — Senior Corporate Account Director',
    agentName: 'Sarah Elizabeth Montgomery-Whitfield — International Luxury Travel Consultant',
    agentEmail: 'sarah.montgomery.whitfield@global-luxury-travel-partners.example.com',
    bookingDate: '2026-05-01',
  },
  tripReference: 'TRP-504567-INTL-MEGA-ITINERARY-2026-Q3',
  tripName: 'Grand Mediterranean & Nile Heritage Explorer',
  clientName:
    'Dr. Alexander Konstantinopoulos-Müller & The Global Heritage Foundation for Cultural Exchange Programs',
  clientEmail:
    'accounts.payable.international.programs@global-heritage-foundation-cultural-exchange.example.org',
  issuedAt: '2026-07-01',
  dueDate: '2026-08-15',
  paymentTermsDays: 45,
  currency: 'USD',
  lineItems: Array.from({ length: 18 }, (_, index) => stressLine(index)),
  categoryBreakdown: [],
  subtotal: 28_750_000.88,
  taxRate: 14,
  taxAmount: 4_025_000.12,
  total: 32_775_001.0,
  amountPaid: 5_000_000,
  balanceDue: 27_775_001.0,
  notes:
    'Please remit payment via international wire transfer referencing the full invoice number. ' +
    'Include SWIFT confirmation within 48 hours. Partial payments are applied oldest invoice first unless otherwise agreed in writing. ' +
    'All supplier vouchers and final manifests will be released upon settlement of outstanding balance. ' +
    'Late payments may incur finance charges per master service agreement section 14.2.',
  paymentInstructions: DEFAULT_PAYMENT_INSTRUCTIONS,
  termsAndConditions: DEFAULT_INVOICE_TERMS,
  documentGeneratedAt: new Date().toISOString(),
}

/** Sparse optional fields — ensures empty rows are hidden without layout collapse. */
export const invoiceStressSparseDocument: InvoiceDocumentData = {
  ...invoiceStressDocument,
  invoiceNumber: 'TRP-SPARSE-01',
  clientEmail: undefined,
  trip: {
    ...invoiceStressDocument.trip,
    destination: undefined,
    agentName: undefined,
    agentEmail: undefined,
  },
  notes: undefined,
  amountPaid: undefined,
  balanceDue: undefined,
  taxRate: 0,
  taxAmount: 0,
  total: invoiceStressDocument.subtotal,
  lineItems: [stressLine(0, { detailRows: [], detailNote: undefined })],
}
