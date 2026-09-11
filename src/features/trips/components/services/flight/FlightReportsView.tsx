import { useMemo, useState } from 'react'
import { BarChart3 } from 'lucide-react'
import type { FlightServiceDetails } from '@/domain/flight/types'
import { DataTableEmptyRow } from '@/design-system/components/DataTableEmptyState'
import { TableColumnPicker } from '@/design-system/components/TableColumnPicker'
import {
  FLIGHT_REPORTS_TABLE_COLUMN_OPTIONS,
  FLIGHT_REPORTS_TABLE_COLUMN_ORDER,
  type FlightReportsTableColumnKey,
} from '@/features/trips/components/services/flight/flight-reports-table-columns'
import {
  FLIGHT_REPORT_OPTIONS,
  buildFinancialSummary,
  buildFlightReport,
  type FlightReportType,
} from '@/domain/flight/reports'
import { formatAccountingAmount } from '@/features/trips/utils/format'
import { useTableColumnVisibility } from '@/shared/hooks/use-table-column-visibility'
import { FLIGHT_REPORTS_TABLE_COLUMNS_STORAGE_KEY } from '@/types/table-columns'
import { cn } from '@/shared/utils/cn'
import { layout } from '@/design-system/tokens/layout'

interface FlightReportsViewProps {
  details: FlightServiceDetails
  clientName?: string
}

const HEADER_LABELS: Record<FlightReportsTableColumnKey, string> = {
  ticketNumber: 'Ticket',
  passenger: 'Passenger',
  airline: 'Airline',
  route: 'Route',
  status: 'Status',
  amount: 'Amount',
  profit: 'Profit',
  date: 'Date',
}

export function FlightReportsView({ details, clientName }: FlightReportsViewProps) {
  const [reportType, setReportType] = useState<FlightReportType>('issued')
  const columnVisibility = useTableColumnVisibility(
    FLIGHT_REPORTS_TABLE_COLUMNS_STORAGE_KEY,
    FLIGHT_REPORTS_TABLE_COLUMN_OPTIONS,
  )
  const { isVisible } = columnVisibility
  const visibleColumns = useMemo(
    () => FLIGHT_REPORTS_TABLE_COLUMN_ORDER.filter((key) => isVisible(key)),
    [isVisible],
  )
  const visibleColCount = visibleColumns.length
  const show = isVisible

  const rows = useMemo(() => buildFlightReport(details, reportType, clientName), [details, reportType, clientName])
  const summary = useMemo(() => buildFinancialSummary(details), [details])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {FLIGHT_REPORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setReportType(opt.value)}
              className={cn(
                'rounded-[var(--radius-sm)] px-2 py-1 text-[11px] font-medium transition-colors',
                reportType === opt.value
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-surface-muted)] text-[var(--color-muted)] hover:text-[var(--color-foreground)]',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {reportType !== 'financial_summary' ? (
          <TableColumnPicker columnVisibility={columnVisibility} />
        ) : null}
      </div>

      {reportType === 'financial_summary' ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {summary.map((row) => (
            <div key={row.label} className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2">
              <p className={layout.caption}>{row.label}</p>
              <p className="mt-0.5 text-sm font-medium tabular-nums">
                {row.currency} {formatAccountingAmount(row.amount)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border)]">
          <table className="w-full min-w-[800px] text-left text-xs">
            <thead className="bg-[var(--color-surface-muted)]/60 text-[var(--color-muted)]">
              <tr>
                {visibleColumns.map((key) => (
                  <th
                    key={key}
                    className={cn(
                      'px-2 py-2 font-medium',
                      (key === 'amount' || key === 'profit') && 'text-right',
                    )}
                  >
                    {HEADER_LABELS[key]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <DataTableEmptyRow
                  colSpan={visibleColCount}
                  cellClassName="px-2"
                  icon={BarChart3}
                  title="No data for this report"
                  description="Try another report type or add ticket activity first."
                />
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-t border-[var(--color-border)]">
                    {show('ticketNumber') ? (
                      <td className="px-2 py-2">{row.ticketNumber || '—'}</td>
                    ) : null}
                    {show('passenger') ? (
                      <td className="px-2 py-2">{row.passengerName || '—'}</td>
                    ) : null}
                    {show('airline') ? (
                      <td className="px-2 py-2">{row.airline || '—'}</td>
                    ) : null}
                    {show('route') ? (
                      <td className="px-2 py-2">{row.route || '—'}</td>
                    ) : null}
                    {show('status') ? (
                      <td className="px-2 py-2">{row.status || '—'}</td>
                    ) : null}
                    {show('amount') ? (
                      <td className="px-2 py-2 text-right tabular-nums">
                        {row.currency} {formatAccountingAmount(row.amount)}
                      </td>
                    ) : null}
                    {show('profit') ? (
                      <td className="px-2 py-2 text-right tabular-nums">{formatAccountingAmount(row.profit)}</td>
                    ) : null}
                    {show('date') ? (
                      <td className="px-2 py-2">{row.date ?? '—'}</td>
                    ) : null}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
