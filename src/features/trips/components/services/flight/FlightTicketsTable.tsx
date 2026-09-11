import { useMemo } from 'react'
import { Ticket } from 'lucide-react'
import type { FlightPassenger, FlightServiceDetails, FlightTicket } from '@/domain/flight/types'
import { PASSENGER_TYPE_LABELS, TICKET_STATUS_LABELS } from '@/domain/flight/types'
import { DataTableEmptyPanel } from '@/design-system/components/DataTableEmptyState'
import { TableColumnPicker } from '@/design-system/components/TableColumnPicker'
import {
  FLIGHT_TICKETS_TABLE_COLUMN_OPTIONS,
  FLIGHT_TICKETS_TABLE_COLUMN_ORDER,
  type FlightTicketsTableColumnKey,
} from '@/features/trips/components/services/flight/flight-tickets-table-columns'
import { formatAccountingAmount } from '@/features/trips/utils/format'
import { useTableColumnVisibility } from '@/shared/hooks/use-table-column-visibility'
import { FLIGHT_TICKETS_TABLE_COLUMNS_STORAGE_KEY } from '@/types/table-columns'
import { cn } from '@/shared/utils/cn'

export interface FlatTicketRow {
  ticket: FlightTicket
  passenger: FlightPassenger
  passengerIndex: number
  ticketIndex: number
}

export function flattenTicketRows(details: FlightServiceDetails): FlatTicketRow[] {
  return details.passengers.flatMap((passenger, passengerIndex) =>
    passenger.tickets.map((ticket, ticketIndex) => ({
      ticket,
      passenger,
      passengerIndex,
      ticketIndex,
    })),
  )
}

interface FlightTicketsTableProps {
  details: FlightServiceDetails
  selectedTicketId?: string | null
  onSelectTicket: (row: FlatTicketRow) => void
  onTicketInlineChange: (row: FlatTicketRow, ticket: FlightTicket) => void
  readOnly?: boolean
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-zinc-100 text-zinc-700',
  issued: 'bg-emerald-100 text-emerald-800',
  void: 'bg-red-100 text-red-800',
  refunded: 'bg-amber-100 text-amber-800',
  partially_refunded: 'bg-amber-100 text-amber-800',
  reissued: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-700',
}

const HEADER_LABELS: Record<FlightTicketsTableColumnKey, string> = {
  passenger: 'Passenger',
  type: 'Type',
  ticketNumber: 'Ticket #',
  pnr: 'PNR',
  airline: 'Airline',
  route: 'Route',
  status: 'Status',
  cost: 'Cost',
  selling: 'Selling',
  profit: 'Profit',
  due: 'Due',
}

