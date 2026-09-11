import { db } from '@/infrastructure/database/db'
import { SERVICE_CATEGORIES, tripTotalSelling, type ServiceCategoryCounts, type Trip, type TripStage } from '@/domain/entities'
import type { TripPayment } from '@/domain/entities/trip-payment'
import type { PaymentAllocation } from '@/domain/entities/payment-allocation'
import type { TripActivity, TripActivityType } from '@/domain/entities/trip-activity'
import type { Reminder } from '@/domain/entities/reminder'
import type { Client } from '@/domain/entities/client'
import { clientPrimaryLabel } from '@/domain/entities/client'
import type { ClientCreditCard } from '@/domain/entities/client-credit-card'
import type { ClientServiceFee } from '@/domain/entities/client-service-fee'
import { normalizeSlaAgreement } from '@/domain/entities/client-sla'
import { computeServiceBreakdown } from '@/domain/entities/trip-service'
import type { TripService } from '@/domain/entities/trip-service'
import type { Invoice, InvoiceStatus } from '@/domain/entities/invoice'
import type { LabelAssignment } from '@/domain/entities/label'
import type { Traveler } from '@/domain/entities/traveler'
import {
  DEFAULT_MEMBERSHIP_DURATION_MONTHS,
  addMonthsToMembershipDate,
  toMembershipStartDate,
} from '@/domain/membership/term'
import { formatMembershipNumber } from '@/domain/membership/program'
import { contactNameForClient } from '@/infrastructure/database/complete-client-enrichment'
import { ACCOUNT_MANAGER_NAMES } from '@/infrastructure/database/seed'
import { mockServicesForTrip } from '@/infrastructure/database/mocks/trip-services.mock'
import { generateId } from '@/shared/utils/cn'

export const SHOWCASE_CLIENT_REFERENCE = 'CLT-0179'
/** v4 — traveler human-facing IDs (`TRV-xxxx`). */
export const SHOWCASE_CLIENT_SEED_VERSION = 4

const PARTNER_SINCE = '2023-07-08'
const OWNER_INDEX = 6
const OWNER_ID = 'USR-007'

const EMPTY_BREAKDOWN: ServiceCategoryCounts[] = SERVICE_CATEGORIES.map((category) => ({
  category,
  proposal: 0,
  confirmed: 0,
  canceled: 0,
}))

type ShowcaseTripBlueprint = {
  name: string
  destination: string
  branch: string
  tripType: string
  stage: TripStage
  baseCost: number
  paidRatio: number
  year: number
  month: string
  day: string
  adults: number
}

/** 16 programs across three partnership years. */
const SHOWCASE_TRIP_HISTORY: ShowcaseTripBlueprint[] = [
  { name: 'Egypt Familiarization', destination: 'Cairo & Giza', branch: 'Cairo', tripType: 'MICE', stage: 'closed', baseCost: 48_200, paidRatio: 1, year: 2023, month: '09', day: '14', adults: 12 },
  { name: 'Nordic Leaders Forum', destination: 'Cairo', branch: 'Cairo', tripType: 'MICE', stage: 'closed', baseCost: 76_800, paidRatio: 1, year: 2023, month: '11', day: '06', adults: 85 },
  { name: 'Red Sea New Year Incentive', destination: 'Hurghada', branch: 'Hurghada', tripType: 'MICE', stage: 'lost', baseCost: 44_500, paidRatio: 0, year: 2023, month: '12', day: '28', adults: 40 },
  { name: 'Spring Nile Incentive', destination: 'Luxor & Aswan', branch: 'Luxor', tripType: 'MICE', stage: 'closed', baseCost: 91_400, paidRatio: 1, year: 2024, month: '03', day: '18', adults: 62 },
  { name: 'Alexandria Corporate Day', destination: 'Alexandria', branch: 'Alexandria', tripType: 'Corporate', stage: 'closed', baseCost: 33_600, paidRatio: 1, year: 2024, month: '05', day: '22', adults: 28 },
  { name: 'Sharm Summer Retreat', destination: 'Sharm El Sheikh', branch: 'Sharm El Sheikh', tripType: 'Corporate', stage: 'closed', baseCost: 58_900, paidRatio: 1, year: 2024, month: '07', day: '11', adults: 36 },
  { name: 'Luxor Heritage MICE Week', destination: 'Luxor', branch: 'Luxor', tripType: 'MICE', stage: 'closed', baseCost: 87_200, paidRatio: 1, year: 2024, month: '10', day: '03', adults: 54 },
  { name: 'Cairo Christmas Program', destination: 'Cairo', branch: 'Cairo', tripType: 'MICE', stage: 'lost', baseCost: 39_800, paidRatio: 0.1, year: 2024, month: '12', day: '15', adults: 32 },
  { name: 'Desert Adventure Incentive', destination: 'Bahariya Oasis', branch: 'Bahariya Oasis', tripType: 'MICE', stage: 'closed', baseCost: 52_400, paidRatio: 1, year: 2025, month: '02', day: '20', adults: 22 },
  { name: 'Cairo Tech Summit', destination: 'Cairo', branch: 'Cairo', tripType: 'MICE', stage: 'closed', baseCost: 71_600, paidRatio: 1, year: 2025, month: '04', day: '09', adults: 120 },
  { name: 'Red Sea Diving Incentive', destination: 'Hurghada', branch: 'Hurghada', tripType: 'MICE', stage: 'closed', baseCost: 46_300, paidRatio: 1, year: 2025, month: '09', day: '24', adults: 30 },
  { name: 'Partnership Anniversary Cruise', destination: 'Aswan', branch: 'Aswan', tripType: 'MICE', stage: 'recent', baseCost: 66_700, paidRatio: 0.92, year: 2025, month: '11', day: '12', adults: 48 },
  { name: 'Nile Incentive Cruise', destination: 'Luxor & Aswan', branch: 'Luxor', tripType: 'MICE', stage: 'closed', baseCost: 84_500, paidRatio: 1, year: 2026, month: '03', day: '12', adults: 56 },
  { name: 'Cairo MICE Summit', destination: 'Cairo', branch: 'Cairo', tripType: 'MICE', stage: 'confirmed', baseCost: 62_300, paidRatio: 0.55, year: 2026, month: '05', day: '08', adults: 95 },
  { name: 'Red Sea Team Retreat', destination: 'Sharm El Sheikh', branch: 'Sharm El Sheikh', tripType: 'Corporate', stage: 'active', baseCost: 47_800, paidRatio: 0.35, year: 2026, month: '06', day: '18', adults: 24 },
  { name: 'Alexandria Heritage Incentive', destination: 'Alexandria', branch: 'Alexandria', tripType: 'MICE', stage: 'proposal', baseCost: 38_200, paidRatio: 0, year: 2026, month: '07', day: '22', adults: 40 },
]

