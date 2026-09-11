export interface ClientCommercialRegistration {
  registrationNumber?: string
  registeredName?: string
  issuingAuthority?: string
  issuedDate?: string
  expiresDate?: string
  registeredAddress?: string
}

export interface ClientTaxRegistration {
  taxId?: string
  cardNumber?: string
  registeredName?: string
  issuingAuthority?: string
  issuedDate?: string
  expiresDate?: string
  activityCode?: string
}

function trimOptional(value?: string): string | undefined {
  const trimmed = value?.trim()
  return trimmed || undefined
}

function hasCommercialRegistrationValues(reg: ClientCommercialRegistration): boolean {
  return Boolean(
    trimOptional(reg.registrationNumber) ||
      trimOptional(reg.registeredName) ||
      trimOptional(reg.issuingAuthority) ||
      trimOptional(reg.issuedDate) ||
      trimOptional(reg.expiresDate) ||
      trimOptional(reg.registeredAddress),
  )
}

function hasTaxRegistrationValues(reg: ClientTaxRegistration): boolean {
  return Boolean(
    trimOptional(reg.taxId) ||
      trimOptional(reg.cardNumber) ||
      trimOptional(reg.registeredName) ||
      trimOptional(reg.issuingAuthority) ||
      trimOptional(reg.issuedDate) ||
      trimOptional(reg.expiresDate) ||
      trimOptional(reg.activityCode),
  )
}

export function isClientCommercialRegistrationProvided(reg?: ClientCommercialRegistration): boolean {
  if (!reg) return false
  return hasCommercialRegistrationValues(reg)
}

export function isClientTaxRegistrationProvided(reg?: ClientTaxRegistration): boolean {
  if (!reg) return false
  return hasTaxRegistrationValues(reg)
}

export function normalizeClientCommercialRegistration(
  reg?: ClientCommercialRegistration,
): ClientCommercialRegistration | undefined {
  if (!reg) return undefined
  const normalized: ClientCommercialRegistration = {
    registrationNumber: trimOptional(reg.registrationNumber),
    registeredName: trimOptional(reg.registeredName),
    issuingAuthority: trimOptional(reg.issuingAuthority),
    issuedDate: trimOptional(reg.issuedDate),
    expiresDate: trimOptional(reg.expiresDate),
    registeredAddress: trimOptional(reg.registeredAddress),
  }
  return hasCommercialRegistrationValues(normalized) ? normalized : undefined
}

export function normalizeClientTaxRegistration(reg?: ClientTaxRegistration): ClientTaxRegistration | undefined {
  if (!reg) return undefined
  const normalized: ClientTaxRegistration = {
    taxId: trimOptional(reg.taxId),
    cardNumber: trimOptional(reg.cardNumber),
    registeredName: trimOptional(reg.registeredName),
    issuingAuthority: trimOptional(reg.issuingAuthority),
    issuedDate: trimOptional(reg.issuedDate),
    expiresDate: trimOptional(reg.expiresDate),
    activityCode: trimOptional(reg.activityCode),
  }
  return hasTaxRegistrationValues(normalized) ? normalized : undefined
}

export function patchClientCommercialRegistration(
  current: ClientCommercialRegistration | undefined,
  patch: Partial<ClientCommercialRegistration>,
): ClientCommercialRegistration | undefined {
  return normalizeClientCommercialRegistration({ ...current, ...patch })
}

export function patchClientTaxRegistration(
  current: ClientTaxRegistration | undefined,
  patch: Partial<ClientTaxRegistration>,
): ClientTaxRegistration | undefined {
  return normalizeClientTaxRegistration({ ...current, ...patch })
}
