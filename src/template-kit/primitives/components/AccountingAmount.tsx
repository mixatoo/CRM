import { formatAccountingAmount } from '../utils/format-accounting'
import { cn } from '../utils/cn'

interface AccountingAmountProps {
  amount: number
  currency: string
  className?: string
  currencyClassName?: string
  amountClassName?: string
  /** When false, shows the full value (e.g. 99,999,999.00) without ellipsis. */
  truncate?: boolean
}

export function AccountingAmount({
  amount,
  currency,
  className,
  currencyClassName,
  amountClassName,
  truncate = true,
}: AccountingAmountProps) {
  return (
    <div
      className={cn(
        'grid min-w-0 items-baseline',
        truncate
          ? 'w-full grid-cols-[2rem_minmax(0,1fr)] gap-x-1.5'
          : 'w-auto max-w-full shrink-0 grid-cols-[auto_auto] justify-end gap-x-2',
        className,
      )}
    >
      <span className={cn('text-left text-sm text-[var(--color-muted)]', currencyClassName)}>{currency}</span>
      <span
        className={cn(
          'text-right text-sm font-normal tabular-nums',
          truncate ? 'min-w-0 truncate' : 'min-w-[14ch] whitespace-nowrap',
          amountClassName,
        )}
      >
        {formatAccountingAmount(amount)}
      </span>
    </div>
  )
}
