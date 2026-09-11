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
  clientPrimaryLabel,
  formatClientAge,
  isClientAcquisitionChannelValidForSource,
  isClientMember,
  resolveClientBillingAccount,
  resolveClientMembership,
  resolveClientJoinedAt,
  CLIENT_JOINED_COMPANY_LABEL,
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
  resolveClientSlaAgreement,
} from '@/domain/entities/client-sla'
import {
  MEMBERSHIP_DURATION_PRESETS,
  matchMembershipDurationPreset,
  toMembershipStartDate,
} from '@/domain/membership/term'
import { resolveCountryName } from '@/domain/catalog/location-utils'
import type { ClientFormStepId } from '@/features/clients/components/client-form-step-completion'
import type { DashboardFieldSection } from '@/features/clients/components/dashboard/ClientDashboardInfoCard'
import { formatDate } from '@/shared/utils/date-format'

export interface ClientProfileWizardDisplayOptions {
  accountManagerName?: string
  paymentTermName?: string
  maskContactValue?: (value: string) => string
}

interface WizardField {
  label: string
  value: ReactNode
}

const EMPTY = '—'
const UNASSIGNED = 'Unassigned'

function field(label: string, value?: ReactNode): WizardField {
  if (value == null) return { label, value: EMPTY }
  if (typeof value === 'string' && !value.trim()) return { label, value: EMPTY }
  return { label, value }
}

function section(title: string | undefined, fields: WizardField[]): DashboardFieldSection {
  return { title: title ?? '', fields }
}

function resolveAcquisitionChannel(client: Client): string | undefined {
  if (
    client.acquisitionSource &&
    client.acquisitionChannel &&
    isClientAcquisitionChannelValidForSource(client.acquisitionSource, client.acquisitionChannel)
  ) {
    return CLIENT_ACQUISITION_CHANNEL_LABELS[client.acquisitionChannel]
  }
  return undefined
}

function buildAcquisitionAssignmentFields(
  client: Client,
  accountManagerName?: string,
): WizardField[] {
  return [
    field(
      'Source',
      client.acquisitionSource ? CLIENT_ACQUISITION_SOURCE_LABELS[client.acquisitionSource] : undefined,
    ),
    field('Channel', resolveAcquisitionChannel(client)),
    field('Account manager', accountManagerName?.trim() || UNASSIGNED),
  ]
}

function buildIndividualBasicsFields(
  client: Client,
  accountManagerName?: string,
): WizardField[] {
  const nameParts = resolveClientNameParts(client)

  return [
    field('First name', nameParts.firstName),
    field('Middle name', nameParts.middleName),
    field('Last name', nameParts.lastName),
    field('Date of birth', client.dateOfBirth ? formatDate(client.dateOfBirth) : undefined),
    field('Age', formatClientAge(client.dateOfBirth)),
    field('Gender', client.gender ? CLIENT_GENDER_LABELS[client.gender] : undefined),
    field(CLIENT_JOINED_COMPANY_LABEL, formatDate(resolveClientJoinedAt(client))),
    ...buildAcquisitionAssignmentFields(client, accountManagerName),
  ]
}

