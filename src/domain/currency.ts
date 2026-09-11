/** System base currency — all reports and rollups convert to EGP. */
export const BASE_CURRENCY = 'EGP'

const FALLBACK_CURRENCY_CODES = [
  'EGP',
  'USD',
  'EUR',
  'GBP',
  'SAR',
  'AED',
  'QAR',
  'KWD',
  'BHD',
  'OMR',
  'JOD',
  'TRY',
  'CHF',
  'CAD',
  'AUD',
  'JPY',
  'CNY',
  'INR',
  'PKR',
  'NGN',
  'ZAR',
  'RUB',
  'BRL',
  'MXN',
  'SGD',
  'HKD',
  'NZD',
  'SEK',
  'NOK',
  'DKK',
  'PLN',
  'CZK',
  'HUF',
  'RON',
  'BGN',
  'ILS',
  'THB',
  'MYR',
  'IDR',
  'PHP',
  'KRW',
  'TWD',
  'VND',
  'MAD',
  'TND',
  'DZD',
  'LYD',
  'SDG',
  'ETB',
  'KES',
  'UGX',
  'GHS',
  'XOF',
  'XAF',
] as const

let currencyDisplayNames: Intl.DisplayNames | undefined

function getCurrencyDisplayNames(): Intl.DisplayNames | undefined {
  if (currencyDisplayNames) return currencyDisplayNames
  try {
    currencyDisplayNames = new Intl.DisplayNames(['en'], { type: 'currency' })
    return currencyDisplayNames
  } catch {
    return undefined
  }
}

/** All ISO currencies supported by the runtime (falls back to a travel-focused list). */
export function listCurrencyCodes(): string[] {
  if (typeof Intl !== 'undefined' && 'supportedValuesOf' in Intl) {
    try {
      const codes = Intl.supportedValuesOf('currency')
      return [...codes].sort((a, b) => a.localeCompare(b))
    } catch {
      // ignore
    }
  }
  return [...FALLBACK_CURRENCY_CODES]
}

export function getCurrencyLabel(code: string): string {
  const normalized = code.trim().toUpperCase()
  const names = getCurrencyDisplayNames()
  const name = names?.of(normalized)
  return name && name !== normalized ? `${normalized} — ${name}` : normalized
}

export function getCurrencyName(code: string): string {
  const label = getCurrencyLabel(code)
  const separator = ' — '
  const index = label.indexOf(separator)
  if (index >= 0) return label.slice(index + separator.length)
  return label
}

export function isBaseCurrency(currency: string): boolean {
  return currency.trim().toUpperCase() === BASE_CURRENCY
}

export function normalizeExchangeRate(currency: string, exchangeRate: number | undefined): number {
  if (isBaseCurrency(currency)) return 1
  const rate = exchangeRate ?? 0
  return rate > 0 ? rate : 0
}

/**
 * Convert an amount in `currency` to the system base currency (EGP).
 * `exchangeRate` = how many EGP equal 1 unit of `currency`.
 */
export function convertToBaseCurrency(amount: number, currency: string, exchangeRate: number): number {
  if (!amount) return 0
  if (isBaseCurrency(currency)) return roundCurrency(amount)
  const rate = normalizeExchangeRate(currency, exchangeRate)
  if (rate <= 0) return 0
  return roundCurrency(amount * rate)
}

export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100
}

export function defaultExchangeRate(currency: string): number {
  return getFallbackExchangeRateToBase(currency)
}

/** Demo / offline fallback — how many EGP equal 1 unit of `currency`. */
const FALLBACK_RATES_TO_EGP: Record<string, number> = {
  EGP: 1,
  USD: 50,
  EUR: 54,
  GBP: 63,
  SAR: 13.3,
  AED: 13.6,
  QAR: 13.7,
  KWD: 162,
  BHD: 132,
  OMR: 130,
  JOD: 70.5,
  CHF: 56,
  CAD: 36,
  AUD: 32,
  TRY: 1.55,
}

export function getFallbackExchangeRateToBase(currency: string): number {
  const code = currency.trim().toUpperCase()
  if (isBaseCurrency(code)) return 1
  return FALLBACK_RATES_TO_EGP[code] ?? 0
}

/** Convert between two currencies via the system base currency (EGP). */
export function convertBetweenCurrencies(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  fromExchangeRate?: number,
  toExchangeRate?: number,
): number {
  if (!amount) return 0
  const from = fromCurrency.trim().toUpperCase()
  const to = toCurrency.trim().toUpperCase()
  if (from === to) return roundCurrency(amount)

  const fromRate = normalizeExchangeRate(from, fromExchangeRate ?? getFallbackExchangeRateToBase(from))
  const toRate = normalizeExchangeRate(to, toExchangeRate ?? getFallbackExchangeRateToBase(to))
  if (fromRate <= 0 || toRate <= 0) return roundCurrency(amount)

  const inBase = convertToBaseCurrency(amount, from, fromRate)
  return roundCurrency(inBase / toRate)
}

export interface CurrencyFieldOption {
  value: string
  label: string
}

export function buildCurrencyOptions(preferred: string[] = [BASE_CURRENCY, 'USD', 'EUR', 'GBP', 'SAR', 'AED']): CurrencyFieldOption[] {
  const all = listCurrencyCodes()
  const preferredSet = new Set(preferred.map((c) => c.toUpperCase()))
  const ordered = [
    ...preferred.filter((c) => all.includes(c) || preferredSet.has(c)),
    ...all.filter((c) => !preferredSet.has(c)),
  ]
  const unique = [...new Set(ordered.map((c) => c.toUpperCase()))]
  return unique.map((value) => ({ value, label: getCurrencyLabel(value) }))
}
