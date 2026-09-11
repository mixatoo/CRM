import type { ClientCommercialRegistration, ClientTaxRegistration } from '@/domain/entities/client-commercial'
import {
  normalizeClientCommercialRegistration,
  normalizeClientTaxRegistration,
} from '@/domain/entities/client-commercial'
import { listCurrencyCodes } from '@/domain/currency'
import {
  normalizeSlaAgreement,
  syncLegacyClientSla,
  type ClientSlaAgreement,
} from '@/domain/entities/client-sla'
import { stripClientFieldsForType } from '@/domain/entities/client-field-visibility'
import { normalizeNameField, toTitleCase } from '@/shared/utils/text-format'

export type { ClientSlaAgreement } from '@/domain/entities/client-sla'
export type { ClientCommercialRegistration, ClientTaxRegistration } from '@/domain/entities/client-commercial'

export type ClientStatus = 'active' | 'inactive' | 'blocked'

export type ClientType = 'individual' | 'corporate'

export type ClientIndustry =
  | 'travel_tourism'
  | 'hospitality'
  | 'corporate_services'
  | 'education'
  | 'healthcare'
  | 'technology'
  | 'finance'
  | 'real_estate'
  | 'retail'
  | 'manufacturing'
  | 'government'
  | 'nonprofit'
  | 'media'
  | 'other'

export type ClientSla = 'standard' | 'priority' | 'premium' | 'vip'

export type ClientMarket = 'leisure' | 'corporate' | 'mice' | 'luxury' | 'fit' | 'groups'

export type ClientCustomerTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'strategic'

export type ClientAcquisitionSource =
  | 'referral'
  | 'website'
  | 'walk_in'
  | 'social_media'
  | 'partner'
  | 'event'
  | 'phone_inquiry'
  | 'email_inquiry'
  | 'ota'
  | 'existing_customer'
  | 'other'

export type ClientAcquisitionChannel =
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'twitter'
  | 'youtube'
  | 'snapchat'
  | 'whatsapp'
  | 'telegram'
  | 'travel_blog'
  | 'travel_group'
  | 'organic_search'
  | 'google_ads'
  | 'meta_ads'
  | 'direct_visit'
  | 'package_landing_page'
  | 'blog_article'
  | 'flight_hotel_deals'
  | 'client_referral'
  | 'employee_referral'
  | 'partner_referral'
  | 'family_friend'
  | 'tour_guide'
  | 'hotel_concierge'
  | 'past_traveler'
  | 'main_office'
  | 'branch_office'
  | 'airport_desk'
  | 'hotel_partner'
  | 'resort_desk'
  | 'cruise_terminal'
  | 'tourist_info_center'
  | 'mall_kiosk'
  | 'historic_site'
  | 'travel_agent'
  | 'sub_agent'
  | 'dmc'
  | 'tour_operator'
  | 'corporate_partner'
  | 'airline'
  | 'hotel_chain'
  | 'cruise_line'
  | 'ground_handler'
  | 'car_rental'
  | 'influencer'
  | 'affiliate'
  | 'trade_show'
  | 'travel_fair'
  | 'roadshow'
  | 'expo'
  | 'fam_trip'
  | 'mice_event'
  | 'tourism_board_event'
  | 'webinar'
  | 'inbound_call'
  | 'outbound_call'
  | 'hotline'
  | 'inbound_email'
  | 'newsletter'
  | 'email_campaign'
  | 'quote_request'
  | 'group_booking_inquiry'
  | 'booking_com'
  | 'expedia'
  | 'tripadvisor'
  | 'agoda'
  | 'hotels_com'
  | 'airbnb'
  | 'skyscanner'
  | 'wego'
  | 'almosafer'
  | 'trivago'
  | 'repeat_booking'
  | 'return_trip'
  | 'upsell'
  | 'group_extension'
  | 'loyalty_rebooking'
  | 'honeymoon_package'
  | 'umrah_hajj'
  | 'other'

