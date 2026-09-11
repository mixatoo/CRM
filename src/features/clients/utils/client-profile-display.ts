import type { ReactNode } from 'react'
import type { Client } from '@/domain/entities/client'
import {
  CLIENT_ACQUISITION_CHANNEL_LABELS,
  CLIENT_ACQUISITION_SOURCE_LABELS,
  CLIENT_BILLING_ACCOUNT_LABELS,
  CLIENT_GENDER_LABELS,
  CLIENT_INDUSTRY_LABELS,
  CLIENT_MEMBERSHIP_LABELS,
  CLIENT_PAYMENT_METHOD_LABELS,
  buildClientDisplayName,
  clientPrimaryLabel,
  formatClientAge,
  isClientAcquisitionChannelValidForSource,
  isClientMember,
  resolveClientBillingAccount,
  resolveClientMembership,
  resolveClientNameParts,
  resolveClientPaymentCurrencies,
  resolveClientPaymentMethods,
} from '@/domain/entities/client'
import {
  isClientCommercialRegistrationProvided,
  isClientTaxRegistrationProvided,
} from '@/domain/entities/client-commercial'
import {
  CLIENT_SLA_LEVEL_LABELS,
  CLIENT_SLA_RESPONSE_TARGET_KEYS,
  CLIENT_SLA_RESPONSE_TARGET_LABELS,
  CLIENT_SLA_SUPPORT_COVERAGE_LABELS,
  formatSlaResponseTarget,
  isSlaAgreementEngaged,
  isSlaExpired,
  resolveClientSlaAgreement,
} from '@/domain/entities/client-sla'
import { formatMembershipDuration } from '@/domain/membership/term'
import { resolveCountryName } from '@/domain/catalog/location-utils'
import type { ClientFormStepId } from '@/features/clients/components/client-form-step-completion'
import type { DashboardFieldSection } from '@/features/clients/components/dashboard/ClientDashboardInfoCard'
import { formatDate } from '@/shared/utils/date-format'
import {
  appendInternalNotesWizardSection,
  buildProfileWizardStepSections,
  type ClientProfileWizardDisplayOptions,
} from '@/features/clients/utils/client-profile-wizard-display'

export interface ClientProfileDisplayField {
  label: string
  value: ReactNode
}

export interface ClientProfileDisplayOptions {
  accountManagerName?: string
  paymentTermName?: string
  maskContactValue?: (value: string) => string
}

function filledTextField(label: string, value?: string | null): ClientProfileDisplayField | null {
  const text = value?.trim()
  if (!text) return null
  return { label, value: text }
}

function pushField(
  fields: ClientProfileDisplayField[],
  field: ClientProfileDisplayField | null,
): void {
  if (field) fields.push(field)
}

function sectionResult(
  title: string,
  fields: ClientProfileDisplayField[],
  emptyMessage: string,
): DashboardFieldSection {
  return {
    title,
    fields,
    emptyMessage: fields.length === 0 ? emptyMessage : undefined,
  }
}

function buildIndividualIdentityFields(client: Client): ClientProfileDisplayField[] {
  const nameParts = resolveClientNameParts(client)
  const displayName = clientPrimaryLabel(client)
  const builtName = buildClientDisplayName(nameParts.firstName, nameParts.lastName)
  const fields: ClientProfileDisplayField[] = []

  if (displayName && displayName !== builtName) {
    pushField(fields, filledTextField('Display name', displayName))
  }
  pushField(fields, filledTextField('First name', nameParts.firstName))
  pushField(fields, filledTextField('Middle name', nameParts.middleName))
  pushField(fields, filledTextField('Last name', nameParts.lastName))
  if (client.dateOfBirth) {
    fields.push({ label: 'Date of birth', value: formatDate(client.dateOfBirth) })
  }
  if (formatClientAge(client.dateOfBirth)) {
    fields.push({ label: 'Age', value: formatClientAge(client.dateOfBirth) })
  }
  if (client.gender) {
    fields.push({ label: 'Gender', value: CLIENT_GENDER_LABELS[client.gender] })
  }

  return fields
}