function isoAt(year: number, month: string, day: string, hour = 9): string {
  return new Date(`${year}-${month}-${day}T${String(hour).padStart(2, '0')}:00:00.000Z`).toISOString()
}

function buildShowcaseProfile(client: Client, now: string): Partial<Client> {
  const enrolledAt = '2023-09-01T10:00:00.000Z'
  const membershipStart = toMembershipStartDate(enrolledAt)

  return {
    displayName: 'Nordic Incentives Dmc 175',
    company: 'Nordic Incentives Dmc 175',
    type: 'corporate',
    status: 'active',
    email: client.email?.trim() || 'hello.acct175@nordicincentives.se',
    phone: '+46 8 555 0179',
    country: 'Sweden',
    city: 'Stockholm',
    address: '87 Stureplan, Norrmalm, Stockholm 114 35, Sweden',
    industry: 'corporate_services',
    preferredCurrency: 'EUR',
    paymentCurrencies: ['EUR', 'USD', 'SEK'],
    preferredLanguage: 'en',
    preferredPaymentMethods: ['bank_transfer', 'wire', 'credit_card'],
    billingAccount: 'credit',
    creditLimit: 650_000,
    paymentTermId: 'PTM-006',
    acquisitionSource: 'email_inquiry',
    acquisitionChannel: 'inbound_email',
    segment: 'Nordic incentive groups',
    market: 'mice',
    customerTier: 'platinum',
    accountManagerId: 'USR-011',
    preferredDestination: 'Cairo & Giza',
    nationalityFocus: 'Sweden',
    billingNotes:
      'Strategic EUR credit line — last reviewed Apr 2026. Lifetime volume €2.8M since Jul 2023. Net-30; USD settlement available on request.',
    notes:
      'Partnership since Jul 2023. Primary Nordic MICE partner for Egypt — 14 completed programs, 2 lost bids. Annual target €1.4M. Key contact: events@nordicincentives.se.',
    membership: 'member',
    membershipNumber: client.membershipNumber ?? formatMembershipNumber(179),
    membershipEnrolledAt: enrolledAt,
    membershipExpiresAt: addMonthsToMembershipDate(membershipStart, DEFAULT_MEMBERSHIP_DURATION_MONTHS),
    membershipNotes:
      'Corporate membership since Sep 2023 — renewed annually. Priority handling on groups above 20 pax.',
    sla: 'premium',
    slaAgreement: normalizeSlaAgreement({
      level: 'premium',
      supportCoverage: 'extended_hours',
      emergencyPhone: '+46 8 555 0179',
      emergencyEmail: 'emergency@nordicincentives.se',
      emergencyResponseTime: '1_hour',
      inquiryResponse: { preset: '1_hour' },
      quotationDelivery: { preset: '4_hours' },
      bookingConfirmation: { preset: 'same_business_day' },
      voucherDelivery: { preset: 'same_business_day' },
      complaintResponse: { preset: '2_hours' },
      complaintResolution: { preset: 'same_business_day' },
      escalationEnabled: true,
      escalationAfter: '4_hours',
      escalationContact: 'Hesham Ali',
      escalationEmail: 'hesham.ali@egyliere.com',
      escalationPhone: '+20 100 555 0111',
      effectiveDate: PARTNER_SINCE,
      expiryDate: '2027-07-07',
      autoRenew: true,
      renewalPeriod: 'annual',
      renewalReminderDays: 45,
      trackPerformance: true,
      kpiReviewFrequency: 'quarterly',
      slaSuccessTarget: 96,
      alertBeforeBreach: '30_minutes',
      internalNotes: '3-year platinum partner. QBR every quarter with Stockholm office.',
    }),
    commercialRegistration: {
      registrationNumber: 'SE-556789-0179',
      registeredName: 'Nordic Incentives Dmc 175 AB',
      issuingAuthority: 'Bolagsverket',
      issuedDate: '2018-03-22',
      expiresDate: '2028-03-21',
      registeredAddress: '87 Stureplan, Norrmalm, Stockholm 114 35, Sweden',
    },
    taxRegistration: {
      taxId: 'SE556789017901',
      cardNumber: 'VAT-SE-0179',
      registeredName: 'Nordic Incentives Dmc 175 AB',
      issuingAuthority: 'Skatteverket',
      issuedDate: '2018-04-01',
      expiresDate: '2028-03-31',
      activityCode: '79.11',
    },
    joinedAt: PARTNER_SINCE,
    createdAt: client.createdAt > PARTNER_SINCE ? PARTNER_SINCE : client.createdAt,
    updatedAt: now,
  }
}

