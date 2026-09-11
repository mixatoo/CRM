import { describe, expect, it } from 'vitest'
import {
  detectCreditCardBrandFromNumber,
  formatCreditCardCvvInput,
  formatCreditCardExpiryInput,
  formatCreditCardNumberInput,
  passesLuhnCheck,
  validateCreditCardNumberInput,
} from '@/domain/entities/client-credit-card-input'

describe('client-credit-card-input', () => {
  it('formats card numbers in 4-digit groups', () => {
    expect(formatCreditCardNumberInput('4111111111111111', 'visa')).toBe('4111 1111 1111 1111')
  })

  it('formats amex numbers as 4-6-5', () => {
    expect(formatCreditCardNumberInput('378282246310005', 'amex')).toBe('3782 822463 10005')
  })

  it('formats expiry as MM/YY while typing', () => {
    expect(formatCreditCardExpiryInput('12')).toBe('12')
    expect(formatCreditCardExpiryInput('1228')).toBe('12/28')
    expect(formatCreditCardExpiryInput('1', '12/')).toBe('1')
  })

  it('detects visa from card number prefix', () => {
    expect(detectCreditCardBrandFromNumber('4111')).toBe('visa')
  })

  it('limits cvv length by brand', () => {
    expect(formatCreditCardCvvInput('12345', 'visa')).toBe('123')
    expect(formatCreditCardCvvInput('12345', 'amex')).toBe('1234')
  })

  it('validates luhn for test visa number', () => {
    expect(passesLuhnCheck('4111111111111111')).toBe(true)
    expect(validateCreditCardNumberInput('4111 1111 1111 1111', 'visa')).toBe(true)
  })
})
