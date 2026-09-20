import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Client } from '@/domain/entities/client'
import type { TripSortDir, TripSortField } from '@/repositories/interfaces'
import { ClientLinkedTripsTable } from '@/features/clients/components/trips/ClientLinkedTripsTable'
import { ClientLinkedTripsTableColumnPicker } from '@/features/clients/components/trips/ClientLinkedTripsTableColumnPicker'
import { ClientLinkedTripsToolbar } from '@/features/clients/components/trips/ClientLinkedTripsToolbar'
import { useClientLinkedTripsList } from '@/features/clients/hooks/use-clients'
import { useClientLinkedTripsTableLayout } from '@/features/clients/hooks/use-client-linked-trips-table-layout'
import { useTripMutations } from '@/features/trips/hooks/use-trip-mutations'
import { useClientLinkedTripsRowSelection } from '@/features/clients/hooks/use-client-linked-trips-row-selection'
import { TableRowSelectionProvider } from '@/shared/hooks/table-row-selection-context'
import { usePagination } from '@/shared/hooks/use-pagination'
import { CLIENTS_PAGE_SIZE_STORAGE_KEY } from '@/types/pagination'

interface ClientTripsTabProps {
  client: Client
}

export function ClientTripsTab({ client }: ClientTripsTabProps) {
  const [sortBy, setSortBy] = useState<TripSortField>('reference')
  const [sortDir, setSortDir] = useState<TripSortDir>('desc')
  const { page, pageSize, setPage, setPageSize, resetPage } = usePagination({
    persistKey: CLIENTS_PAGE_SIZE_STORAGE_KEY,
  })
  const tableLayout = useClientLinkedTripsTableLayout()
  const { data: result, isLoading, isFetching } = useClientLinkedTripsList(
    client.id,
    sortBy,
    sortDir,
    page,
    pageSize,
  )
  const pageTripIds = useMemo(() => result?.items.map((trip) => trip.id) ?? [], [result?.items])
  const selection = useClientLinkedTripsRowSelection(pageTripIds)
  const { cloneTrip, deleteTrip, cloningTripId, deletingTripId } = useTripMutations()

  const handleSort = useCallback((field: TripSortField) => {
    setSortBy((current) => {
      if (current === field) {
        setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
        return current
      }
      setSortDir('asc')
      return field
    })
  }, [])

  const handleDeleteTrip = useCallback(
    (tripId: string) => {
      deleteTrip(tripId)
    },
    [deleteTrip],
  )

  useEffect(() => {
    resetPage()
  }, [client.id, pageSize, sortBy, sortDir, resetPage])

  const isListRefreshing = isFetching && !isLoading

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <TableRowSelectionProvider store={selection.store}>
        <ClientLinkedTripsTable
          toolbar={
            <ClientLinkedTripsToolbar
              total={result?.total}
              isFetching={isListRefreshing}
              columnPicker={<ClientLinkedTripsTableColumnPicker layout={tableLayout} />}
            />
          }
          selection={selection}
          result={result}
          page={page}
          pageSize={pageSize}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          isLoading={isLoading}
          isFetching={isListRefreshing}
          layout={tableLayout}
          onCloneTrip={cloneTrip}
          onDeleteTrip={handleDeleteTrip}
          cloningTripId={cloningTripId}
          deletingTripId={deletingTripId}
        />
      </TableRowSelectionProvider>
    </div>
  )
}