function buildShowcaseCreditCards(clientId: string): ClientCreditCard[] {
  return [
    {
      id: generateId('CCD'),
      clientId,
      cardName: 'Corporate travel',
      brand: 'visa',
      last4: '4179',
      expMonth: 9,
      expYear: 2028,
      isActive: true,
      createdAt: isoAt(2023, '08', '15'),
      updatedAt: isoAt(2026, '01', '10'),
    },
    {
      id: generateId('CCD'),
      clientId,
      cardName: 'Events backup',
      brand: 'mastercard',
      last4: '8821',
      expMonth: 4,
      expYear: 2027,
      isActive: false,
      createdAt: isoAt(2024, '06', '01'),
      updatedAt: isoAt(2025, '11', '20'),
    },
    {
      id: generateId('CCD'),
      clientId,
      cardName: 'MICE on-site',
      brand: 'amex',
      last4: '3094',
      expMonth: 11,
      expYear: 2029,
      isActive: false,
      createdAt: isoAt(2025, '03', '14'),
      updatedAt: isoAt(2025, '03', '14'),
    },
  ]
}

function buildShowcaseServiceFees(clientId: string): ClientServiceFee[] {
  const agreedAt = isoAt(2023, '07', '20')
  return [
    {
      id: generateId('CSF'),
      clientId,
      serviceName: 'Flight booking',
      category: 'flight',
      feeType: 'percentage',
      feeValue: 5,
      notes: 'Agreed Jul 2023. Applies to published and negotiated air.',
      createdAt: agreedAt,
      updatedAt: isoAt(2025, '07', '08'),
    },
    {
      id: generateId('CSF'),
      clientId,
      serviceName: 'Hotel booking',
      category: 'lodging',
      feeType: 'percentage',
      feeValue: 8,
      notes: 'Group blocks above 15 rooms. Reviewed annually.',
      createdAt: agreedAt,
      updatedAt: isoAt(2025, '07', '08'),
    },
    {
      id: generateId('CSF'),
      clientId,
      serviceName: 'Ground transport',
      category: 'transport',
      feeType: 'fixed',
      feeValue: 150,
      currency: 'EUR',
      notes: 'Per movement within Greater Cairo.',
      createdAt: agreedAt,
      updatedAt: agreedAt,
    },
    {
      id: generateId('CSF'),
      clientId,
      serviceName: 'MICE coordination',
      category: 'activity',
      feeType: 'percentage',
      feeValue: 12,
      notes: 'Full program management — rate locked since 2024.',
      createdAt: isoAt(2024, '01', '15'),
      updatedAt: isoAt(2024, '01', '15'),
    },
    {
      id: generateId('CSF'),
      clientId,
      serviceName: 'Nile cruise charter',
      category: 'cruise',
      feeType: 'percentage',
      feeValue: 10,
      notes: 'Added after 2024 Luxor program success.',
      createdAt: isoAt(2024, '11', '01'),
      updatedAt: isoAt(2024, '11', '01'),
    },
  ]
}

