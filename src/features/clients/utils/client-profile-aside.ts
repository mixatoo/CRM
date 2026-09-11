import { resolveCountryName } from '@/domain/catalog/location-utils'
import {
  CLIENT_ACQUISITION_SOURCE_LABELS,
  CLIENT_BILLING_ACCOUNT_LABELS,
  CLIENT_MEMBERSHIP_LABELS,
  isClientMember,
  resolveClientBillingAccount,
  type ClientAcquisitionSource,
} from '@/domain/entities/client'
import {
  isClientCommercialRegistrationProvided,
  isClientTaxRegistrationProvided,
} from '@/domain/entities/client-commercial'
import {
  CLIENT_SLA_LEVEL_LABELS,
  isSlaAgreementEngaged,
  isSlaExpired,
  resolveClientSlaAgreement,
} from '@/domain/entities/client-sla'
import type { ClientFormStepId } from '@/features/clients/components/client-form-step-completion'
import type { ClientFormInput } from '@/features/clients/hooks/use-client-mutations'

export type ProfileSectionInsightKind = 'highlight' | 'gap'

export interface ProfileSectionInsight {
  kind: ProfileSectionInsightKind
  text: string
}

export interface ProfileSectionFocus {
  insights: ProfileSectionInsight[]
}

export interface ProfileSectionFocusOptions {
  accountManagerName?: string
  paymentTermName?: string
}

function text(value?: string | null): string | undefined {
  const trimmed = value?.trim()
  return trimmed || undefined
}

function takeInsights(insights: ProfileSectionInsight[], limit = 3): ProfileSectionInsight[] {
  const gaps = insights.filter((item) => item.kind === 'gap')
  const highlights = insights.filter((item) => item.kind === 'highlight')
  return [...gaps, ...highlights].slice(0, limit)
}

function resolveLocationLabel(form: ClientFormInput): string | undefined {
  const city = text(form.city)
  const country = text(form.country) ? resolveCountryName(form.country) ?? text(form.country) : undefined

  if (city && country) return `${city}, ${country}`
  return city ?? country
}

function buildBasicsFocus(form: ClientFormInput, options: ProfileSectionFocusOptions): ProfileSectionInsight[] {
  const insights: ProfileSectionInsight[] = []

  if (!text(form.accountManagerId)) {
    insights.push({ kind: 'gap', text: 'Assign an account manager so trips and invoices have a clear owner.' })
  } else if (options.accountManagerName) {
    insights.push({ kind: 'highlight', text: `Managed by ${options.accountManagerName}.` })
  }

  if (!form.acquisitionSource) {
    insights.push({ kind: 'gap', text: 'Record acquisition source to track where this client came from.' })
  } else {
    insights.push({
      kind: 'highlight',
      text: `Acquired via ${CLIENT_ACQUISITION_SOURCE_LABELS[form.acquisitionSource as ClientAcquisitionSource]}.`,
    })
  }

  if (form.type === 'corporate' && text(form.industry)) {
    insights.push({ kind: 'highlight', text: `Industry on file for corporate reporting.` })
  }

  return takeInsights(insights)
}

function buildContactFocus(form: ClientFormInput): ProfileSectionInsight[] {
  const insights: ProfileSectionInsight[] = []
  const email = text(form.email)
  const phone = text(form.phone)
  const location = resolveLocationLabel(form)

  if (!email && !phone) {
    insights.push({ kind: 'gap', text: 'Add email or phone so trip confirmations can be sent automatically.' })
  } else {
    if (!email) {
      insights.push({ kind: 'gap', text: 'Add email for invoices and written confirmations.' })
    }
    if (!phone) {
      insights.push({ kind: 'gap', text: 'Add phone for day-of-travel changes.' })
    }
  }

  if (!location) {
    insights.push({ kind: 'gap', text: 'City or country helps with market assignment and local support.' })
  }

  if (!text(form.address)) {
    insights.push({ kind: 'gap', text: 'Address is optional but useful for ground services and documents.' })
  }

  return takeInsights(insights)
}

