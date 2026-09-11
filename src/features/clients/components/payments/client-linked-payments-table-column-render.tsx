import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, FileText } from 'lucide-react'
import { AccountingAmount } from '@/design-system/components/AccountingAmount'
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from '@/domain/entities/trip-payment'
import type { ClientLinkedPaymentsTableColumnKey } from '@/features/clients/components/payments/client-linked-payments-table-columns'
import type { ClientLinkedPaymentRow } from '@/features/clients/utils/client-linked-payments-list'
import type { ClientLinkedPaymentSortDir, ClientLinkedPaymentSortField } from '@/features/clients/utils/client-linked-payments-list'
import { TableRowCheckbox } from '@/features/trips/components/list/TableRowCheckbox'
import {
  DataTableColumnHeader,
  dataTableAriaSort,
} from '@/design-system/components/DataTableColumnHeader'
import {
  clientsTableHeadCellClassName,
  clientsTableSelectionHeadClass,
} from '@/features/clients/components/list/clients-table-header-ui'
import {
  crmTableActionsCellClass,
  crmTableSelectionCellClass,
  tableCellClass,
  type TableAlign,
} from '@/design-system/components/table-styles'
import { formatDate } from '@/shared/utils/date-format'
import { cn } from '@/shared/utils/cn'

const CELL_META = 'truncate text-xs'
const INVOICE_COLUMN_X = 'px-1'
const COMPACT_COLUMN_X = 'px-2'

function InvoiceNumberCell({ number, unallocated }: { number: string; unallocated?: number }) {
  if (!number) {
    return (
      <span className="flex min-w-0 items-center gap-2 text-[var(--color-muted)]">
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)]/50"
          aria-hidden
        >
          <FileText className="h-3.5 w-3.5" strokeWidth={2} />
        </span>
        <span className="min-w-0 truncate text-xs">
          Unallocated
          {typeof unallocated === 'number' && unallocated > 0 ? ` (${unallocated.toFixed(2)})` : ''}
        </span>
      </span>
    )
  }

  return (
    <span className="flex min-w-0 items-center gap-2">
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-accent)]/25 bg-[var(--color-accent-muted)]/45 text-[var(--color-accent)]"
        aria-hidden
      >
        <FileText className="h-3.5 w-3.5" strokeWidth={2} />
      </span>
      <span className="min-w-0 truncate font-mono text-xs font-medium">{number}</span>
    </span>
  )
}

type SortableHeaderProps = {
  label: string
  field: ClientLinkedPaymentSortField
  sortBy: ClientLinkedPaymentSortField
  sortDir: ClientLinkedPaymentSortDir
  onSort: (field: ClientLinkedPaymentSortField) => void
  align?: TableAlign
  className?: string
}

function paymentsHeadClass(extra?: string) {
  return cn(clientsTableHeadCellClassName, extra)
}

function SortableHeader({
  label,
  field,
  sortBy,
  sortDir,
  onSort,
  align = 'left',
  className,
}: SortableHeaderProps) {
  const active = sortBy === field

  return (
    <DataTableColumnHeader
      label={label}
      align={align}
      className={paymentsHeadClass(className)}
      active={active}
      sortDir={sortDir}
      onSort={() => onSort(field)}
      aria-sort={dataTableAriaSort(active, sortDir)}
    />
  )
}

type HeaderContext = {
  sortBy: ClientLinkedPaymentSortField
  sortDir: ClientLinkedPaymentSortDir
  onSort: (field: ClientLinkedPaymentSortField) => void
  allPageSelected: boolean
  somePageSelected: boolean
  onTogglePage: () => void
}