function maxTripReference(trips: Trip[]): number {
  return trips.reduce((max, trip) => {
    const match = trip.reference.match(/^(\d+)$/)
    if (!match) return max
    return Math.max(max, Number.parseInt(match[1], 10))
  }, 504_576)
}

function buildShowcaseTrip(client: Client, blueprint: ShowcaseTripBlueprint, reference: string): Trip {
  const commission = Math.round(blueprint.baseCost * (0.09 + (blueprint.year % 3) * 0.01))
  const clientPaidAmount = Math.round(blueprint.baseCost * blueprint.paidRatio)
  const supplierBalanceDue =
    blueprint.stage === 'closed' || blueprint.stage === 'recent'
      ? 0
      : Math.max(0, Math.round(blueprint.baseCost * 0.28))
  const created = isoAt(blueprint.year, blueprint.month, blueprint.day)
  const endDay = String(Math.min(Number(blueprint.day) + 5, 28)).padStart(2, '0')

  return {
    id: `TRP-${reference}`,
    reference,
    name: `${blueprint.name} — ${clientPrimaryLabel(client)}`,
    ownerName: ACCOUNT_MANAGER_NAMES[OWNER_INDEX],
    ownerId: OWNER_ID,
    branch: blueprint.branch,
    destination: blueprint.destination,
    stage: blueprint.stage,
    lastPipelineStage:
      blueprint.stage === 'closed' || blueprint.stage === 'lost' || blueprint.stage === 'recent'
        ? 'confirmed'
        : undefined,
    tripType: blueprint.tripType,
    currency: client.preferredCurrency ?? 'EUR',
    totalCost: blueprint.baseCost,
    totalCommission: commission,
    clientPaidAmount,
    supplierBalanceDue,
    adults: blueprint.adults,
    minors: blueprint.adults > 50 ? 2 : 0,
    bookingStartedAt: `${blueprint.year}-${blueprint.month}-01`,
    startDate: `${blueprint.year}-${blueprint.month}-${blueprint.day}`,
    endDate: `${blueprint.year}-${blueprint.month}-${endDay}`,
    mainContactName: contactNameForClient(client),
    mainContactEmail: client.email,
    clientId: client.id,
    agentName: ACCOUNT_MANAGER_NAMES[OWNER_INDEX],
    agentEmail: 'hesham.ali@egyliere.com',
    serviceBreakdown: EMPTY_BREAKDOWN,
    createdAt: created,
    updatedAt: created,
  }
}

async function purgeClientOperationalData(clientId: string): Promise<void> {
  const trips = await db.trips.where('clientId').equals(clientId).toArray()
  const tripIds = trips.map((trip) => trip.id)
  if (tripIds.length === 0) return

  await db.transaction(
    'rw',
    [db.trips, db.tripServices, db.invoices, db.tripPayments, db.tripActivities, db.labelAssignments, db.reminders],
    async () => {
      for (const tripId of tripIds) {
        await db.tripServices.where('tripId').equals(tripId).delete()
        await db.invoices.where('tripId').equals(tripId).delete()
        await db.tripPayments.where('tripId').equals(tripId).delete()
        await db.tripActivities.where('tripId').equals(tripId).delete()
        await db.reminders.where('tripId').equals(tripId).delete()

        const tripLabels = await db.labelAssignments
          .where('[targetType+targetId]')
          .equals(['trip', tripId])
          .toArray()
        await Promise.all(tripLabels.map((assignment) => db.labelAssignments.delete(assignment.id)))
      }
      await Promise.all(trips.map((trip) => db.trips.delete(trip.id)))
    },
  )
}

async function ensureShowcaseTripServices(trips: Trip[], tripOffset: number): Promise<void> {
  const services: TripService[] = []

  for (const [index, trip] of trips.entries()) {
    services.push(...mockServicesForTrip(trip, tripOffset + index))
  }

  if (services.length === 0) return

  await db.tripServices.bulkPut(services)

  const byTrip = new Map<string, TripService[]>()
  for (const service of services) {
    const list = byTrip.get(service.tripId) ?? []
    list.push(service)
    byTrip.set(service.tripId, list)
  }

  await Promise.all(
    Array.from(byTrip.entries()).map(([tripId, tripServices]) =>
      db.trips.update(tripId, {
        serviceBreakdown: computeServiceBreakdown(tripServices),
        updatedAt: new Date().toISOString(),
      }),
    ),
  )
}