function buildCorporateIdentityFields(client: Client): ClientProfileDisplayField[] {
  const companyName = client.company?.trim() || clientPrimaryLabel(client)
  const fields: ClientProfileDisplayField[] = []

  pushField(fields, filledTextField('Company name', companyName))
  if (client.industry) {
    fields.push({ label: 'Industry', value: CLIENT_INDUSTRY_LABELS[client.industry] })
  }

  return fields
}

function buildAccountInformationFields(
  client: Client,
  accountManagerName?: string,
): ClientProfileDisplayField[] {
  const fields: ClientProfileDisplayField[] = []

  pushField(fields, filledTextField('Account manager', accountManagerName))

  if (client.acquisitionSource) {
    fields.push({
      label: 'Source',
      value: CLIENT_ACQUISITION_SOURCE_LABELS[client.acquisitionSource],
    })
  }

  if (
    client.acquisitionSource &&
    client.acquisitionChannel &&
    isClientAcquisitionChannelValidForSource(client.acquisitionSource, client.acquisitionChannel)
  ) {
    fields.push({
      label: 'Channel',
      value: CLIENT_ACQUISITION_CHANNEL_LABELS[client.acquisitionChannel],
    })
  }

  return fields
}

function buildContactFields(
  client: Client,
  maskContactValue?: (value: string) => string,
): ClientProfileDisplayField[] {
  const mask = maskContactValue ?? ((value: string) => value)
  const fields: ClientProfileDisplayField[] = []

  pushField(fields, client.email?.trim() ? { label: 'Email', value: mask(client.email) } : null)
  pushField(fields, client.phone?.trim() ? { label: 'Phone', value: mask(client.phone) } : null)
  pushField(fields, filledTextField('Country', resolveCountryName(client.country) || client.country))
  pushField(fields, filledTextField('City', client.city))
  pushField(fields, filledTextField('Address', client.address))

  return fields
}

function formatCreditLimit(client: Client): string | undefined {
  const billingAccount = resolveClientBillingAccount(client)
  if (billingAccount !== 'credit' || !client.creditLimit || client.creditLimit <= 0) return undefined
  const currency = client.preferredCurrency?.trim() || 'EGP'
  return `${client.creditLimit.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ${currency}`
}

function buildPaymentInformationFields(
  client: Client,
  paymentTermName?: string,
): ClientProfileDisplayField[] {
  const billingAccount = resolveClientBillingAccount(client)
  const currencies = resolveClientPaymentCurrencies(client)
  const methods = resolveClientPaymentMethods(client)
  const fields: ClientProfileDisplayField[] = []

  fields.push({
    label: 'Billing account',
    value: CLIENT_BILLING_ACCOUNT_LABELS[billingAccount],
  })

  pushField(fields, filledTextField('Credit limit', formatCreditLimit(client)))

  if (currencies.length > 0) {
    fields.push({ label: 'Payment currencies', value: currencies.join(', ') })
  }

  if (methods.length > 0) {
    fields.push({
      label: 'Payment methods',
      value: methods.map((method) => CLIENT_PAYMENT_METHOD_LABELS[method]).join(', '),
    })
  }

  pushField(fields, filledTextField('Payment terms', paymentTermName))
  pushField(fields, filledTextField('Billing notes', client.billingNotes))

  return fields
}

function buildMembershipFields(client: Client): ClientProfileDisplayField[] {
  const membership = resolveClientMembership(client.membership)
  const fields: ClientProfileDisplayField[] = [
    { label: 'Enrollment', value: CLIENT_MEMBERSHIP_LABELS[membership] },
  ]

  if (!isClientMember(membership)) return fields

  pushField(fields, filledTextField('Member number', client.membershipNumber))

  if (client.membershipEnrolledAt) {
    fields.push({ label: 'Start date', value: formatDate(client.membershipEnrolledAt) })
  }
  if (client.membershipExpiresAt) {
    fields.push({ label: 'End date', value: formatDate(client.membershipExpiresAt) })
  }

  const duration = formatMembershipDuration(client.membershipEnrolledAt, client.membershipExpiresAt)
  pushField(fields, filledTextField('Duration', duration))
  pushField(fields, filledTextField('Notes', client.membershipNotes))

  return fields
}