export function renderClientLinkedPaymentsTableHeader(
  key: ClientLinkedPaymentsTableColumnKey,
  ctx: HeaderContext,
): ReactNode {
  switch (key) {
    case 'selection':
      return (
        <th
          key={key}
          scope="col"
          className={clientsTableSelectionHeadClass()}
          data-client-row-selection=""
          onClick={(event) => {
            event.stopPropagation()
            ctx.onTogglePage()
          }}
        >
          <TableRowCheckbox
            checked={ctx.allPageSelected}
            indeterminate={ctx.somePageSelected}
            onChange={() => ctx.onTogglePage()}
            aria-label={ctx.allPageSelected ? 'Deselect all on this page' : 'Select all on this page'}
          />
        </th>
      )
    case 'invoice':
      return (
        <SortableHeader
          key={key}
          label="Invoice"
          field="invoice"
          sortBy={ctx.sortBy}
          sortDir={ctx.sortDir}
          onSort={ctx.onSort}
          className={INVOICE_COLUMN_X}
        />
      )
    case 'date':
      return (
        <SortableHeader
          key={key}
          label="Date"
          field="date"
          sortBy={ctx.sortBy}
          sortDir={ctx.sortDir}
          onSort={ctx.onSort}
          className={COMPACT_COLUMN_X}
        />
      )
    case 'trip':
      return (
        <SortableHeader
          key={key}
          label="Trip"
          field="trip"
          sortBy={ctx.sortBy}
          sortDir={ctx.sortDir}
          onSort={ctx.onSort}
          className={COMPACT_COLUMN_X}
        />
      )
    case 'method':
      return (
        <SortableHeader
          key={key}
          label="Method"
          field="method"
          sortBy={ctx.sortBy}
          sortDir={ctx.sortDir}
          onSort={ctx.onSort}
        />
      )
    case 'reference':
      return (
        <SortableHeader
          key={key}
          label="Reference"
          field="reference"
          sortBy={ctx.sortBy}
          sortDir={ctx.sortDir}
          onSort={ctx.onSort}
        />
      )
    case 'amount':
      return (
        <SortableHeader
          key={key}
          label="Amount"
          field="amount"
          sortBy={ctx.sortBy}
          sortDir={ctx.sortDir}
          onSort={ctx.onSort}
          className={COMPACT_COLUMN_X}
        />
      )
    case 'status':
      return (
        <SortableHeader
          key={key}
          label="Status"
          field="status"
          sortBy={ctx.sortBy}
          sortDir={ctx.sortDir}
          onSort={ctx.onSort}
          align="center"
        />
      )
    case 'notes':
      return (
        <DataTableColumnHeader
          key={key}
          label="Notes"
          align="left"
          sortable={false}
          className={paymentsHeadClass(COMPACT_COLUMN_X)}
        />
      )
    case 'actions':
      return (
        <DataTableColumnHeader
          key={key}
          label="Actions"
          align="center"
          sortable={false}
          className={paymentsHeadClass()}
        />
      )
    default:
      return null
  }
}

export type ClientLinkedPaymentsTableCellContext = {
  payment: ClientLinkedPaymentRow
  selected: boolean
  isDragSelecting: boolean
  onOpen: (payment: ClientLinkedPaymentRow) => void
  onSelectionPointerDown: (paymentId: string, button: number) => void
  onSelectionPointerEnter: (paymentId: string) => void
  onSelectionClick: (paymentId: string, shiftKey: boolean) => void
}

