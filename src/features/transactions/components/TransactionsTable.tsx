import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { ExternalLink, Inbox } from 'lucide-react'
import type { TripPayment } from '@/domain/entities/trip-payment'
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from '@/domain/entities/trip-payment'
import { AccountingAmount } from '@/design-system/components/AccountingAmount'
import { DataTableEmptyRow } from '@/design-system/components/DataTableEmptyState'
import { DataTableShell } from '@/design-system/layout/DataTableShell'
import { StickyDataTable } from '@/design-system/components/StickyDataTable'
import { Pagination } from '@/design-system/components/Pagination'
import { Skeleton } from '@/design-system/components/Skeleton'
import { EntityLabelChips } from '@/features/labels/components/EntityLabelChips'
import { useEntityLabelAssignments } from '@/features/labels/hooks/use-labels'
import { tableCellClass, tableHeadClass } from '@/design-system/components/table-styles'
import { formatDate } from '@/shared/utils/date-format'
import type { PaginatedResult, PageSizeOption } from '@/types/pagination'
import { cn } from '@/shared/utils/cn'

interface TransactionsTableProps {
  toolbar?: React.ReactNode
  result?: PaginatedResult<TripPayment>
  tripRefs: Record<string, string>
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: PageSizeOption) => void
  isLoading?: boolean
  isFetching?: boolean
}

export function TransactionsTable({
  toolbar,
  result,
  tripRefs,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isLoading,
  isFetching,
}: TransactionsTableProps) {
  const payments = result?.items ?? []
  const paymentIds = useMemo(() => payments.map((payment) => payment.id), [payments])
  const { data: labelsByTarget } = useEntityLabelAssignments('payment', paymentIds)
  const total = result?.total ?? 0
  const totalPages = total > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1

  return (
    <DataTableShell
      className="h-full"
      header={toolbar}
      headerClassName="p-0"
      isFetching={isFetching && !isLoading}
      footer={
        <Pagination
          compact
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      }
    >
      <StickyDataTable fill freezeFirstColumn={false} tableClassName="table-fixed text-sm">
        <thead>
          <tr>
            <th className={tableHeadClass('left')}>Date</th>
            <th className={tableHeadClass('left')}>Trip</th>
            <th className={tableHeadClass('left')}>Direction</th>
            <th className={tableHeadClass('left')}>Counterparty</th>
            <th className={tableHeadClass('left')}>Method</th>
            <th className={tableHeadClass('left')}>Reference</th>
            <th className={tableHeadClass('right')}>Amount</th>
            <th className={tableHeadClass('left')}>Labels</th>
            <th className={tableHeadClass('center')}>Status</th>
            <th className={tableHeadClass('center')} aria-label="Open" />
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <tr key={i} className="border-b border-[var(--color-border)]">
                {Array.from({ length: 10 }).map((__, j) => (
                  <td key={j} className={tableCellClass('left')}>
                    <Skeleton className="h-3.5 w-full max-w-[6rem]" />
                  </td>
                ))}
              </tr>
            ))
          ) : payments.length === 0 ? (
            <DataTableEmptyRow
              colSpan={10}
              icon={Inbox}
              title="No transactions found"
              description="Adjust filters or record payments on trip workspaces."
            />
          ) : (
            payments.map((payment) => (
              <tr key={payment.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className={tableCellClass('left', { numeric: true, extra: 'text-xs' })}>
                  {formatDate(payment.paidAt)}
                </td>
                <td className={tableCellClass('left', { extra: 'font-mono text-xs text-[var(--color-accent)]' })}>
                  {tripRefs[payment.tripId] ?? '—'}
                </td>
                <td className={tableCellClass('left')}>
                  <span
                    className={cn(
                      'text-xs font-medium',
                      payment.direction === 'inbound' ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]',
                    )}
                  >
                    {payment.direction === 'inbound' ? 'Receipt' : 'Disbursement'}
                  </span>
                </td>
                <td className={tableCellClass('left', { extra: 'truncate' })} title={payment.counterpartyName}>
                  {payment.counterpartyName ?? '—'}
                </td>
                <td className={tableCellClass('left', { muted: true, extra: 'text-xs' })}>
                  {PAYMENT_METHOD_LABELS[payment.method]}
                </td>
                <td className={tableCellClass('left', { extra: 'font-mono text-xs' })}>{payment.reference ?? '—'}</td>
                <td className={tableCellClass('right')}>
                  <AccountingAmount amount={payment.amount} currency={payment.currency} className="min-w-0" />
                </td>
                <td className={tableCellClass('left', { extra: 'px-2' })}>
                  <EntityLabelChips labels={labelsByTarget?.get(payment.id) ?? []} maxVisible={2} nowrap />
                </td>
                <td className={tableCellClass('center', { muted: true, extra: 'text-xs' })}>
                  {PAYMENT_STATUS_LABELS[payment.status]}
                </td>
                <td className={tableCellClass('center')}>
                  <Link
                    to={`/trips/${payment.tripId}/payments`}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-accent)]"
                    aria-label="Open trip payments"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </StickyDataTable>
    </DataTableShell>
  )
}