function buildSlaFields(client: Client): ClientProfileDisplayField[] {
  const agreement = resolveClientSlaAgreement(client)
  if (!isSlaAgreementEngaged(agreement)) return []

  const fields: ClientProfileDisplayField[] = []

  if (agreement.level) {
    const levelLabel =
      agreement.level === 'custom'
        ? agreement.customName?.trim() || 'Custom'
        : CLIENT_SLA_LEVEL_LABELS[agreement.level]
    fields.push({ label: 'SLA level', value: levelLabel })
  }

  if (agreement.supportCoverage) {
    fields.push({
      label: 'Support coverage',
      value: CLIENT_SLA_SUPPORT_COVERAGE_LABELS[agreement.supportCoverage],
    })
  }

  if (agreement.level === 'custom') {
    pushField(fields, filledTextField('SLA name', agreement.customName))
  }

  for (const key of CLIENT_SLA_RESPONSE_TARGET_KEYS) {
    const formatted = formatSlaResponseTarget(agreement[key])
    if (formatted && formatted !== '—') {
      fields.push({ label: CLIENT_SLA_RESPONSE_TARGET_LABELS[key], value: formatted })
    }
  }

  if (agreement.effectiveDate) {
    fields.push({ label: 'Effective date', value: formatDate(agreement.effectiveDate) })
  }

  if (agreement.expiryDate) {
    const expiryText = isSlaExpired(agreement.expiryDate)
      ? `${formatDate(agreement.expiryDate)} (expired)`
      : formatDate(agreement.expiryDate)
    fields.push({ label: 'Expiry date', value: expiryText })
  }

  pushField(fields, filledTextField('Internal SLA notes', agreement.internalNotes))

  return fields
}

function appendCommercialRegistrationFields(
  fields: ClientProfileDisplayField[],
  client: Client,
): void {
  const registration = client.commercialRegistration
  if (!registration && !isClientCommercialRegistrationProvided(registration)) return

  fields.push({ label: 'Commercial register', value: 'Available' })
  pushField(fields, filledTextField('Registration number', registration?.registrationNumber))
  pushField(fields, filledTextField('Registered name', registration?.registeredName))
  pushField(fields, filledTextField('Issuing authority', registration?.issuingAuthority))
  if (registration?.issuedDate) {
    fields.push({ label: 'Issue date', value: formatDate(registration.issuedDate) })
  }
  if (registration?.expiresDate) {
    fields.push({ label: 'Expiry date', value: formatDate(registration.expiresDate) })
  }
  pushField(fields, filledTextField('Registered address', registration?.registeredAddress))
}

function appendTaxRegistrationFields(fields: ClientProfileDisplayField[], client: Client): void {
  const registration = client.taxRegistration
  if (!registration && !isClientTaxRegistrationProvided(registration)) return

  fields.push({ label: 'Tax card', value: 'Available' })
  pushField(fields, filledTextField('Tax ID', registration?.taxId))
  pushField(fields, filledTextField('Card number', registration?.cardNumber))
  pushField(fields, filledTextField('Registered name', registration?.registeredName))
  pushField(fields, filledTextField('Issuing authority', registration?.issuingAuthority))
  if (registration?.issuedDate) {
    fields.push({ label: 'Issue date', value: formatDate(registration.issuedDate) })
  }
  if (registration?.expiresDate) {
    fields.push({ label: 'Expiry date', value: formatDate(registration.expiresDate) })
  }
  pushField(fields, filledTextField('Activity code', registration?.activityCode))
}

function buildCommercialInformationFields(client: Client): ClientProfileDisplayField[] {
  if (client.type !== 'corporate') return []

  const fields: ClientProfileDisplayField[] = []
  appendCommercialRegistrationFields(fields, client)
  appendTaxRegistrationFields(fields, client)
  return fields
}

