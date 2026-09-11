import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ExternalLink, FileText, Inbox, Wallet } from 'lucide-react'
import type { InvoiceStatus } from '@/domain/entities/invoice'
import { invoiceBalanceDue, INVOICE_STATUSES } from '@/domain/entities/invoice'
import { shouldMaskFinancials } from '@/domain/policies/permissions'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { Page } from '@/design-system/layout/Page'
import { SearchField } from '@/design-system/components/SearchField'
import { FormPicklist } from '@/design-system/components/FormPicklist'
import { AccountingAmount } from '@/design-system/components/AccountingAmount'
import { DataTableEmptyRow } from '@/design-system/components/DataTableEmptyState'
import { DataTableShell } from '@/design-system/layout/DataTableShell'
import { StickyDataTable } from '@/design-system/components/StickyDataTable'
import { Pagination } from '@/design-system/components/Pagination'
import { Skeleton } from '@/design-system/components/Skeleton'
import { TravelCard } from '@/design-system/layout/TravelCard'
import { InvoiceStatusBadge } from '@/features/trips/components/invoices/InvoiceStatusBadge'
import { EntityLabelChips } from '@/features/labels/components/EntityLabelChips'
import { LabelFilterField } from '@/features/labels/components/LabelFilterField'
import { useEntityLabelAssignments } from '@/features/labels/hooks/use-labels'
import { useInvoicesList, useInvoiceTripRefs, useInvoicesSummary } from '@/features/invoices/hooks/use-invoices'
import { invoiceAgingBucket } from '@/repositories/implementations/invoice-repository'
import { usePagination } from '@/shared/hooks/use-pagination'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'
import { INVOICES_PAGE_SIZE_STORAGE_KEY } from '@/types/pagination'
import type { InvoiceFilters } from '@/repositories/interfaces'
import { layout } from '@/design-system/tokens/layout'
import { tableCellClass, tableHeadClass } from '@/design-system/components/table-styles'
import { formatDate } from '@/shared/utils/date-format'
import { cn } from '@/shared/utils/cn'
import { useLabelIdsSearchParam } from '@/features/labels/hooks/use-label-ids-search-param'

