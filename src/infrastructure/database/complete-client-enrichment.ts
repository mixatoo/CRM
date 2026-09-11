import type {
  Client,
  ClientAcquisitionChannel,
  ClientAcquisitionSource,
  ClientCustomerTier,
  ClientGender,
  ClientPaymentMethod,
} from '@/domain/entities/client'
import {
  CLIENT_ACQUISITION_CHANNELS_BY_SOURCE,
  clientPrimaryLabel,
} from '@/domain/entities/client'
import type { ClientCommercialRegistration, ClientTaxRegistration } from '@/domain/entities/client-commercial'
import type { ClientSlaAgreement, ClientSlaLevel } from '@/domain/entities/client-sla'
import { normalizeSlaAgreement } from '@/domain/entities/client-sla'
import type { ClientSeedRecord } from '@/infrastructure/database/mocks/clients.mock'

const PAYMENT_METHODS: ClientPaymentMethod[] = [
  'bank_transfer',
  'credit_card',
  'wire',
  'cheque',
  'mobile_wallet',
]

const PREFERRED_DESTINATIONS = [
  'Cairo & Giza',
  'Luxor & Aswan',
  'Red Sea',
  'Sharm El Sheikh',
  'Alexandria',
  'Dubai',
  'Istanbul',
  'Paris',
  'London',
  'Marrakech',
]

const JOB_TITLES = [
  'Travel Manager',
  'Operations Director',
  'Procurement Lead',
  'Executive Assistant',
  'Marketing Manager',
  'Finance Controller',
]

function defaultPhone(country: string | undefined, index: number): string {
  const codes: Record<string, string> = {
    Egypt: '+20',
    UAE: '+971',
    'Saudi Arabia': '+966',
    USA: '+1',
    UK: '+44',
    France: '+33',
    Germany: '+49',
  }
  const prefix = codes[country ?? ''] ?? '+20'
  const local = String(100_000_000 + index * 1_117_019).slice(0, 9)
  return `${prefix} ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`
}

function defaultAddress(city: string | undefined, country: string | undefined, index: number): string {
  const street = 12 + (index % 80)
  return `${street} Travel District, ${city ?? 'Cairo'}, ${country ?? 'Egypt'}`
}

function acquisitionChannelFor(
  source: ClientAcquisitionSource,
  index: number,
): ClientAcquisitionChannel {
  const channels = CLIENT_ACQUISITION_CHANNELS_BY_SOURCE[source]
  return channels[index % channels.length] ?? 'other'
}

function slaLevelForTier(tier?: ClientCustomerTier): ClientSlaLevel {
  if (tier === 'strategic' || tier === 'platinum') return 'vip'
  if (tier === 'gold') return 'premium'
  return 'standard'
}

function buildSlaAgreement(seed: ClientSeedRecord, index: number): ClientSlaAgreement | undefined {
  if (seed.status === 'blocked') return undefined

  const level = slaLevelForTier(seed.customerTier)
  const year = 2025 + (index % 2)
  const effectiveDate = `${year}-01-01`
  const expiryDate = `${year + 1}-12-31`

  const inquiryPreset =
    level === 'vip' ? '30_minutes' : level === 'premium' ? '1_hour' : 'same_business_day'
  const quotePreset =
    level === 'vip' ? '2_hours' : level === 'premium' ? '4_hours' : 'next_business_day'

  return normalizeSlaAgreement({
    level,
    supportCoverage: level === 'vip' ? '24_7' : level === 'premium' ? 'extended_hours' : 'business_hours',
    inquiryResponse: { preset: inquiryPreset },
    quotationDelivery: { preset: quotePreset },
    bookingConfirmation: { preset: level === 'vip' ? '1_hour' : 'same_business_day' },
    voucherDelivery: { preset: 'same_business_day' },
    effectiveDate,
    expiryDate,
    autoRenew: true,
    renewalPeriod: 'annual',
    trackPerformance: level !== 'standard',
    slaSuccessTarget: level === 'vip' ? 98 : level === 'premium' ? 95 : 90,
  })
}

function buildCommercialReg(
  seed: ClientSeedRecord,
  index: number,
  address: string,
): ClientCommercialRegistration | undefined {
  const isCorporate = (seed.type ?? (seed.company ? 'corporate' : 'individual')) === 'corporate'
  if (!isCorporate) return undefined
  const name = seed.company?.trim() || seed.displayName
  return {
    registrationNumber: `CR-${String(10_000 + index).padStart(6, '0')}`,
    registeredName: name,
    issuingAuthority: seed.country === 'Egypt' ? 'GAFI' : 'Companies Registry',
    issuedDate: '2019-06-15',
    expiresDate: '2029-06-14',
    registeredAddress: address,
  }
}

