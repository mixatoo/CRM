import { useMemo, useState } from 'react'
import { Pencil, Undo2 } from 'lucide-react'
import type { FlightTicket, TicketTransaction } from '@/domain/flight/types'
import {
  TICKET_STATUS_LABELS,
  TICKET_TRANSACTION_TYPE_LABELS,
} from '@/domain/flight/types'
import { getLastReversibleTransaction } from '@/domain/flight/reversal'
import { AccountingAmount } from '@/design-system/components/AccountingAmount'
import { Button } from '@/design-system/components/Button'
import { TableColumnPicker } from '@/design-system/components/TableColumnPicker'
import { ReverseTransactionDialog } from '@/features/trips/components/services/flight/ReverseTransactionDialog'
import {
  FLIGHT_LEDGER_TABLE_COLUMN_OPTIONS,
  FLIGHT_LEDGER_TABLE_COLUMN_ORDER,
  type FlightLedgerTableColumnKey,
} from '@/features/trips/components/services/flight/flight-ledger-table-columns'
import { useTableColumnVisibility } from '@/shared/hooks/use-table-column-visibility'
import { FLIGHT_LEDGER_TABLE_COLUMNS_STORAGE_KEY } from '@/types/table-columns'
import { cn } from '@/shared/utils/cn'
import { layout } from '@/design-system/tokens/layout'
import { formatAccountingAmount } from '@/features/trips/utils/format'

interface FlightTicketLedgerProps {
  ticket: FlightTicket
}

const LEDGER_HEADER_LABELS: Record<FlightLedgerTableColumnKey, string> = {
  date: 'Date',
  type: 'Type',
  description: 'Description',
  debit: 'Debit',
  credit: 'Credit',
  ref: 'Ref',
  user: 'User',
}

