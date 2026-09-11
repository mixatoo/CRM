import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, FileText } from 'lucide-react'
import { AccountingAmount } from '@/design-system/components/AccountingAmount'
import { invoiceBalanceDue } from '@/domain/entities/invoice'
import type { ClientLinkedInvoicesTableColumnKey } from '@/features/clients/components/invoices/client-linked-invoices-table-columns'
import type { ClientLinkedInvoiceRow } from '@/features/clients/utils/client-linked-invoices-list'
import type { ClientLinkedInvoiceSortDir, ClientLinkedInvoiceSortField } from '@/features/clients/utils/client-linked-invoices-list'
import { InvoiceStatusBadge } from '@/features/trips/components/invoices/InvoiceStatusBadge'
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

function InvoiceNumberCell({ number }: { number: string }) {
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
  field: ClientLinkedInvoiceSortField
  sortBy: ClientLinkedInvoiceSortField
  sortDir: ClientLinkedInvoiceSortDir
  onSort: (field: ClientLinkedInvoiceSortField) => void
  align?: TableAlign
  className?: string
}

function invoicesHeadClass(extra?: string) {
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
      className={invoicesHeadClass(className)}
      active={active}
      sortDir={sortDir}
      onSort={() => onSort(field)}
      aria-sort={dataTableAriaSort(active, sortDir)}
    />
  )
}

type HeaderContext = {
  sortBy: ClientLinkedInvoiceSortField
  sortDir: ClientLinkedInvoiceSortDir
  onSort: (field: ClientLinkedInvoiceSortField) => void
  allPageSelected: boolean
  somePageSelected: boolean
  onTogglePage: () => void
}

export function renderClientLinkedInvoicesTableHeader(
  key: ClientLinkedInvoicesTableColumnKey,
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
    case 'issued':
      return (
        <SortableHeader
          key={key}
          label="Issued"
          field="issued"
          sortBy={ctx.sortBy}
          sortDir={ctx.sortDir}
          onSort={ctx.onSort}
          className={COMPACT_COLUMN_X}
        />
      )
    case 'due':
      return (
        <SortableHeader
          key={key}
          label="Due"
          field="due"
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
    case 'total':
      return (
        <SortableHeader
          key={key}
          label="Total"
          field="total"
          sortBy={ctx.sortBy}
          sortDir={ctx.sortDir}
          onSort={ctx.onSort}
          className={COMPACT_COLUMN_X}
        />
      )
    case 'balance':
      return (
        <SortableHeader
          key={key}
          label="Balance"
          field="balance"
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
    case 'actions':
      return (
        <DataTableColumnHeader
          key={key}
          label="Actions"
          align="center"
          sortable={false}
          className={invoicesHeadClass()}
        />
      )
    default:
      return null
  }
}

export type ClientLinkedInvoicesTableCellContext = {
  invoice: ClientLinkedInvoiceRow
  selected: boolean
  isDragSelecting: boolean
  onOpen: (invoice: ClientLinkedInvoiceRow) => void
  onSelectionPointerDown: (invoiceId: string, button: number) => void
  onSelectionPointerEnter: (invoiceId: string) => void
  onSelectionClick: (invoiceId: string, shiftKey: boolean) => void
}

export function renderClientLinkedInvoicesTableCell(
  key: ClientLinkedInvoicesTableColumnKey,
  ctx: ClientLinkedInvoicesTableCellContext,
): ReactNode {
  const balance = invoiceBalanceDue(ctx.invoice)

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
          data-invoice-id={ctx.invoice.id}
          onPointerDown={(event) => {
            event.stopPropagation()
            ctx.onSelectionPointerDown(ctx.invoice.id, event.button)
          }}
          onPointerEnter={() => ctx.onSelectionPointerEnter(ctx.invoice.id)}
          onClick={(event) => {
            event.stopPropagation()
            ctx.onSelectionClick(ctx.invoice.id, event.shiftKey)
          }}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <TableRowCheckbox
            checked={ctx.selected}
            onChange={(shiftKey) => ctx.onSelectionClick(ctx.invoice.id, shiftKey ?? false)}
            aria-label={`Select invoice ${ctx.invoice.number}`}
          />
        </td>
      )
    case 'invoice':
      return (
        <td key={key} className={tableCellClass('left', { extra: INVOICE_COLUMN_X })} title={ctx.invoice.number}>
          <InvoiceNumberCell number={ctx.invoice.number} />
        </td>
      )
    case 'issued':
      return (
        <td
          key={key}
          className={tableCellClass('left', { numeric: true, extra: cn(COMPACT_COLUMN_X, CELL_META) })}
        >
          {formatDate(ctx.invoice.issuedAt)}
        </td>
      )
    case 'due':
      return (
        <td
          key={key}
          className={tableCellClass('left', { numeric: true, extra: cn(COMPACT_COLUMN_X, CELL_META) })}
        >
          {formatDate(ctx.invoice.dueDate)}
        </td>
      )
    case 'trip':
      return (
        <td
          key={key}
          className={tableCellClass('left', { extra: cn(COMPACT_COLUMN_X, CELL_META, 'font-mono') })}
        >
          {ctx.invoice.tripReference ? (
            <Link
              to={`/trips/${ctx.invoice.tripId}/documents`}
              className="text-[var(--color-accent)] hover:underline"
              onClick={(event) => event.stopPropagation()}
            >
              {ctx.invoice.tripReference}
            </Link>
          ) : (
            '—'
          )}
        </td>
      )
    case 'total':
      return (
        <td key={key} className={tableCellClass('left', { extra: COMPACT_COLUMN_X })}>
          <AccountingAmount amount={ctx.invoice.total} currency={ctx.invoice.currency} className="min-w-0" />
        </td>
      )
    case 'balance':
      return (
        <td key={key} className={tableCellClass('left', { extra: COMPACT_COLUMN_X })}>
          <AccountingAmount amount={balance} currency={ctx.invoice.currency} className="min-w-0" />
        </td>
      )
    case 'status':
      return (
        <td key={key} className={tableCellClass('center')}>
          <InvoiceStatusBadge status={ctx.invoice.status} />
        </td>
      )
    case 'actions':
      return (
        <td
          key={key}
          className={crmTableActionsCellClass('!text-center')}
          data-invoice-row-action=""
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <div className="flex justify-center">
            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-accent)]"
              aria-label={`Open invoice ${ctx.invoice.number}`}
              onClick={() => ctx.onOpen(ctx.invoice)}
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
