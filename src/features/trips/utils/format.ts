import { formatDate } from '@/shared/utils/date-format'

export function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

/** Number portion of accounting format (currency shown separately). */
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

/** @deprecated Use AccountingAmount + formatAccountingAmount for split currency/amount columns. */
export function formatMoneyAccounting(amount: number, currency: string) {
  if (amount === 0) return '—'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    currencySign: 'accounting',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatCount(value: number) {
  return String(value).padStart(2, '0')
}

export function formatPersonCount(adults: number, minors: number) {
  return String(adults + minors)
}

export function formatTripDate(trip: { startDate?: string; bookingStartedAt?: string }) {
  return formatDate(trip.startDate ?? trip.bookingStartedAt)
}

export function tripClientName(trip: { mainContactName?: string }) {
  return trip.mainContactName?.trim() || '—'
}

export function truncateText(text: string, max = 18) {
  return text.length > max ? `${text.slice(0, max)}...` : text
}

export { formatDate, formatDateTime } from '@/shared/utils/date-format'
