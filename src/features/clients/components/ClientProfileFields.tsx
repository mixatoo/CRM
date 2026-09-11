import type { Client } from '@/domain/entities/client'
import {
  DEFAULT_CLIENT_MEMBERSHIP,
  buildClientDisplayName,
  resolveClientBillingAccount,
  resolveClientMembership,
  resolveClientJoinedAt,
  resolveClientNameParts,
  resolveClientPaymentMethods,
  resolveClientPaymentCurrencies,
  clientPrimaryLabel,
} from '@/domain/entities/client'
import { resolveClientSlaAgreement } from '@/domain/entities/client-sla'
import type { ClientFormInput } from '@/features/clients/hooks/use-client-mutations'
import type { ClientFormStepId } from '@/features/clients/components/client-form-ui'
import type { SlaValidationErrors } from '@/features/clients/components/sla/sla-validation'
import { stripClientFieldsForType } from '@/domain/entities/client-field-visibility'
import { resolveCountryName } from '@/domain/catalog/location-utils'
import { CorporateClientForm } from '@/features/clients/components/corporate-client-form'
import { IndividualClientForm } from '@/features/clients/components/individual-client-form'
import { ClientCreditCardsTab } from '@/features/clients/components/credit-cards/ClientCreditCardsTab'
import { ClientServiceFeesTab } from '@/features/clients/components/service-fees/ClientServiceFeesTab'

interface ClientProfileFieldsProps {
  form: ClientFormInput
  onChange: <K extends keyof ClientFormInput>(key: K, value: ClientFormInput[K]) => void
  onPatch?: (patch: Partial<ClientFormInput>) => void
  disabled?: boolean
  showStatus?: boolean
  showJoinedAt?: boolean
  showNameHint?: boolean
  layout?: 'panels' | 'step' | 'section' | 'profile'
  step?: ClientFormStepId
  clientId?: string
  lockClientType?: boolean
  showSlaErrors?: boolean
  slaErrors?: SlaValidationErrors
}

export function ClientProfileFields({
  form,
  onChange,
  onPatch,
  disabled,
  showStatus = false,
  showJoinedAt = false,
  showNameHint,
  layout = 'panels',
  step = 'basics',
  clientId,
  lockClientType,
  showSlaErrors,
  slaErrors,
}: ClientProfileFieldsProps) {
  if (step === 'credit-cards' && clientId) {
    return (
      <ClientCreditCardsTab
        clientId={clientId}
        disabled={disabled}
        layout={layout === 'section' ? 'section' : 'profile'}
      />
    )
  }

  if (step === 'service-fees' && clientId) {
    return (
      <ClientServiceFeesTab
        clientId={clientId}
        disabled={disabled}
        layout={layout === 'section' ? 'section' : 'profile'}
      />
    )
  }

  const shared = {
    form,
    onChange,
    onPatch,
    disabled,
    showStatus,
    showJoinedAt,
    showNameHint,
    layout,
    step,
    lockClientType,
    showSlaErrors,
    slaErrors,
  }

  if (form.type === 'corporate') {
    return <CorporateClientForm {...shared} />
  }

  return <IndividualClientForm {...shared} />
}

export const EMPTY_CLIENT_FORM: ClientFormInput = {
  displayName: '',
  firstName: '',
  middleName: '',
  lastName: '',
  type: 'individual',
  status: 'active',
  email: '',
  phone: '',
  company: '',
  industry: undefined,
  jobTitle: '',
  country: '',
  city: '',
  address: '',
  preferredCurrency: 'EGP',
  paymentCurrencies: [],
  preferredLanguage: 'en',
  preferredPaymentMethods: [],
  paymentTermId: undefined,
  billingAccount: 'prepaid',
  creditLimit: undefined,
  sla: undefined,
  slaAgreement: undefined,
  market: undefined,
  segment: '',
  customerTier: undefined,
  acquisitionSource: undefined,
  acquisitionChannel: undefined,
  dateOfBirth: undefined,
  gender: undefined,
  accountManagerId: undefined,
  membership: DEFAULT_CLIENT_MEMBERSHIP,
  membershipNotes: '',
  preferredDestination: '',
  nationalityFocus: '',
  billingNotes: '',
  commercialRegistration: undefined,
  taxRegistration: undefined,
  notes: '',
  joinedAt: undefined,
}

