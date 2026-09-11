import { resolveCountryName } from '@/domain/catalog/location-utils'
import {
  isClientCommercialRegistrationProvided,
  isClientTaxRegistrationProvided,
} from '@/domain/entities/client-commercial'
import { isSlaAgreementEngaged } from '@/domain/entities/client-sla'
import {
  isClientIdentityComplete,
  isClientMember,
  resolveClientBillingAccount,
  type ClientType,
} from '@/domain/entities/client'
import type { ClientFormInput } from '@/features/clients/hooks/use-client-mutations'

export type ClientFormStepId =
  | 'basics'
  | 'commercial'
  | 'sla'
  | 'contact'
  | 'financial'
  | 'service-fees'
  | 'credit-cards'
  | 'membership'

type StepField = {
  label: string
  isFilled: (form: ClientFormInput) => boolean
  required?: boolean
}

export type ClientFormStepCompletion = {
  complete: boolean
  optional: boolean
  filledCount: number
  totalCount: number
  missingLabels: string[]
}

function textFilled(value?: string | null): boolean {
  return Boolean(value?.trim())
}

function individualBasicsFields(): StepField[] {
  return [
    { label: 'First name', isFilled: (form) => textFilled(form.firstName), required: true },
    { label: 'Last name', isFilled: (form) => textFilled(form.lastName), required: true },
  ]
}

function corporateBasicsFields(): StepField[] {
  return [{ label: 'Company name', isFilled: (form) => textFilled(form.company), required: true }]
}

function contactFields(): StepField[] {
  return []
}

function financialFields(form: ClientFormInput): StepField[] {
  if (resolveClientBillingAccount(form) !== 'credit') return []
  return [
    {
      label: 'Credit limit',
      isFilled: (value) => (value.creditLimit ?? 0) > 0,
      required: true,
    },
  ]
}

function membershipFields(): StepField[] {
  return []
}

function commercialFields(): StepField[] {
  return []
}

function slaFields(form: ClientFormInput): StepField[] {
  if (!isSlaAgreementEngaged(form.slaAgreement) && form.sla == null) return []

  const fields: StepField[] = [
    { label: 'SLA level', isFilled: (value) => value.slaAgreement?.level != null, required: true },
    {
      label: 'Support coverage',
      isFilled: (value) => value.slaAgreement?.supportCoverage != null,
      required: true,
    },
  ]

  if (form.slaAgreement?.level === 'custom') {
    fields.push({
      label: 'SLA name',
      isFilled: (value) => textFilled(value.slaAgreement?.customName),
      required: true,
    })
  }

  return fields
}

function getStepFields(stepId: ClientFormStepId, type: ClientType, form: ClientFormInput): StepField[] {
  switch (stepId) {
    case 'basics':
      return type === 'corporate' ? corporateBasicsFields() : individualBasicsFields()
    case 'contact':
      return contactFields()
    case 'financial':
      return financialFields(form)
    case 'service-fees':
      return []
    case 'credit-cards':
      return []
    case 'membership':
      return membershipFields()
    case 'commercial':
      return commercialFields()
    case 'sla':
      return slaFields(form)
    default:
      return []
  }
}

function isOptionalOnlyStep(fields: StepField[]): boolean {
  return fields.length === 0 || fields.every((field) => !field.required)
}

function stepHasAnyData(stepId: ClientFormStepId, form: ClientFormInput): boolean {
  switch (stepId) {
    case 'contact':
      return Boolean(
        textFilled(form.email) ||
          textFilled(form.phone) ||
          textFilled(resolveCountryName(form.country)) ||
          textFilled(form.city) ||
          textFilled(form.address),
      )
    case 'financial':
      return Boolean(
        (form.paymentCurrencies?.length ?? 0) > 0 ||
          (form.preferredPaymentMethods?.length ?? 0) > 0 ||
          textFilled(form.paymentTermId) ||
          textFilled(form.billingNotes) ||
          (form.creditLimit ?? 0) > 0,
      )
    case 'membership':
      return isClientMember(form.membership)
    case 'commercial':
      return (
        isClientCommercialRegistrationProvided(form.commercialRegistration) ||
        isClientTaxRegistrationProvided(form.taxRegistration)
      )
    default:
      return false
  }
}

export function getClientFormStepCompletion(
  form: ClientFormInput,
  stepId: ClientFormStepId,
): ClientFormStepCompletion {
  const fields = getStepFields(stepId, form.type, form)
  const requiredFields = fields.filter((field) => field.required)
  const optionalOnly = isOptionalOnlyStep(fields)

  if (optionalOnly) {
    return {
      complete: false,
      optional: true,
      filledCount: 0,
      totalCount: 0,
      missingLabels: [],
    }
  }

  const missingLabels = requiredFields
    .filter((field) => !field.isFilled(form))
    .map((field) => field.label)

  return {
    complete: missingLabels.length === 0,
    optional: false,
    filledCount: requiredFields.length - missingLabels.length,
    totalCount: requiredFields.length,
    missingLabels,
  }
}

export function isClientFormStepComplete(form: ClientFormInput, stepId: ClientFormStepId): boolean {
  return getClientFormStepCompletion(form, stepId).complete
}

export function formatClientFormStepRemaining(completion: ClientFormStepCompletion): string | null {
  if (completion.optional || completion.complete || completion.totalCount === 0) return null
  const remaining = completion.totalCount - completion.filledCount
  return remaining === 1 ? '1 field remaining' : `${remaining} fields remaining`
}

export function canNavigateToClientFormStep(
  stepId: ClientFormStepId,
  currentStep: ClientFormStepId,
  order: ClientFormStepId[],
  form: ClientFormInput,
  visitedSteps: Set<ClientFormStepId>,
): boolean {
  void currentStep
  void visitedSteps
  const targetIndex = order.indexOf(stepId)
  if (targetIndex === -1) return false
  if (stepId === 'basics') return true
  if (!isClientIdentityComplete(form)) return false
  return true
}

export type ClientFormStepStatus = 'complete' | 'incomplete' | 'optional' | 'pending'

export function resolveClientFormStepStatus(
  stepId: ClientFormStepId,
  currentStep: ClientFormStepId,
  order: ClientFormStepId[],
  form: ClientFormInput,
  visitedSteps: Set<ClientFormStepId>,
): ClientFormStepStatus {
  void order
  const completion = getClientFormStepCompletion(form, stepId)
  if (completion.optional) return 'optional'
  if (completion.complete) return 'complete'
  if (stepId === currentStep || visitedSteps.has(stepId) || completion.filledCount > 0) return 'incomplete'
  if (stepHasAnyData(stepId, form)) return 'incomplete'
  return 'pending'
}