export type ClientMembership = 'non_member' | 'member'

export type ClientPaymentMethod =
  | 'bank_transfer'
  | 'credit_card'
  | 'cash'
  | 'cheque'
  | 'wire'
  | 'mobile_wallet'
  | 'other'

export type ClientBillingAccount = 'prepaid' | 'credit'

export type ClientGender = 'male' | 'female'

export interface Client {
  id: string
  reference: string
  displayName: string
  /** May contain multiple given names, e.g. "Mohamed Ali". */
  firstName?: string
  /** May contain multiple middle names, e.g. "Abdel Rahman". */
  middleName?: string
  /** May contain multiple family names, e.g. "El Sayed". */
  lastName?: string
  type: ClientType
  status: ClientStatus
  email?: string
  phone?: string
  company?: string
  industry?: ClientIndustry
  jobTitle?: string
  country?: string
  city?: string
  address?: string
  /** Currency of the approved credit line (credit accounts only). Not used for invoice currency. */
  preferredCurrency?: string
  /** ISO currency codes the client accepts for payment. */
  paymentCurrencies?: string[]
  preferredLanguage?: string
  preferredPaymentMethods?: ClientPaymentMethod[]
  /** @deprecated Legacy single value — use preferredPaymentMethods */
  preferredPaymentMethod?: ClientPaymentMethod
  /** @deprecated Legacy text value — use paymentTermId */
  paymentTerms?: string
  paymentTermId?: string
  billingAccount?: ClientBillingAccount
  creditLimit?: number
  sla?: ClientSla
  slaAgreement?: ClientSlaAgreement
  market?: ClientMarket
  segment?: string
  customerTier?: ClientCustomerTier
  /** Primary acquisition category (e.g. social media, referral). */
  acquisitionSource?: ClientAcquisitionSource
  /** Sub-category within the selected source (e.g. Instagram under social media). */
  acquisitionChannel?: ClientAcquisitionChannel
  /** ISO date (YYYY-MM-DD). Individual clients only. */
  dateOfBirth?: string
  gender?: ClientGender
  /** Internal user responsible for this account. */
  accountManagerId?: string
  membership?: ClientMembership
  membershipNumber?: string
  membershipEnrolledAt?: string
  membershipExpiresAt?: string
  membershipNotes?: string
  preferredDestination?: string
  nationalityFocus?: string
  billingNotes?: string
  /** Commercial register details — corporate clients only, when available. */
  commercialRegistration?: ClientCommercialRegistration
  /** Tax card / TIN details — corporate clients only, when available. */
  taxRegistration?: ClientTaxRegistration
  notes?: string
  /** Date the client account joined the company — defaults to account creation; admin-editable. */
  joinedAt?: string
  createdAt: string
  updatedAt: string
}

export const CLIENT_STATUSES: ClientStatus[] = ['active', 'inactive', 'blocked']

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  blocked: 'Blocked',
}

export const CLIENT_TYPES: ClientType[] = ['individual', 'corporate']

export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  individual: 'Individual',
  corporate: 'Corporate',
}

/** When the client account joined the company (distinct from membership enrollment). */
export const CLIENT_JOINED_COMPANY_LABEL = 'Client since'

export const CLIENT_INDUSTRIES: ClientIndustry[] = [
  'travel_tourism',
  'hospitality',
  'corporate_services',
  'education',
  'healthcare',
  'technology',
  'finance',
  'real_estate',
  'retail',
  'manufacturing',
  'government',
  'nonprofit',
  'media',
  'other',
]

export const CLIENT_INDUSTRY_LABELS: Record<ClientIndustry, string> = {
  travel_tourism: 'Travel & Tourism',
  hospitality: 'Hospitality',
  corporate_services: 'Corporate & Business Services',
  education: 'Education',
  healthcare: 'Healthcare',
  technology: 'Technology',
  finance: 'Finance & Banking',
  real_estate: 'Real Estate',
  retail: 'Retail',
  manufacturing: 'Manufacturing',
  government: 'Government',
  nonprofit: 'Non-profit',
  media: 'Media & Entertainment',
  other: 'Other',
}

