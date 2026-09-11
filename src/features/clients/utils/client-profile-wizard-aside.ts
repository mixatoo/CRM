import { CRM_LABELS } from '@/features/clients/config/crm-labels'
import { previewClientDisplayName } from '@/domain/entities/client'
import {
  isClientCommercialRegistrationProvided,
  isClientTaxRegistrationProvided,
} from '@/domain/entities/client-commercial'
import { isSlaAgreementEngaged, resolveClientSlaAgreement } from '@/domain/entities/client-sla'
import { isClientMember } from '@/domain/entities/client'
import type { ClientFormStepId } from '@/features/clients/components/client-form-step-completion'
import type { ClientFormInput } from '@/features/clients/hooks/use-client-mutations'
import { resolveClientBillingAccount } from '@/domain/entities/client'

export interface WizardAsideGuide {
  title: string
  summary: string
  points: string[]
}

function text(value?: string | null): string | undefined {
  const trimmed = value?.trim()
  return trimmed || undefined
}

function hasContactMethod(form: ClientFormInput): boolean {
  return Boolean(text(form.email) || text(form.phone))
}

export function resolveWizardDisplayName(form: ClientFormInput): string {
  if (form.type === 'corporate') {
    return form.company?.trim() || form.displayName?.trim() || 'Unnamed company'
  }
  return previewClientDisplayName(form.firstName, form.lastName) || form.displayName?.trim() || CRM_LABELS.unnamedAccount
}

export function resolveWizardNameInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
}

/** Explains why the active step matters and what to focus on — not a data repeat. */
export function resolveWizardStepGuide(form: ClientFormInput, step: ClientFormStepId): WizardAsideGuide {
  switch (step) {
    case 'basics':
      if (form.type === 'corporate') {
        return {
          title: 'Company identity',
          summary:
            'The company name is the legal label on contracts, invoices, and trip documents. Set it once here so every downstream document stays consistent.',
          points: buildBasicsGuidePoints(form),
        }
      }
      return {
        title: CRM_LABELS.accountIdentity,
        summary:
          'The display name built from first and last name is what staff see on trips, lists, and invoices — not the separate name fields themselves.',
        points: buildBasicsGuidePoints(form),
      }

    case 'contact':
      return {
        title: 'How to reach this client',
        summary:
          'Contact details drive trip confirmations, invoice delivery, and follow-ups. Without at least one channel, the team must look up details manually.',
        points: buildContactGuidePoints(form),
      }

    case 'financial':
      return {
        title: 'Billing defaults',
        summary:
          'These settings pre-fill new trips and invoices so quotes stay in the right currency and payment rules apply from the first booking.',
        points: buildFinancialGuidePoints(form),
      }

    case 'credit-cards':
      return {
        title: 'Saved credit cards',
        summary:
          'Store cards the client left on file so your team can charge bookings without asking for details every time.',
        points: [
          'Record cardholder name, number, expiry, and CVV for operational charging.',
          'Add multiple cards when the client uses different cards for personal and company spend.',
          'Mark one card as default — it is used first when charging this account.',
        ],
      }

    case 'service-fees':
      return {
        title: 'Service fees',
        summary:
          'Define how much your agency earns on each service for this account — as a percentage markup or a fixed fee.',
        points: [
          'Add each service you provide (flights, hotels, tours, etc.).',
          'Choose percentage commission or a fixed amount per booking.',
          'These rules help your team quote consistently for this client.',
        ],
      }

    case 'membership':
      return {
        title: 'Membership program',
        summary:
          'Turn this on only when the client is enrolled. Membership dates control renewal reminders and eligibility checks on future bookings.',
        points: buildMembershipGuidePoints(form),
      }

    case 'sla':
      return {
        title: 'Service level agreement',
        summary:
          'An SLA sets response-time expectations for support. Engage it only when this client has contracted response targets.',
        points: buildSlaGuidePoints(form),
      }

    case 'commercial':
      return {
        title: 'Billing compliance',
        summary:
          'Commercial register and tax card details are required on corporate invoices. Add them before issuing formal billing documents.',
        points: buildCommercialGuidePoints(form),
      }

    default:
      return { title: '', summary: '', points: [] }
  }
}