export function FlightTicketsTable({
  details,
  selectedTicketId,
  onSelectTicket,
  onTicketInlineChange,
  readOnly,
}: FlightTicketsTableProps) {
  const columnVisibility = useTableColumnVisibility(
    FLIGHT_TICKETS_TABLE_COLUMNS_STORAGE_KEY,
    FLIGHT_TICKETS_TABLE_COLUMN_OPTIONS,
  )
  const { isVisible } = columnVisibility
  const visibleColumns = useMemo(
    () => FLIGHT_TICKETS_TABLE_COLUMN_ORDER.filter((key) => isVisible(key)),
    [isVisible],
  )
  const show = isVisible

  const rows = useMemo(() => flattenTicketRows(details), [details])

  if (rows.length === 0) {
    return (
      <DataTableEmptyPanel
        icon={Ticket}
        title="No tickets yet"
        description="Add passengers and generate tickets."
      />
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <TableColumnPicker columnVisibility={columnVisibility} />
      </div>

      <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border)]">
        <table className="w-full min-w-[960px] text-left text-xs">
          <thead className="sticky top-0 z-10 bg-[var(--color-surface-muted)]/90 text-[var(--color-muted)] backdrop-blur-sm">
            <tr>
              {visibleColumns.map((key) => (
                <th
                  key={key}
                  className={cn(
                    'px-2 py-2 font-medium',
                    (key === 'cost' || key === 'selling' || key === 'profit' || key === 'due') && 'text-right',
                  )}
                >
                  {HEADER_LABELS[key]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const { ticket, passenger } = row
              const selected = selectedTicketId === ticket.id
              return (
                <tr
                  key={ticket.id}
                  className={cn(
                    'cursor-pointer border-t border-[var(--color-border)] transition-colors hover:bg-[var(--color-surface-muted)]/40',
                    selected && 'bg-[var(--color-accent)]/5',
                  )}
                  onClick={() => onSelectTicket(row)}
                >
                  {show('passenger') ? (
                    <td className="max-w-[8rem] truncate px-2 py-2 font-medium">{passenger.passengerName}</td>
                  ) : null}
                  {show('type') ? (
                    <td className="px-2 py-2">{PASSENGER_TYPE_LABELS[passenger.passengerType]}</td>
                  ) : null}
                  {show('ticketNumber') ? (
                    <td className="px-2 py-2 tabular-nums">{ticket.ticketNumber || '—'}</td>
                  ) : null}
                  {show('pnr') ? (
                    <td className="px-2 py-2">{ticket.pnr || '—'}</td>
                  ) : null}
                  {show('airline') ? (
                    <td className="px-2 py-2">{ticket.airline || '—'}</td>
                  ) : null}
                  {show('route') ? (
                    <td className="max-w-[10rem] truncate px-2 py-2">{ticket.route || '—'}</td>
                  ) : null}
                  {show('status') ? (
                    <td className="px-2 py-2">
                      <span
                        className={cn(
                          'rounded px-1.5 py-0.5 text-[10px] font-medium',
                          STATUS_COLORS[ticket.status] ?? STATUS_COLORS.draft,
                        )}
                      >
                        {TICKET_STATUS_LABELS[ticket.status]}
                      </span>
                    </td>
                  ) : null}
                  {show('cost') ? (
                    <td className="px-2 py-2 text-right tabular-nums">
                      {!readOnly ? (
                        <input
                          type="number"
                          className="w-16 rounded border border-transparent bg-transparent px-1 text-right hover:border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none"
                          value={ticket.pricing.supplierCost}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const sellingPrice = ticket.pricing.sellingPrice
                            onTicketInlineChange(row, {
                              ...ticket,
                              pricing: { ...ticket.pricing, supplierCost: Number(e.target.value), sellingPrice },
                            })
                          }}
                        />
                      ) : (
                        formatAccountingAmount(ticket.pricing.supplierCost)
                      )}
                    </td>
                  ) : null}
                  {show('selling') ? (
                    <td className="px-2 py-2 text-right tabular-nums">
                      {!readOnly ? (
                        <input
                          type="number"
                          className="w-16 rounded border border-transparent bg-transparent px-1 text-right hover:border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none"
                          value={ticket.pricing.sellingPrice}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            onTicketInlineChange(row, {
                              ...ticket,
                              pricing: { ...ticket.pricing, sellingPrice: Number(e.target.value) },
                            })
                          }}
                        />
                      ) : (
                        formatAccountingAmount(ticket.pricing.sellingPrice)
                      )}
                    </td>
                  ) : null}
                  {show('profit') ? (
                    <td
                      className={cn(
                        'px-2 py-2 text-right tabular-nums',
                        ticket.pricing.profit >= 0 ? 'text-emerald-600' : 'text-red-600',
                      )}
                    >
                      {formatAccountingAmount(ticket.pricing.profit)}
                    </td>
                  ) : null}
                  {show('due') ? (
                    <td className="px-2 py-2 text-right tabular-nums text-amber-600">
                      {ticket.financials.amountOutstanding > 0
                        ? formatAccountingAmount(ticket.financials.amountOutstanding)
                        : '—'}
                    </td>
                  ) : null}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