export const CLIENT_SLAS: ClientSla[] = ['standard', 'priority', 'premium', 'vip']

export const CLIENT_SLA_LABELS: Record<ClientSla, string> = {
  standard: 'Standard',
  priority: 'Priority',
  premium: 'Premium',
  vip: 'VIP',
}

export const CLIENT_SLA_DESCRIPTIONS: Record<ClientSla, string> = {
  standard: 'Response within 24 hours',
  priority: 'Response within 4 hours',
  premium: 'Response within 2 hours',
  vip: 'Response within 1 hour · dedicated contact',
}

export const CLIENT_MARKETS: ClientMarket[] = ['leisure', 'corporate', 'mice', 'luxury', 'fit', 'groups']

export const CLIENT_MARKET_LABELS: Record<ClientMarket, string> = {
  leisure: 'Leisure',
  corporate: 'Corporate',
  mice: 'MICE',
  luxury: 'Luxury',
  fit: 'FIT',
  groups: 'Groups',
}

export const CLIENT_CUSTOMER_TIERS: ClientCustomerTier[] = ['bronze', 'silver', 'gold', 'platinum', 'strategic']

export const CLIENT_CUSTOMER_TIER_LABELS: Record<ClientCustomerTier, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
  strategic: 'Strategic',
}

export const CLIENT_ACQUISITION_SOURCES: ClientAcquisitionSource[] = [
  'referral',
  'website',
  'walk_in',
  'social_media',
  'partner',
  'event',
  'phone_inquiry',
  'email_inquiry',
  'ota',
  'existing_customer',
  'other',
]

export const CLIENT_ACQUISITION_SOURCE_LABELS: Record<ClientAcquisitionSource, string> = {
  referral: 'Referral',
  website: 'Website',
  walk_in: 'Walk-in',
  social_media: 'Social media',
  partner: 'Partner / B2B',
  event: 'Event / trade show',
  phone_inquiry: 'Phone',
  email_inquiry: 'Email',
  ota: 'OTA',
  existing_customer: 'Existing customer',
  other: 'Other',
}

