/** CRM passenger / traveler personal profile linked to an account. */

export type TravelerStatus = 'active' | 'inactive' | 'archived'
export type TravelerType = 'adult' | 'child' | 'infant'
export type TravelerVipLevel = 'standard' | 'vip' | 'vvip'
export type TravelerGender = 'male' | 'female' | 'other' | 'unspecified'
export type TravelerMaritalStatus = 'single' | 'married' | 'divorced' | 'widowed' | 'other'
export type TravelerTitle = 'mr' | 'mrs' | 'ms' | 'miss' | 'dr' | 'prof' | 'other'
export type TravelerCabinClass = 'economy' | 'premium_economy' | 'business' | 'first'
export type TravelerSeatPreference = 'window' | 'aisle' | 'middle' | 'exit_row' | 'no_preference'
export type TravelerSmokingPreference = 'non_smoking' | 'smoking' | 'no_preference'
export type TravelerCommunicationChannel = 'email' | 'phone' | 'whatsapp' | 'sms'
export type TravelerRiskLevel = 'low' | 'medium' | 'high'
export type TravelerWatchlistStatus = 'clear' | 'watch' | 'restricted'
export type TravelerBlacklistStatus = 'clear' | 'blacklisted'
export type TravelerCategory =
  | 'vip'
  | 'vvip'
  | 'diplomat'
  | 'corporate_guest'
  | 'leisure_guest'
  | 'crew'
  | 'family_member'
  | 'celebrity'
  | 'standard'

export type PassportType = 'ordinary' | 'diplomatic' | 'service' | 'official' | 'other'
export type PassportStatus = 'valid' | 'expiring_soon' | 'expired' | 'renewal_pending'
export type VisaType = 'tourist' | 'business' | 'transit' | 'work' | 'residence' | 'diplomatic' | 'other'
export type VisaEntryType = 'single' | 'double' | 'multiple'
export type VisaStatus = 'valid' | 'expiring_soon' | 'expired' | 'pending' | 'cancelled'
export type TravelerOtherDocumentKind =
  | 'national_id'
  | 'residence_permit'
  | 'driving_license'
  | 'travel_insurance'
  | 'invitation_letter'
  | 'qr_code'
  | 'other'

export interface TravelerAttachment {
  id: string
  fileName: string
  mimeType: string
  sizeBytes: number
  /** Data URL for local IndexedDB persistence / preview. */
  dataUrl: string
  uploadedAt: string
}

export interface TravelerPassport {
  id: string
  passportNumber: string
  passportType?: PassportType
  countryOfIssue?: string
  nationalityOnPassport?: string
  placeOfIssue?: string
  issueDate?: string
  expiryDate?: string
  isPrimary?: boolean
  status?: PassportStatus
  copy?: TravelerAttachment
  notes?: string
}

export interface TravelerVisa {
  id: string
  visaCountry: string
  visaType?: VisaType
  visaNumber?: string
  entryType?: VisaEntryType
  issueDate?: string
  expiryDate?: string
  durationOfStay?: string
  sponsor?: string
  status?: VisaStatus
  copy?: TravelerAttachment
  notes?: string
}

export interface TravelerOtherDocument {
  id: string
  kind: TravelerOtherDocumentKind
  label?: string
  number?: string
  issueDate?: string
  expiryDate?: string
  country?: string
  attachment?: TravelerAttachment
  notes?: string
}

export interface TravelerEmergencyContact {
  name?: string
  relationship?: string
  mobile?: string
  whatsapp?: string
  email?: string
  notes?: string
}

export interface TravelerAddress {
  country?: string
  city?: string
  area?: string
  street?: string
  building?: string
  postalCode?: string
  mapsLink?: string
  notes?: string
}

export interface TravelerTravelPreferences {
  preferredAirline?: string
  frequentFlyerProgram?: string
  frequentFlyerNumber?: string
  preferredCabinClass?: TravelerCabinClass
  preferredSeat?: TravelerSeatPreference
  mealPreference?: string
  preferredHotelChain?: string
  preferredRoomType?: string
  smokingPreference?: TravelerSmokingPreference
  preferredVehicleType?: string
  preferredDriver?: string
  preferredCommunicationChannel?: TravelerCommunicationChannel
}

export interface TravelerAssistance {
  wheelchairRequired?: boolean
  mobilityAssistance?: boolean
  porterRequired?: boolean
  fastTrackPreference?: boolean
  loungePreference?: boolean
  meetAndAssistPreference?: boolean
  specialAssistanceNotes?: string
}

export interface TravelerMedical {
  allergies?: string
  medicalConditions?: string
  medicationNotes?: string
  bloodType?: string
  dietaryRestrictions?: string
  healthNotes?: string
  safetyNotes?: string
}

