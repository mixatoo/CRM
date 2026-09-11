import type { Traveler } from '@/domain/entities/traveler'
import { emptyTravelerProfileDefaults, travelerLegalName } from '@/domain/entities/traveler'
import type { TravelerProfileInput } from '@/features/travelers/hooks/use-traveler-mutations'
import type { TravelerProfileSectionId } from '@/features/travelers/components/profile/traveler-profile-sections'

export function travelerToProfileInput(traveler: Traveler): TravelerProfileInput {
  const defaults = emptyTravelerProfileDefaults()
  return {
    accountId: traveler.accountId,
    photo: traveler.photo,
    preferredName: traveler.preferredName,
    status: traveler.status ?? defaults.status,
    passengerType: traveler.passengerType,
    vipLevel: traveler.vipLevel ?? defaults.vipLevel,
    primaryNationality: traveler.primaryNationality ?? traveler.nationality,
    accountOwnerId: traveler.accountOwnerId,
    title: traveler.title,
    firstName: traveler.firstName,
    middleName: traveler.middleName,
    lastName: traveler.lastName,
    gender: traveler.gender,
    dateOfBirth: traveler.dateOfBirth,
    placeOfBirth: traveler.placeOfBirth,
    countryOfBirth: traveler.countryOfBirth,
    nationality: traveler.nationality,
    secondNationality: traveler.secondNationality,
    maritalStatus: traveler.maritalStatus,
    occupation: traveler.occupation,
    companyName: traveler.companyName,
    jobTitle: traveler.jobTitle,
    spokenLanguages: traveler.spokenLanguages ?? [],
    preferredLanguage: traveler.preferredLanguage,
    email: traveler.email,
    alternativeEmail: traveler.alternativeEmail,
    phone: traveler.phone,
    secondaryPhone: traveler.secondaryPhone,
    whatsapp: traveler.whatsapp,
    address: traveler.address ?? {},
    emergencyContact: traveler.emergencyContact ?? {},
    passports: traveler.passports ?? [],
    visas: traveler.visas ?? [],
    otherDocuments: traveler.otherDocuments ?? [],
    travelPreferences: traveler.travelPreferences ?? {},
    assistance: traveler.assistance ?? {},
    medical: traveler.medical ?? {},
    privacy: traveler.privacy ?? {},
    classification: {
      ...defaults.classification,
      ...traveler.classification,
      categories: traveler.classification?.categories ?? [],
      internalTags: traveler.classification?.internalTags ?? [],
    },
    profileSettings: traveler.profileSettings ?? {},
    notes: traveler.notes,
  }
}

export function travelerProfileSnapshot(form: TravelerProfileInput): string {
  return JSON.stringify(form)
}

export function isTravelerProfilePersistable(form: TravelerProfileInput): boolean {
  return Boolean(form.accountId.trim() && form.firstName.trim() && form.lastName.trim())
}

export function isTravelerProfileSectionComplete(
  form: TravelerProfileInput,
  section: TravelerProfileSectionId,
): boolean {
  switch (section) {
    case 'summary':
      return Boolean(form.accountId && form.status && form.firstName && form.lastName)
    case 'personal':
      return Boolean(form.firstName && form.lastName && (form.nationality || form.primaryNationality))
    case 'contact':
      return Boolean(form.email || form.phone)
    case 'address':
      return Boolean(form.address?.country || form.address?.city)
    case 'emergency':
      return Boolean(form.emergencyContact?.name && form.emergencyContact?.mobile)
    case 'documents':
      return (form.passports?.length ?? 0) > 0
    case 'preferences':
      return Boolean(
        form.travelPreferences?.preferredAirline ||
          form.travelPreferences?.preferredCabinClass ||
          form.travelPreferences?.mealPreference,
      )
    case 'assistance':
      return Boolean(
        form.assistance?.wheelchairRequired ||
          form.assistance?.meetAndAssistPreference ||
          form.assistance?.specialAssistanceNotes,
      )
    case 'medical':
      return Boolean(
        form.medical?.allergies ||
          form.medical?.dietaryRestrictions ||
          form.medical?.medicalConditions,
      )
    case 'privacy':
      return form.privacy?.consentToStorePersonalData === true
    case 'classification':
      return (form.classification?.categories?.length ?? 0) > 0
    case 'settings':
      return form.status === 'active' || form.status === 'inactive' || form.status === 'archived'
    default:
      return false
  }
}

export function getTravelerProfileModifiedCount(
  saved: TravelerProfileInput,
  current: TravelerProfileInput,
): number {
  const savedJson = JSON.parse(travelerProfileSnapshot(saved)) as Record<string, unknown>
  const currentJson = JSON.parse(travelerProfileSnapshot(current)) as Record<string, unknown>
  let count = 0
  const keys = new Set([...Object.keys(savedJson), ...Object.keys(currentJson)])
  for (const key of keys) {
    if (JSON.stringify(savedJson[key]) !== JSON.stringify(currentJson[key])) count += 1
  }
  return count
}

export function derivedFullName(form: Pick<TravelerProfileInput, 'firstName' | 'middleName' | 'lastName'>): string {
  return travelerLegalName(form)
}