function invoiceStatusForTrip(trip: Trip): InvoiceStatus {
  if (trip.stage === 'closed' || trip.stage === 'recent') return 'paid'
  if (trip.stage === 'lost') return trip.clientPaidAmount > 0 ? 'sent' : 'void'
  if (trip.stage === 'confirmed' || trip.stage === 'upcoming') return 'sent'
  if (trip.stage === 'active') return 'pending'
  return 'draft'
}

function buildShowcaseInvoice(trip: Trip, sequence: number): Invoice {
  const status = invoiceStatusForTrip(trip)
  const total = Math.max(tripTotalSelling(trip), trip.totalCost || 25_000)
  const taxRate = 14
  const subtotal = Math.round((total / (1 + taxRate / 100)) * 100) / 100
  const taxAmount = Math.round((total - subtotal) * 100) / 100
  const issuedAt = trip.createdAt
  const year = trip.startDate?.slice(0, 4) ?? '2026'
  const amountPaid =
    status === 'paid'
      ? total
      : status === 'sent'
        ? Math.min(trip.clientPaidAmount, total)
        : 0

  return {
    id: generateId('INV'),
    tripId: trip.id,
    number: `INV-${year}-${String(sequence).padStart(3, '0')}`,
    status,
    clientName: trip.mainContactName ?? 'Client',
    clientEmail: trip.mainContactEmail,
    currency: trip.currency,
    lineItems: [
      {
        id: generateId('LINE'),
        description: `${trip.name} — travel services`,
        quantity: 1,
        unitAmount: subtotal,
        amount: subtotal,
        currency: trip.currency,
      },
    ],
    subtotal,
    taxRate,
    taxAmount,
    total,
    amountPaid,
    issuedAt,
    dueDate: trip.endDate ?? issuedAt.slice(0, 10),
    createdAt: issuedAt,
    updatedAt: issuedAt,
  }
}

function buildPaymentsForTrip(trip: Trip, invoiceId?: string): TripPayment[] {
  if (trip.clientPaidAmount <= 0) return []

  const isFullyPaid = trip.clientPaidAmount >= trip.totalCost * 0.9
  const bookingDate = new Date(trip.bookingStartedAt || trip.createdAt)

  if (isFullyPaid && (trip.stage === 'closed' || trip.stage === 'recent')) {
    const deposit = Math.round(trip.clientPaidAmount * 0.35)
    const balance = trip.clientPaidAmount - deposit
    const depositDate = new Date(bookingDate)
    depositDate.setDate(depositDate.getDate() + 5)
    const balanceDate = new Date(trip.startDate || trip.createdAt)
    balanceDate.setDate(balanceDate.getDate() - 14)

    return [
      {
        id: generateId('PAY'),
        clientId: trip.clientId,
        tripId: trip.id,
        invoiceId,
        direction: 'inbound',
        method: 'bank_transfer',
        status: 'confirmed',
        amount: deposit,
        currency: trip.currency,
        reference: `RCPT-${trip.reference}-01`,
        counterpartyName: trip.mainContactName ?? 'Client',
        paidAt: depositDate.toISOString(),
        createdAt: depositDate.toISOString(),
        updatedAt: depositDate.toISOString(),
      },
      {
        id: generateId('PAY'),
        clientId: trip.clientId,
        tripId: trip.id,
        invoiceId,
        direction: 'inbound',
        method: 'wire',
        status: 'confirmed',
        amount: balance,
        currency: trip.currency,
        reference: `RCPT-${trip.reference}-02`,
        counterpartyName: trip.mainContactName ?? 'Client',
        paidAt: balanceDate.toISOString(),
        createdAt: balanceDate.toISOString(),
        updatedAt: balanceDate.toISOString(),
      },
    ]
  }

  const paidAt = trip.createdAt
  return [
    {
      id: generateId('PAY'),
      clientId: trip.clientId,
      tripId: trip.id,
      invoiceId,
      direction: 'inbound',
      method: 'bank_transfer',
      status: trip.stage === 'proposal' ? 'recorded' : 'confirmed',
      amount: trip.clientPaidAmount,
      currency: trip.currency,
      reference: `RCPT-${trip.reference}`,
      counterpartyName: trip.mainContactName ?? 'Client',
      paidAt,
      createdAt: paidAt,
      updatedAt: paidAt,
    },
  ]
}

function buildAllocationsForPayments(payments: TripPayment[]): PaymentAllocation[] {
  return payments
    .filter((payment) => payment.direction === 'inbound' && payment.invoiceId && payment.status !== 'void')
    .map((payment) => ({
      id: generateId('PAL'),
      paymentId: payment.id,
      invoiceId: payment.invoiceId!,
      amount: payment.amount,
      createdAt: payment.createdAt,
    }))
}