export interface TravelerPrivacy {
  consentToStorePersonalData?: boolean
  consentDate?: string
  marketingCommunicationConsent?: boolean
  dataRetentionNotes?: string
  sensitiveDataNotes?: string
}

export interface TravelerClassification {
  categories?: TravelerCategory[]
  specialHandlingRequired?: boolean
  riskLevel?: TravelerRiskLevel
  blacklistStatus?: TravelerBlacklistStatus
  watchlistStatus?: TravelerWatchlistStatus
  internalTags?: string[]
  internalNotes?: string
}

export interface TravelerProfileSettings {
  archived?: boolean
  duplicateCheckFlag?: boolean
  assignedTeamMemberId?: string
  lastProfileReviewDate?: string
  nextReviewDate?: string
}

export interface Traveler {
  id: string
  /** Human-facing traveler ID (e.g. `TRV-0001`). */
  reference: string
  /** FK to the account (`Client.id`). */
  accountId: string

  /** Profile summary */
  photo?: TravelerAttachment
  preferredName?: string
  status: TravelerStatus
  passengerType?: TravelerType
  vipLevel?: TravelerVipLevel
  primaryNationality?: string
  accountOwnerId?: string

  /** Personal */
  title?: TravelerTitle
  firstName: string
  middleName?: string
  lastName: string
  gender?: TravelerGender
  dateOfBirth?: string
  placeOfBirth?: string
  countryOfBirth?: string
  nationality?: string
  secondNationality?: string
  maritalStatus?: TravelerMaritalStatus
  occupation?: string
  companyName?: string
  jobTitle?: string
  spokenLanguages?: string[]
  preferredLanguage?: string

  /** Contact */
  email?: string
  alternativeEmail?: string
  phone?: string
  secondaryPhone?: string
  whatsapp?: string

  /** Address / emergency / docs / prefs */
  address?: TravelerAddress
  emergencyContact?: TravelerEmergencyContact
  passports?: TravelerPassport[]
  visas?: TravelerVisa[]
  otherDocuments?: TravelerOtherDocument[]
  travelPreferences?: TravelerTravelPreferences
  assistance?: TravelerAssistance
  medical?: TravelerMedical
  privacy?: TravelerPrivacy
  classification?: TravelerClassification
  profileSettings?: TravelerProfileSettings

  notes?: string
  createdAt: string
  updatedAt: string
}

export const TRAVELER_STATUSES: TravelerStatus[] = ['active', 'inactive', 'archived']
export const TRAVELER_STATUS_LABELS: Record<TravelerStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  archived: 'Archived',
}

export const TRAVELER_TYPES: TravelerType[] = ['adult', 'child', 'infant']
export const TRAVELER_TYPE_LABELS: Record<TravelerType, string> = {
  adult: 'Adult',
  child: 'Child',
  infant: 'Infant',
}

export const TRAVELER_VIP_LEVELS: TravelerVipLevel[] = ['standard', 'vip', 'vvip']
export const TRAVELER_VIP_LEVEL_LABELS: Record<TravelerVipLevel, string> = {
  standard: 'Standard',
  vip: 'VIP',
  vvip: 'VVIP',
}

export const TRAVELER_TITLES: TravelerTitle[] = ['mr', 'mrs', 'ms', 'miss', 'dr', 'prof', 'other']
export const TRAVELER_TITLE_LABELS: Record<TravelerTitle, string> = {
  mr: 'Mr',
  mrs: 'Mrs',
  ms: 'Ms',
  miss: 'Miss',
  dr: 'Dr',
  prof: 'Prof',
  other: 'Other',
}

export const TRAVELER_GENDERS: TravelerGender[] = ['male', 'female', 'other', 'unspecified']
export const TRAVELER_GENDER_LABELS: Record<TravelerGender, string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
  unspecified: 'Unspecified',
}

export const TRAVELER_MARITAL_STATUSES: TravelerMaritalStatus[] = [
  'single',
  'married',
  'divorced',
  'widowed',
  'other',
]
export const TRAVELER_MARITAL_STATUS_LABELS: Record<TravelerMaritalStatus, string> = {
  single: 'Single',
  married: 'Married',
  divorced: 'Divorced',
  widowed: 'Widowed',
  other: 'Other',
}

export const PASSPORT_TYPES: PassportType[] = ['ordinary', 'diplomatic', 'service', 'official', 'other']
export const PASSPORT_TYPE_LABELS: Record<PassportType, string> = {
  ordinary: 'Ordinary',
  diplomatic: 'Diplomatic',
  service: 'Service',
  official: 'Official',
  other: 'Other',
}

