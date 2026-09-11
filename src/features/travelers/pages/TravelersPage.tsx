import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { Traveler } from '@/domain/entities/traveler'
import { canMutate } from '@/domain/policies/permissions'
import { Page } from '@/design-system/layout/Page'
import { TableRowSelectionProvider } from '@/shared/hooks/table-row-selection-context'
import { TravelersTable } from '@/features/travelers/components/list/TravelersTable'
import { TravelersFiltersBar } from '@/features/travelers/components/list/TravelersFiltersBar'
import { TravelersTableColumnPicker } from '@/features/travelers/components/list/TravelersTableColumnPicker'
import { TravelerFormDialog } from '@/features/travelers/components/TravelerFormDialog'
import { useTravelersList } from '@/features/travelers/hooks/use-travelers'
import { useTravelerMutations } from '@/features/travelers/hooks/use-traveler-mutations'
import { useTravelerRowSelection } from '@/features/travelers/hooks/use-travelers-row-selection'
import { useTravelersTableLayout } from '@/features/travelers/hooks/use-travelers-table-layout'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { usePagination } from '@/shared/hooks/use-pagination'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'
import { TRAVELERS_PAGE_SIZE_STORAGE_KEY } from '@/types/pagination'
import type { TravelerFilters, TravelerSortDir, TravelerSortField } from '@/repositories/interfaces'
import { removeActionSearchParams } from '@/features/labels/utils/label-filter-navigation'

export function TravelersPage() {
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const canCreate = canMutate(role, 'passenger', 'create')
  const canDelete = canMutate(role, 'passenger', 'delete')
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [searchInput, setSearchInput] = useState('')
  const [sortBy, setSortBy] = useState<TravelerSortField>('name')
  const [sortDir, setSortDir] = useState<TravelerSortDir>('asc')
  const [formOpen, setFormOpen] = useState(false)
  const [editingTraveler, setEditingTraveler] = useState<Traveler | null>(null)

  const search = useDebouncedValue(searchInput, 300)
  const { page, pageSize, setPage, setPageSize, resetPage } = usePagination({
    persistKey: TRAVELERS_PAGE_SIZE_STORAGE_KEY,
  })
  const tableLayout = useTravelersTableLayout()
  const {
    createTraveler,
    updateTraveler,
    deleteTraveler,
    bulkDeleteTravelers,
    isFormPending,
    isBulkPending,
    deletingTravelerId,
  } = useTravelerMutations()

  const filters: TravelerFilters = {
    search,
    sortBy,
    sortDir,
  }
  const { data: result, isLoading, isFetching, isPlaceholderData } = useTravelersList(filters, page, pageSize)
  const isListRefreshing = isFetching && !isLoading && !isPlaceholderData
  const pageTravelerIds = useMemo(() => result?.items.map((traveler) => traveler.id) ?? [], [result?.items])
  const selection = useTravelerRowSelection(pageTravelerIds)

  useEffect(() => {
    resetPage()
  }, [search, pageSize, sortBy, sortDir, resetPage])

  useEffect(() => {
    if (searchParams.get('create') === '1' && canCreate) {
      setEditingTraveler(null)
      setFormOpen(true)
      removeActionSearchParams(searchParams, setSearchParams, ['create'])
    }
  }, [searchParams, setSearchParams, canCreate])

  const handleSort = useCallback(
    (field: TravelerSortField) => {
      if (sortBy === field) {
        setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
        return
      }
      setSortBy(field)
      setSortDir(field === 'createdAt' ? 'desc' : 'asc')
    },
    [sortBy],
  )

  const openCreate = useCallback(() => {
    setEditingTraveler(null)
    setFormOpen(true)
  }, [])

  const openEdit = useCallback((traveler: Traveler) => {
    setEditingTraveler(traveler)
    setFormOpen(true)
  }, [])

  const openProfile = useCallback(
    (traveler: Traveler) => {
      navigate(`/travelers/${traveler.id}`)
    },
    [navigate],
  )

  const openAccount = useCallback(
    (traveler: Traveler) => {
      navigate(`/clients/${traveler.accountId}/travelers`)
    },
    [navigate],
  )

  const handleBulkDelete = useCallback(() => {
    if (!canDelete) return
    const ids = Array.from(selection.selectedIds)
    if (ids.length === 0) return
    bulkDeleteTravelers.mutate(ids, {
      onSuccess: () => selection.clear(),
    })
  }, [bulkDeleteTravelers, canDelete, selection])

  const handleDeleteTraveler = useCallback(
    (id: string) => {
      if (!canDelete) return
      deleteTraveler.mutate(id)
    },
    [canDelete, deleteTraveler],
  )

  const handleFormSubmit = useCallback(
    (input: Parameters<typeof createTraveler.mutate>[0]) => {
      if (editingTraveler) {
        updateTraveler.mutate(
          { id: editingTraveler.id, patch: input },
          {
            onSuccess: () => {
              setFormOpen(false)
              setEditingTraveler(null)
            },
          },
        )
        return
      }

      createTraveler.mutate(input, {
        onSuccess: () => {
          setFormOpen(false)
        },
      })
    },
    [createTraveler, updateTraveler, editingTraveler],
  )

  return (
    <Page layout="viewportFlush" className="min-h-0 flex-1">
      <TableRowSelectionProvider store={selection.store}>
        <div className="flex h-full min-h-0 flex-1 flex-col">
          <TravelersTable
            toolbar={
              <TravelersFiltersBar
                searchInput={searchInput}
                onSearchChange={setSearchInput}
                matchCount={result?.total}
                isFetching={isListRefreshing}
                selection={selection}
                pageTravelerCount={result?.items.length ?? 0}
                isBulkPending={isBulkPending}
                onBulkDelete={canDelete ? handleBulkDelete : undefined}
                canCreate={canCreate}
                onCreate={openCreate}
                columnPicker={<TravelersTableColumnPicker layout={tableLayout} />}
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
            hasActiveSearch={search.trim().length > 0}
            onEditTraveler={openEdit}
            onOpenProfile={openProfile}
            onDeleteTraveler={handleDeleteTraveler}
            onOpenAccount={openAccount}
            deletingTravelerId={deletingTravelerId}
          />

          <TravelerFormDialog
            open={formOpen}
            onOpenChange={(open) => {
              setFormOpen(open)
              if (!open) setEditingTraveler(null)
            }}
            traveler={editingTraveler}
            isPending={isFormPending}
            onSubmit={handleFormSubmit}
          />
        </div>
      </TableRowSelectionProvider>
    </Page>
  )
}
