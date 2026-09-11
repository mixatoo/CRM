import type { ClientCreditCardBrand } from '@/domain/entities/client-credit-card'
import { parseClientCreditCardExpiry } from '@/domain/entities/client-credit-card'

export function creditCardDigitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

export function detectCreditCardBrandFromNumber(digits: string): ClientCreditCardBrand {
  if (/^3[47]/.test(digits)) return 'amex'
  if (/^4/.test(digits)) return 'visa'
  if (/^5[1-5]/.test(digits)) return 'mastercard'
  if (/^(222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(digits)) return 'mastercard'
  if (/^(6011|65|64[4-9])/.test(digits)) return 'discover'
  return 'other'
}

export function getCreditCardNumberMaxDigits(brand: ClientCreditCardBrand): number {
  switch (brand) {
    case 'amex':
      return 15
    case 'visa':
      return 19
    default:
      return 16
  }
}

export function getCreditCardCvvMaxLength(brand: ClientCreditCardBrand): number {
  return brand === 'amex' ? 4 : 3
}

export function formatCreditCardNumberInput(
  value: string,
  brand: ClientCreditCardBrand = 'other',
): string {
  const digits = creditCardDigitsOnly(value).slice(0, getCreditCardNumberMaxDigits(brand))

  if (brand === 'amex') {
    const chunks = [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)].filter(Boolean)
    return chunks.join(' ')
  }

  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

export function formatCreditCardExpiryInput(value: string, previousValue = ''): string {
  const digits = creditCardDigitsOnly(value).slice(0, 4)

  if (
    value.length < previousValue.length &&
    previousValue.endsWith('/') &&
    digits.length === 2 &&
    !value.includes('/')
  ) {
    return digits.slice(0, 1)
  }

  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

export function formatCreditCardCvvInput(value: string, brand: ClientCreditCardBrand): string {
  return creditCardDigitsOnly(value).slice(0, getCreditCardCvvMaxLength(brand))
}

export function passesLuhnCheck(digits: string): boolean {
  if (!/^\d{13,19}$/.test(digits)) return false

  let sum = 0
  let shouldDouble = false

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number.parseInt(digits[index] ?? '0', 10)
    if (shouldDouble) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    shouldDouble = !shouldDouble
  }

  return sum % 10 === 0
}

export function isValidCreditCardNumberLength(
  digits: string,
  brand: ClientCreditCardBrand,
): boolean {
  const length = digits.length

  switch (brand) {
    case 'amex':
      return length === 15
    case 'mastercard':
    case 'discover':
      return length === 16
    case 'visa':
      return length >= 13 && length <= 19
    default:
      return length >= 13 && length <= 19
  }
}

export function resolveCreditCardBrandForValidation(
  digits: string,
  selectedBrand: ClientCreditCardBrand,
): ClientCreditCardBrand {
  const detected = detectCreditCardBrandFromNumber(digits)
  return detected !== 'other' ? detected : selectedBrand
}

export function validateCreditCardNumberInput(
  value: string,
  selectedBrand: ClientCreditCardBrand,
): string | true {
  const digits = creditCardDigitsOnly(value)
  if (!digits) return 'Card number is required'

  const brand = resolveCreditCardBrandForValidation(digits, selectedBrand)
  if (!isValidCreditCardNumberLength(digits, brand)) {
    return brand === 'amex' ? 'Enter 15 digits' : 'Enter a valid card number'
  }
  if (!passesLuhnCheck(digits)) return 'Enter a valid card number'
  return true
}

export function validateCreditCardCvvInput(
  value: string,
  brand: ClientCreditCardBrand,
): string | true {
  const digits = creditCardDigitsOnly(value)
  if (!digits) return 'CVV is required'

  const expected = getCreditCardCvvMaxLength(brand)
  if (brand === 'other') {
    return digits.length >= 3 && digits.length <= 4 ? true : 'Enter 3 or 4 digits'
  }
  if (digits.length !== expected) {
    return expected === 4 ? 'Enter 4 digits' : 'Enter 3 digits'
  }
  return true
}

export function isCreditCardNumberComplete(
  value: string,
  selectedBrand: ClientCreditCardBrand,
): boolean {
  const digits = creditCardDigitsOnly(value)
  if (!digits) return false

  const brand = resolveCreditCardBrandForValidation(digits, selectedBrand)
  return isValidCreditCardNumberLength(digits, brand) && passesLuhnCheck(digits)
}

export function isCreditCardExpiryComplete(value: string): boolean {
  return parseClientCreditCardExpiry(value) != null
}