export const CLIENT_ACQUISITION_CHANNEL_LABELS: Record<ClientAcquisitionChannel, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  twitter: 'X (Twitter)',
  youtube: 'YouTube',
  snapchat: 'Snapchat',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  travel_blog: 'Travel blog / vlog',
  travel_group: 'Travel group / community',
  organic_search: 'Organic search',
  google_ads: 'Google Ads',
  meta_ads: 'Meta Ads',
  direct_visit: 'Direct website visit',
  package_landing_page: 'Tour package landing page',
  blog_article: 'Travel blog / article',
  flight_hotel_deals: 'Flight & hotel deals page',
  client_referral: 'Client referral',
  employee_referral: 'Employee referral',
  partner_referral: 'Partner referral',
  family_friend: 'Family / friend',
  tour_guide: 'Tour guide',
  hotel_concierge: 'Hotel concierge',
  past_traveler: 'Past traveler recommendation',
  main_office: 'Main office',
  branch_office: 'Branch office',
  airport_desk: 'Airport desk / meet & greet',
  hotel_partner: 'Partner hotel lobby',
  resort_desk: 'Resort front desk',
  cruise_terminal: 'Cruise terminal',
  tourist_info_center: 'Tourist information center',
  mall_kiosk: 'Mall / bazaar travel kiosk',
  historic_site: 'Historic site / attraction desk',
  travel_agent: 'Travel agent (IATA)',
  sub_agent: 'Sub-agent / reseller',
  dmc: 'DMC (destination management)',
  tour_operator: 'Tour operator',
  corporate_partner: 'Corporate / MICE partner',
  airline: 'Airline partner',
  hotel_chain: 'Hotel chain',
  cruise_line: 'Cruise line',
  ground_handler: 'Ground handler',
  car_rental: 'Car rental partner',
  influencer: 'Travel influencer',
  affiliate: 'Affiliate / blogger',
  trade_show: 'Trade show',
  travel_fair: 'Travel fair / exhibition',
  roadshow: 'Roadshow',
  expo: 'Exhibition / expo',
  fam_trip: 'FAM trip',
  mice_event: 'MICE / conference event',
  tourism_board_event: 'Tourism board event',
  webinar: 'Webinar',
  inbound_call: 'Inbound call',
  outbound_call: 'Outbound call',
  hotline: 'Travel hotline',
  inbound_email: 'Inbound email',
  newsletter: 'Newsletter',
  email_campaign: 'Email campaign',
  quote_request: 'Quote / itinerary request',
  group_booking_inquiry: 'Group booking inquiry',
  booking_com: 'Booking.com',
  expedia: 'Expedia',
  tripadvisor: 'TripAdvisor',
  agoda: 'Agoda',
  hotels_com: 'Hotels.com',
  airbnb: 'Airbnb',
  skyscanner: 'Skyscanner',
  wego: 'Wego',
  almosafer: 'Almosafer',
  trivago: 'Trivago',
  repeat_booking: 'Repeat booking',
  return_trip: 'Return trip to destination',
  upsell: 'Upsell / cross-sell',
  group_extension: 'Group booking extension',
  loyalty_rebooking: 'Loyalty / member rebooking',
  honeymoon_package: 'Honeymoon package',
  umrah_hajj: 'Umrah / Hajj program',
  other: 'Other',
}

export const CLIENT_ACQUISITION_CHANNELS_BY_SOURCE: Record<
  ClientAcquisitionSource,
  readonly ClientAcquisitionChannel[]
> = {
  social_media: [
    'facebook',
    'instagram',
    'tiktok',
    'twitter',
    'youtube',
    'snapchat',
    'whatsapp',
    'telegram',
    'travel_blog',
    'travel_group',
    'influencer',
    'other',
  ],
  website: [
    'organic_search',
    'google_ads',
    'meta_ads',
    'direct_visit',
    'package_landing_page',
    'blog_article',
    'flight_hotel_deals',
    'other',
  ],
  referral: [
    'client_referral',
    'employee_referral',
    'partner_referral',
    'family_friend',
    'tour_guide',
    'hotel_concierge',
    'past_traveler',
    'travel_agent',
    'other',
  ],
  walk_in: [
    'main_office',
    'branch_office',
    'airport_desk',
    'hotel_partner',
    'resort_desk',
    'cruise_terminal',
    'tourist_info_center',
    'mall_kiosk',
    'historic_site',
    'other',
  ],
  partner: [
    'travel_agent',
    'sub_agent',
    'dmc',
    'tour_operator',
    'corporate_partner',
    'airline',
    'hotel_chain',
    'cruise_line',
    'ground_handler',
    'car_rental',
    'influencer',
    'affiliate',
    'other',
  ],
  event: [
    'trade_show',
    'travel_fair',
    'roadshow',
    'expo',
    'fam_trip',
    'mice_event',
    'tourism_board_event',
    'webinar',
    'other',
  ],
  phone_inquiry: ['inbound_call', 'outbound_call', 'hotline', 'whatsapp', 'other'],
  email_inquiry: [
    'inbound_email',
    'newsletter',
    'email_campaign',
    'quote_request',
    'group_booking_inquiry',
    'other',
  ],
  ota: [
    'booking_com',
    'expedia',
    'tripadvisor',
    'agoda',
    'hotels_com',
    'airbnb',
    'skyscanner',
    'wego',
    'almosafer',
    'trivago',
    'other',
  ],
  existing_customer: [
    'repeat_booking',
    'return_trip',
    'upsell',
    'group_extension',
    'loyalty_rebooking',
    'honeymoon_package',
    'umrah_hajj',
    'other',
  ],
  other: ['other'],
}