function buildInternalNotesFields(client: Client): ClientProfileDisplayField[] {
  const notes = client.notes?.trim()
  return notes ? [{ label: 'Team-only context', value: notes }] : []
}

export function buildClientProfileDashboardSections(
  client: Client,
  options?: ClientProfileDisplayOptions,
): DashboardFieldSection[] {
  const identityTitle = client.type === 'corporate' ? 'Company profile' : 'Personal profile'
  const identityFields =
    client.type === 'corporate'
      ? buildCorporateIdentityFields(client)
      : buildIndividualIdentityFields(client)

  const sections: DashboardFieldSection[] = [
    sectionResult(
      identityTitle,
      identityFields,
      client.type === 'corporate'
        ? 'No company details recorded yet.'
        : 'No personal details recorded yet.',
    ),
    sectionResult(
      'Account Information',
      buildAccountInformationFields(client, options?.accountManagerName),
      'No account assignment or acquisition source recorded yet.',
    ),
    sectionResult(
      'Communication',
      buildContactFields(client, options?.maskContactValue),
      'No contact details recorded yet.',
    ),
    sectionResult(
      'Payment information',
      buildPaymentInformationFields(client, options?.paymentTermName),
      'No payment setup recorded yet.',
    ),
    sectionResult(
      'Membership',
      buildMembershipFields(client),
      'No membership enrollment recorded yet.',
    ),
    sectionResult(
      'SLA',
      buildSlaFields(client),
      'No service level agreement recorded yet.',
    ),
  ]

  if (client.type === 'corporate') {
    sections.push(
      sectionResult(
        'Commercial information',
        buildCommercialInformationFields(client),
        'No commercial or tax documentation recorded yet.',
      ),
    )
  }

  const internalNotes = buildInternalNotesFields(client)
  if (internalNotes.length > 0) {
    sections.push(sectionResult('Internal notes', internalNotes, 'No internal notes recorded yet.'))
  }

  return sections
}

export function profileSectionAnchorId(title: string): string {
  return `client-profile-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`
}

export interface ClientProfileDisplayCard {
  key: string
  sections: DashboardFieldSection[]
  className?: string
}

export function groupClientProfileDisplayCards(sections: DashboardFieldSection[]): ClientProfileDisplayCard[] {
  const find = (title: string) => sections.find((section) => section.title === title)

  const identitySection = sections.find(
    (section) => section.title === 'Personal profile' || section.title === 'Company profile',
  )
  if (!identitySection) return sections.map((section) => ({ key: section.title, sections: [section] }))

  const cards: ClientProfileDisplayCard[] = [
    {
      key: 'identity-account',
      sections: [identitySection, find('Account Information')].filter(
        (section): section is DashboardFieldSection => section != null,
      ),
    },
    {
      key: 'contact-payment',
      sections: [find('Communication'), find('Payment information')].filter(
        (section): section is DashboardFieldSection => section != null,
      ),
    },
    {
      key: 'membership-sla',
      sections: [find('Membership'), find('SLA')].filter(
        (section): section is DashboardFieldSection => section != null,
      ),
    },
  ]

  const commercial = find('Commercial information')
  if (commercial) {
    cards.push({
      key: 'commercial',
      className: 'lg:col-span-2',
      sections: [commercial],
    })
  }

  const notes = find('Internal notes')
  if (notes) {
    cards.push({ key: 'notes', sections: [notes] })
  }

  return cards
}

export function getProfileSectionsForWizardStep(
  step: ClientFormStepId,
  client: Client,
  options?: ClientProfileWizardDisplayOptions & {
    includeInternalNotesOnLastStep?: boolean
    isLastStep?: boolean
  },
): DashboardFieldSection[] {
  let stepSections = buildProfileWizardStepSections(step, client, options)

  if (options?.includeInternalNotesOnLastStep && options.isLastStep) {
    stepSections = appendInternalNotesWizardSection(stepSections, client)
  }

  return stepSections
}
