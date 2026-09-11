import type { Invoice } from '@/domain/entities/invoice'
import { invoiceBalanceDue } from '@/domain/entities/invoice'
import { AccountingAmount } from '@/design-system/components/AccountingAmount'
import { DataTableEmptyRow } from '@/design-system/components/DataTableEmptyState'
import { StickyDataTable } from '@/design-system/components/StickyDataTable'
import { Skeleton } from '@/design-system/components/Skeleton'
import { tableCellClass } from '@/design-system/components/table-styles'
import { InvoiceStatusBadge } from '@/features/trips/components/invoices/InvoiceStatusBadge'
import { formatDate } from '@/shared/utils/date-format'
import { cn } from '@/shared/utils/cn'

interface TripInvoicesTableProps {
  invoices: Invoice[]
  selectedId?: string | null
  onSelect: (invoice: Invoice) => void
  isLoading?: boolean
}

export function TripInvoicesTable({ invoices, selectedId, onSelect, isLoading }: TripInvoicesTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <StickyDataTable fill freezeFirstColumn={false}>
      <thead>
        <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]/80">
          <th className={tableCellClass('left', { extra: 'font-medium' })}>Invoice</th>
          <th className={tableCellClass('left', { extra: 'font-medium' })}>Client</th>
          <th className={tableCellClass('left', { extra: 'font-medium' })}>Issued</th>
          <th className={tableCellClass('left', { extra: 'font-medium' })}>Due</th>
          <th className={tableCellClass('right', { extra: 'font-medium' })}>Total</th>
          <th className={tableCellClass('right', { extra: 'font-medium' })}>Balance</th>
          <th className={tableCellClass('left', { extra: 'font-medium' })}>Status</th>
        </tr>
      </thead>
      <tbody>
        {invoices.length === 0 ? (
          <DataTableEmptyRow colSpan={7} title="No invoices yet" description="Create an invoice from trip services." />
        ) : (
          invoices.map((invoice) => {
            const selected = invoice.id === selectedId
            const balance = invoiceBalanceDue(invoice)
            return (
              <tr
                key={invoice.id}
                className={cn(
                  'cursor-pointer border-b border-[var(--color-border)] transition-colors hover:bg-[var(--color-surface-elevated)]/60',
                  selected && 'bg-[var(--color-accent-muted)]/25',
                )}
                onClick={() => onSelect(invoice)}
              >
                <td className={tableCellClass('left', { extra: 'font-mono text-xs' })}>{invoice.number}</td>
                <td className={tableCellClass('left')}>
                  <div className="min-w-0 truncate text-sm">{invoice.clientName}</div>
                  {invoice.clientEmail ? (
                    <div className="truncate text-[11px] text-[var(--color-muted)]">{invoice.clientEmail}</div>
                  ) : null}
                </td>
                <td className={tableCellClass('left', { numeric: true, extra: 'text-sm' })}>
                  {formatDate(invoice.issuedAt)}
                </td>
                <td className={tableCellClass('left', { numeric: true, extra: 'text-sm' })}>
                  {formatDate(invoice.dueDate)}
                </td>
                <td className={tableCellClass('right')}>
                  <AccountingAmount amount={invoice.total} currency={invoice.currency} />
                </td>
                <td className={tableCellClass('right')}>
                  <AccountingAmount amount={balance} currency={invoice.currency} />
                </td>
                <td className={tableCellClass('left')}>
                  <InvoiceStatusBadge status={invoice.status} />
                </td>
              </tr>
            )
          })
        )}
      </tbody>
    </StickyDataTable>
  )
}
