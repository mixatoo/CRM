import { describe, expect, it } from 'vitest'
import type { Client } from '@/domain/entities/client'
import { normalizeSlaAgreement } from '@/domain/entities/client-sla'
import {
  buildClientProfileDashboardSections,
  getProfileSectionsForWizardStep,
  groupClientProfileDisplayCards,
} from '@/features/clients/utils/client-profile-display'

const now = '2026-07-07T00:00:00.000Z'

function baseClient(overrides: Partial<Client>): Client {
  return {
    id: 'client-1',
    reference: 'CLT-0001',
    displayName: 'Placeholder',
    type: 'individual',
    status: 'active',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

function fieldLabels(sections: ReturnType<typeof buildClientProfileDashboardSections>): string[] {
  return sections.flatMap((section) => section.fields.map((field) => field.label))
}

describe('buildClientProfileDashboardSections', () => {
  it('shows personal profile fields for individual clients only', () => {
    const sections = buildClientProfileDashboardSections(
      baseClient({
        type: 'individual',
        displayName: 'Nour Hamed',
        firstName: 'Nour',
        lastName: 'Hamed',
        dateOfBirth: '1990-03-15',
        gender: 'female',
        acquisitionSource: 'referral',
        acquisitionChannel: 'client_referral',
      }),
      { accountManagerName: 'Sara Ali' },
    )

    expect(sections.map((section) => section.title)).toEqual([
      'Personal profile',
      'Account Information',
      'Communication',
      'Payment information',
      'Membership',
      'SLA',
    ])
    expect(sections[0].fields.map((field) => field.label)).toEqual([
      'First name',
      'Last name',
      'Date of birth',
      'Age',
      'Gender',
    ])
    expect(sections[0].fields.some((field) => field.label === 'Industry')).toBe(false)
    expect(sections[0].fields.some((field) => field.label === 'Company name')).toBe(false)
    expect(sections[1].fields.map((field) => field.label)).toEqual([
      'Account manager',
      'Source',
      'Channel',
    ])
  })

  it('shows company profile fields for corporate clients only', () => {
    const sections = buildClientProfileDashboardSections(
      baseClient({
        type: 'corporate',
        displayName: 'Acme Holdings',
        company: 'Acme Holdings',
        industry: 'finance',
        firstName: 'Leaked',
        lastName: 'Name',
        dateOfBirth: '1985-01-01',
        gender: 'male',
      }),
    )

    expect(sections[0].title).toBe('Company profile')
    expect(sections[0].fields.map((field) => field.label)).toEqual(['Company name', 'Industry'])
    expect(sections[0].fields.some((field) => field.label === 'First name')).toBe(false)
    expect(sections[0].fields.some((field) => field.label === 'Date of birth')).toBe(false)
    expect(sections.some((section) => section.title === 'Commercial information')).toBe(true)
  })

  it('hides empty optional fields and uses empty states for blank sections', () => {
    const sections = buildClientProfileDashboardSections(
      baseClient({
        type: 'individual',
        displayName: 'Nour Hamed',
        firstName: 'Nour',
        lastName: 'Hamed',
        billingAccount: 'prepaid',
      }),
    )

    expect(sections[0].fields.some((field) => field.label === 'Middle name')).toBe(false)
    expect(sections[0].fields.some((field) => field.label === 'Gender')).toBe(false)
    expect(sections[1].fields).toHaveLength(0)
    expect(sections[1].emptyMessage).toBe(
      'No account assignment or acquisition source recorded yet.',
    )
    expect(sections[2].emptyMessage).toBe('No contact details recorded yet.')
    expect(sections[3].fields.map((field) => field.label)).toEqual(['Billing account'])
    expect(sections[5].emptyMessage).toBe('No service level agreement recorded yet.')
  })

  it('covers all add-client form fields for a fully populated individual client', () => {
    const sections = buildClientProfileDashboardSections(
      baseClient({
        type: 'individual',
        displayName: 'Nour Hamed',
        firstName: 'Nour',
        middleName: 'Salah',
        lastName: 'Hamed',
        dateOfBirth: '1990-03-15',
        gender: 'female',
        acquisitionSource: 'website',
        acquisitionChannel: 'organic_search',
        accountManagerId: 'mgr-1',
        email: 'nour@example.com',
        phone: '+20 100 000 0000',
        preferredLanguage: 'ar',
        country: 'Egypt',
        city: 'Cairo',
        address: '12 Nile Street',
        billingAccount: 'credit',
        creditLimit: 50_000,
        preferredCurrency: 'EGP',
        paymentCurrencies: ['EGP', 'USD'],
        preferredPaymentMethods: ['bank_transfer', 'credit_card'],
        paymentTermId: 'PTM-005',
        billingNotes: 'Invoice in EGP only.',
        membership: 'member',
        membershipNumber: 'MEM-1001',
        membershipEnrolledAt: '2026-01-01',
        membershipExpiresAt: '2027-01-01',
        membershipNotes: 'Gold tier renewal.',
        slaAgreement: normalizeSlaAgreement({
          level: 'premium',
          supportCoverage: 'extended_hours',
          inquiryResponse: { preset: '1_hour' },
          quotationDelivery: { preset: '4_hours' },
          bookingConfirmation: { preset: 'same_business_day' },
          voucherDelivery: { preset: 'same_business_day' },
          complaintResponse: { preset: 'same_business_day' },
          complaintResolution: { preset: 'next_business_day' },
          effectiveDate: '2026-01-01',
          expiryDate: '2026-12-31',
          internalNotes: 'Priority handling.',
        }),
        notes: 'VIP traveler.',
      }),
      {
        accountManagerName: 'Sara Ali',
        paymentTermName: 'Net 30',
      },
    )

    const labels = fieldLabels(sections)

    expect(labels).toEqual(
      expect.arrayContaining([
        'First name',
        'Middle name',
        'Last name',
        'Date of birth',
        'Age',
        'Gender',
        'Account manager',
        'Source',
        'Channel',
        'Email',
        'Phone',
        'Country',
        'City',
        'Address',
        'Billing account',
        'Credit limit',
        'Payment currencies',
        'Payment methods',
        'Payment terms',
        'Billing notes',
        'Enrollment',
        'Member number',
        'Start date',
        'End date',
        'Duration',
        'Notes',
        'SLA level',
        'Support coverage',
        'Inquiry Response Time',
        'Quotation Delivery Time',
        'Booking Confirmation Time',
        'Voucher Delivery Time',
        'Complaint Response Time',
        'Complaint Resolution Time',
        'Effective date',
        'Expiry date',
        'Internal SLA notes',
        'Team-only context',
      ]),
    )
    expect(sections.some((section) => section.title === 'Internal notes')).toBe(true)
    expect(labels).not.toContain('Company name')
    expect(labels).not.toContain('Industry')
  })

  it('covers all add-client form fields for a fully populated corporate client', () => {
    const sections = buildClientProfileDashboardSections(
      baseClient({
        type: 'corporate',
        displayName: 'Acme Holdings',
        company: 'Acme Holdings',
        industry: 'finance',
        acquisitionSource: 'partner',
        acquisitionChannel: 'travel_agent',
        email: 'billing@acme.com',
        billingAccount: 'prepaid',
        commercialRegistration: {
          registrationNumber: 'CR-123456',
          registeredName: 'Acme Holdings LLC',
          issuingAuthority: 'GAFI',
          issuedDate: '2020-01-01',
          expiresDate: '2030-01-01',
          registeredAddress: 'Downtown Cairo',
        },
        taxRegistration: {
          taxId: 'TIN-123',
          cardNumber: 'TC-456',
          registeredName: 'Acme Holdings LLC',
          issuingAuthority: 'ETA',
          issuedDate: '2021-01-01',
          expiresDate: '2031-01-01',
          activityCode: '79.11',
        },
      }),
      { paymentTermName: 'Prepaid' },
    )

    const labels = fieldLabels(sections)

    expect(labels).toEqual(
      expect.arrayContaining([
        'Company name',
        'Industry',
        'Commercial register',
        'Registration number',
        'Registered name',
        'Issuing authority',
        'Issue date',
        'Expiry date',
        'Registered address',
        'Tax card',
        'Tax ID',
        'Card number',
        'Activity code',
      ]),
    )
    expect(labels).not.toContain('First name')
    expect(labels).not.toContain('Date of birth')
  })

  it('groups profile sections into fewer cards for easier scanning', () => {
    const sections = buildClientProfileDashboardSections(
      baseClient({
        type: 'corporate',
        company: 'Acme Holdings',
        industry: 'finance',
        notes: 'Internal only.',
        commercialRegistration: { registrationNumber: 'CR-1' },
      }),
    )

    const cards = groupClientProfileDisplayCards(sections)

    expect(cards).toHaveLength(5)
    expect(cards[0].sections.map((section) => section.title)).toEqual([
      'Company profile',
      'Account Information',
    ])
    expect(cards[1].sections.map((section) => section.title)).toEqual([
      'Communication',
      'Payment information',
    ])
    expect(cards.find((card) => card.key === 'commercial')?.className).toContain('lg:col-span-2')
  })

  it('maps wizard steps to form-aligned profile fields', () => {
    const client = baseClient({
      type: 'individual',
      firstName: 'Ibrahim',
      middleName: 'Mahmoud',
      lastName: 'Mohamed',
      email: 'm@example.com',
    })

    const basicsStep = getProfileSectionsForWizardStep('basics', client)

    expect(basicsStep).toHaveLength(1)
    expect(basicsStep[0].fields.map((field) => field.label)).toEqual([
      'First name',
      'Middle name',
      'Last name',
      'Date of birth',
      'Age',
      'Gender',
      'Client since',
      'Source',
      'Channel',
      'Account manager',
    ])

    const contactStep = getProfileSectionsForWizardStep('contact', client)
    expect(contactStep[0].fields.map((field) => field.label)).toEqual([
      'Email',
      'Phone',
      'Country',
      'City',
      'Address',
    ])

    const corporateBasics = getProfileSectionsForWizardStep(
      'basics',
      baseClient({ type: 'corporate', company: 'Acme Holdings', industry: 'finance' }),
    )
    expect(corporateBasics[0].fields.map((field) => field.label)).toEqual([
      'Company name',
      'Industry',
      'Client since',
      'Source',
      'Channel',
      'Account manager',
    ])
  })
})