const ACTIVITY_TEMPLATES: Array<{
  type: TripActivityType
  action: string
  summary: string
  actorName: string
  daysBeforeStart: number
}> = [
  { type: 'trip', action: 'trip_created', summary: 'Inquiry opened from Stockholm office', actorName: 'Hesham Ali', daysBeforeStart: 90 },
  { type: 'trip', action: 'stage_changed', summary: 'Moved to Proposal', actorName: 'Hesham Ali', daysBeforeStart: 75 },
  { type: 'service', action: 'service_added', summary: 'Flight options CAI ↔ destination added', actorName: 'Operations', daysBeforeStart: 60 },
  { type: 'invoice', action: 'invoice_created', summary: 'Pro-forma invoice drafted', actorName: 'Finance Team', daysBeforeStart: 45 },
  { type: 'payment', action: 'payment_recorded', summary: 'Deposit receipt logged', actorName: 'Finance Team', daysBeforeStart: 40 },
  { type: 'service', action: 'service_confirmed', summary: 'Hotel block confirmed', actorName: 'Operations', daysBeforeStart: 30 },
  { type: 'trip', action: 'stage_changed', summary: 'Moved to Confirmed', actorName: 'Hesham Ali', daysBeforeStart: 28 },
  { type: 'invoice', action: 'invoice_sent', summary: 'Final invoice sent to client', actorName: 'Finance Team', daysBeforeStart: 20 },
  { type: 'payment', action: 'payment_confirmed', summary: 'Balance payment confirmed', actorName: 'Finance Team', daysBeforeStart: 15 },
  { type: 'trip', action: 'stage_changed', summary: 'Program completed successfully', actorName: 'Hesham Ali', daysBeforeStart: -2 },
]

function buildActivitiesForTrip(trip: Trip): TripActivity[] {
  if (trip.stage === 'proposal' || trip.stage === 'draft') {
    return ACTIVITY_TEMPLATES.slice(0, 3).map((template) => {
      const start = new Date(trip.startDate || trip.createdAt)
      start.setDate(start.getDate() - template.daysBeforeStart)
      return {
        id: generateId('ACT'),
        tripId: trip.id,
        type: template.type,
        action: template.action,
        summary: template.summary,
        actorName: template.actorName,
        createdAt: start.toISOString(),
      }
    })
  }

  if (trip.stage === 'lost') {
    const lostAt = new Date(trip.createdAt)
    lostAt.setDate(lostAt.getDate() + 45)
    return [
      {
        id: generateId('ACT'),
        tripId: trip.id,
        type: 'trip',
        action: 'trip_created',
        summary: 'RFP received from Nordic Incentives',
        actorName: 'Hesham Ali',
        createdAt: trip.createdAt,
      },
      {
        id: generateId('ACT'),
        tripId: trip.id,
        type: 'trip',
        action: 'stage_changed',
        summary: 'Marked as lost — client chose alternate dates',
        actorName: 'Hesham Ali',
        createdAt: lostAt.toISOString(),
      },
    ]
  }

  return ACTIVITY_TEMPLATES.map((template) => {
    const start = new Date(trip.startDate || trip.createdAt)
    start.setDate(start.getDate() - template.daysBeforeStart)
    return {
      id: generateId('ACT'),
      tripId: trip.id,
      type: template.type,
      action: template.action,
      summary: template.summary,
      actorName: template.actorName,
      createdAt: start.toISOString(),
    }
  })
}

function buildShowcaseReminders(trips: Trip[]): Reminder[] {
  const activeTrips = trips.filter((trip) => trip.stage === 'active' || trip.stage === 'confirmed')
  const templates: Array<{
    title: string
    category: Reminder['category']
    priority: Reminder['priority']
    dueInDays: number
    status?: Reminder['status']
  }> = [
    { title: 'Collect Cairo MICE Summit balance', category: 'payment', priority: 'high', dueInDays: 2 },
    { title: 'Send Sharm retreat rooming list', category: 'document', priority: 'normal', dueInDays: 1 },
    { title: 'Reconfirm Sharm airport transfers', category: 'operations', priority: 'high', dueInDays: 0 },
    { title: 'Alexandria proposal follow-up call', category: 'client', priority: 'normal', dueInDays: 3 },
    { title: 'Q3 partnership review deck', category: 'client', priority: 'low', dueInDays: 14, status: 'open' },
    { title: 'Archive 2025 anniversary cruise files', category: 'document', priority: 'low', dueInDays: -30, status: 'done' },
  ]

  const now = new Date()
  return templates.map((template, index) => {
    const trip = activeTrips[index % Math.max(activeTrips.length, 1)]
    const due = new Date(now)
    due.setDate(due.getDate() + template.dueInDays)
    due.setHours(9, 0, 0, 0)
    const created = new Date(now)
    created.setDate(created.getDate() - (index + 1))

    return {
      id: generateId('REM'),
      reference: `REM-NI-${String(1790 + index).padStart(4, '0')}`,
      title: template.title,
      description: `Nordic Incentives — ${trip?.name ?? 'account follow-up'}`,
      status: template.status ?? 'open',
      priority: template.priority,
      category: template.category,
      dueAt: due.toISOString(),
      tripId: trip?.id,
      assigneeName: 'Hesham Ali',
      createdAt: created.toISOString(),
      updatedAt: created.toISOString(),
    }
  })
}

