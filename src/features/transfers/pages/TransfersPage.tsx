import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import type { TransferStage } from '@/domain/entities/transfer'
import {
  TRANSFER_KIND_LABELS,
  transferMargin,
  transferPrimaryLabel,
} from '@/domain/entities/transfer'
import { canMutate } from '@/domain/policies/permissions'
import { Page } from '@/design-system/layout/Page'
import { Button } from '@/design-system/components/Button'
import { SearchField } from '@/design-system/components/SearchField'
import { DataTableEmptyRow } from '@/design-system/components/DataTableEmptyState'
import { DataTableShell } from '@/design-system/layout/DataTableShell'
import { StickyDataTable } from '@/design-system/components/StickyDataTable'
import { Pagination } from '@/design-system/components/Pagination'
import { Skeleton } from '@/design-system/components/Skeleton'
import { AccountingAmount } from '@/design-system/components/AccountingAmount'
import { TripStageFilter } from '@/features/trips/components/list/TripStageFilter'
import { TripStageBadge } from '@/features/trips/components/list/TripStageBadge'
import { TransferFormDialog } from '@/features/transfers/components/TransferFormDialog'
import { useTransfersList } from '@/features/transfers/hooks/use-transfers'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { usePagination } from '@/shared/hooks/use-pagination'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'
import { TRANSFERS_PAGE_SIZE_STORAGE_KEY } from '@/types/pagination'
import type { TransferFilters } from '@/repositories/interfaces'
import { layout } from '@/design-system/tokens/layout'
import { tableCellClass, tableHeadClass } from '@/design-system/components/table-styles'
import { formatDate } from '@/shared/utils/date-format'
import { cn } from '@/shared/utils/cn'
import { removeActionSearchParams } from '@/features/labels/utils/label-filter-navigation'

export function TransfersPage() {
  const navigate = useNavigate()
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const canCreate = canMutate(role, 'order', 'create')
  const [searchParams, setSearchParams] = useSearchParams()

  const [searchInput, setSearchInput] = useState('')
  const [stage, setStage] = useState<TransferStage | 'all'>('all')
  const [formOpen, setFormOpen] = useState(false)

  const search = useDebouncedValue(searchInput, 300)
  const { page, pageSize, setPage, setPageSize, resetPage } = usePagination({
    persistKey: TRANSFERS_PAGE_SIZE_STORAGE_KEY,
  })

  const filters: TransferFilters = useMemo(
    () => ({ search, stage, sortBy: 'reference', sortDir: 'desc' }),
    [search, stage],
  )
  const { data: result, isLoading, isFetching } = useTransfersList(filters, page, pageSize)
  const transfers = result?.items ?? []

  useEffect(() => {
    resetPage()
  }, [search, stage, pageSize, resetPage])

  useEffect(() => {
    if (searchParams.get('create') === '1' && canCreate) {
      setFormOpen(true)
      removeActionSearchParams(searchParams, setSearchParams, ['create'])
    }
  }, [searchParams, setSearchParams, canCreate])

  const total = result?.total ?? 0
  const totalPages = total > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1
  const hasFilters = searchInput.trim().length > 0 || stage !== 'all'

  return (
    <Page className="flex min-h-0 flex-col">
      <DataTableShell
        className="h-full"
        isFetching={isFetching && !isLoading}
        header={
          <div className="flex flex-col gap-2 border-b border-[var(--color-border)] px-2 py-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 sm:px-4 sm:py-2.5">
            <h1 className={cn('shrink-0', layout.pageTitle)}>Transfers</h1>
            <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
              <SearchField
                value={searchInput}
                onValueChange={setSearchInput}
                placeholder="Route, trip, supplier, ID"
                aria-label="Search transfers"
                density="toolbar"
              />
              <TripStageFilter value={stage} onChange={setStage} />
              {canCreate ? (
                <Button type="button" size="sm" className="h-8 gap-1.5" onClick={() => setFormOpen(true)}>
                  <Plus className="h-3.5 w-3.5" />
                  New transfer
                </Button>
              ) : null}
            </div>
          </div>
        }
        footer={
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        }
      >
        <StickyDataTable>
          <thead>
            <tr>
              <th className={tableHeadClass}>Reference</th>
              <th className={tableHeadClass}>Route</th>
              <th className={tableHeadClass}>Kind</th>
              <th className={tableHeadClass}>Stage</th>
              <th className={tableHeadClass}>Date</th>
              <th className={tableHeadClass}>Trip</th>
              <th className={cn(tableHeadClass, 'text-right')}>Sell</th>
              <th className={cn(tableHeadClass, 'text-right')}>Margin</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <tr key={index}>
                  <td className={tableCellClass} colSpan={8}>
                    <Skeleton className="h-8 w-full" />
                  </td>
                </tr>
              ))
            ) : transfers.length === 0 ? (
              <DataTableEmptyRow
                colSpan={8}
                title={hasFilters ? 'No transfers match filters' : 'No transfers yet'}
                description={
                  hasFilters
                    ? 'Try clearing search or stage filters.'
                    : 'Create a draft transfer to start the ops pipeline.'
                }
              />
            ) : (
              transfers.map((transfer) => (
                <tr
                  key={transfer.id}
                  className="cursor-pointer transition-colors hover:bg-[var(--color-surface-muted)]/70"
                  onClick={() => navigate(`/transfers/${transfer.id}/route`)}
                >
                  <td className={cn(tableCellClass, 'font-medium')}>{transfer.reference}</td>
                  <td className={cn(tableCellClass, 'max-w-[16rem] truncate')}>
                    {transferPrimaryLabel(transfer)}
                  </td>
                  <td className={tableCellClass}>{TRANSFER_KIND_LABELS[transfer.kind]}</td>
                  <td className={tableCellClass}>
                    <TripStageBadge stage={transfer.stage} />
                  </td>
                  <td className={tableCellClass}>
                    {transfer.serviceDate ? formatDate(transfer.serviceDate) : '—'}
                  </td>
                  <td className={cn(tableCellClass, 'max-w-[8rem] truncate')}>
                    {transfer.tripReference ?? '—'}
                  </td>
                  <td className={cn(tableCellClass, 'text-right')}>
                    <AccountingAmount amount={transfer.sellingPrice} currency={transfer.currency} />
                  </td>
                  <td className={cn(tableCellClass, 'text-right')}>
                    <AccountingAmount amount={transferMargin(transfer)} currency={transfer.currency} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </StickyDataTable>
      </DataTableShell>

      <TransferFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onCreated={(transferId) => navigate(`/transfers/${transferId}/route`)}
      />
    </Page>
  )
}