export const CLIENT_ACQUISITION_CHANNELS: ClientAcquisitionChannel[] = [
  ...new Set(Object.values(CLIENT_ACQUISITION_CHANNELS_BY_SOURCE).flat()),
]

export function resolveClientAcquisitionChannels(
  source?: ClientAcquisitionSource,
): ClientAcquisitionChannel[] {
  if (!source) return []
  return [...CLIENT_ACQUISITION_CHANNELS_BY_SOURCE[source]]
}

export function isClientAcquisitionChannelValidForSource(
  source: ClientAcquisitionSource | undefined,
  channel: ClientAcquisitionChannel | undefined,
): boolean {
  if (!source || !channel) return false
  return CLIENT_ACQUISITION_CHANNELS_BY_SOURCE[source].includes(channel)
}

export function resolveClientAcquisitionPair(
  source?: ClientAcquisitionSource,
  channel?: ClientAcquisitionChannel,
): { acquisitionSource?: ClientAcquisitionSource; acquisitionChannel?: ClientAcquisitionChannel } {
  if (!source) {
    return { acquisitionSource: undefined, acquisitionChannel: undefined }
  }
  if (!channel || !isClientAcquisitionChannelValidForSource(source, channel)) {
    return { acquisitionSource: source, acquisitionChannel: undefined }
  }
  return { acquisitionSource: source, acquisitionChannel: channel }
}

export function formatClientAcquisition(
  source?: ClientAcquisitionSource,
  channel?: ClientAcquisitionChannel,
): string {
  if (!source) return ''
  const sourceLabel = CLIENT_ACQUISITION_SOURCE_LABELS[source]
  if (!channel || !isClientAcquisitionChannelValidForSource(source, channel)) {
    return sourceLabel
  }
  return `${sourceLabel} · ${CLIENT_ACQUISITION_CHANNEL_LABELS[channel]}`
}

export const CLIENT_MEMBERSHIPS: ClientMembership[] = ['non_member', 'member']

export const CLIENT_MEMBERSHIP_LABELS: Record<ClientMembership, string> = {
  non_member: 'Not enrolled',
  member: 'Member',
}

export const CLIENT_MEMBERSHIP_SHORT_LABELS: Record<ClientMembership, string> = {
  non_member: 'Standard',
  member: 'Member',
}

export const CLIENT_MEMBERSHIP_PROGRAM_NAME = 'Membership Program'

export const CLIENT_MEMBERSHIP_DESCRIPTIONS: Record<ClientMembership, string> = {
  non_member: 'Standard account — not enrolled in the membership program.',
  member: 'Enrolled in the membership program — eligible for member benefits.',
}

export const DEFAULT_CLIENT_MEMBERSHIP: ClientMembership = 'non_member'

export const CLIENT_PAYMENT_METHODS: ClientPaymentMethod[] = [
  'bank_transfer',
  'credit_card',
  'cash',
  'cheque',
  'wire',
  'mobile_wallet',
  'other',
]

export const CLIENT_PAYMENT_METHOD_LABELS: Record<ClientPaymentMethod, string> = {
  bank_transfer: 'Bank transfer',
  credit_card: 'Credit card',
  cash: 'Cash',
  cheque: 'Cheque',
  wire: 'Wire transfer',
  mobile_wallet: 'Mobile wallet',
  other: 'Other',
}

export function resolveClientPaymentMethods(
  client: Pick<Client, 'preferredPaymentMethods' | 'preferredPaymentMethod'>,
): ClientPaymentMethod[] {
  const fromList = (client.preferredPaymentMethods ?? []).filter((method) =>
    CLIENT_PAYMENT_METHODS.includes(method),
  )
  if (fromList.length > 0) return [...new Set(fromList)]
  if (client.preferredPaymentMethod && CLIENT_PAYMENT_METHODS.includes(client.preferredPaymentMethod)) {
    return [client.preferredPaymentMethod]
  }
  return []
}

