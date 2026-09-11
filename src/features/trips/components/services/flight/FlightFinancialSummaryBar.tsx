import type { FlightServiceFinancialSummary } from '@/domain/flight/types'
import { PAYMENT_STATUS_LABELS } from '@/domain/flight/types'
import { AccountingAmount } from '@/design-system/components/AccountingAmount'
import { cn } from '@/shared/utils/cn'
import { layout } from '@/design-system/tokens/layout'

interface FlightFinancialSummaryBarProps {
  summary?: FlightServiceFinancialSummary
  className?: string
}

function Metric({
  label,
  amount,
  currency,
  highlight,
}: {
  label: string
  amount: number
  currency: string
  highlight?: 'positive' | 'negative' | 'warning'
}) {
  return (
    <div className="min-w-0 flex-1 px-3 py-2">
      <p className={cn(layout.caption, 'truncate')}>{label}</p>
      <AccountingAmount
        amount={amount}
        currency={currency}
        className="mt-0.5"
        amountClassName={cn(
          highlight === 'positive' && 'text-emerald-600',
          highlight === 'negative' && 'text-red-600',
          highlight === 'warning' && 'text-amber-600',
        )}
      />
    </div>
  )
}

export function FlightFinancialSummaryBar({ summary, className }: FlightFinancialSummaryBarProps) {
  if (!summary) return null
  const currency = summary.currency

  return (
    <div
      className={cn(
        'flex flex-wrap divide-x divide-[var(--color-border)] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]',
        className,
      )}
    >
      <Metric label="Supplier Cost" amount={summary.supplierCost} currency={currency} />
      <Metric label="Selling Price" amount={summary.sellingPrice} currency={currency} />
      <Metric
        label="Gross Profit"
        amount={summary.grossProfit}
        currency={currency}
        highlight={summary.grossProfit >= 0 ? 'positive' : 'negative'}
      />
      <Metric
        label="Net Profit"
        amount={summary.netProfit}
        currency={currency}
        highlight={summary.netProfit >= 0 ? 'positive' : 'negative'}
      />
      <Metric label="Collected" amount={summary.amountCollected} currency={currency} />
      <Metric
        label="Outstanding"
        amount={summary.amountOutstanding}
        currency={currency}
        highlight={summary.amountOutstanding > 0 ? 'warning' : undefined}
      />
      <div className="min-w-0 flex-1 px-3 py-2">
        <p className={cn(layout.caption, 'truncate')}>Payment</p>
        <p className="mt-1 text-sm font-medium tabular-nums">
          {PAYMENT_STATUS_LABELS[summary.paymentStatus]}
          <span className="ml-2 text-[var(--color-muted)]">
            · {summary.issuedCount}/{summary.ticketCount} issued
          </span>
        </p>
      </div>
    </div>
  )
}
