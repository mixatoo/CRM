import type { ClientCreditCardBrand } from '@/domain/entities/client-credit-card'

export function clientCreditCardBrandTone(brand?: ClientCreditCardBrand): string {
  switch (brand) {
    case 'visa':
      return 'text-sky-600 dark:text-sky-400'
    case 'mastercard':
      return 'text-orange-600 dark:text-orange-400'
    case 'amex':
      return 'text-teal-600 dark:text-teal-400'
    case 'discover':
      return 'text-amber-600 dark:text-amber-400'
    default:
      return 'text-[var(--color-muted)]'
  }
}