export function normalizeClientPaymentMethods(
  methods?: ClientPaymentMethod[],
): ClientPaymentMethod[] | undefined {
  const normalized = [...new Set((methods ?? []).filter((method) => CLIENT_PAYMENT_METHODS.includes(method)))]
  return normalized.length > 0 ? normalized : undefined
}

const VALID_CURRENCY_CODES = new Set(listCurrencyCodes())

export function resolveClientPaymentCurrencies(
  client: Pick<Client, 'paymentCurrencies'>,
): string[] {
  const fromList = (client.paymentCurrencies ?? [])
    .map((code) => code.trim().toUpperCase())
    .filter((code) => VALID_CURRENCY_CODES.has(code))
  return fromList.length > 0 ? [...new Set(fromList)] : []
}

export function normalizeClientPaymentCurrencies(
  currencies?: string[],
): string[] | undefined {
  const normalized = [
    ...new Set(
      (currencies ?? [])
        .map((code) => code.trim().toUpperCase())
        .filter((code) => VALID_CURRENCY_CODES.has(code)),
    ),
  ]
  return normalized.length > 0 ? normalized : undefined
}

export const CLIENT_BILLING_ACCOUNTS: ClientBillingAccount[] = ['prepaid', 'credit']

export const CLIENT_BILLING_ACCOUNT_LABELS: Record<ClientBillingAccount, string> = {
  prepaid: 'Cash / Prepaid',
  credit: 'Credit account',
}

export const CLIENT_BILLING_ACCOUNT_DESCRIPTIONS: Record<ClientBillingAccount, string> = {
  prepaid: 'Payment before travel — no credit line extended',
  credit: 'Invoice on agreed terms with an approved limit',
}

export const CLIENT_GENDERS: ClientGender[] = ['male', 'female']

export const CLIENT_GENDER_LABELS: Record<ClientGender, string> = {
  male: 'Male',
  female: 'Female',
}

export function normalizeClientDateOfBirth(value?: string | null): string | undefined {
  const trimmed = value?.trim()
  if (!trimmed) return undefined
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return undefined
  const [year, month, day] = trimmed.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined
  }
  return trimmed
}

/** Resolved company join date — uses `joinedAt` when set, otherwise account creation. */
export function resolveClientJoinedAt(client: Pick<Client, 'joinedAt' | 'createdAt'>): string {
  const joinedAt = normalizeClientDateOfBirth(client.joinedAt)
  if (joinedAt) return joinedAt
  const created = client.createdAt?.trim()
  if (!created) return ''
  const datePart = created.slice(0, 10)
  return normalizeClientDateOfBirth(datePart) ?? datePart
}

export function calculateAgeFromDateOfBirth(
  dateOfBirth?: string | null,
  asOf: Date = new Date(),
): number | null {
  const iso = normalizeClientDateOfBirth(dateOfBirth)
  if (!iso) return null
  const [year, month, day] = iso.split('-').map(Number)
  let age = asOf.getFullYear() - year
  const monthDiff = asOf.getMonth() + 1 - month
  if (monthDiff < 0 || (monthDiff === 0 && asOf.getDate() < day)) {
    age -= 1
  }
  return age >= 0 ? age : null
}

export function formatClientAge(dateOfBirth?: string | null): string {
  const age = calculateAgeFromDateOfBirth(dateOfBirth)
  if (age == null) return ''
  return age === 1 ? '1 year' : `${age} years`
}

export function resolveClientBillingAccount(
  client: Pick<Client, 'billingAccount' | 'creditLimit'>,
): ClientBillingAccount {
  if (client.billingAccount) return client.billingAccount
  return client.creditLimit && client.creditLimit > 0 ? 'credit' : 'prepaid'
}