function buildFinancialFocus(form: ClientFormInput, options: ProfileSectionFocusOptions): ProfileSectionInsight[] {
  const insights: ProfileSectionInsight[] = []
  const billingAccount = resolveClientBillingAccount(form)
  const currency = text(form.preferredCurrency)

  if (currency) {
    insights.push({ kind: 'highlight', text: `Default quote currency: ${currency}.` })
  } else {
    insights.push({ kind: 'gap', text: 'Set a preferred currency for new trip quotes.' })
  }

  if (options.paymentTermName) {
    insights.push({ kind: 'highlight', text: `Payment terms: ${options.paymentTermName}.` })
  } else if (!text(form.paymentTermId)) {
    insights.push({ kind: 'gap', text: 'Payment terms clarify invoice due dates.' })
  }

  insights.push({
    kind: 'highlight',
    text: `Billing account: ${CLIENT_BILLING_ACCOUNT_LABELS[billingAccount]}.`,
  })

  if (billingAccount === 'credit' && !(form.creditLimit && form.creditLimit > 0)) {
    insights.push({ kind: 'gap', text: 'Credit accounts need an approved limit before new charges.' })
  }

  return takeInsights(insights)
}

function buildMembershipFocus(form: ClientFormInput): ProfileSectionInsight[] {
  const insights: ProfileSectionInsight[] = []

  if (!isClientMember(form.membership)) {
    insights.push({ kind: 'highlight', text: 'Not enrolled in a membership program.' })
    return takeInsights(insights)
  }

  insights.push({
    kind: 'highlight',
    text: `Enrolled: ${CLIENT_MEMBERSHIP_LABELS[form.membership]}.`,
  })

  if (!text(form.membershipNumber)) {
    insights.push({ kind: 'gap', text: 'Add member number to link bookings to benefits.' })
  }
  if (!text(form.membershipEnrolledAt)) {
    insights.push({ kind: 'gap', text: 'Add enrollment date for renewal tracking.' })
  }

  return takeInsights(insights)
}

function buildSlaFocus(form: ClientFormInput): ProfileSectionInsight[] {
  const agreement = resolveClientSlaAgreement(form)

  if (!isSlaAgreementEngaged(agreement)) {
    return takeInsights([
      { kind: 'highlight', text: 'Using standard support — no contracted SLA on this account.' },
    ])
  }

  const insights: ProfileSectionInsight[] = []

  if (agreement.level) {
    insights.push({
      kind: 'highlight',
      text: `SLA level: ${CLIENT_SLA_LEVEL_LABELS[agreement.level]}.`,
    })
  } else {
    insights.push({ kind: 'gap', text: 'Pick an SLA level to set response targets.' })
  }

  if (isSlaExpired(agreement.expiryDate)) {
    insights.push({ kind: 'gap', text: 'SLA contract has expired — review before the next support ticket.' })
  }

  return takeInsights(insights)
}

function buildCommercialFocus(form: ClientFormInput): ProfileSectionInsight[] {
  const hasRegister = isClientCommercialRegistrationProvided(form.commercialRegistration)
  const hasTax = isClientTaxRegistrationProvided(form.taxRegistration)
  const insights: ProfileSectionInsight[] = []

  if (hasRegister && hasTax) {
    insights.push({ kind: 'highlight', text: 'Commercial register and tax card are on file.' })
    return takeInsights(insights)
  }

  if (!hasRegister && !hasTax) {
    insights.push({ kind: 'gap', text: 'Corporate invoices usually need register and tax details.' })
  } else if (!hasTax) {
    insights.push({ kind: 'gap', text: 'Add tax card for VAT-compliant invoices.' })
  } else {
    insights.push({ kind: 'gap', text: 'Add commercial register for formal billing documents.' })
  }

  return takeInsights(insights)
}

function buildPanelFocus(message: string): ProfileSectionInsight[] {
  return [{ kind: 'highlight', text: message }]
}

/** Section-aware notes for the profile-page rail — highlights and gaps for the active section only. */
export function buildProfileSectionFocus(
  step: ClientFormStepId,
  form: ClientFormInput,
  options: ProfileSectionFocusOptions = {},
): ProfileSectionFocus {
  let insights: ProfileSectionInsight[]

  switch (step) {
    case 'basics':
      insights = buildBasicsFocus(form, options)
      break
    case 'contact':
      insights = buildContactFocus(form)
      break
    case 'financial':
      insights = buildFinancialFocus(form, options)
      break
    case 'membership':
      insights = buildMembershipFocus(form)
      break
    case 'sla':
      insights = buildSlaFocus(form)
      break
    case 'commercial':
      insights = buildCommercialFocus(form)
      break
    case 'credit-cards':
      insights = buildPanelFocus('Saved cards let your team charge without asking for details each time.')
      break
    case 'service-fees':
      insights = buildPanelFocus('Service fees keep quotes consistent for this account.')
      break
    default:
      insights = []
  }

  return { insights: takeInsights(insights) }
}