function LedgerFinancialSummary({ ticket }: { ticket: FlightTicket }) {
  const { financials, pricing } = ticket
  const rows = [
    { label: 'Client receivable', amount: financials.clientReceivable },
    { label: 'Collected', amount: financials.amountCollected },
    { label: 'Outstanding', amount: financials.amountOutstanding, highlight: true },
    { label: 'Supplier payable', amount: financials.supplierPayable },
    { label: 'Paid to supplier', amount: financials.amountPaidToSupplier },
    { label: 'Supplier outstanding', amount: financials.supplierOutstanding },
    { label: 'Net profit', amount: financials.netProfit, highlight: true },
  ]

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]/30 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-muted)]">
        Current financial position
      </p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className={cn(
              'flex items-center justify-between gap-2 rounded-[var(--radius-sm)] px-2 py-1.5',
              row.highlight && 'bg-[var(--color-surface)]',
            )}
          >
            <span className="text-[11px] text-[var(--color-muted)]">{row.label}</span>
            <AccountingAmount
              amount={row.amount}
              currency={pricing.currency}
              className={cn('text-xs', row.highlight && 'font-semibold')}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export function FlightTicketLedger({ ticket }: FlightTicketLedgerProps) {
  const columnVisibility = useTableColumnVisibility(
    FLIGHT_LEDGER_TABLE_COLUMNS_STORAGE_KEY,
    FLIGHT_LEDGER_TABLE_COLUMN_OPTIONS,
  )
  const { isVisible } = columnVisibility
  const visibleColumns = useMemo(
    () => FLIGHT_LEDGER_TABLE_COLUMN_ORDER.filter((key) => isVisible(key)),
    [isVisible],
  )
  const show = isVisible

  const entries = useMemo(
    () => [...ticket.ledger].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)),
    [ticket.ledger],
  )

  if (entries.length === 0) {
    return (
      <div className="space-y-3">
        <p className={layout.caption}>
          No ledger entries yet. Issue, refund, reissue, void, cancel, and payment operations are recorded here
          automatically.
        </p>
        <LedgerFinancialSummary ticket={ticket} />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <LedgerFinancialSummary ticket={ticket} />

      <div className="flex justify-end">
        <TableColumnPicker columnVisibility={columnVisibility} />
      </div>

      <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border)]">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead className="bg-[var(--color-surface-muted)]/60 text-[var(--color-muted)]">
            <tr>
              {visibleColumns.map((key) => (
                <th
                  key={key}
                  className={cn(
                    'px-2 py-1.5 font-medium',
                    (key === 'debit' || key === 'credit') && 'text-right',
                  )}
                >
                  {LEDGER_HEADER_LABELS[key]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-t border-[var(--color-border)]">
                {show('date') ? (
                  <td className="px-2 py-1.5 tabular-nums">{entry.date}</td>
                ) : null}
                {show('type') ? (
                  <td className="px-2 py-1.5">{TICKET_TRANSACTION_TYPE_LABELS[entry.transactionType]}</td>
                ) : null}
                {show('description') ? (
                  <td className="max-w-[14rem] truncate px-2 py-1.5" title={entry.description}>
                    {entry.description}
                  </td>
                ) : null}
                {show('debit') ? (
                  <td className="px-2 py-1.5 text-right tabular-nums text-red-600">
                    {entry.debit > 0 ? formatAccountingAmount(entry.debit) : '—'}
                  </td>
                ) : null}
                {show('credit') ? (
                  <td className="px-2 py-1.5 text-right tabular-nums text-emerald-600">
                    {entry.credit > 0 ? formatAccountingAmount(entry.credit) : '—'}
                  </td>
                ) : null}
                {show('ref') ? (
                  <td className="px-2 py-1.5">{entry.referenceNumber ?? '—'}</td>
                ) : null}
                {show('user') ? (
                  <td className="px-2 py-1.5">{entry.userName ?? '—'}</td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface FlightTicketHistoryProps {
  ticket: FlightTicket
  readOnly?: boolean
  onReverseTransaction?: (transactionId: string, reason: string) => void
  onCorrectTransaction?: (transactionId: string, reason: string) => void
  isReversing?: boolean
}

export function FlightTicketHistory({
  ticket,
  readOnly = false,
  onReverseTransaction,
  onCorrectTransaction,
  isReversing = false,
}: FlightTicketHistoryProps) {
  const [dialogTxn, setDialogTxn] = useState<TicketTransaction | null>(null)
  const [dialogMode, setDialogMode] = useState<'reverse' | 'correct'>('reverse')

  const transactions = useMemo(
    () => [...ticket.transactions].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [ticket.transactions],
  )

  const latestReversibleId = getLastReversibleTransaction(ticket)?.id

  if (transactions.length === 0) {
    return <p className={layout.caption}>No operations recorded yet.</p>
  }

  const openDialog = (txn: TicketTransaction, mode: 'reverse' | 'correct') => {
    setDialogTxn(txn)
    setDialogMode(mode)
  }

  return (
    <>
      <ul className="space-y-2">
        {transactions.map((txn) => (
          <li
            key={txn.id}
            className={cn(
              'rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2',
              txn.status === 'cancelled' && 'opacity-60',
            )}
          >
            <TransactionSummary
              txn={txn}
              ticket={ticket}
              canReverse={!readOnly && txn.id === latestReversibleId && txn.status === 'completed'}
              onReverse={() => openDialog(txn, 'reverse')}
              onCorrect={() => openDialog(txn, 'correct')}
            />
          </li>
        ))}
      </ul>

      <ReverseTransactionDialog
        open={dialogTxn != null}
        onOpenChange={(open) => {
          if (!open) setDialogTxn(null)
        }}
        transaction={dialogTxn}
        mode={dialogMode}
        isPending={isReversing}
        onConfirm={(reason) => {
          if (!dialogTxn) return
          if (dialogMode === 'correct') onCorrectTransaction?.(dialogTxn.id, reason)
          else onReverseTransaction?.(dialogTxn.id, reason)
          setDialogTxn(null)
        }}
      />
    </>
  )
}

function TransactionSummary({
  txn,
  ticket,
  canReverse,
  onReverse,
  onCorrect,
}: {
  txn: TicketTransaction
  ticket: FlightTicket
  canReverse?: boolean
  onReverse?: () => void
  onCorrect?: () => void
}) {
  const date = txn.createdAt.slice(0, 10)
  const label = TICKET_TRANSACTION_TYPE_LABELS[txn.type]
  const currency = ticket.pricing.currency
  const cancelled = txn.status === 'cancelled'
  const reversed = txn.type === 'manual_adjustment' && txn.reversesTransactionId

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className={cn('text-xs font-medium', cancelled && 'line-through')}>
          {label} · {date}
          {cancelled ? <span className="ml-1.5 text-[var(--color-danger)] no-underline">Reversed</span> : null}
          {reversed ? <span className="ml-1.5 text-[var(--color-muted)] no-underline">Reversal</span> : null}
        </p>
        <p className={cn(layout.caption, 'mt-0.5')}>
          {txn.createdByName ?? 'System'} · {TICKET_STATUS_LABELS[ticket.status]}
        </p>
        {txn.issue ? (
          <p className="mt-1 text-xs">
            Ticket {txn.issue.ticketNumber} · Selling {formatAccountingAmount(txn.issue.sellingPrice)} {currency}
          </p>
        ) : null}
        {txn.refund ? (
          <p className="mt-1 text-xs">
            Gross {formatAccountingAmount(txn.refund.refundAmount)} · Net refund{' '}
            {formatAccountingAmount(txn.refund.netRefund)} · P/L {formatAccountingAmount(txn.refund.profitLoss)}
          </p>
        ) : null}
        {txn.reissue ? (
          <p className="mt-1 text-xs">
            {txn.reissue.oldTicketNumber} → {txn.reissue.newTicketNumber} · Collect{' '}
            {formatAccountingAmount(txn.reissue.amountToCollect)} · Pay{' '}
            {formatAccountingAmount(txn.reissue.amountToPay)} · P/L {formatAccountingAmount(txn.reissue.profit)}
          </p>
        ) : null}
        {txn.void ? (
          <p className="mt-1 text-xs">
            Void fees {formatAccountingAmount(txn.void.voidFee + txn.void.supplierFee + txn.void.agencyFee)} · P/L{' '}
            {formatAccountingAmount(txn.void.profitLoss)}
          </p>
        ) : null}
        {txn.cancellation ? (
          <p className="mt-1 text-xs">
            {txn.cancellation.isRefundable ? 'Refundable' : 'Non-refundable'} · Net refund{' '}
            {formatAccountingAmount(txn.cancellation.netRefund)} · P/L{' '}
            {formatAccountingAmount(txn.cancellation.profitLoss)}
          </p>
        ) : null}
        {txn.notes ? <p className={cn(layout.caption, 'mt-1')}>{txn.notes}</p> : null}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        {txn.payment ? (
          <AccountingAmount amount={txn.payment.amount} currency={txn.payment.currency} className="shrink-0" />
        ) : null}
        {canReverse ? (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-[11px]" onClick={onCorrect}>
              <Pencil className="h-3 w-3" />
              Correct
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-[11px] text-[var(--color-danger)] hover:bg-[var(--color-danger-muted)]"
              onClick={onReverse}
            >
              <Undo2 className="h-3 w-3" />
              Reverse
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