export function resolveClientMembership(membership?: ClientMembership): ClientMembership {
  return membership === 'member' ? 'member' : DEFAULT_CLIENT_MEMBERSHIP
}

export function isClientMember(membership?: ClientMembership): boolean {
  return resolveClientMembership(membership) === 'member'
}

export function clientPrimaryLabel(client: Pick<Client, 'displayName' | 'company' | 'type'>): string {
  if (client.type === 'corporate') {
    return client.company?.trim() || client.displayName.trim()
  }
  return client.displayName.trim()
}

export function formatClientNamePart(value?: string | null): string {
  return normalizeNameField(value)
}

/** Lists and documents show first-name field + last-name field (middle is stored but not shown). */
export function buildClientDisplayName(firstName?: string | null, lastName?: string | null): string {
  return [formatClientNamePart(firstName), formatClientNamePart(lastName)].filter(Boolean).join(' ')
}

/** Preview display name while typing — keeps partial words without trimming trailing spaces from the field value. */
export function previewClientDisplayName(firstName?: string | null, lastName?: string | null): string {
  const first = firstName?.trim()
  const last = lastName?.trim()
  if (!first && !last) return ''
  return [first ? formatClientNamePart(first) : '', last ? formatClientNamePart(last) : ''].filter(Boolean).join(' ')
}

export function finalizeClientNameFields(
  input: Pick<Client, 'firstName' | 'middleName' | 'lastName' | 'displayName'>,
): Pick<Client, 'firstName' | 'middleName' | 'lastName' | 'displayName'> {
  const firstName = formatClientNamePart(input.firstName)
  const middleName = formatClientNamePart(input.middleName)
  const lastName = formatClientNamePart(input.lastName)
  const displayNameFromParts = buildClientDisplayName(firstName, lastName)
  return {
    firstName: firstName || undefined,
    middleName: middleName || undefined,
    lastName: lastName || undefined,
    displayName:
      displayNameFromParts ||
      (input.displayName.trim() ? formatClientNamePart(input.displayName) : ''),
  }
}

export function inferClientNameParts(displayName: string): {
  firstName: string
  middleName: string
  lastName: string
} {
  const parts = displayName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstName: '', middleName: '', lastName: '' }
  if (parts.length === 1) return { firstName: parts[0], middleName: '', lastName: '' }
  if (parts.length === 2) return { firstName: parts[0], middleName: '', lastName: parts[1] }
  return {
    firstName: parts[0],
    middleName: parts.slice(1, -1).join(' '),
    lastName: parts[parts.length - 1],
  }
}

export function resolveClientNameParts(
  client: Pick<Client, 'firstName' | 'middleName' | 'lastName' | 'displayName'>,
): { firstName: string; middleName: string; lastName: string } {
  if (client.firstName?.trim() || client.lastName?.trim()) {
    return {
      firstName: client.firstName ?? '',
      middleName: client.middleName ?? '',
      lastName: client.lastName ?? '',
    }
  }
  return inferClientNameParts(client.displayName)
}

export function patchIndividualNameFields(
  current: Pick<Client, 'firstName' | 'middleName' | 'lastName' | 'displayName'>,
  patch: Partial<Pick<Client, 'firstName' | 'middleName' | 'lastName'>>,
): Pick<Client, 'firstName' | 'middleName' | 'lastName' | 'displayName'> {
  const firstName =
    patch.firstName !== undefined ? patch.firstName : (current.firstName ?? '')
  const middleName =
    patch.middleName !== undefined ? patch.middleName : (current.middleName ?? '')
  const lastName = patch.lastName !== undefined ? patch.lastName : (current.lastName ?? '')
  return {
    firstName,
    middleName,
    lastName,
    displayName: previewClientDisplayName(firstName, lastName),
  }
}

