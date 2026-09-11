import { useMemo, useState } from 'react'
import { ScrollText } from 'lucide-react'
import type { ReactNode } from 'react'
import type { TripService } from '@/domain/entities/trip-service'
import { DataTableEmptyRow } from '@/design-system/components/DataTableEmptyState'
import { TableColumnPicker } from '@/design-system/components/TableColumnPicker'
import {
  defaultFlightServiceDetails,
  migrateFlightServiceDetails,
  refreshFlightServiceDetails,
} from '@/domain/flight'
import { flattenTickets } from '@/domain/flight/migration'
import type { FlightTicket, TicketTransaction, TicketTransactionType } from '@/domain/flight/types'
import { TICKET_TRANSACTION_TYPE_LABELS } from '@/domain/flight/types'
import { SearchField } from '@/design-system/components/SearchField'
import { StickyDataTable } from '@/design-system/components/StickyDataTable'
import { CRM_TABLE_HEAD_LABEL, tableCellClass, tableHeadClass } from '@/design-system/components/table-styles'
import { cn } from '@/shared/utils/cn'
import { formatDate } from '@/shared/utils/date-format'
import { formatAccountingAmount } from '@/features/trips/utils/format'
import { useTableColumnVisibility } from '@/shared/hooks/use-table-column-visibility'
import type { TableColumnDefinition } from '@/shared/hooks/use-table-column-visibility'
import { TRIP_FLIGHT_TRANSACTIONS_COLUMNS_STORAGE_KEY } from '@/types/table-columns'

type OperationRow = {
  id: string
  createdAt: string
  type: TicketTransactionType
  createdByName?: string
  currency: string
  passengerName: string
  pnr: string
  ticketNumber: string
  route: string
  supplierCost: number | null
  amount: number | null
  fees: number | null
  profitLoss: number | null
  reference: string
}

type TransactionColumnKey =
  | 'date'
  | 'passenger'
  | 'pnr'
  | 'ticket'
  | 'route'
  | 'operation'
  | 'currency'
  | 'cost'
  | 'amount'
  | 'fees'
  | 'pl'
  | 'ref'
  | 'by'

type TableColumn = {
  key: TransactionColumnKey
  label: string
  align: 'left' | 'right'
  className?: string
  groupStart?: boolean
}

const TRANSACTION_COLUMN_OPTIONS: TableColumnDefinition<TransactionColumnKey>[] = [
  { key: 'date', label: 'Date', locked: true },
  { key: 'passenger', label: 'Passenger', locked: true },
  { key: 'pnr', label: 'PNR' },
  { key: 'ticket', label: 'Ticket' },
  { key: 'route', label: 'Route' },
  { key: 'operation', label: 'Operation' },
  { key: 'currency', label: 'Currency' },
  { key: 'cost', label: 'Cost' },
  { key: 'amount', label: 'Amount' },
  { key: 'fees', label: 'Fees' },
  { key: 'pl', label: 'P/L' },
  { key: 'ref', label: 'Reference' },
  { key: 'by', label: 'By' },
]

const TABLE_COLUMNS: TableColumn[] = [
  { key: 'date', label: 'DATE', align: 'left', className: 'w-[6.75rem]' },
  { key: 'passenger', label: 'PASSENGER', align: 'left', className: 'w-[8rem]' },
  { key: 'pnr', label: 'PNR', align: 'left', className: 'w-[5.25rem]' },
  { key: 'ticket', label: 'TICKET', align: 'left', className: 'w-[6.5rem]' },
  { key: 'route', label: 'ROUTE', align: 'left', className: 'w-[5.75rem]' },
  { key: 'operation', label: 'OPERATION', align: 'left', className: 'w-[6.75rem]', groupStart: true },
  { key: 'currency', label: 'CUR', align: 'left', className: 'w-[3.25rem]' },
  { key: 'cost', label: 'COST', align: 'right', className: 'w-[5rem]', groupStart: true },
  { key: 'amount', label: 'AMOUNT', align: 'right', className: 'w-[5rem]' },
  { key: 'fees', label: 'FEES', align: 'right', className: 'w-[4.75rem]' },
  { key: 'pl', label: 'P/L', align: 'right', className: 'w-[4.75rem]' },
  { key: 'ref', label: 'REF', align: 'left', className: 'w-[5.25rem]', groupStart: true },
  { key: 'by', label: 'BY', align: 'left', className: 'w-[4.75rem]' },
]

const TYPE_BADGE: Partial<Record<TicketTransactionType, string>> = {
  issue: 'bg-emerald-500/10 text-emerald-700',
  refund: 'bg-sky-500/10 text-sky-700',
  partial_refund: 'bg-sky-500/10 text-sky-700',
  reissue: 'bg-violet-500/10 text-violet-700',
  void: 'bg-red-500/10 text-red-700',
  cancellation: 'bg-amber-500/10 text-amber-800',
  client_payment: 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]',
  supplier_payment: 'bg-[var(--color-warning-muted)] text-[var(--color-warning)]',
}

