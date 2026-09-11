import type { Client, ClientType } from '@/domain/entities/client'

/** Profile identity fields shown only for individual clients in forms and profile tabs. */
export const CLIENT_INDIVIDUAL_ONLY_FIELDS = [
  'firstName',
  'middleName',
  'lastName',
  'dateOfBirth',
  'gender',
  'jobTitle',
] as const satisfies readonly (keyof Client)[]

/** Profile identity fields shown only for corporate clients in forms and profile tabs. */
export const CLIENT_CORPORATE_ONLY_FIELDS = [
  'company',
  'industry',
  'commercialRegistration',
  'taxRegistration',
] as const satisfies readonly (keyof Client)[]

export type ClientIndividualOnlyField = (typeof CLIENT_INDIVIDUAL_ONLY_FIELDS)[number]
export type ClientCorporateOnlyField = (typeof CLIENT_CORPORATE_ONLY_FIELDS)[number]

/** Dashboard Account Information rows that exist in the client workspace today. */
export type ClientDashboardAccountField =
  | 'accountManager'
  | 'industry'
  | 'source'
  | 'email'
  | 'phone'
  | 'location'

const DASHBOARD_ACCOUNT_FIELDS: Record<ClientType, ClientDashboardAccountField[]> = {
  individual: ['accountManager', 'source', 'email', 'phone', 'location'],
  corporate: ['accountManager', 'industry', 'source', 'email', 'phone', 'location'],
}

export function isClientFieldVisibleForType(field: keyof Client, type: ClientType): boolean {
  if ((CLIENT_INDIVIDUAL_ONLY_FIELDS as readonly string[]).includes(field)) {
    return type === 'individual'
  }
  if ((CLIENT_CORPORATE_ONLY_FIELDS as readonly string[]).includes(field)) {
    return type === 'corporate'
  }
  return true
}

export function getClientDashboardAccountFields(type: ClientType): ClientDashboardAccountField[] {
  return DASHBOARD_ACCOUNT_FIELDS[type]
}

export function stripClientFieldsForType<T extends Record<string, unknown>>(
  input: T,
  type: ClientType,
): T {
  const next: Record<string, unknown> = { ...input }

  if (type === 'individual') {
    next.company = ''
    next.industry = undefined
    next.commercialRegistration = undefined
    next.taxRegistration = undefined
    return next as T
  }

  next.firstName = ''
  next.middleName = ''
  next.lastName = ''
  next.dateOfBirth = undefined
  next.gender = undefined
  next.jobTitle = ''
  return next as T
}
