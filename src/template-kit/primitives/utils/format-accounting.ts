/** Snapshot of accounting amount formatting — independent from project trips utils. */
export function formatAccountingAmount(
  amount: number,
  options?: { negativeStyle?: 'parentheses' | 'minus' },
): string {
  if (amount === 0) return '—'

  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount))

  if (amount < 0) {
    return options?.negativeStyle === 'minus' ? `−${formatted}` : `(${formatted})`
  }

  return formatted
}
