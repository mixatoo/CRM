import {
  TRAVELER_CATEGORY_LABELS,
  TRAVELER_GENDER_LABELS,
  TRAVELER_RISK_LEVEL_LABELS,
  TRAVELER_TYPE_LABELS,
  TRAVELER_STATUS_LABELS,
  TRAVELER_VIP_LEVEL_LABELS,
  PASSPORT_STATUS_LABELS,
  VISA_STATUS_LABELS,
  resolvePassportStatus,
  resolveVisaStatus,
  travelerAge,
  travelerDisplayName,
  type Traveler,
  type TravelerCategory,
} from '@/domain/entities/traveler'

export function travelerPrimaryPassport(traveler: Traveler) {
  return traveler.passports?.find((passport) => passport.isPrimary) ?? traveler.passports?.[0]
}

export function travelerPrimaryVisa(traveler: Traveler) {
  return traveler.visas?.[0]
}

export function travelerCategoryLabels(traveler: Traveler): string {
  const categories = traveler.classification?.categories ?? []
  if (!categories.length) return ''
  return categories.map((category) => TRAVELER_CATEGORY_LABELS[category]).join(', ')
}

export function travelerPrimaryCategory(traveler: Traveler): TravelerCategory | undefined {
  return traveler.classification?.categories?.[0]
}

export function travelerPassengerTypeLabel(traveler: Traveler): string {
  const type = traveler.passengerType ?? 'adult'
  return TRAVELER_TYPE_LABELS[type]
}

export function travelerGenderLabel(traveler: Traveler): string {
  if (!traveler.gender) return ''
  return TRAVELER_GENDER_LABELS[traveler.gender]
}

export function travelerPassportStatusLabel(traveler: Traveler): string {
  const passport = travelerPrimaryPassport(traveler)
  if (!passport) return ''
  return PASSPORT_STATUS_LABELS[resolvePassportStatus(passport)]
}

export function travelerVisaStatusLabel(traveler: Traveler): string {
  const visa = travelerPrimaryVisa(traveler)
  if (!visa) return ''
  return VISA_STATUS_LABELS[resolveVisaStatus(visa)]
}

export function travelerRiskLevelLabel(traveler: Traveler): string {
  const level = traveler.classification?.riskLevel ?? 'low'
  return TRAVELER_RISK_LEVEL_LABELS[level]
}

export function travelerAgeOrEmpty(traveler: Traveler): number | undefined {
  return travelerAge(traveler.dateOfBirth)
}

function dateValue(value?: string): number {
  if (!value) return 0
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? 0 : time
}

export type TravelerTableSortField =
  | 'reference'
  | 'name'
  | 'role'
  | 'status'
  | 'passengerType'
  | 'nationality'
  | 'vipLevel'
  | 'gender'
  | 'dateOfBirth'
  | 'passportStatus'
  | 'passportExpiry'
  | 'visaStatus'
  | 'email'
  | 'phone'
  | 'whatsapp'
  | 'country'
  | 'city'
  | 'occupation'
  | 'company'
  | 'preferredLanguage'
  | 'category'
  | 'riskLevel'
  | 'createdAt'
  | 'updatedAt'

export function compareTravelersByField(left: Traveler, right: Traveler, field: TravelerTableSortField): number {
  switch (field) {
    case 'reference':
      return left.reference.localeCompare(right.reference)
    case 'name':
      return travelerDisplayName(left).localeCompare(travelerDisplayName(right))
    case 'role':
      return (left.jobTitle ?? '').localeCompare(right.jobTitle ?? '')
    case 'status':
      return TRAVELER_STATUS_LABELS[left.status ?? 'active'].localeCompare(
        TRAVELER_STATUS_LABELS[right.status ?? 'active'],
      )
    case 'passengerType':
      return TRAVELER_TYPE_LABELS[left.passengerType ?? 'adult'].localeCompare(
        TRAVELER_TYPE_LABELS[right.passengerType ?? 'adult'],
      )
    case 'nationality':
      return (left.primaryNationality ?? left.nationality ?? '').localeCompare(
        right.primaryNationality ?? right.nationality ?? '',
      )
    case 'vipLevel':
      return TRAVELER_VIP_LEVEL_LABELS[left.vipLevel ?? 'standard'].localeCompare(
        TRAVELER_VIP_LEVEL_LABELS[right.vipLevel ?? 'standard'],
      )
    case 'gender':
      return travelerGenderLabel(left).localeCompare(travelerGenderLabel(right))
    case 'dateOfBirth':
      return dateValue(left.dateOfBirth) - dateValue(right.dateOfBirth)
    case 'passportStatus':
      return travelerPassportStatusLabel(left).localeCompare(travelerPassportStatusLabel(right))
    case 'passportExpiry':
      return dateValue(travelerPrimaryPassport(left)?.expiryDate) - dateValue(travelerPrimaryPassport(right)?.expiryDate)
    case 'visaStatus':
      return travelerVisaStatusLabel(left).localeCompare(travelerVisaStatusLabel(right))
    case 'email':
      return (left.email ?? '').localeCompare(right.email ?? '')
    case 'phone':
      return (left.phone ?? '').localeCompare(right.phone ?? '')
    case 'whatsapp':
      return (left.whatsapp ?? '').localeCompare(right.whatsapp ?? '')
    case 'country':
      return (left.address?.country ?? '').localeCompare(right.address?.country ?? '')
    case 'city':
      return (left.address?.city ?? '').localeCompare(right.address?.city ?? '')
    case 'occupation':
      return (left.occupation ?? '').localeCompare(right.occupation ?? '')
    case 'company':
      return (left.companyName ?? '').localeCompare(right.companyName ?? '')
    case 'preferredLanguage':
      return (left.preferredLanguage ?? '').localeCompare(right.preferredLanguage ?? '')
    case 'category': {
      const leftCategory = travelerPrimaryCategory(left)
      const rightCategory = travelerPrimaryCategory(right)
      return (leftCategory ? TRAVELER_CATEGORY_LABELS[leftCategory] : '').localeCompare(
        rightCategory ? TRAVELER_CATEGORY_LABELS[rightCategory] : '',
      )
    }
    case 'riskLevel':
      return travelerRiskLevelLabel(left).localeCompare(travelerRiskLevelLabel(right))
    case 'createdAt':
      return dateValue(left.createdAt) - dateValue(right.createdAt)
    case 'updatedAt':
      return dateValue(left.updatedAt) - dateValue(right.updatedAt)
  }
}

export function travelerSearchHaystackValues(traveler: Traveler, accountName?: string): string[] {
  return [
    traveler.reference,
    travelerDisplayName(traveler),
    traveler.jobTitle,
    travelerPassengerTypeLabel(traveler),
    traveler.primaryNationality,
    traveler.nationality,
    travelerGenderLabel(traveler),
    travelerPassportStatusLabel(traveler),
    travelerVisaStatusLabel(traveler),
    traveler.email,
    traveler.alternativeEmail,
    traveler.phone,
    traveler.secondaryPhone,
    traveler.whatsapp,
    traveler.address?.country,
    traveler.address?.city,
    traveler.occupation,
    traveler.companyName,
    traveler.preferredLanguage,
    travelerCategoryLabels(traveler),
    travelerRiskLevelLabel(traveler),
    traveler.notes,
    accountName,
  ]
}
