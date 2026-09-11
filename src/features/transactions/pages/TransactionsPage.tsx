import { useEffect, useMemo, useState } from 'react'
import { Page } from '@/design-system/layout/Page'
import { TransactionsFiltersBar } from '@/features/transactions/components/TransactionsFiltersBar'
import { TransactionsTable } from '@/features/transactions/components/TransactionsTable'
import { useTransactionsList, useTransactionTripRefs } from '@/features/transactions/hooks/use-transactions'
import { usePagination } from '@/shared/hooks/use-pagination'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'
import { TRANSACTIONS_PAGE_SIZE_STORAGE_KEY } from '@/types/pagination'
import type { PaymentFilters, PaymentSortDir, PaymentSortField } from '@/repositories/interfaces'
import { useLabelIdsSearchParam } from '@/features/labels/hooks/use-label-ids-search-param'

export function TransactionsPage() {
  const [searchInput, setSearchInput] = useState('')
  const [direction, setDirection] = useState<PaymentFilters['direction']>('all')
  const [status, setStatus] = useState<PaymentFilters['status']>('all')
  const [labelIds, setLabelIds] = useState<string[]>([])
  useLabelIdsSearchParam(setLabelIds)
  const [sortBy] = useState<PaymentSortField>('paidAt')
  const [sortDir] = useState<PaymentSortDir>('desc')

  const search = useDebouncedValue(searchInput, 300)
  const { page, pageSize, setPage, setPageSize, resetPage } = usePagination({
    persistKey: TRANSACTIONS_PAGE_SIZE_STORAGE_KEY,
  })

  const filters: PaymentFilters = { search, direction, status, labelIds, sortBy, sortDir }
  const { data: result, isLoading, isFetching } = useTransactionsList(filters, page, pageSize)

  const tripIds = useMemo(() => [...new Set((result?.items ?? []).map((payment) => payment.tripId))], [result?.items])
  const { data: tripRefs = {} } = useTransactionTripRefs(tripIds)

  useEffect(() => {
    resetPage()
  }, [search, direction, status, labelIds, pageSize, resetPage])

  return (
    <Page className="flex min-h-0 flex-col">
      <TransactionsTable
        toolbar={
          <TransactionsFiltersBar
            searchInput={searchInput}
            onSearchChange={setSearchInput}
            direction={direction ?? 'all'}
            onDirectionChange={setDirection}
            status={status ?? 'all'}
            onStatusChange={setStatus}
            labelIds={labelIds}
            onLabelIdsChange={setLabelIds}
            isFetching={isFetching}
          />
        }
        result={result}
        tripRefs={tripRefs}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        isLoading={isLoading}
        isFetching={isFetching}
      />
    </Page>
  )
}
