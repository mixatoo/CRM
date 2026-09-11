import { describe, expect, it } from 'vitest'
import {
  formatAmountDraftFromValue,
  parseAmountInput,
  sanitizeAmountDraft,
} from '@/shared/utils/amount-input'

describe('sanitizeAmountDraft', () => {
  it('allows decimal entry while typing', () => {
    expect(sanitizeAmountDraft('0.')).toBe('0.')
    expect(sanitizeAmountDraft('0.5')).toBe('0.5')
    expect(sanitizeAmountDraft('100.')).toBe('100.')
    expect(sanitizeAmountDraft('100.50')).toBe('100.50')
  })

  it('strips grouping separators and limits decimals', () => {
    expect(sanitizeAmountDraft('1,234.567', 2)).toBe('1234.56')
  })
})

describe('parseAmountInput', () => {
  it('parses decimal amounts', () => {
    expect(parseAmountInput('0.5')).toBe(0.5)
    expect(parseAmountInput('100.25')).toBe(100.25)
    expect(parseAmountInput('100.')).toBe(100)
  })
})

describe('formatAmountDraftFromValue', () => {
  it('keeps decimal fractions for editing', () => {
    expect(formatAmountDraftFromValue(0.5)).toBe('0.5')
    expect(formatAmountDraftFromValue(100.25)).toBe('100.25')
  })
})
