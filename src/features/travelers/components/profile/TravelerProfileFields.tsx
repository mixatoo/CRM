import { useMemo } from 'react'
import {
  TRAVELER_BLACKLIST_STATUSES,
  TRAVELER_BLACKLIST_STATUS_LABELS,
  TRAVELER_CABIN_CLASS_LABELS,
  TRAVELER_CABIN_CLASSES,
  TRAVELER_CATEGORIES,
  TRAVELER_CATEGORY_LABELS,
  TRAVELER_COMMUNICATION_CHANNEL_LABELS,
  TRAVELER_COMMUNICATION_CHANNELS,
  TRAVELER_GENDER_LABELS,
  TRAVELER_GENDERS,
  TRAVELER_MARITAL_STATUS_LABELS,
  TRAVELER_MARITAL_STATUSES,
  TRAVELER_RISK_LEVEL_LABELS,
  TRAVELER_RISK_LEVELS,
  TRAVELER_SEAT_PREFERENCE_LABELS,
  TRAVELER_SEAT_PREFERENCES,
  TRAVELER_SMOKING_PREFERENCE_LABELS,
  TRAVELER_SMOKING_PREFERENCES,
  TRAVELER_STATUS_LABELS,
  TRAVELER_STATUSES,
  TRAVELER_TITLE_LABELS,
  TRAVELER_TITLES,
  TRAVELER_TYPE_LABELS,
  TRAVELER_TYPES,
  TRAVELER_VIP_LEVEL_LABELS,
  TRAVELER_VIP_LEVELS,
  TRAVELER_WATCHLIST_STATUS_LABELS,
  TRAVELER_WATCHLIST_STATUSES,
  travelerAge,
} from '@/domain/entities/traveler'
import { getCityPicklistOptions, getCountryPicklistOptions } from '@/domain/catalog/location-utils'
import { formatDate } from '@/shared/utils/date-format'
import { CRM_LABELS } from '@/features/clients/config/crm-labels'
import type { TravelerProfileInput } from '@/features/travelers/hooks/use-traveler-mutations'
import type { TravelerProfileSectionId } from '@/features/travelers/components/profile/traveler-profile-sections'
import { derivedFullName } from '@/features/travelers/components/profile/traveler-profile-form'
import { TravelerDocumentsSection } from '@/features/travelers/components/profile/TravelerDocumentsSection'
import { TravelerFileUploadField } from '@/features/travelers/components/profile/TravelerFileUploadField'
import {
  TravelerDateField,
  TravelerMultiPicklistField,
  TravelerNotesField,
  TravelerPicklistField,
  TravelerProfileFieldsShell,
  TravelerTextField,
  TravelerToggleField,
  enumOptions,
} from '@/features/travelers/components/profile/TravelerProfileFieldControls'
import { ProfileCrmFieldRow } from '@/features/clients/components/profile/ProfileCrmFieldRow'
import {
  TravelerNationalityBadge,
  TravelerStatusBadge,
  TravelerVipBadge,
} from '@/features/travelers/components/profile/TravelerProfileBadges'
import type { FormPicklistOption } from '@/design-system/components/FormPicklist'

interface TravelerProfileFieldsProps {
  section: TravelerProfileSectionId
  form: TravelerProfileInput
  reference: string
  createdAt: string
  updatedAt: string
  accountOptions: FormPicklistOption[]
  accountOwnerOptions: FormPicklistOption[]
  accountOwnerName?: string
  onChange: (patch: Partial<TravelerProfileInput>) => void
}