export function clientContactEmail(client: Pick<Client, 'email'>): string {
  return client.email?.trim() ?? ''
}

export function isClientIdentityComplete(
  client: Pick<Client, 'type' | 'company' | 'firstName' | 'lastName'>,
): boolean {
  if (client.type === 'corporate') return Boolean(client.company?.trim())
  return Boolean(client.firstName?.trim() && client.lastName?.trim())
}

export function normalizeClientFormInput(
  input: Omit<Client, 'id' | 'reference' | 'createdAt' | 'updatedAt'>,
): Omit<Client, 'id' | 'reference' | 'createdAt' | 'updatedAt'> {
  const company = input.company?.trim() ? toTitleCase(input.company.trim()) : ''
  const membership = resolveClientMembership(input.membership)
  const membershipNotes = input.membershipNotes?.trim() || undefined

  const firstName = input.firstName ?? ''
  const middleName = input.middleName ?? ''
  const lastName = input.lastName ?? ''
  const individualDisplayNameFromParts = previewClientDisplayName(firstName, lastName)
  const individualDisplayName =
    individualDisplayNameFromParts ||
    (input.displayName.trim() ? toTitleCase(input.displayName.trim()) : '')

  const membershipFields =
    membership === 'member'
      ? {
          membership,
          membershipNotes,
          membershipNumber: input.membershipNumber,
          membershipEnrolledAt: input.membershipEnrolledAt,
          membershipExpiresAt: input.membershipExpiresAt,
        }
      : {
          membership,
          membershipNotes,
          membershipNumber: undefined,
          membershipEnrolledAt: undefined,
          membershipExpiresAt: undefined,
        }

  const slaAgreement = normalizeSlaAgreement(input.slaAgreement)
  const sla = syncLegacyClientSla(slaAgreement) ?? input.sla

  if (input.type === 'individual') {
    const dateOfBirth = normalizeClientDateOfBirth(input.dateOfBirth)
    const joinedAt = normalizeClientDateOfBirth(input.joinedAt)
    const gender = input.gender && CLIENT_GENDERS.includes(input.gender) ? input.gender : undefined
    const accountManagerId = input.accountManagerId?.trim() || undefined
    return stripClientFieldsForType(
      {
        ...input,
        firstName,
        middleName,
        lastName,
        displayName: individualDisplayName,
        dateOfBirth,
        joinedAt,
        gender,
        accountManagerId,
        preferredPaymentMethods: normalizeClientPaymentMethods(input.preferredPaymentMethods),
        preferredPaymentMethod: undefined,
        paymentCurrencies: normalizeClientPaymentCurrencies(input.paymentCurrencies),
        slaAgreement,
        sla,
        ...membershipFields,
      },
      'individual',
    )
  }
  const accountManagerId = input.accountManagerId?.trim() || undefined
  const joinedAt = normalizeClientDateOfBirth(input.joinedAt)
  return stripClientFieldsForType(
    {
      ...input,
      displayName: company,
      company,
      joinedAt,
      accountManagerId,
      preferredPaymentMethods: normalizeClientPaymentMethods(input.preferredPaymentMethods),
      preferredPaymentMethod: undefined,
      paymentCurrencies: normalizeClientPaymentCurrencies(input.paymentCurrencies),
      slaAgreement,
      sla,
      commercialRegistration: normalizeClientCommercialRegistration(input.commercialRegistration),
      taxRegistration: normalizeClientTaxRegistration(input.taxRegistration),
      ...membershipFields,
    },
    'corporate',
  )
}

export type { ClientFinancialSummary } from '@/domain/client/client-financial'
export {
  assertClientCreditAvailable,
  ClientBillingBlockedError,
  ClientCreditExceededError,
  isClientBillingBlocked,
  resolveClientFinancialSummary,
  resolveClientReportingCurrency,
  tripClientBalanceForSummary,
  validateCreditAccountSetup,
} from '@/domain/client/client-financial'