export function renderClientLinkedPaymentsTableCell(
  key: ClientLinkedPaymentsTableColumnKey,
  ctx: ClientLinkedPaymentsTableCellContext,
): ReactNode {
  switch (key) {
    case 'selection':
      return (
        <td
          key={key}
          className={crmTableSelectionCellClass(
            cn(
              '!text-center',
              ctx.selected && 'bg-[var(--color-accent-muted)]/35',
              ctx.isDragSelecting && 'cursor-grabbing',
            ),
          )}
          data-client-row-selection=""
          data-payment-id={ctx.payment.id}
          onPointerDown={(event) => {
            event.stopPropagation()
            ctx.onSelectionPointerDown(ctx.payment.id, event.button)
          }}
          onPointerEnter={() => ctx.onSelectionPointerEnter(ctx.payment.id)}
          onClick={(event) => {
            event.stopPropagation()
            ctx.onSelectionClick(ctx.payment.id, event.shiftKey)
          }}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <TableRowCheckbox
            checked={ctx.selected}
            onChange={(shiftKey) => ctx.onSelectionClick(ctx.payment.id, shiftKey ?? false)}
            aria-label={`Select payment on ${formatDate(ctx.payment.paidAt)}`}
          />
        </td>
      )
    case 'invoice':
      return (
        <td
          key={key}
          className={tableCellClass('left', { extra: INVOICE_COLUMN_X })}
          title={
            ctx.payment.allocations.length > 0
              ? ctx.payment.allocations.map((row) => `${row.invoiceNumber}: ${row.amount.toFixed(2)}`).join(', ')
              : ctx.payment.unallocatedAmount > 0
                ? `Unallocated ${ctx.payment.unallocatedAmount.toFixed(2)}`
                : undefined
          }
        >
          <InvoiceNumberCell number={ctx.payment.invoiceNumber} unallocated={ctx.payment.unallocatedAmount} />
        </td>
      )
    case 'date':
      return (
        <td
          key={key}
          className={tableCellClass('left', { numeric: true, extra: cn(COMPACT_COLUMN_X, CELL_META) })}
          title={formatDate(ctx.payment.paidAt)}
        >
          {formatDate(ctx.payment.paidAt)}
        </td>
      )
    case 'trip':
      return (
        <td
          key={key}
          className={tableCellClass('left', { extra: cn(COMPACT_COLUMN_X, CELL_META, 'font-mono') })}
        >
          {ctx.payment.tripReference && ctx.payment.tripId ? (
            <Link
              to={`/trips/${ctx.payment.tripId}/documents`}
              className="text-[var(--color-accent)] hover:underline"
              onClick={(event) => event.stopPropagation()}
            >
              {ctx.payment.tripReference}
            </Link>
          ) : ctx.payment.tripReference ? (
            <span>{ctx.payment.tripReference}</span>
          ) : (
            '—'
          )}
        </td>
      )
    case 'method':
      return (
        <td key={key} className={tableCellClass('left', { muted: true, extra: cn(CELL_META, 'truncate') })}>
          {PAYMENT_METHOD_LABELS[ctx.payment.method]}
        </td>
      )
    case 'reference':
      return (
        <td
          key={key}
          className={tableCellClass('left', { extra: cn(CELL_META, 'truncate font-mono') })}
          title={ctx.payment.reference ?? undefined}
        >
          {ctx.payment.reference?.trim() || '—'}
        </td>
      )
    case 'amount':
      return (
        <td key={key} className={tableCellClass('left', { extra: COMPACT_COLUMN_X })}>
          <AccountingAmount amount={ctx.payment.amount} currency={ctx.payment.currency} className="min-w-0" />
        </td>
      )
    case 'status':
      return (
        <td key={key} className={tableCellClass('center', { extra: CELL_META })}>
          <span
            className={cn(
              'text-xs font-medium',
              ctx.payment.status === 'confirmed' && 'text-[var(--color-success)]',
              ctx.payment.status === 'recorded' && 'text-[var(--color-foreground)]',
              ctx.payment.status === 'void' && 'text-[var(--color-muted)] line-through',
            )}
          >
            {PAYMENT_STATUS_LABELS[ctx.payment.status]}
          </span>
        </td>
      )
    case 'notes':
      return (
        <td
          key={key}
          className={tableCellClass('left', { muted: true, extra: cn(COMPACT_COLUMN_X, CELL_META, 'truncate') })}
          title={ctx.payment.notes ?? undefined}
        >
          {ctx.payment.notes?.trim() || '—'}
        </td>
      )
    case 'actions':
      return (
        <td
          key={key}
          className={crmTableActionsCellClass('!text-center')}
          data-payment-row-action=""
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <div className="flex justify-center">
            <button
              type="button"
              disabled={!ctx.payment.linkedInvoice}
              className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-accent)] disabled:pointer-events-none disabled:opacity-40"
              aria-label={
                ctx.payment.linkedInvoice
                  ? `Open invoice ${ctx.payment.linkedInvoice.number}`
                  : 'No linked invoice'
              }
              onClick={() => ctx.onOpen(ctx.payment)}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </td>
      )
    default:
      return null
  }
}