export function TravelerProfileFields({
  section,
  form,
  reference,
  createdAt,
  updatedAt,
  accountOptions,
  accountOwnerOptions,
  accountOwnerName,
  onChange,
}: TravelerProfileFieldsProps) {
  const countryOptions = useMemo(() => getCountryPicklistOptions(), [])
  const cityOptions = useMemo(
    () => getCityPicklistOptions(form.address?.country ?? '', form.address?.city),
    [form.address?.country, form.address?.city],
  )
  const age = travelerAge(form.dateOfBirth)

  const patchAddress = (patch: NonNullable<TravelerProfileInput['address']>) => {
    onChange({ address: { ...form.address, ...patch } })
  }
  const patchEmergency = (patch: NonNullable<TravelerProfileInput['emergencyContact']>) => {
    onChange({ emergencyContact: { ...form.emergencyContact, ...patch } })
  }
  const patchPrefs = (patch: NonNullable<TravelerProfileInput['travelPreferences']>) => {
    onChange({ travelPreferences: { ...form.travelPreferences, ...patch } })
  }
  const patchAssistance = (patch: NonNullable<TravelerProfileInput['assistance']>) => {
    onChange({ assistance: { ...form.assistance, ...patch } })
  }
  const patchMedical = (patch: NonNullable<TravelerProfileInput['medical']>) => {
    onChange({ medical: { ...form.medical, ...patch } })
  }
  const patchPrivacy = (patch: NonNullable<TravelerProfileInput['privacy']>) => {
    onChange({ privacy: { ...form.privacy, ...patch } })
  }
  const patchClassification = (patch: NonNullable<TravelerProfileInput['classification']>) => {
    onChange({ classification: { ...form.classification, ...patch } })
  }
  const patchSettings = (patch: NonNullable<TravelerProfileInput['profileSettings']>) => {
    onChange({ profileSettings: { ...form.profileSettings, ...patch } })
  }

  return (
    <TravelerProfileFieldsShell>
      {section === 'summary' ? (
        <>
          <TravelerTextField label="Passenger reference" value={reference} readOnly />
          <div className="border-b border-[var(--color-border)]/40 px-3 py-3 sm:px-5">
            <TravelerFileUploadField
              label="Profile photo"
              value={form.photo}
              accept="image/*"
              onChange={(photo) => onChange({ photo })}
            />
          </div>
          <TravelerTextField label="Full name" value={derivedFullName(form)} readOnly />
          <TravelerTextField
            label="Preferred name"
            value={form.preferredName}
            onChange={(preferredName) => onChange({ preferredName })}
          />
          <TravelerPicklistField
            label="Passenger status"
            value={form.status}
            options={enumOptions(TRAVELER_STATUSES, TRAVELER_STATUS_LABELS)}
            required
            onChange={(value) => onChange({ status: (value as TravelerProfileInput['status']) ?? 'active' })}
          />
          <TravelerPicklistField
            label="Passenger type"
            value={form.passengerType}
            options={enumOptions(TRAVELER_TYPES, TRAVELER_TYPE_LABELS)}
            onChange={(value) =>
              onChange({ passengerType: value as TravelerProfileInput['passengerType'] })
            }
          />
          <TravelerPicklistField
            label="VIP level"
            value={form.vipLevel}
            options={enumOptions(TRAVELER_VIP_LEVELS, TRAVELER_VIP_LEVEL_LABELS)}
            onChange={(value) => onChange({ vipLevel: value as TravelerProfileInput['vipLevel'] })}
          />
          <TravelerPicklistField
            label="Primary nationality"
            value={form.primaryNationality}
            options={countryOptions}
            onChange={(value) => onChange({ primaryNationality: value, nationality: value ?? form.nationality })}
          />
          <TravelerPicklistField
            label={`Linked ${CRM_LABELS.account.toLowerCase()}`}
            value={form.accountId}
            options={accountOptions}
            required
            onChange={(value) => onChange({ accountId: value ?? form.accountId })}
          />
          <TravelerPicklistField
            label="Account owner"
            value={form.accountOwnerId}
            options={accountOwnerOptions}
            onChange={(value) => onChange({ accountOwnerId: value })}
          />
          <TravelerTextField label="Created date" value={formatDate(createdAt)} readOnly />
          <TravelerTextField label="Last updated" value={formatDate(updatedAt)} readOnly />
          <ProfileCrmFieldRow label="Badges">
            <div className="flex flex-wrap items-center gap-1.5">
              <TravelerStatusBadge status={form.status} />
              {form.vipLevel ? <TravelerVipBadge level={form.vipLevel} /> : null}
              {form.primaryNationality ? (
                <TravelerNationalityBadge nationality={form.primaryNationality} />
              ) : null}
              {accountOwnerName ? (
                <span className="text-[11px] text-[var(--color-muted)]">Owner: {accountOwnerName}</span>
              ) : null}
            </div>
          </ProfileCrmFieldRow>
        </>
      ) : null}

      {section === 'personal' ? (
        <>
          <TravelerPicklistField
            label="Title"
            value={form.title}
            options={enumOptions(TRAVELER_TITLES, TRAVELER_TITLE_LABELS)}
            onChange={(value) => onChange({ title: value as TravelerProfileInput['title'] })}
          />
          <TravelerTextField
            label="First name"
            value={form.firstName}
            required
            onChange={(firstName) => onChange({ firstName })}
          />
          <TravelerTextField
            label="Middle name"
            value={form.middleName}
            onChange={(middleName) => onChange({ middleName })}
          />
          <TravelerTextField
            label="Last name"
            value={form.lastName}
            required
            onChange={(lastName) => onChange({ lastName })}
          />
          <TravelerTextField label="Full name" value={derivedFullName(form)} readOnly />
          <TravelerTextField
            label="Preferred name / nickname"
            value={form.preferredName}
            onChange={(preferredName) => onChange({ preferredName })}
          />
          <TravelerPicklistField
            label="Gender"
            value={form.gender}
            options={enumOptions(TRAVELER_GENDERS, TRAVELER_GENDER_LABELS)}
            onChange={(value) => onChange({ gender: value as TravelerProfileInput['gender'] })}
          />
          <TravelerDateField
            label="Date of birth"
            value={form.dateOfBirth}
            onChange={(dateOfBirth) => onChange({ dateOfBirth })}
          />
          <TravelerTextField label="Age" value={age !== undefined ? String(age) : '—'} readOnly />
          <TravelerTextField
            label="Place of birth"
            value={form.placeOfBirth}
            onChange={(placeOfBirth) => onChange({ placeOfBirth })}
          />
          <TravelerPicklistField
            label="Country of birth"
            value={form.countryOfBirth}
            options={countryOptions}
            onChange={(countryOfBirth) => onChange({ countryOfBirth })}
          />
          <TravelerPicklistField
            label="Nationality"
            value={form.nationality}
            options={countryOptions}
            onChange={(nationality) =>
              onChange({
                nationality,
                primaryNationality: form.primaryNationality ?? nationality,
              })
            }
          />
          <TravelerPicklistField
            label="Second nationality"
            value={form.secondNationality}
            options={countryOptions}
            onChange={(secondNationality) => onChange({ secondNationality })}
          />
          <TravelerPicklistField
            label="Marital status"
            value={form.maritalStatus}
            options={enumOptions(TRAVELER_MARITAL_STATUSES, TRAVELER_MARITAL_STATUS_LABELS)}
            onChange={(value) =>
              onChange({ maritalStatus: value as TravelerProfileInput['maritalStatus'] })
            }
          />
          <TravelerTextField
            label="Occupation"
            value={form.occupation}
            onChange={(occupation) => onChange({ occupation })}
          />
          <TravelerTextField
            label="Company name"
            value={form.companyName}
            onChange={(companyName) => onChange({ companyName })}
          />
          <TravelerTextField
            label="Job title"
            value={form.jobTitle}
            onChange={(jobTitle) => onChange({ jobTitle })}
          />
          <TravelerTextField
            label="Spoken languages"
            value={(form.spokenLanguages ?? []).join(', ')}
            placeholder="English, Arabic, French…"
            onChange={(value) =>
              onChange({
                spokenLanguages: value
                  .split(',')
                  .map((part) => part.trim())
                  .filter(Boolean),
              })
            }
          />
          <TravelerTextField
            label="Preferred language"
            value={form.preferredLanguage}
            onChange={(preferredLanguage) => onChange({ preferredLanguage })}
          />
        </>
      ) : null}

      {section === 'contact' ? (
        <>
          <TravelerTextField
            label="Primary mobile number"
            value={form.phone}
            onChange={(phone) => onChange({ phone })}
          />
          <TravelerTextField
            label="Secondary mobile number"
            value={form.secondaryPhone}
            onChange={(secondaryPhone) => onChange({ secondaryPhone })}
          />
          <TravelerTextField
            label="WhatsApp number"
            value={form.whatsapp}
            onChange={(whatsapp) => onChange({ whatsapp })}
          />
          <TravelerTextField
            label="Email address"
            value={form.email}
            type="email"
            onChange={(email) => onChange({ email })}
          />
          <TravelerTextField
            label="Alternative email address"
            value={form.alternativeEmail}
            type="email"
            onChange={(alternativeEmail) => onChange({ alternativeEmail })}
          />
        </>
      ) : null}

      {section === 'address' ? (
        <>
          <TravelerPicklistField
            label="Country"
            value={form.address?.country}
            options={countryOptions}
            onChange={(country) => patchAddress({ country, city: undefined })}
          />
          <TravelerPicklistField
            label="City"
            value={form.address?.city}
            options={cityOptions}
            onChange={(city) => patchAddress({ city })}
          />
          <TravelerTextField
            label="Area / district"
            value={form.address?.area}
            onChange={(area) => patchAddress({ area })}
          />
          <TravelerTextField
            label="Street address"
            value={form.address?.street}
            onChange={(street) => patchAddress({ street })}
          />
          <TravelerTextField
            label="Building / villa / apartment"
            value={form.address?.building}
            onChange={(building) => patchAddress({ building })}
          />
          <TravelerTextField
            label="Postal code"
            value={form.address?.postalCode}
            onChange={(postalCode) => patchAddress({ postalCode })}
          />
          <TravelerTextField
            label="Google Maps link"
            value={form.address?.mapsLink}
            onChange={(mapsLink) => patchAddress({ mapsLink })}
          />
          <TravelerNotesField
            label="Address notes"
            value={form.address?.notes}
            onChange={(notes) => patchAddress({ notes })}
          />
        </>
      ) : null}

      {section === 'emergency' ? (
        <>
          <TravelerTextField
            label="Emergency contact name"
            value={form.emergencyContact?.name}
            onChange={(name) => patchEmergency({ name })}
          />
          <TravelerTextField
            label="Relationship"
            value={form.emergencyContact?.relationship}
            onChange={(relationship) => patchEmergency({ relationship })}
          />
          <TravelerTextField
            label="Mobile number"
            value={form.emergencyContact?.mobile}
            onChange={(mobile) => patchEmergency({ mobile })}
          />
          <TravelerTextField
            label="WhatsApp number"
            value={form.emergencyContact?.whatsapp}
            onChange={(whatsapp) => patchEmergency({ whatsapp })}
          />
          <TravelerTextField
            label="Email address"
            value={form.emergencyContact?.email}
            type="email"
            onChange={(email) => patchEmergency({ email })}
          />
          <TravelerNotesField
            label="Notes"
            value={form.emergencyContact?.notes}
            onChange={(notes) => patchEmergency({ notes })}
          />
        </>
      ) : null}

      {section === 'documents' ? (
        <TravelerDocumentsSection
          passports={form.passports ?? []}
          visas={form.visas ?? []}
          otherDocuments={form.otherDocuments ?? []}
          onChangePassports={(passports) => onChange({ passports })}
          onChangeVisas={(visas) => onChange({ visas })}
          onChangeOtherDocuments={(otherDocuments) => onChange({ otherDocuments })}
        />
      ) : null}

      {section === 'preferences' ? (
        <>
          <TravelerTextField
            label="Preferred airline"
            value={form.travelPreferences?.preferredAirline}
            onChange={(preferredAirline) => patchPrefs({ preferredAirline })}
          />
          <TravelerTextField
            label="Frequent flyer program"
            value={form.travelPreferences?.frequentFlyerProgram}
            onChange={(frequentFlyerProgram) => patchPrefs({ frequentFlyerProgram })}
          />
          <TravelerTextField
            label="Frequent flyer number"
            value={form.travelPreferences?.frequentFlyerNumber}
            onChange={(frequentFlyerNumber) => patchPrefs({ frequentFlyerNumber })}
          />
          <TravelerPicklistField
            label="Preferred cabin class"
            value={form.travelPreferences?.preferredCabinClass}
            options={enumOptions(TRAVELER_CABIN_CLASSES, TRAVELER_CABIN_CLASS_LABELS)}
            onChange={(value) =>
              patchPrefs({
                preferredCabinClass: value as NonNullable<
                  TravelerProfileInput['travelPreferences']
                >['preferredCabinClass'],
              })
            }
          />
          <TravelerPicklistField
            label="Preferred seat"
            value={form.travelPreferences?.preferredSeat}
            options={enumOptions(TRAVELER_SEAT_PREFERENCES, TRAVELER_SEAT_PREFERENCE_LABELS)}
            onChange={(value) =>
              patchPrefs({
                preferredSeat: value as NonNullable<
                  TravelerProfileInput['travelPreferences']
                >['preferredSeat'],
              })
            }
          />
          <TravelerTextField
            label="Meal preference"
            value={form.travelPreferences?.mealPreference}
            onChange={(mealPreference) => patchPrefs({ mealPreference })}
          />
          <TravelerTextField
            label="Preferred hotel chain"
            value={form.travelPreferences?.preferredHotelChain}
            onChange={(preferredHotelChain) => patchPrefs({ preferredHotelChain })}
          />
          <TravelerTextField
            label="Preferred room type"
            value={form.travelPreferences?.preferredRoomType}
            onChange={(preferredRoomType) => patchPrefs({ preferredRoomType })}
          />
          <TravelerPicklistField
            label="Smoking preference"
            value={form.travelPreferences?.smokingPreference}
            options={enumOptions(TRAVELER_SMOKING_PREFERENCES, TRAVELER_SMOKING_PREFERENCE_LABELS)}
            onChange={(value) =>
              patchPrefs({
                smokingPreference: value as NonNullable<
                  TravelerProfileInput['travelPreferences']
                >['smokingPreference'],
              })
            }
          />
          <TravelerTextField
            label="Preferred vehicle type"
            value={form.travelPreferences?.preferredVehicleType}
            onChange={(preferredVehicleType) => patchPrefs({ preferredVehicleType })}
          />
          <TravelerTextField
            label="Preferred driver"
            value={form.travelPreferences?.preferredDriver}
            onChange={(preferredDriver) => patchPrefs({ preferredDriver })}
          />
          <TravelerPicklistField
            label="Preferred communication channel"
            value={form.travelPreferences?.preferredCommunicationChannel}
            options={enumOptions(TRAVELER_COMMUNICATION_CHANNELS, TRAVELER_COMMUNICATION_CHANNEL_LABELS)}
            onChange={(value) =>
              patchPrefs({
                preferredCommunicationChannel: value as NonNullable<
                  TravelerProfileInput['travelPreferences']
                >['preferredCommunicationChannel'],
              })
            }
          />
        </>
      ) : null}

      {section === 'assistance' ? (
        <>
          <TravelerToggleField
            label="Wheelchair required"
            checked={form.assistance?.wheelchairRequired}
            onChange={(wheelchairRequired) => patchAssistance({ wheelchairRequired })}
          />
          <TravelerToggleField
            label="Mobility assistance"
            checked={form.assistance?.mobilityAssistance}
            onChange={(mobilityAssistance) => patchAssistance({ mobilityAssistance })}
          />
          <TravelerToggleField
            label="Porter required"
            checked={form.assistance?.porterRequired}
            onChange={(porterRequired) => patchAssistance({ porterRequired })}
          />
          <TravelerToggleField
            label="Fast track preference"
            checked={form.assistance?.fastTrackPreference}
            onChange={(fastTrackPreference) => patchAssistance({ fastTrackPreference })}
          />
          <TravelerToggleField
            label="Lounge preference"
            checked={form.assistance?.loungePreference}
            onChange={(loungePreference) => patchAssistance({ loungePreference })}
          />
          <TravelerToggleField
            label="Meet & assist preference"
            checked={form.assistance?.meetAndAssistPreference}
            onChange={(meetAndAssistPreference) => patchAssistance({ meetAndAssistPreference })}
          />
          <TravelerNotesField
            label="Special assistance notes"
            value={form.assistance?.specialAssistanceNotes}
            onChange={(specialAssistanceNotes) => patchAssistance({ specialAssistanceNotes })}
          />
        </>
      ) : null}

      {section === 'medical' ? (
        <>
          <TravelerNotesField
            label="Allergies"
            value={form.medical?.allergies}
            onChange={(allergies) => patchMedical({ allergies })}
          />
          <TravelerNotesField
            label="Medical conditions"
            value={form.medical?.medicalConditions}
            onChange={(medicalConditions) => patchMedical({ medicalConditions })}
          />
          <TravelerNotesField
            label="Medication notes"
            value={form.medical?.medicationNotes}
            onChange={(medicationNotes) => patchMedical({ medicationNotes })}
          />
          <TravelerTextField
            label="Blood type"
            value={form.medical?.bloodType}
            onChange={(bloodType) => patchMedical({ bloodType })}
          />
          <TravelerNotesField
            label="Dietary restrictions"
            value={form.medical?.dietaryRestrictions}
            onChange={(dietaryRestrictions) => patchMedical({ dietaryRestrictions })}
          />
          <TravelerNotesField
            label="Health notes"
            value={form.medical?.healthNotes}
            onChange={(healthNotes) => patchMedical({ healthNotes })}
          />
          <TravelerNotesField
            label="Safety notes"
            value={form.medical?.safetyNotes}
            onChange={(safetyNotes) => patchMedical({ safetyNotes })}
          />
        </>
      ) : null}

      {section === 'privacy' ? (
        <>
          <TravelerToggleField
            label="Consent to store personal data"
            checked={form.privacy?.consentToStorePersonalData}
            onChange={(consentToStorePersonalData) => patchPrivacy({ consentToStorePersonalData })}
          />
          <TravelerDateField
            label="Consent date"
            value={form.privacy?.consentDate}
            onChange={(consentDate) => patchPrivacy({ consentDate })}
          />
          <TravelerToggleField
            label="Marketing communication consent"
            checked={form.privacy?.marketingCommunicationConsent}
            onChange={(marketingCommunicationConsent) =>
              patchPrivacy({ marketingCommunicationConsent })
            }
          />
          <TravelerNotesField
            label="Data retention notes"
            value={form.privacy?.dataRetentionNotes}
            onChange={(dataRetentionNotes) => patchPrivacy({ dataRetentionNotes })}
          />
          <TravelerNotesField
            label="Sensitive data notes"
            value={form.privacy?.sensitiveDataNotes}
            onChange={(sensitiveDataNotes) => patchPrivacy({ sensitiveDataNotes })}
          />
        </>
      ) : null}

      {section === 'classification' ? (
        <>
          <TravelerMultiPicklistField
            label="Passenger category"
            value={form.classification?.categories ?? []}
            options={enumOptions(TRAVELER_CATEGORIES, TRAVELER_CATEGORY_LABELS)}
            onChange={(categories) =>
              patchClassification({
                categories: categories as NonNullable<
                  TravelerProfileInput['classification']
                >['categories'],
              })
            }
          />
          <TravelerToggleField
            label="Special handling required"
            checked={form.classification?.specialHandlingRequired}
            onChange={(specialHandlingRequired) => patchClassification({ specialHandlingRequired })}
          />
          <TravelerPicklistField
            label="Risk level"
            value={form.classification?.riskLevel}
            options={enumOptions(TRAVELER_RISK_LEVELS, TRAVELER_RISK_LEVEL_LABELS)}
            onChange={(value) =>
              patchClassification({
                riskLevel: value as NonNullable<TravelerProfileInput['classification']>['riskLevel'],
              })
            }
          />
          <TravelerPicklistField
            label="Blacklist status"
            value={form.classification?.blacklistStatus}
            options={enumOptions(TRAVELER_BLACKLIST_STATUSES, TRAVELER_BLACKLIST_STATUS_LABELS)}
            onChange={(value) =>
              patchClassification({
                blacklistStatus: value as NonNullable<
                  TravelerProfileInput['classification']
                >['blacklistStatus'],
              })
            }
          />
          <TravelerPicklistField
            label="Watchlist status"
            value={form.classification?.watchlistStatus}
            options={enumOptions(TRAVELER_WATCHLIST_STATUSES, TRAVELER_WATCHLIST_STATUS_LABELS)}
            onChange={(value) =>
              patchClassification({
                watchlistStatus: value as NonNullable<
                  TravelerProfileInput['classification']
                >['watchlistStatus'],
              })
            }
          />
          <TravelerTextField
            label="Internal tags"
            value={(form.classification?.internalTags ?? []).join(', ')}
            placeholder="Comma-separated tags"
            onChange={(value) =>
              patchClassification({
                internalTags: value
                  .split(',')
                  .map((part) => part.trim())
                  .filter(Boolean),
              })
            }
          />
          <TravelerNotesField
            label="Internal notes"
            value={form.classification?.internalNotes}
            onChange={(internalNotes) => patchClassification({ internalNotes })}
          />
        </>
      ) : null}

      {section === 'settings' ? (
        <>
          <TravelerPicklistField
            label="Active / inactive"
            value={form.status === 'archived' ? 'inactive' : form.status}
            options={enumOptions(['active', 'inactive'] as const, {
              active: 'Active',
              inactive: 'Inactive',
            })}
            onChange={(value) => {
              if (value === 'active' || value === 'inactive') onChange({ status: value })
            }}
          />
          <TravelerToggleField
            label="Archived"
            checked={form.status === 'archived' || form.profileSettings?.archived}
            onChange={(archived) => {
              patchSettings({ archived })
              onChange({ status: archived ? 'archived' : form.status === 'archived' ? 'inactive' : form.status })
            }}
          />
          <TravelerToggleField
            label="Duplicate profile check"
            checked={form.profileSettings?.duplicateCheckFlag}
            onChange={(duplicateCheckFlag) => patchSettings({ duplicateCheckFlag })}
          />
          <TravelerPicklistField
            label="Assigned team member"
            value={form.profileSettings?.assignedTeamMemberId}
            options={accountOwnerOptions}
            onChange={(assignedTeamMemberId) => patchSettings({ assignedTeamMemberId })}
          />
          <TravelerDateField
            label="Last profile review date"
            value={form.profileSettings?.lastProfileReviewDate}
            onChange={(lastProfileReviewDate) => patchSettings({ lastProfileReviewDate })}
          />
          <TravelerDateField
            label="Next review date"
            value={form.profileSettings?.nextReviewDate}
            onChange={(nextReviewDate) => patchSettings({ nextReviewDate })}
          />
          <TravelerNotesField
            label="General notes"
            value={form.notes}
            onChange={(notes) => onChange({ notes })}
          />
        </>
      ) : null}
    </TravelerProfileFieldsShell>
  )
}