const TABLE_TEXT_CLASS = 'uppercase tracking-wide'
const GROUP_BORDER = 'border-l border-[var(--color-border)]/70'

function tableCaps(value: string): string {
  if (!value || value === '—') return value
  return value.toUpperCase()
}

function sumFees(...amounts: number[]): number | null {
  const total = amounts.reduce((sum, n) => sum + n, 0)
  return total > 0 ? total : null
}

function buildOperationRow(
  txn: TicketTransaction,
  ticket: FlightTicket & { passengerName: string },
): OperationRow {
  const currency = tableCaps(ticket.pricing.currency)
  const base: OperationRow = {
    id: txn.id,
    createdAt: txn.createdAt,
    type: txn.type,
    createdByName: txn.createdByName ? tableCaps(txn.createdByName) : undefined,
    currency,
    passengerName: tableCaps(ticket.passengerName || '—'),
    pnr: tableCaps(ticket.pnr?.trim() || '—'),
    ticketNumber: tableCaps(ticket.ticketNumber?.trim() || '—'),
    route: tableCaps(ticket.route?.trim() || '—'),
    supplierCost: null,
    amount: null,
    fees: null,
    profitLoss: null,
    reference: '—',
  }

  if (txn.issue) {
    const d = txn.issue
    return {
      ...base,
      supplierCost: d.fare + d.taxes + d.airlineFees + d.supplierFees,
      amount: d.sellingPrice,
      fees: sumFees(d.agencyServiceFees, d.clientDiscount),
      reference: tableCaps(d.ticketNumber),
    }
  }

  if (txn.refund) {
    const d = txn.refund
    return {
      ...base,
      supplierCost: d.refundAmount,
      amount: d.netRefund,
      fees: sumFees(d.airlinePenalty, d.supplierFees, d.agencyFees),
      profitLoss: d.profitLoss,
      reference: tableCaps(d.status),
    }
  }

  if (txn.reissue) {
    const d = txn.reissue
    return {
      ...base,
      ticketNumber: tableCaps(d.newTicketNumber),
      supplierCost: d.amountToPay,
      amount: d.amountToCollect,
      fees: sumFees(d.reissuePenalty, d.supplierFees, d.agencyFees),
      profitLoss: d.profit,
      reference: tableCaps(d.newTicketNumber),
    }
  }

  if (txn.void) {
    const d = txn.void
    const totalFees = d.voidFee + d.supplierFee + d.agencyFee
    return {
      ...base,
      supplierCost: d.supplierFee,
      amount: d.voidFee,
      fees: totalFees > 0 ? totalFees : null,
      profitLoss: d.profitLoss,
      reference: tableCaps(d.status),
    }
  }

  if (txn.cancellation) {
    const d = txn.cancellation
    return {
      ...base,
      amount: d.netRefund,
      fees: sumFees(d.cancellationPenalty, d.supplierFees, d.agencyFees),
      profitLoss: d.profitLoss,
      reference: tableCaps(d.isRefundable ? 'REFUNDABLE' : 'NON-REFUNDABLE'),
    }
  }

  if (txn.payment) {
    const d = txn.payment
    return {
      ...base,
      currency: tableCaps(d.currency),
      amount: d.amount,
      reference: tableCaps(d.referenceNumber?.trim() || '—'),
    }
  }

  return base
}