export function InvoicesPage() {
  const role = useAuthStore((s) => s.user?.role ?? 'guest')
  const mask = shouldMaskFinancials(role)
  const [searchInput, setSearchInput] = useState('')
  const [status, setStatus] = useState<InvoiceStatus | 'all'>('all')
  const [aging, setAging] = useState<InvoiceFilters['aging']>('all')
  const [labelIds, setLabelIds] = useState<string[]>([])
  useLabelIdsSearchParam(setLabelIds)
  const search = useDebouncedValue(searchInput, 300)
  const { page, pageSize, setPage, setPageSize, resetPage } = usePagination({ persistKey: INVOICES_PAGE_SIZE_STORAGE_KEY })

  const filters: InvoiceFilters = { search, status, aging, labelIds, sortBy: 'issuedAt', sortDir: 'desc' }
  const { data: result, isLoading, isFetching } = useInvoicesList(filters, page, pageSize)
  const { data: summary, isLoading: summaryLoading } = useInvoicesSummary()
  const invoices = result?.items ?? []
  const invoiceIds = useMemo(() => invoices.map((invoice) => invoice.id), [invoices])
  const { data: labelsByTarget } = useEntityLabelAssignments('invoice', invoiceIds)
  const tripIds = useMemo(() => [...new Set(invoices.map((i) => i.tripId))], [invoices])
  const { data: tripRefs = {} } = useInvoiceTripRefs(tripIds)

  useEffect(() => resetPage(), [search, status, aging, labelIds, pageSize, resetPage])

  const total = result?.total ?? 0
  const totalPages = total > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1

  return (
    <Page className="flex min-h-0 flex-col">
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={FileText} label="Total" value={summaryLoading ? '…' : String(summary?.total ?? 0)} />
        <Kpi icon={Wallet} label="Open" value={summaryLoading ? '…' : String(summary?.open ?? 0)} />
        <Kpi icon={AlertTriangle} label="Overdue" value={summaryLoading ? '…' : String(summary?.overdue ?? 0)} danger />
        <Kpi icon={Wallet} label="Outstanding" value={mask ? '••••' : (summary?.outstanding ?? 0).toLocaleString()} />
      </div>

      <DataTableShell
        className="min-h-0 flex-1"
        isFetching={isFetching && !isLoading}
        header={
          <div className="flex flex-col gap-2 border-b border-[var(--color-border)] px-2 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-2.5">
            <h1 className={layout.pageTitle}>Invoices</h1>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <SearchField value={searchInput} onValueChange={setSearchInput} placeholder="Invoice #, client…" collapsible={false} className="sm:max-w-xs" />
              <FormPicklist
                size="sm"
                fullWidth={false}
                value={status}
                onChange={(value) => setStatus(value as InvoiceStatus | 'all')}
                options={[
                  { value: 'all', label: 'All statuses' },
                  ...INVOICE_STATUSES.map((s) => ({ value: s, label: s })),
                ]}
                panelTitle="Status"
                ariaLabel="Filter by status"
              />
              <FormPicklist
                size="sm"
                fullWidth={false}
                value={aging ?? 'all'}
                onChange={(value) => setAging(value as InvoiceFilters['aging'])}
                options={[
                  { value: 'all', label: 'All aging' },
                  { value: 'overdue', label: 'Overdue' },
                  { value: 'due_soon', label: 'Due soon' },
                  { value: 'current', label: 'Current' },
                ]}
                panelTitle="Aging"
                ariaLabel="Filter by aging"
              />
              <LabelFilterField
                value={labelIds}
                onChange={setLabelIds}
                targetType="invoice"
                ariaLabel="Filter invoices by labels"
              />
            </div>
          </div>
        }
        footer={<Pagination compact page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} />}
      >
        {isLoading ? (
          <div className="space-y-2 p-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
        ) : (
          <StickyDataTable fill tableClassName="text-sm">
            <thead>
              <tr>
                <th className={tableHeadClass('left')}>Invoice</th>
                <th className={tableHeadClass('left')}>Client</th>
                <th className={tableHeadClass('left')}>Trip</th>
                <th className={tableHeadClass('left')}>Due</th>
                <th className={tableHeadClass('right')}>Total</th>
                <th className={tableHeadClass('right')}>Balance</th>
                <th className={tableHeadClass('left')}>Labels</th>
                <th className={tableHeadClass('center')}>Status</th>
                <th className={tableHeadClass('center')} />
              </tr>
            </thead>
            <tbody>
              {(result?.items ?? []).length === 0 ? (
                <DataTableEmptyRow colSpan={9} icon={Inbox} title="No invoices" description="Create invoices from trip document workspaces." />
              ) : (
                result?.items.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-[var(--color-border)]">
                    <td className={tableCellClass('left', { extra: 'font-mono text-xs text-[var(--color-accent)]' })}>{invoice.number}</td>
                    <td className={tableCellClass('left')}>{invoice.clientName}</td>
                    <td className={tableCellClass('left', { extra: 'font-mono text-xs' })}>{tripRefs[invoice.tripId] ?? '—'}</td>
                    <td className={tableCellClass('left', { extra: cn('text-xs', invoiceAgingBucket(invoice) === 'overdue' && 'text-[var(--color-danger)] font-semibold') })}>
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className={tableCellClass('right')}>{mask ? '••••' : <AccountingAmount amount={invoice.total} currency={invoice.currency} className="justify-end" />}</td>
                    <td className={tableCellClass('right')}>{mask ? '••••' : <AccountingAmount amount={invoiceBalanceDue(invoice)} currency={invoice.currency} className="justify-end" />}</td>
                    <td className={tableCellClass('left', { extra: 'px-2' })}>
                      <EntityLabelChips labels={labelsByTarget?.get(invoice.id) ?? []} maxVisible={2} nowrap />
                    </td>
                    <td className={tableCellClass('center')}><InvoiceStatusBadge status={invoice.status} /></td>
                    <td className={tableCellClass('center')}>
                      <Link to={`/trips/${invoice.tripId}/documents`} className="inline-flex items-center gap-1 text-xs text-[var(--color-accent)] hover:underline">
                        Open <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </StickyDataTable>
        )}
      </DataTableShell>
    </Page>
  )
}

function Kpi({ icon: Icon, label, value, danger }: { icon: typeof FileText; label: string; value: string; danger?: boolean }) {
  return (
    <TravelCard contentClassName="px-4 py-3">
      <div className="flex items-start gap-3">
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)]', danger ? 'bg-[var(--color-danger-muted)] text-[var(--color-danger)]' : 'bg-[var(--color-accent-muted)]/50 text-[var(--color-accent)]')}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className={layout.statLabel}>{label}</p>
          <p className="text-base font-semibold">{value}</p>
        </div>
      </div>
    </TravelCard>
  )
}