async function ensureShowcaseLabels(clientId: string, tripIds: string[]): Promise<void> {
  await db.labelAssignments
    .where('[targetType+targetId]')
    .equals(['client', clientId])
    .delete()

  const now = new Date().toISOString()
  const clientLabels: LabelAssignment[] = ['LBL-001', 'LBL-005', 'LBL-003'].map((labelId) => ({
    id: generateId('LAS'),
    labelId,
    targetType: 'client',
    targetId: clientId,
    createdAt: now,
  }))

  const tripLabels: LabelAssignment[] = tripIds.map((tripId, index) => ({
    id: generateId('LAS'),
    labelId: index % 3 === 0 ? 'LBL-002' : index % 3 === 1 ? 'LBL-006' : 'LBL-005',
    targetType: 'trip',
    targetId: tripId,
    createdAt: now,
  }))

  await db.labelAssignments.bulkAdd([...clientLabels, ...tripLabels])
}

type ShowcaseTravelerSeed = Pick<Traveler, 'firstName' | 'lastName' | 'email' | 'phone' | 'jobTitle' | 'notes'> & {
  year: number
  month: string
  day: string
}

const SHOWCASE_TRAVELERS: ShowcaseTravelerSeed[] = [
  {
    firstName: 'Erik',
    lastName: 'Lindqvist',
    email: 'erik.lindqvist@nordicincentives.se',
    phone: '+46 70 441 2290',
    jobTitle: 'Head of Events',
    notes: 'Primary booker since Jul 2023. Signs off all MICE programs.',
    year: 2023,
    month: '07',
    day: '12',
  },
  {
    firstName: 'Anna',
    lastName: 'Bergström',
    email: 'anna.bergstrom@nordicincentives.se',
    phone: '+46 70 882 1144',
    jobTitle: 'Program Manager',
    notes: 'Day-to-day coordinator for Cairo and Luxor movements.',
    year: 2023,
    month: '08',
    day: '20',
  },
  {
    firstName: 'Lars',
    lastName: 'Johansson',
    email: 'finance@nordicincentives.se',
    phone: '+46 8 555 0142',
    jobTitle: 'Finance Controller',
    notes: 'Approves deposits and final settlements.',
    year: 2023,
    month: '09',
    day: '05',
  },
  {
    firstName: 'Sofia',
    lastName: 'Nilsson',
    email: 'sofia.nilsson@nordicincentives.se',
    phone: '+46 73 220 8891',
    jobTitle: 'Operations Coordinator',
    notes: 'Handles rooming lists and on-site logistics.',
    year: 2024,
    month: '02',
    day: '14',
  },
  {
    firstName: 'Magnus',
    lastName: 'Andersson',
    email: 'magnus.andersson@nordicincentives.se',
    phone: '+46 76 330 5512',
    jobTitle: 'Group Leader',
    notes: 'Escorts delegate groups on Nile and Red Sea programs.',
    year: 2024,
    month: '06',
    day: '18',
  },
  {
    firstName: 'Ingrid',
    lastName: 'Holm',
    email: 'ingrid.holm@nordicincentives.se',
    phone: '+46 70 119 7734',
    jobTitle: 'VIP Delegate',
    notes: 'Recurring guest on luxury Nile departures.',
    year: 2024,
    month: '10',
    day: '02',
  },
  {
    firstName: 'Johan',
    lastName: 'Ekström',
    email: 'johan.ekstrom@nordicincentives.se',
    phone: '+46 72 904 3310',
    jobTitle: 'Sales Director',
    notes: 'Joined 2025 partnership review meetings in Cairo.',
    year: 2025,
    month: '01',
    day: '22',
  },
  {
    firstName: 'Maria',
    lastName: 'Forsberg',
    email: 'maria.forsberg@nordicincentives.se',
    phone: '+46 70 558 9021',
    jobTitle: 'Delegate',
    notes: 'Sharm retreat and Alexandria heritage programs.',
    year: 2025,
    month: '06',
    day: '11',
  },
  {
    firstName: 'Peter',
    lastName: 'Karlsson',
    email: 'peter.karlsson@nordicincentives.se',
    phone: '+46 73 661 4488',
    jobTitle: 'Delegate',
    notes: 'Tech summit group — Cairo Apr 2025.',
    year: 2025,
    month: '04',
    day: '07',
  },
  {
    firstName: 'Karin',
    lastName: 'Lund',
    email: 'karin.lund@nordicincentives.se',
    phone: '+46 70 774 1205',
    jobTitle: 'Delegate',
    notes: 'Registered for Alexandria heritage incentive Jul 2026.',
    year: 2026,
    month: '05',
    day: '30',
  },
]

