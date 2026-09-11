import type { ClientSlaAgreement, ClientSlaResponseTarget } from '@/domain/entities/client-sla'
import { CLIENT_SLA_RESPONSE_TARGET_KEYS, isSlaAgreementEngaged } from '@/domain/entities/client-sla'

export type SlaValidationErrors = Partial<Record<string, string>>

function validateResponseTarget(
  target: ClientSlaResponseTarget | undefined,
  prefix: string,
): SlaValidationErrors {
  if (!target?.preset) return {}
  if (target.preset === 'custom' && !target.customValue?.trim()) {
    return { [prefix]: 'Custom value is required' }
  }
  return {}
}

/** Validates only fields shown in the Add Client SLA essentials form. */
export function validateSlaAgreement(agreement?: ClientSlaAgreement): SlaValidationErrors {
  if (!isSlaAgreementEngaged(agreement)) return {}

  const errors: SlaValidationErrors = {}
  const sla = agreement!

  if (sla.level === 'custom' && !sla.customName?.trim()) {
    errors.customName = 'SLA name is required for custom agreements'
  }

  for (const key of CLIENT_SLA_RESPONSE_TARGET_KEYS) {
    Object.assign(errors, validateResponseTarget(sla[key], key))
  }

  if (sla.effectiveDate && sla.expiryDate && sla.expiryDate < sla.effectiveDate) {
    errors.expiryDate = 'Expiry date must be on or after the effective date'
  }

  return errors
}

export function hasSlaValidationErrors(errors: SlaValidationErrors): boolean {
  return Object.keys(errors).length > 0
}

export function slaFieldError(errors: SlaValidationErrors, key: string): string | undefined {
  return errors[key]
}
