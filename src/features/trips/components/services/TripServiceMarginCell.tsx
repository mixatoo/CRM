import { AccountingAmount } from '@/design-system/components/AccountingAmount'
import { TRIP_SERVICE_FINANCIAL_AMOUNT } from '@/features/trips/components/services/service-styles'
import {
  tripServiceMargin,
  tripServiceMarginPercent,
} from '@/features/trips/components/services/trip-service-financial'
import { formatAccountingAmount } from '@/features/trips/utils/format'
import { cn } from '@/shared/utils/cn'

interface TripServiceMarginCellProps {
  cost: number
  selling: number
  currency: string
  inactive?: boolean
  className?: string
}

export function TripServiceMarginCell({
  cost,
  selling,
  currency,
  inactive,
  className,
}: TripServiceMarginCellProps) {
  if (inactive) {
    return (
      <span className={cn('block text-center text-xs text-[var(--color-muted)]', className)}>—</span>
    )
  }

  const margin = tripServiceMargin({ cost, selling })
  const percent = tripServiceMarginPercent({ cost, selling })
  const positive = margin >= 0
  const percentLabel = `${positive ? '+' : ''}${percent.toFixed(1)}%`

  return (
    <div
      className={cn('relative min-h-[2.75rem] w-full min-w-0', className)}
      title={`${percentLabel} · ${currency} ${formatAccountingAmount(margin)}`}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <AccountingAmount
          amount={margin}
          currency={currency}
          className="w-auto shrink-0 grid-cols-[auto_auto] items-baseline justify-center gap-x-1"
          currencyClassName={TRIP_SERVICE_FINANCIAL_AMOUNT.currency}
          amountClassName={cn(TRIP_SERVICE_FINANCIAL_AMOUNT.amount, 'text-right')}
        />
      </div>
      <span
        className={cn(
          'absolute left-1/2 top-[calc(50%+0.6rem)] -translate-x-1/2 text-[10px] font-normal tabular-nums leading-none',
          positive ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]',
        )}
      >
        {percentLabel}
      </span>
    </div>
  )
}
