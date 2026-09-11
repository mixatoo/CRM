export const amountInputClassName =
  'tabular-nums text-right [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'

/** Keep only digits and at most one decimal point while typing. */
export function sanitizeAmountDraft(raw: string, maxDecimals = 2, allowNegative = false): string {
  let cleaned = raw.replace(/,/g, '').replace(/\s/g, '')

  if (allowNegative && cleaned === '-') return '-'

  const negative = allowNegative && cleaned.startsWith('-')
  cleaned = cleaned.replace(/-/g, '').replace(/[^\d.]/g, '')

  const dotIndex = cleaned.indexOf('.')
  const intPart = (dotIndex === -1 ? cleaned : cleaned.slice(0, dotIndex)).replace(/^0+(?=\d)/, '')
  const decPart =
    dotIndex === -1 ? '' : cleaned.slice(dotIndex + 1).replace(/\./g, '').slice(0, maxDecimals)

  if (dotIndex === -1) {
    const result = intPart
    return negative && result ? `-${result}` : result
  }

  const withDot = `${intPart || '0'}.${decPart}`
  if (decPart.length === 0 && raw.endsWith('.')) {
    const trailing = `${intPart || '0'}.`
    return negative ? `-${trailing}` : trailing
  }

  return negative && withDot !== '0.' ? `-${withDot}` : withDot
}

export function parseAmountInput(
  raw: string,
  options?: { decimals?: number; min?: number },
): number {
  const decimals = options?.decimals ?? 2
  const min = options?.min ?? 0
  const cleaned = raw.replace(/,/g, '').replace(/\s/g, '').trim()

  if (!cleaned || cleaned === '.' || cleaned === '-' || cleaned === '-.') return 0

  const parsed = Number(cleaned)
  if (!Number.isFinite(parsed)) return 0

  const factor = 10 ** decimals
  const rounded = Math.round(parsed * factor) / factor
  return min === -Infinity ? rounded : Math.max(min, rounded)
}

export function formatAmountInputValue(
  amount: number,
  options?: { decimals?: number; emptyWhenZero?: boolean },
): string {
  const decimals = options?.decimals ?? 2
  const emptyWhenZero = options?.emptyWhenZero ?? true

  if (amount === 0 && emptyWhenZero) return ''

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}

export function formatAmountDraftFromValue(amount: number, decimals = 2): string {
  if (amount === 0) return ''
  return String(parseAmountInput(String(amount), { decimals, min: -Infinity }))
}
