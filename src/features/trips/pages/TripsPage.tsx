import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { canMutate } from '@/domain/policies/permissions'
import { useTripsList } from '@/features/trips/hooks/use-trips'
import { useTripMutations } from '@/features/trips/hooks/use-trip-mutations'
import { useTripRowSelection } from '@/features/trips/hooks/use-trip-row-selection'
import { usePagination } from '@/shared/hooks/use-pagination'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'
import { Page } from '@/design-system/layout/Page'
import { TripsTable } from '@/features/trips/components/list/TripsTable'
import { TripsFiltersBar } from '@/features/trips/components/list/TripsFiltersBar'
import { TripsBulkEditDialog } from '@/features/trips/components/list/TripsBulkEditDialog'
import { TripFormDialog } from '@/features/trips/components/TripFormDialog'
import type { TripFormInput } from '@/features/trips/utils/create-trip'
import type { TripStage } from '@/domain/entities'
import { useAuthStore } from '@/features/auth/store/auth-store'
import {
  EMPTY_TRIP_PANEL_FILTERS,
  type TripFilters,
  type TripPanelFilters,
  type TripSortDir,
  type TripSortField,
} from '@/repositories/interfaces'
import { useTripsSearchStore } from '@/shared/stores/trips-search-store'
import { TRIPS_PAGE_SIZE_STORAGE_KEY } from '@/types/pagination'
import { useTripsTableLayout } from '@/features/trips/hooks/use-trips-table-layout'
import { TripsTableColumnPicker } from '@/features/trips/components/list/TripsTableColumnPicker'
import { useLabelIdsSearchParam } from '@/features/labels/hooks/use-label-ids-search-param'
import { removeActionSearchParams } from '@/features/labels/utils/label-filter-navigation'
import { TableRowSelectionProvider } from '@/shared/hooks/table-row-selection-context'