function buildBasicsGuidePoints(form: ClientFormInput): string[] {
  const points: string[] = []
  if (form.type === 'corporate') {
    if (!text(form.company)) points.push('Company name is required before other profile sections unlock.')
  } else if (!text(form.firstName) || !text(form.lastName)) {
    points.push('First and last name are required before other profile sections unlock.')
  }
  if (!hasContactMethod(form)) {
    points.push('No contact channel yet — trip confirmations will need manual handling.')
  }
  if (form.acquisitionSource) {
    points.push('Acquisition source feeds channel reports — pick the closest match, not a perfect one.')
  } else {
    points.push('Recording how this client found you improves marketing spend decisions later.')
  }
  return points.slice(0, 3)
}

function buildContactGuidePoints(form: ClientFormInput): string[] {
  const points: string[] = []
  if (!text(form.email) && !text(form.phone)) {
    points.push('Add at least email or phone — both is ideal for confirmations and urgent reach.')
  } else if (!text(form.email)) {
    points.push('Email is the default channel for invoices and written confirmations.')
  } else if (!text(form.phone)) {
    points.push('Phone helps for day-of-travel changes when email is too slow.')
  }
  if (!text(form.city) && !text(form.country)) {
    points.push('Location helps assign the right market and local account manager.')
  }
  if (points.length < 3) {
    points.push('Address is optional but useful for ground services and document delivery.')
  }
  return points.slice(0, 3)
}

function buildFinancialGuidePoints(form: ClientFormInput): string[] {
  const points: string[] = []
  if (!text(form.preferredCurrency)) {
    points.push('Preferred currency sets the default on new trip quotes and account reporting.')
  }
  if (!text(form.paymentTermId)) {
    points.push('Payment terms clarify due dates on invoices and reduce billing back-and-forth.')
  }
  if (resolveClientBillingAccount(form) === 'credit' && !(form.creditLimit && form.creditLimit > 0)) {
    points.push('Credit accounts need an approved limit — new trip charges are blocked once the limit is reached.')
  }
  if (points.length === 0) {
    points.push('Credit limits are enforced when linked trip balances are updated.')
    points.push('Changes here do not alter existing trips — only new ones inherit these defaults.')
  }
  return points.slice(0, 3)
}

function buildMembershipGuidePoints(form: ClientFormInput): string[] {
  const points: string[] = []
  if (!isClientMember(form.membership)) {
    points.push('Leave membership off until enrollment is confirmed — it affects renewal tracking.')
  } else {
    if (!text(form.membershipNumber)) points.push('Member number links bookings to loyalty benefits.')
    if (!text(form.membershipEnrolledAt)) points.push('Start date anchors renewal reminders.')
    if (points.length === 0) points.push('Membership term dates drive expiry alerts before renewal.')
  }
  return points.slice(0, 3)
}

function buildSlaGuidePoints(form: ClientFormInput): string[] {
  const agreement = resolveClientSlaAgreement(form)
  if (!isSlaAgreementEngaged(agreement)) {
    return [
      'Most clients use standard support — only engage SLA when contracted targets exist.',
      'Once engaged, response targets apply to support tickets tied to this account.',
    ]
  }
  const points: string[] = []
  if (!agreement.supportCoverage) {
    points.push('Support coverage defines when response targets are in effect (e.g. business hours).')
  }
  if (!agreement.level) {
    points.push('SLA level sets the baseline response times for this client.')
  }
  if (points.length === 0) {
    points.push('Expiry date stops SLA targets from applying after the contract ends.')
  }
  return points.slice(0, 3)
}

function buildCommercialGuidePoints(form: ClientFormInput): string[] {
  const hasRegister = isClientCommercialRegistrationProvided(form.commercialRegistration)
  const hasTax = isClientTaxRegistrationProvided(form.taxRegistration)
  const points: string[] = []
  if (!hasRegister && !hasTax) {
    points.push('Corporate invoices typically need both register and tax details.')
  } else if (!hasTax) {
    points.push('Tax card completes the billing identity for VAT-compliant invoices.')
  } else if (!hasRegister) {
    points.push('Commercial register confirms the legal entity on formal documents.')
  } else {
    points.push('Documents on file — verify expiry dates before the next invoice run.')
  }
  return points.slice(0, 3)
}