function buildTaxReg(
  seed: ClientSeedRecord,
  index: number,
  _address: string,
): ClientTaxRegistration | undefined {
  const isCorporate = (seed.type ?? (seed.company ? 'corporate' : 'individual')) === 'corporate'
  if (!isCorporate) return undefined
  const name = seed.company?.trim() || seed.displayName
  return {
    taxId: `TIN-${String(200_000 + index).padStart(7, '0')}`,
    cardNumber: `TC-${String(300_000 + index).padStart(7, '0')}`,
    registeredName: name,
    issuingAuthority: seed.country === 'Egypt' ? 'ETA' : 'Tax Authority',
    issuedDate: '2020-01-01',
    expiresDate: '2030-12-31',
    activityCode: '79.11',
  }
}

/** Fill profile fields missing from sparse seed rows. */
export function enrichClientFromSeed(
  seed: ClientSeedRecord,
  index: number,
  partial: Pick<Client, 'type' | 'displayName' | 'company' | 'firstName' | 'lastName'>,
): Partial<Client> {
  const country = seed.country ?? 'Egypt'
  const city = seed.city ?? 'Cairo'
  const address = defaultAddress(city, country, index)
  const phone = seed.phone?.trim() || defaultPhone(country, index)
  const currency = seed.preferredCurrency ?? 'EGP'
  const source = seed.acquisitionSource ?? 'website'
  const billingAccount = seed.billingAccount ?? 'prepaid'
  const isCorporate = (seed.type ?? (seed.company ? 'corporate' : 'individual')) === 'corporate'
  const label = isCorporate
    ? seed.company?.trim() || seed.displayName
    : partial.displayName

  const paymentCurrencies = Array.from(new Set([currency, 'USD', ...(currency === 'EGP' ? ['EUR'] : [])]))

  return {
    phone,
    address,
    country,
    city,
    preferredLanguage: seed.country === 'Egypt' ? (index % 3 === 0 ? 'ar' : 'en') : 'en',
    acquisitionSource: source,
    acquisitionChannel: acquisitionChannelFor(source, index),
    segment:
      seed.segment ??
      (isCorporate ? `${seed.industry?.replace(/_/g, ' ') ?? 'Corporate'} accounts` : 'Leisure traveler'),
    market: seed.market ?? (isCorporate ? 'corporate' : 'leisure'),
    customerTier: seed.customerTier ?? (index % 5 === 0 ? 'gold' : 'silver'),
    paymentTermId: seed.paymentTermId ?? (billingAccount === 'credit' ? 'PTM-005' : 'PTM-002'),
    paymentCurrencies,
    preferredPaymentMethods: [
      PAYMENT_METHODS[index % PAYMENT_METHODS.length],
      PAYMENT_METHODS[(index + 2) % PAYMENT_METHODS.length],
    ],
    billingNotes:
      billingAccount === 'credit'
        ? `Approved credit line reviewed Q${(index % 4) + 1} 2026. Invoices in ${currency}.`
        : 'Prepaid account — full settlement before voucher release.',
    notes: `${label} onboarded via ${source.replace(/_/g, ' ')}. Primary contact for ${city} departures.`,
    preferredDestination: PREFERRED_DESTINATIONS[index % PREFERRED_DESTINATIONS.length],
    nationalityFocus: country,
    sla:
      seed.customerTier === 'strategic' || seed.customerTier === 'platinum'
        ? 'vip'
        : seed.customerTier === 'gold'
          ? 'premium'
          : 'standard',
    slaAgreement: buildSlaAgreement(seed, index),
    commercialRegistration: buildCommercialReg(seed, index, address),
    taxRegistration: buildTaxReg(seed, index, address),
    ...(isCorporate
      ? {}
      : {
          dateOfBirth: `${1968 + (index % 28)}-${String((index % 12) + 1).padStart(2, '0')}-15`,
          gender: (index % 2 === 0 ? 'male' : 'female') satisfies ClientGender,
          jobTitle: JOB_TITLES[index % JOB_TITLES.length],
        }),
  }
}

export function contactNameForClient(client: Pick<Client, 'type' | 'displayName' | 'company' | 'firstName' | 'lastName'>): string {
  return clientPrimaryLabel(client as Client)
}