export function TripsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const user = useAuthStore((state) => state.user)
  const role = user?.role ?? 'guest'
  const canCreate = canMutate(role, 'order', 'create')
  const [bulkEditOpen, setBulkEditOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const searchInput = useTripsSearchStore((state) => state.searchInput)
  const setSearchInput = useTripsSearchStore((state) => state.setSearchInput)
  const [stage, setStage] = useState<TripStage | 'all'>('all')
  const [panelFilters, setPanelFilters] = useState<TripPanelFilters>(EMPTY_TRIP_PANEL_FILTERS)
  const applyLabelIdsFromUrl = useCallback((labelIds: string[]) => {
    setPanelFilters((current) => ({ ...current, labelIds }))
  }, [])
  useLabelIdsSearchParam(applyLabelIdsFromUrl)
  const [sortBy, setSortBy] = useState<TripSortField>('reference')
  const [sortDir, setSortDir] = useState<TripSortDir>('desc')
  const search = useDebouncedValue(searchInput, 300)
  const { page, pageSize, setPage, setPageSize, resetPage } = usePagination({
    persistKey: TRIPS_PAGE_SIZE_STORAGE_KEY,
  })
  const tripsTableLayout = useTripsTableLayout()

  const filters: TripFilters = {
    search,
    stage,
    owner: panelFilters.owner,
    client: panelFilters.client,
    destination: panelFilters.destination,
    dateFrom: panelFilters.dateFrom || undefined,
    dateTo: panelFilters.dateTo || undefined,
    labelIds: panelFilters.labelIds,
    sortBy,
    sortDir,
  }
  const { data: result, isLoading, isFetching } = useTripsList(filters, page, pageSize)
  const pageTripIds = useMemo(() => result?.items.map((trip) => trip.id) ?? [], [result?.items])
  const selection = useTripRowSelection(pageTripIds)
  const { bulkDeleteTrips, bulkCloneTrips, bulkUpdateTrips, createTrip, isBulkPending, isCreating } =
    useTripMutations()

  const handleBulkDelete = useCallback(() => {
    const ids = Array.from(selection.selectedIds)
    if (ids.length === 0) return
    bulkDeleteTrips(ids, {
      onSuccess: () => selection.clear(),
    })
  }, [bulkDeleteTrips, selection])

  const handleBulkClone = useCallback(() => {
    const ids = Array.from(selection.selectedIds)
    if (ids.length === 0) return
    bulkCloneTrips(ids, {
      onSuccess: () => selection.clear(),
    })
  }, [bulkCloneTrips, selection])

  const handleBulkEdit = useCallback(() => {
    const ids = Array.from(selection.selectedIds)
    if (ids.length === 0) return
    if (ids.length === 1) {
      navigate(`/trips/${ids[0]}/services`)
      return
    }
    setBulkEditOpen(true)
  }, [navigate, selection.selectedIds])

  const handleBulkUpdateStage = useCallback(
    (stage: TripStage) => {
      const ids = Array.from(selection.selectedIds)
      if (ids.length === 0) return
      bulkUpdateTrips(
        { tripIds: ids, patch: { stage } },
        {
          onSuccess: () => {
            selection.clear()
            setBulkEditOpen(false)
          },
        },
      )
    },
    [bulkUpdateTrips, selection],
  )

  useEffect(() => {
    resetPage()
  }, [search, stage, panelFilters, pageSize, sortBy, sortDir, resetPage])

  useEffect(() => {
    if (searchParams.get('create') === '1' && canCreate) {
      setFormOpen(true)
      removeActionSearchParams(searchParams, setSearchParams, ['create'])
    }
  }, [searchParams, setSearchParams, canCreate])

  const openCreate = useCallback(() => {
    setFormOpen(true)
  }, [])

  const handleCreateTrip = useCallback(
    (input: TripFormInput) => {
      createTrip(
        { input },
        {
          onSuccess: () => setFormOpen(false),
        },
      )
    },
    [createTrip],
  )

  const defaultOwner = useMemo(
    () => (user ? { name: user.name, id: user.id } : null),
    [user],
  )

  const handleSort = useCallback(
    (field: TripSortField) => {
      if (sortBy === field) {
        setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
        return
      }
      setSortBy(field)
      const defaultAsc =
        field === 'owner' || field === 'client' || field === 'destination' || field === 'stage'
      setSortDir(field === 'reference' ? 'desc' : defaultAsc ? 'asc' : 'desc')
    },
    [sortBy],
  )

  const handleSortDirChange = useCallback((dir: TripSortDir) => {
    setSortDir(dir)
  }, [])

  return (
    <Page layout="viewportFlush" className="min-h-0 flex-1">
      <TableRowSelectionProvider store={selection.store}>
        <div className="flex h-full min-h-0 flex-1 flex-col">
          <TripsTable
          toolbar={
            <TripsFiltersBar
              searchInput={searchInput}
              onSearchChange={setSearchInput}
              stage={stage}
              onStageChange={setStage}
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={handleSort}
              onSortDirChange={handleSortDirChange}
              panelFilters={panelFilters}
              onPanelFiltersChange={setPanelFilters}
              matchCount={result?.total}
              isFetching={isFetching && !isLoading}
              selection={selection}
              pageTripCount={result?.items.length ?? 0}
              isBulkPending={isBulkPending}
              onBulkClone={handleBulkClone}
              onBulkEdit={handleBulkEdit}
              onBulkDelete={handleBulkDelete}
              columnPicker={<TripsTableColumnPicker layout={tripsTableLayout} />}
              canCreate={canCreate}
              onNewTrip={openCreate}
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
          isFetching={isFetching}
          layout={tripsTableLayout}
        />
        <TripsBulkEditDialog
          open={bulkEditOpen}
          onOpenChange={setBulkEditOpen}
          selectedCount={selection.selectedCount}
          isPending={isBulkPending}
          onApply={handleBulkUpdateStage}
        />
        {canCreate ? (
          <TripFormDialog
            open={formOpen}
            onOpenChange={setFormOpen}
            defaultOwner={defaultOwner}
            isPending={isCreating}
            onSubmit={handleCreateTrip}
          />
        ) : null}
        </div>
      </TableRowSelectionProvider>
    </Page>
  )
}