function buildAllOperations(service: TripService): OperationRow[] {
  const details = service.flightDetails
    ? migrateFlightServiceDetails(service.flightDetails, service.currency)
    : defaultFlightServiceDetails('one_way', service.currency)

  const refreshed = refreshFlightServiceDetails(details, service.currency)

  return flattenTickets(refreshed)
    .flatMap((ticket) =>
      ticket.transactions
        .filter((txn) => txn.status === 'completed')
        .map((txn) => buildOperationRow(txn, ticket)),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

function matchesRow(row: OperationRow, query: string): boolean {
  if (!query) return true
  const haystack = [
    row.passengerName,
    row.pnr,
    row.ticketNumber,
    row.route,
    row.reference,
    row.currency,
    TICKET_TRANSACTION_TYPE_LABELS[row.type],
    row.createdByName,
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(query)
}

function headClass(col: TableColumn) {
  return cn(tableHeadClass(col.align, col.className, true), col.groupStart && GROUP_BORDER)
}

function cellClass(col: TableColumn, extra?: string) {
  return cn(
    tableCellClass(col.align, { extra: cn('py-2.5 align-middle', extra) }),
    col.groupStart && GROUP_BORDER,
  )
}

function OperationTypeBadge({ type }: { type: TicketTransactionType }) {
  return (
    <span
      className={cn(
        'inline-block max-w-full truncate rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        TYPE_BADGE[type] ?? 'bg-[var(--color-surface-muted)] text-[var(--color-muted)]',
      )}
    >
      {TICKET_TRANSACTION_TYPE_LABELS[type].toUpperCase()}
    </span>
  )
}

function AmountCell({ amount, emphasis }: { amount: number | null; emphasis?: boolean }) {
  if (amount == null || amount === 0) {
    return <span className="text-[var(--color-muted)]">—</span>
  }
  return (
    <span className={cn('font-mono text-[12px] tabular-nums', emphasis && 'font-semibold text-[var(--color-foreground)]')}>
      {formatAccountingAmount(amount)}
    </span>
  )
}

function ProfitLossCell({ amount }: { amount: number | null }) {
  if (amount == null) return <span className="text-[var(--color-muted)]">—</span>
  return (
    <span
      className={cn(
        'font-mono text-[12px] font-semibold tabular-nums',
        amount >= 0 ? 'text-emerald-600' : 'text-red-600',
      )}
    >
      {formatAccountingAmount(amount)}
    </span>
  )
}

function renderOperationCell(key: TransactionColumnKey, row: OperationRow): ReactNode {
  switch (key) {
    case 'date':
      return <span className="whitespace-nowrap tabular-nums text-[12px]">{tableCaps(formatDate(row.createdAt))}</span>
    case 'passenger':
      return <span className="block max-w-[8rem] truncate text-[12px] font-medium">{row.passengerName}</span>
    case 'pnr':
      return <span className="font-mono text-[11px] tracking-wide">{row.pnr}</span>
    case 'ticket':
      return <span className="block max-w-[6.5rem] truncate font-mono text-[11px] tracking-wide">{row.ticketNumber}</span>
    case 'route':
      return <span className="block max-w-[5.75rem] truncate text-[12px]">{row.route}</span>
    case 'operation':
      return <OperationTypeBadge type={row.type} />
    case 'currency':
      return <span className="font-mono text-[11px]">{row.currency}</span>
    case 'cost':
      return <AmountCell amount={row.supplierCost} />
    case 'amount':
      return <AmountCell amount={row.amount} emphasis />
    case 'fees':
      return <AmountCell amount={row.fees} />
    case 'pl':
      return <ProfitLossCell amount={row.profitLoss} />
    case 'ref':
      return <span className="block max-w-[5.25rem] truncate font-mono text-[11px]">{row.reference}</span>
    case 'by':
      return <span className="block max-w-[4.75rem] truncate text-[12px]">{row.createdByName ?? '—'}</span>
    default:
      return null
  }
}

interface TripFlightOperationsViewProps {
  service: TripService
}

export function TripFlightOperationsView({ service }: TripFlightOperationsViewProps) {
  const [search, setSearch] = useState('')
  const columnVisibility = useTableColumnVisibility(
    TRIP_FLIGHT_TRANSACTIONS_COLUMNS_STORAGE_KEY,
    TRANSACTION_COLUMN_OPTIONS,
  )

  const visibleTableColumns = useMemo(
    () => TABLE_COLUMNS.filter((column) => columnVisibility.isVisible(column.key)),
    [columnVisibility],
  )

  const rows = useMemo(() => {
    const all = buildAllOperations(service)
    const query = search.trim().toLowerCase()
    return query ? all.filter((row) => matchesRow(row, query)) : all
  }, [service, search])

  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--color-surface)]">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--color-border)] px-3 py-2">
        <p className={cn(CRM_TABLE_HEAD_LABEL, 'text-[var(--color-muted)]')}>
          {rows.length} TRANSACTION{rows.length === 1 ? '' : 'S'}
        </p>
        <div className="flex min-w-0 items-center gap-2">
          <TableColumnPicker columnVisibility={columnVisibility} />
          <SearchField
            value={search}
            onValueChange={setSearch}
            placeholder="SEARCH…"
            aria-label="Search transactions"
            collapsible={false}
            density="compact"
            className="max-w-sm"
            inputClassName={cn(TABLE_TEXT_CLASS, 'placeholder:uppercase')}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <StickyDataTable fill striped freezeLeadingColumns={2} tableClassName={cn('min-w-[58rem]', TABLE_TEXT_CLASS)}>
          <thead>
            <tr>
              {visibleTableColumns.map((col) => (
                <th key={col.key} className={headClass(col)}>
                  <span className={cn(CRM_TABLE_HEAD_LABEL, 'text-[var(--color-muted)]')}>{col.label}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <DataTableEmptyRow
                colSpan={visibleTableColumns.length}
                cellClassName="px-3"
                icon={ScrollText}
                title="No transactions yet"
                description="Run them from the Flight tab, then save."
                tone="uppercase"
              />
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-[var(--color-border)] last:border-0">
                  {visibleTableColumns.map((col) => (
                    <td
                      key={col.key}
                      className={cellClass(col, col.key === 'ref' || col.key === 'by' ? 'text-[var(--color-muted)]' : undefined)}
                    >
                      {renderOperationCell(col.key, row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </StickyDataTable>
      </div>
    </div>
  )
}
