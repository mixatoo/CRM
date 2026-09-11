import type { TripPayment } from '@/domain/entities/trip-payment'
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from '@/domain/entities/trip-payment'
import { AccountingAmount } from '@/design-system/components/AccountingAmount'
import { DataTableEmptyRow } from '@/design-system/components/DataTableEmptyState'
import { StickyDataTable } from '@/design-system/components/StickyDataTable'
import { Skeleton } from '@/design-system/components/Skeleton'
import { tableCellClass } from '@/design-system/components/table-styles'
import { formatDate } from '@/shared/utils/date-format'
import { cn } from '@/shared/utils/cn'

interface TripPaymentsTableProps {
  payments: TripPayment[]
  invoiceNumbers: Record<string, string>
  isLoading?: boolean
  canVoid?: boolean
  onVoid?: (payment: TripPayment) => void
}

export function TripPaymentsTable({
  payments,
  invoiceNumbers,
  isLoading,
  canVoid,
  onVoid,
}: TripPaymentsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <StickyDataTable fill freezeFirstColumn={false}>
      <thead>
        <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]/80">
          <th className={tableCellClass('left', { extra: 'font-medium' })}>Date</th>
          <th className={tableCellClass('left', { extra: 'font-medium' })}>Direction</th>
          <th className={tableCellClass('left', { extra: 'font-medium' })}>Method</th>
          <th className={tableCellClass('left', { extra: 'font-medium' })}>Reference</th>
          <th className={tableCellClass('left', { extra: 'font-medium' })}>Invoice</th>
          <th className={tableCellClass('right', { extra: 'font-medium' })}>Amount</th>
          <th className={tableCellClass('left', { extra: 'font-medium' })}>Status</th>
          {canVoid ? <th className={tableCellClass('right', { extra: 'font-medium' })} /> : null}
        </tr>
      </thead>
      <tbody>
        {payments.length === 0 ? (
          <DataTableEmptyRow
            colSpan={canVoid ? 8 : 7}
            title="No payments recorded"
            description="Record client receipts or supplier disbursements for this trip."
          />
        ) : (
          payments.map((payment) => (
            <tr key={payment.id} className="border-b border-[var(--color-border)]">
              <td className={tableCellClass('left', { numeric: true })}>{formatDate(payment.paidAt)}</td>
              <td className={tableCellClass('left')}>
                <span
                  className={cn(
                    'text-xs font-medium capitalize',
                    payment.direction === 'inbound' ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]',
                  )}
                >
                  {payment.direction === 'inbound' ? 'Client receipt' : 'Supplier payment'}
                </span>
              </td>
              <td className={tableCellClass('left', { extra: 'text-sm' })}>
                {PAYMENT_METHOD_LABELS[payment.method]}
              </td>
              <td className={tableCellClass('left', { extra: 'font-mono text-xs' })}>
                {payment.reference ?? '—'}
              </td>
              <td className={tableCellClass('left', { extra: 'font-mono text-xs' })}>
                {payment.invoiceId ? invoiceNumbers[payment.invoiceId] ?? '—' : '—'}
              </td>
              <td className={tableCellClass('right')}>
                <AccountingAmount amount={payment.amount} currency={payment.currency} />
              </td>
              <td className={tableCellClass('left', { extra: 'text-xs' })}>
                {PAYMENT_STATUS_LABELS[payment.status]}
              </td>
              {canVoid ? (
                <td className={tableCellClass('right')}>
                  {payment.status !== 'void' ? (
                    <button
                      type="button"
                      className="text-xs text-[var(--color-danger)] hover:underline"
                      onClick={() => onVoid?.(payment)}
                    >
                      Void
                    </button>
                  ) : null}
                </td>
              ) : null}
            </tr>
          ))
        )}
      </tbody>
    </StickyDataTable>
  )
}
