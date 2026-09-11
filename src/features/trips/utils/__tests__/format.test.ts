import { describe, expect, it } from 'vitest'
import { formatAccountingAmount } from '@/features/trips/utils/format'

describe('formatAccountingAmount', () => {
  it('formats positive amounts with fixed decimals', () => {
    expect(formatAccountingAmount(6757)).toBe('6,757.00')
    expect(formatAccountingAmount(122323)).toBe('122,323.00')
  })

  it('formats negative amounts in parentheses', () => {
    expect(formatAccountingAmount(-4200)).toBe('(4,200.00)')
  })

  it('formats negative amounts with a minus sign when requested', () => {
    expect(formatAccountingAmount(-1_000_000, { negativeStyle: 'minus' })).toBe('−1,000,000.00')
  })

  it('shows dash for zero', () => {
    expect(formatAccountingAmount(0)).toBe('—')
  })
})