function buildCorporateBasicsFields(
  client: Client,
  accountManagerName?: string,
): WizardField[] {
  const companyName = client.company?.trim() || clientPrimaryLabel(client)

  return [
    field('Company name', companyName),
    field('Industry', client.industry ? CLIENT_INDUSTRY_LABELS[client.industry] : undefined),
    field(CLIENT_JOINED_COMPANY_LABEL, formatDate(resolveClientJoinedAt(client))),
    ...buildAcquisitionAssignmentFields(client, accountManagerName),
  ]
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

function buildFinancialFields(client: Client, paymentTermName?: string): WizardField[] {
  const billingAccount = resolveClientBillingAccount(client)
  const currencies = resolveClientPaymentCurrencies(client)
  const methods = resolveClientPaymentMethods(client)
  const fields: WizardField[] = [
    field('Billing account', CLIENT_BILLING_ACCOUNT_LABELS[billingAccount]),
  ]

  if (billingAccount === 'credit') {
    fields.push(field('Credit limit', formatCreditLimit(client)))
  }

  fields.push(
    field('Payment currencies', currencies.length > 0 ? currencies.join(', ') : undefined),
    field(
      'Payment methods',
      methods.length > 0
        ? methods.map((method) => CLIENT_PAYMENT_METHOD_LABELS[method]).join(', ')
        : undefined,
    ),
    field('Payment terms', paymentTermName),
    field('Billing notes', client.billingNotes),
  )

  return fields
}

function resolveMembershipDurationLabel(client: Client): string | undefined {
  if (!client.membershipEnrolledAt || !client.membershipExpiresAt) return undefined
  const preset = matchMembershipDurationPreset(client.membershipEnrolledAt, client.membershipExpiresAt)
  if (preset === 'custom') return 'Custom end date'
  return MEMBERSHIP_DURATION_PRESETS.find((item) => item.months === preset)?.label
}

function buildMembershipFields(client: Client): WizardField[] {
  const membership = resolveClientMembership(client.membership)
  const enrolled = isClientMember(membership)
  const fields: WizardField[] = [
    field('Membership', CLIENT_MEMBERSHIP_LABELS[membership]),
    field('Member number', client.membershipNumber),
  ]

  if (!enrolled) return fields

  fields.push(
    field(
      'Start date',
      client.membershipEnrolledAt
        ? formatDate(toMembershipStartDate(client.membershipEnrolledAt))
        : undefined,
    ),
    field('End date', client.membershipExpiresAt ? formatDate(client.membershipExpiresAt) : undefined),
    field('Duration', resolveMembershipDurationLabel(client)),
    field('Notes', client.membershipNotes),
  )

  return fields
}

function buildSlaFields(client: Client): WizardField[] {
  const agreement = resolveClientSlaAgreement(client)
  const fields: WizardField[] = [
    field(
      'SLA level',
      agreement.level
        ? agreement.level === 'custom'
          ? agreement.customName?.trim() || 'Custom'
          : CLIENT_SLA_LEVEL_LABELS[agreement.level]
        : undefined,
    ),
    field(
      'Support coverage',
      agreement.supportCoverage
        ? CLIENT_SLA_SUPPORT_COVERAGE_LABELS[agreement.supportCoverage]
        : undefined,
    ),
  ]

  if (agreement.level === 'custom') {
    fields.push(field('SLA name', agreement.customName))
  }

  for (const key of CLIENT_SLA_RESPONSE_TARGET_KEYS) {
    fields.push(field(CLIENT_SLA_RESPONSE_TARGET_LABELS[key], formatSlaResponseTarget(agreement[key])))
  }

  fields.push(
    field('Effective date', agreement.effectiveDate ? formatDate(agreement.effectiveDate) : undefined),
    field('Expiry date', agreement.expiryDate ? formatDate(agreement.expiryDate) : undefined),
    field('Internal SLA notes', agreement.internalNotes),
  )

  return fields
}

function buildContactFields(client: Client, maskContactValue?: (value: string) => string): WizardField[] {
  const mask = maskContactValue ?? ((value: string) => value)

  return [
    field('Email', client.email?.trim() ? mask(client.email) : undefined),
    field('Phone', client.phone?.trim() ? mask(client.phone) : undefined),
    field('Country', resolveCountryName(client.country) || client.country),
    field('City', client.city),
    field('Address', client.address),
  ]
}

function buildCommercialRegistrationFields(client: Client): WizardField[] {
  const registration = client.commercialRegistration
  const available =
    isClientCommercialRegistrationProvided(registration) || registration != null

  const fields: WizardField[] = [
    field('Commercial register', available ? 'Available' : 'Not available'),
  ]

  if (!available) return fields

  fields.push(
    field('Registration number', registration?.registrationNumber),
    field('Registered name', registration?.registeredName),
    field('Issuing authority', registration?.issuingAuthority),
    field('Issue date', registration?.issuedDate ? formatDate(registration.issuedDate) : undefined),
    field('Expiry date', registration?.expiresDate ? formatDate(registration.expiresDate) : undefined),
    field('Registered address', registration?.registeredAddress),
  )

  return fields
}

function buildTaxRegistrationFields(client: Client): WizardField[] {
  const registration = client.taxRegistration
  const available = isClientTaxRegistrationProvided(registration) || registration != null

  const fields: WizardField[] = [field('Tax card', available ? 'Available' : 'Not available')]

  if (!available) return fields

  fields.push(
    field('Tax ID', registration?.taxId),
    field('Card number', registration?.cardNumber),
    field('Registered name', registration?.registeredName),
    field('Issuing authority', registration?.issuingAuthority),
    field('Issue date', registration?.issuedDate ? formatDate(registration.issuedDate) : undefined),
    field('Expiry date', registration?.expiresDate ? formatDate(registration.expiresDate) : undefined),
    field('Activity code', registration?.activityCode),
  )

  return fields
}

function buildInternalNotesFields(client: Client): WizardField[] {
  return [field('Team-only context', client.notes)]
}

function buildCommercialStepSections(client: Client): DashboardFieldSection[] {
  return [
    section(undefined, buildCommercialRegistrationFields(client)),
    section(undefined, buildTaxRegistrationFields(client)),
  ]
}

export function buildProfileWizardStepSections(
  step: ClientFormStepId,
  client: Client,
  options?: ClientProfileWizardDisplayOptions,
): DashboardFieldSection[] {
  switch (step) {
    case 'basics':
      return [
        section(
          undefined,
          client.type === 'corporate'
            ? buildCorporateBasicsFields(client, options?.accountManagerName)
            : buildIndividualBasicsFields(client, options?.accountManagerName),
        ),
      ]
    case 'contact':
      return [section(undefined, buildContactFields(client, options?.maskContactValue))]
    case 'financial':
      return [section(undefined, buildFinancialFields(client, options?.paymentTermName))]
    case 'membership':
      return [section(undefined, buildMembershipFields(client))]
    case 'sla':
      return [section(undefined, buildSlaFields(client))]
    case 'commercial':
      return buildCommercialStepSections(client)
    default:
      return []
  }
}

export function appendInternalNotesWizardSection(
  sections: DashboardFieldSection[],
  client: Client,
): DashboardFieldSection[] {
  const notes = client.notes?.trim()
  if (!notes) return sections
  return [...sections, section('Internal notes', buildInternalNotesFields(client))]
}
