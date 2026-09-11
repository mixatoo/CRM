export type ClientCreditCardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'other'

export interface ClientCreditCard {
  id: string
  /** FK to the account (`Client.id`). */
  clientId: string
  /** Optional user label for the card. */
  cardName?: string
  brand: ClientCreditCardBrand
  /** @deprecated Legacy full PAN — never written for new cards; use last4 only. */
  cardNumber?: string
  /** Last 4 digits — indexed for quick display. */
  last4: string
  expMonth: number
  expYear: number
  /** @deprecated CVV is validated at entry time only and is never persisted. */
  cvv?: string
  /** If true, this card is the default saved card. */
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ClientCreditCardInput {
  clientId: string
  cardName?: string
  brand: ClientCreditCardBrand
  cardNumber: string
  expMonth: number
  expYear: number
  cvv: string
  isActive?: boolean
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

function normalizeCardNumber(cardNumber: string): { cardNumber: string; last4: string } | null {
  const digits = digitsOnly(cardNumber)
  if (digits.length < 13 || digits.length > 19) return null
  return { cardNumber: digits, last4: digits.slice(-4) }
}

function normalizeCvv(cvv: string): string | null {
  const digits = digitsOnly(cvv)
  if (digits.length < 3 || digits.length > 4) return null
  return digits
}

export function parseClientCreditCardExpiry(
  expiry: string,
): { expMonth: number; expYear: number } | null {
  const match = expiry.trim().match(/^(\d{1,2})\s*\/\s*(\d{2,4})$/)
  if (!match) return null

  const expMonth = Number.parseInt(match[1], 10)
  let expYear = Number.parseInt(match[2], 10)
  if (expYear < 100) expYear += 2000

  if (expMonth < 1 || expMonth > 12) return null
  if (expYear < 2000 || expYear > 2099) return null

  return { expMonth, expYear }
}

export function normalizeClientCreditCardInput(
  input: ClientCreditCardInput,
): Omit<ClientCreditCard, 'id' | 'createdAt' | 'updatedAt'> {
  const cardNumberNormalized = normalizeCardNumber(input.cardNumber)
  if (!cardNumberNormalized) {
    throw new Error('Invalid card number. Enter 13–19 digits.')
  }

  const cvvNormalized = normalizeCvv(input.cvv)
  if (!cvvNormalized) {
    throw new Error('Invalid CVV. Enter 3 or 4 digits.')
  }

  const expMonth =
    input.expMonth == null || Number.isNaN(input.expMonth)
      ? NaN
      : Math.min(12, Math.max(1, Math.trunc(input.expMonth)))

  const expYear =
    input.expYear == null || Number.isNaN(input.expYear)
      ? NaN
      : Math.trunc(input.expYear >= 100 ? input.expYear : 2000 + input.expYear)

  if (Number.isNaN(expMonth) || Number.isNaN(expYear)) {
    throw new Error('Expiry date is required (MM/YY).')
  }

  return {
    clientId: input.clientId,
    cardName: input.cardName?.trim() || undefined,
    brand: input.brand,
    last4: cardNumberNormalized.last4,
    expMonth,
    expYear,
    isActive: input.isActive ?? true,
  }
}

export function formatClientCreditCardLabel(card: ClientCreditCard): string {
  const brandLabel = getClientCreditCardBrandLabel(card.brand)
  const base = `${brandLabel} •••• ${card.last4}`
  return card.cardName?.trim() ? `${card.cardName.trim()} (${base})` : base
}

export function getClientCreditCardBrandLabel(brand?: ClientCreditCardBrand): string {
  switch (brand) {
    case 'visa':
      return 'Visa'
    case 'mastercard':
      return 'Mastercard'
    case 'amex':
      return 'Amex'
    case 'discover':
      return 'Discover'
    case 'other':
      return 'Card'
    default:
      return 'Card'
  }
}

export function formatClientCreditCardMask(
  card: Pick<ClientCreditCard, 'cardNumber' | 'last4'>,
): string {
  const last4 = card.last4?.trim() || digitsOnly(card.cardNumber ?? '').slice(-4) || '0000'
  return `•••• •••• •••• ${last4}`
}

export function formatClientCreditCardCvv(): string {
  return '—'
}

export function formatClientCreditCardExpiry(
  card: Pick<ClientCreditCard, 'expMonth' | 'expYear'>,
): string {
  if (card.expMonth == null || card.expYear == null) return '—'
  return `${String(card.expMonth).padStart(2, '0')}/${String(card.expYear).slice(-2)}`
}

export type ClientCreditCardExpiryStatus = 'valid' | 'expiring' | 'expired'

export function getClientCreditCardExpiryStatus(
  card: Pick<ClientCreditCard, 'expMonth' | 'expYear'>,
): ClientCreditCardExpiryStatus {
  if (card.expMonth == null || card.expYear == null) return 'valid'

  const now = new Date()
  const expiry = new Date(card.expYear, card.expMonth, 0)
  if (expiry < now) return 'expired'

  const warning = new Date(now)
  warning.setMonth(warning.getMonth() + 3)
  if (expiry <= warning) return 'expiring'

  return 'valid'
}