export function clientToFormInput(client: Client): ClientFormInput {
  const nameParts =
    client.type === 'individual'
      ? resolveClientNameParts(client)
      : { firstName: '', middleName: '', lastName: '' }
  return stripClientFieldsForType(
    {
      displayName: clientPrimaryLabel(client),
      firstName: nameParts.firstName,
      middleName: nameParts.middleName,
      lastName: nameParts.lastName,
      type: client.type,
      status: client.status,
      email: client.email ?? '',
      phone: client.phone ?? '',
      company: client.company ?? '',
      industry: client.industry,
      jobTitle: client.jobTitle ?? '',
      country: client.country ? resolveCountryName(client.country) : '',
      city: client.city ?? '',
      address: client.address ?? '',
      preferredCurrency: client.preferredCurrency ?? 'EGP',
      paymentCurrencies: resolveClientPaymentCurrencies(client),
      preferredLanguage: client.preferredLanguage ?? 'en',
      preferredPaymentMethods: resolveClientPaymentMethods(client),
      paymentTermId: client.paymentTermId,
      billingAccount: resolveClientBillingAccount(client),
      creditLimit: client.creditLimit,
      sla: client.sla,
      slaAgreement: resolveClientSlaAgreement(client),
      market: client.market,
      segment: client.segment ?? '',
      customerTier: client.customerTier,
      acquisitionSource: client.acquisitionSource,
      acquisitionChannel: client.acquisitionChannel,
      dateOfBirth: client.dateOfBirth,
      gender: client.gender,
      accountManagerId: client.accountManagerId,
      membership: resolveClientMembership(client.membership),
      membershipNumber: client.membershipNumber,
      membershipEnrolledAt: client.membershipEnrolledAt,
      membershipExpiresAt: client.membershipExpiresAt,
      membershipNotes: client.membershipNotes ?? '',
      preferredDestination: client.preferredDestination ?? '',
      nationalityFocus: client.nationalityFocus ?? '',
      billingNotes: client.billingNotes ?? '',
      commercialRegistration: client.commercialRegistration,
      taxRegistration: client.taxRegistration,
      notes: client.notes ?? '',
      joinedAt: resolveClientJoinedAt(client),
    },
    client.type,
  )
}

const CLONE_SUFFIX = ' (Copy)'

function stripCloneSuffix(value: string): string {
  return value.replace(/ \(Copy\)+$/u, '').trim()
}

/** Form input for duplicating a client — clears identity fields that must be unique on create. */
export function clientToCloneFormInput(client: Client): ClientFormInput {
  const base = clientToFormInput(client)

  if (base.type === 'corporate') {
    const company = `${stripCloneSuffix(base.company ?? '')}${CLONE_SUFFIX}`.trim()
    return {
      ...base,
      company,
      displayName: company,
      email: '',
      status: 'active',
      membershipNumber: undefined,
      membershipEnrolledAt: base.membership === 'member' ? base.membershipEnrolledAt : undefined,
      membershipExpiresAt: base.membership === 'member' ? base.membershipExpiresAt : undefined,
      notes: base.notes
        ? `${base.notes}\n\nCloned from ${client.reference}.`
        : `Cloned from ${client.reference}.`,
    }
  }

  const lastName = `${stripCloneSuffix(base.lastName ?? '')}${CLONE_SUFFIX}`.trim()
  const displayName = buildClientDisplayName(base.firstName, lastName) || `${stripCloneSuffix(base.displayName)}${CLONE_SUFFIX}`

  return {
    ...base,
    lastName,
    displayName,
    email: '',
    status: 'active',
    membershipNumber: undefined,
    membershipEnrolledAt: base.membership === 'member' ? base.membershipEnrolledAt : undefined,
    membershipExpiresAt: base.membership === 'member' ? base.membershipExpiresAt : undefined,
    notes: base.notes
      ? `${base.notes}\n\nCloned from ${client.reference}.`
      : `Cloned from ${client.reference}.`,
  }
}