function buildShowcaseTravelers(accountId: string): Traveler[] {
  return SHOWCASE_TRAVELERS.map((seed, index) => {
    const createdAt = isoAt(seed.year, seed.month, seed.day)
    return {
      id: generateId('TRV'),
      reference: `TRV-${String(index + 1).padStart(4, '0')}`,
      accountId,
      status: 'active' as const,
      vipLevel: index === 0 ? ('vip' as const) : ('standard' as const),
      passengerType: 'adult' as const,
      firstName: seed.firstName,
      lastName: seed.lastName,
      email: seed.email,
      phone: seed.phone,
      jobTitle: seed.jobTitle,
      notes: seed.notes,
      primaryNationality: 'SE',
      nationality: 'SE',
      passports: [],
      visas: [],
      otherDocuments: [],
      address: {},
      emergencyContact: {},
      travelPreferences: {},
      assistance: {},
      medical: {},
      privacy: {},
      classification: {
        categories: index === 0 ? (['vip'] as const) : (['corporate_guest'] as const),
        riskLevel: 'low' as const,
        blacklistStatus: 'clear' as const,
        watchlistStatus: 'clear' as const,
        internalTags: [],
      },
      profileSettings: {},
      createdAt,
      updatedAt: createdAt,
    }
  })
}

async function ensureShowcaseTravelers(accountId: string): Promise<void> {
  await db.travelers.where('accountId').equals(accountId).delete()
  await db.travelers.bulkAdd(buildShowcaseTravelers(accountId))
}

async function seedShowcaseOperationalHistory(client: Client): Promise<void> {
  await db.clientCreditCards.where('clientId').equals(client.id).delete()
  await db.clientServiceFees.where('clientId').equals(client.id).delete()
  await db.clientCreditCards.bulkAdd(buildShowcaseCreditCards(client.id))
  await db.clientServiceFees.bulkAdd(buildShowcaseServiceFees(client.id))

  await purgeClientOperationalData(client.id)

  const updatedClient = (await db.clients.get(client.id)) ?? client
  const allTrips = await db.trips.toArray()
  let nextRef = maxTripReference(allTrips) + 1

  const newTrips = SHOWCASE_TRIP_HISTORY.map((blueprint) => {
    const reference = String(nextRef).padStart(6, '0')
    nextRef += 1
    return buildShowcaseTrip(updatedClient, blueprint, reference)
  })

  await db.trips.bulkAdd(newTrips)

  const tripOffset = allTrips.length
  await ensureShowcaseTripServices(newTrips, tripOffset)

  const invoices = newTrips.map((trip, index) => buildShowcaseInvoice(trip, 179 + index))
  await db.invoices.bulkAdd(invoices)

  const payments = newTrips.flatMap((trip, index) => buildPaymentsForTrip(trip, invoices[index]?.id))
  if (payments.length > 0) {
    await db.tripPayments.bulkAdd(payments)
    const paymentAllocations = buildAllocationsForPayments(payments)
    if (paymentAllocations.length > 0) {
      await db.paymentAllocations.bulkAdd(paymentAllocations)
    }
  }

  const activities = newTrips.flatMap((trip) => buildActivitiesForTrip(trip))
  if (activities.length > 0) {
    await db.tripActivities.bulkAdd(activities)
  }

  const existingReminderRefs = await db.reminders.where('reference').startsWith('REM-NI-').count()
  if (existingReminderRefs === 0) {
    await db.reminders.bulkAdd(buildShowcaseReminders(newTrips))
  }

  await ensureShowcaseLabels(
    client.id,
    newTrips.map((trip) => trip.id),
  )
}

export async function ensureShowcaseClientSeed(): Promise<void> {
  const settings = await db.settings.get('SET-001')
  const version = settings?.showcaseClientSeedVersion ?? 0
  if (version >= SHOWCASE_CLIENT_SEED_VERSION) return

  const client = await db.clients.where('reference').equals(SHOWCASE_CLIENT_REFERENCE).first()
  if (!client) return

  const now = new Date().toISOString()
  await db.clients.update(client.id, buildShowcaseProfile(client, now))

  if (version < 2) {
    await seedShowcaseOperationalHistory(client)
  }

  await ensureShowcaseTravelers(client.id)

  if (settings) {
    await db.settings.update('SET-001', {
      showcaseClientSeedVersion: SHOWCASE_CLIENT_SEED_VERSION,
    })
  }
}