export const PASSPORT_STATUSES: PassportStatus[] = ['valid', 'expiring_soon', 'expired', 'renewal_pending']
export const PASSPORT_STATUS_LABELS: Record<PassportStatus, string> = {
  valid: 'Valid',
  expiring_soon: 'Expiring soon',
  expired: 'Expired',
  renewal_pending: 'Renewal pending',
}

export const VISA_TYPES: VisaType[] = [
  'tourist',
  'business',
  'transit',
  'work',
  'residence',
  'diplomatic',
  'other',
]
export const VISA_TYPE_LABELS: Record<VisaType, string> = {
  tourist: 'Tourist',
  business: 'Business',
  transit: 'Transit',
  work: 'Work',
  residence: 'Residence',
  diplomatic: 'Diplomatic',
  other: 'Other',
}

export const VISA_ENTRY_TYPES: VisaEntryType[] = ['single', 'double', 'multiple']
export const VISA_ENTRY_TYPE_LABELS: Record<VisaEntryType, string> = {
  single: 'Single entry',
  double: 'Double entry',
  multiple: 'Multiple entry',
}

export const VISA_STATUSES: VisaStatus[] = ['valid', 'expiring_soon', 'expired', 'pending', 'cancelled']
export const VISA_STATUS_LABELS: Record<VisaStatus, string> = {
  valid: 'Valid',
  expiring_soon: 'Expiring soon',
  expired: 'Expired',
  pending: 'Pending',
  cancelled: 'Cancelled',
}

export const TRAVELER_OTHER_DOCUMENT_KINDS: TravelerOtherDocumentKind[] = [
  'national_id',
  'residence_permit',
  'driving_license',
  'travel_insurance',
  'invitation_letter',
  'qr_code',
  'other',
]
export const TRAVELER_OTHER_DOCUMENT_KIND_LABELS: Record<TravelerOtherDocumentKind, string> = {
  national_id: 'National ID',
  residence_permit: 'Residence permit',
  driving_license: 'Driving license',
  travel_insurance: 'Travel insurance',
  invitation_letter: 'Invitation letter',
  qr_code: 'QR code',
  other: 'Other',
}

export const TRAVELER_CABIN_CLASSES: TravelerCabinClass[] = [
  'economy',
  'premium_economy',
  'business',
  'first',
]
export const TRAVELER_CABIN_CLASS_LABELS: Record<TravelerCabinClass, string> = {
  economy: 'Economy',
  premium_economy: 'Premium economy',
  business: 'Business',
  first: 'First',
}

export const TRAVELER_SEAT_PREFERENCES: TravelerSeatPreference[] = [
  'window',
  'aisle',
  'middle',
  'exit_row',
  'no_preference',
]
export const TRAVELER_SEAT_PREFERENCE_LABELS: Record<TravelerSeatPreference, string> = {
  window: 'Window',
  aisle: 'Aisle',
  middle: 'Middle',
  exit_row: 'Exit row',
  no_preference: 'No preference',
}

export const TRAVELER_SMOKING_PREFERENCES: TravelerSmokingPreference[] = [
  'non_smoking',
  'smoking',
  'no_preference',
]
export const TRAVELER_SMOKING_PREFERENCE_LABELS: Record<TravelerSmokingPreference, string> = {
  non_smoking: 'Non-smoking',
  smoking: 'Smoking',
  no_preference: 'No preference',
}

export const TRAVELER_COMMUNICATION_CHANNELS: TravelerCommunicationChannel[] = [
  'email',
  'phone',
  'whatsapp',
  'sms',
]
export const TRAVELER_COMMUNICATION_CHANNEL_LABELS: Record<TravelerCommunicationChannel, string> = {
  email: 'Email',
  phone: 'Phone',
  whatsapp: 'WhatsApp',
  sms: 'SMS',
}

export const TRAVELER_CATEGORIES: TravelerCategory[] = [
  'vip',
  'vvip',
  'diplomat',
  'corporate_guest',
  'leisure_guest',
  'crew',
  'family_member',
  'celebrity',
  'standard',
]
export const TRAVELER_CATEGORY_LABELS: Record<TravelerCategory, string> = {
  vip: 'VIP',
  vvip: 'VVIP',
  diplomat: 'Diplomat',
  corporate_guest: 'Corporate guest',
  leisure_guest: 'Leisure guest',
  crew: 'Crew',
  family_member: 'Family member',
  celebrity: 'Celebrity',
  standard: 'Standard',
}

export const TRAVELER_RISK_LEVELS: TravelerRiskLevel[] = ['low', 'medium', 'high']
export const TRAVELER_RISK_LEVEL_LABELS: Record<TravelerRiskLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export const TRAVELER_WATCHLIST_STATUSES: TravelerWatchlistStatus[] = ['clear', 'watch', 'restricted']
export const TRAVELER_WATCHLIST_STATUS_LABELS: Record<TravelerWatchlistStatus, string> = {
  clear: 'Clear',
  watch: 'Watch',
  restricted: 'Restricted',
}

export const TRAVELER_BLACKLIST_STATUSES: TravelerBlacklistStatus[] = ['clear', 'blacklisted']
export const TRAVELER_BLACKLIST_STATUS_LABELS: Record<TravelerBlacklistStatus, string> = {
  clear: 'Clear',
  blacklisted: 'Blacklisted',
}

export function travelerDisplayName(
  traveler: Pick<Traveler, 'firstName' | 'lastName' | 'middleName' | 'preferredName'>,
): string {
  if (traveler.preferredName?.trim()) return traveler.preferredName.trim()
  return [traveler.firstName, traveler.middleName, traveler.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ')
}

export function travelerLegalName(
  traveler: Pick<Traveler, 'firstName' | 'lastName' | 'middleName'>,
): string {
  return [traveler.firstName, traveler.middleName, traveler.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ')
}

export function travelerInitials(
  traveler: Pick<Traveler, 'firstName' | 'lastName' | 'preferredName'>,
): string {
  if (traveler.preferredName?.trim()) {
    const parts = traveler.preferredName.trim().split(/\s+/)
    const first = parts[0]?.charAt(0) ?? ''
    const last = parts.length > 1 ? parts[parts.length - 1]!.charAt(0) : ''
    return `${first}${last}`.toUpperCase() || '?'
  }
  const first = traveler.firstName.trim().charAt(0)
  const last = traveler.lastName.trim().charAt(0)
  return `${first}${last}`.toUpperCase() || '?'
}

export function travelerAge(dateOfBirth?: string, asOf = new Date()): number | undefined {
  if (!dateOfBirth) return undefined
  const dob = new Date(dateOfBirth)
  if (Number.isNaN(dob.getTime())) return undefined
  let age = asOf.getFullYear() - dob.getFullYear()
  const monthDiff = asOf.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && asOf.getDate() < dob.getDate())) age -= 1
  return age >= 0 ? age : undefined
}

const EXPIRY_SOON_DAYS = 90

export function documentValidityFromExpiry(
  expiryDate?: string,
  asOf = new Date(),
): 'valid' | 'expiring_soon' | 'expired' | 'unknown' {
  if (!expiryDate) return 'unknown'
  const expiry = new Date(expiryDate)
  if (Number.isNaN(expiry.getTime())) return 'unknown'
  const startOfToday = new Date(asOf.getFullYear(), asOf.getMonth(), asOf.getDate())
  const startOfExpiry = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate())
  const diffDays = Math.ceil((startOfExpiry.getTime() - startOfToday.getTime()) / 86_400_000)
  if (diffDays < 0) return 'expired'
  if (diffDays <= EXPIRY_SOON_DAYS) return 'expiring_soon'
  return 'valid'
}

export function resolvePassportStatus(passport: Pick<TravelerPassport, 'expiryDate' | 'status'>): PassportStatus {
  const fromExpiry = documentValidityFromExpiry(passport.expiryDate)
  if (fromExpiry === 'expired') return 'expired'
  if (fromExpiry === 'expiring_soon') return 'expiring_soon'
  if (passport.status === 'renewal_pending') return 'renewal_pending'
  if (fromExpiry === 'valid') return 'valid'
  return passport.status ?? 'valid'
}

export function resolveVisaStatus(visa: Pick<TravelerVisa, 'expiryDate' | 'status'>): VisaStatus {
  const fromExpiry = documentValidityFromExpiry(visa.expiryDate)
  if (fromExpiry === 'expired') return 'expired'
  if (fromExpiry === 'expiring_soon') return 'expiring_soon'
  if (visa.status === 'pending' || visa.status === 'cancelled') return visa.status
  if (fromExpiry === 'valid') return 'valid'
  return visa.status ?? 'valid'
}

export function emptyTravelerProfileDefaults(): Pick<
  Traveler,
  'status' | 'vipLevel' | 'passports' | 'visas' | 'otherDocuments' | 'address' | 'emergencyContact' | 'travelPreferences' | 'assistance' | 'medical' | 'privacy' | 'classification' | 'profileSettings'
> {
  return {
    status: 'active',
    vipLevel: 'standard',
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
      categories: [],
      riskLevel: 'low',
      blacklistStatus: 'clear',
      watchlistStatus: 'clear',
      internalTags: [],
    },
    profileSettings: {},
  }
}
