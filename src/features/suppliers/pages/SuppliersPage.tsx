import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Supplier } from '@/domain/entities/supplier'
import type { SupplierStatus } from '@/domain/entities/supplier'
import { canMutate } from '@/domain/policies/permissions'
import { Page } from '@/design-system/layout/Page'
import { TableColumnPicker } from '@/design-system/components/TableColumnPicker'
import { SuppliersTable } from '@/features/suppliers/components/list/SuppliersTable'
import { SuppliersFiltersBar } from '@/features/suppliers/components/list/SuppliersFiltersBar'
import { SuppliersBulkEditDialog } from '@/features/suppliers/components/list/SuppliersBulkEditDialog'
import { SupplierFormDialog } from '@/features/suppliers/components/SupplierFormDialog'
import { useSuppliersList } from '@/features/suppliers/hooks/use-suppliers'
import { useSupplierMutations } from '@/features/suppliers/hooks/use-supplier-mutations'
import { useSupplierRowSelection } from '@/features/suppliers/hooks/use-supplier-row-selection'
import { useSupplierTabNavigation } from '@/features/suppliers/hooks/use-supplier-tab-navigation'
import { SUPPLIERS_TABLE_COLUMN_OPTIONS } from '@/features/suppliers/components/list/suppliers-table-columns'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { usePagination } from '@/shared/hooks/use-pagination'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'
import { useTableColumnVisibility } from '@/shared/hooks/use-table-column-visibility'
import { SUPPLIERS_PAGE_SIZE_STORAGE_KEY } from '@/types/pagination'
import { SUPPLIERS_TABLE_COLUMNS_STORAGE_KEY } from '@/types/table-columns'
import {
  EMPTY_SUPPLIER_PANEL_FILTERS,
  type SupplierFilters,
  type SupplierPanelFilters,
  type SupplierSortDir,
  type SupplierSortField,
} from '@/repositories/interfaces'
import { useLabelIdsSearchParam } from '@/features/labels/hooks/use-label-ids-search-param'
import { removeActionSearchParams } from '@/features/labels/utils/label-filter-navigation'

export function SuppliersPage() {
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const canCreate = canMutate(role, 'directory', 'create')
  const [searchParams, setSearchParams] = useSearchParams()
  const { navigateToSupplier } = useSupplierTabNavigation()

  const [searchInput, setSearchInput] = useState('')
  const [status, setStatus] = useState<SupplierStatus | 'all'>('all')
  const [panelFilters, setPanelFilters] = useState<SupplierPanelFilters>(EMPTY_SUPPLIER_PANEL_FILTERS)
  const applyLabelIdsFromUrl = useCallback((labelIds: string[]) => {
    setPanelFilters((current) => ({ ...current, labelIds }))
  }, [])
  useLabelIdsSearchParam(applyLabelIdsFromUrl)
  const [sortBy, setSortBy] = useState<SupplierSortField>('reference')
  const [sortDir, setSortDir] = useState<SupplierSortDir>('desc')
  const [bulkEditOpen, setBulkEditOpen] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)

  const search = useDebouncedValue(searchInput, 300)
  const { page, pageSize, setPage, setPageSize, resetPage } = usePagination({
    persistKey: SUPPLIERS_PAGE_SIZE_STORAGE_KEY,
  })
  const columnVisibility = useTableColumnVisibility(SUPPLIERS_TABLE_COLUMNS_STORAGE_KEY, SUPPLIERS_TABLE_COLUMN_OPTIONS)
  const { createSupplier, updateSupplier, bulkDeleteSuppliers, bulkUpdateSuppliers, isPending, isBulkPending } =
    useSupplierMutations()

  const filters: SupplierFilters = {
    search,
    status,
    category: panelFilters.category,
    country: panelFilters.country,
    city: panelFilters.city,
    labelIds: panelFilters.labelIds,
    sortBy,
    sortDir,
  }
  const { data: result, isLoading, isFetching } = useSuppliersList(filters, page, pageSize)
  const pageSupplierIds = useMemo(() => result?.items.map((supplier) => supplier.id) ?? [], [result?.items])
  const selection = useSupplierRowSelection(pageSupplierIds)

  useEffect(() => {
    resetPage()
  }, [search, status, panelFilters, pageSize, sortBy, sortDir, resetPage])

  useEffect(() => {
    if (searchParams.get('create') === '1' && canCreate) {
      setEditingSupplier(null)
      setFormOpen(true)
      removeActionSearchParams(searchParams, setSearchParams, ['create'])
    }
  }, [searchParams, setSearchParams, canCreate])

  const handleSort = useCallback(
    (field: SupplierSortField) => {
      if (sortBy === field) {
        setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
        return
      }
      setSortBy(field)
      const defaultAsc =
        field === 'displayName' || field === 'category' || field === 'email' || field === 'status'
      setSortDir(field === 'reference' || field === 'updatedAt' ? 'desc' : defaultAsc ? 'asc' : 'desc')
    },
    [sortBy],
  )

  const openCreate = useCallback(() => {
    setEditingSupplier(null)
    setFormOpen(true)
  }, [])

  const openEdit = useCallback((supplier: Supplier) => {
    setEditingSupplier(supplier)
    setFormOpen(true)
  }, [])

  const handleBulkDelete = useCallback(() => {
    const ids = Array.from(selection.selectedIds)
    if (ids.length === 0) return
    bulkDeleteSuppliers.mutate(ids, {
      onSuccess: () => selection.clear(),
    })
  }, [bulkDeleteSuppliers, selection])

  const handleBulkEdit = useCallback(() => {
    const ids = Array.from(selection.selectedIds)
    if (ids.length === 0) return
    if (ids.length === 1) {
      navigateToSupplier(ids[0], { tab: 'profile' })
      return
    }
    setBulkEditOpen(true)
  }, [navigateToSupplier, selection.selectedIds])

  const handleBulkUpdate = useCallback(
    (patch: { status?: SupplierStatus; category?: Supplier['category'] }) => {
      const ids = Array.from(selection.selectedIds)
      if (ids.length === 0) return
      bulkUpdateSuppliers.mutate(
        { supplierIds: ids, patch },
        {
          onSuccess: () => {
            selection.clear()
            setBulkEditOpen(false)
          },
        },
      )
    },
    [bulkUpdateSuppliers, selection],
  )

  const handleFormSubmit = useCallback(
    (input: Parameters<typeof createSupplier.mutate>[0]) => {
      if (editingSupplier) {
        updateSupplier.mutate(
          { id: editingSupplier.id, patch: input },
          {
            onSuccess: () => {
              setFormOpen(false)
              setEditingSupplier(null)
            },
          },
        )
        return
      }

      createSupplier.mutate(input, {
        onSuccess: (created) => {
          setFormOpen(false)
          navigateToSupplier(created.id, { tab: 'overview' })
        },
      })
    },
    [createSupplier, updateSupplier, editingSupplier, navigateToSupplier],
  )

  return (
    <Page layout="viewport" className="min-h-0 flex-1">
      <div className="min-h-0 flex-1">
        <SuppliersTable
          toolbar={
            <SuppliersFiltersBar
              searchInput={searchInput}
              onSearchChange={setSearchInput}
              status={status}
              onStatusChange={setStatus}
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={handleSort}
              onSortDirChange={setSortDir}
              panelFilters={panelFilters}
              onPanelFiltersChange={setPanelFilters}
              matchCount={result?.total}
              isFetching={isFetching && !isLoading}
              selection={selection}
              pageSupplierCount={result?.items.length ?? 0}
              isBulkPending={isBulkPending}
              onBulkEdit={handleBulkEdit}
              onBulkDelete={handleBulkDelete}
              canCreate={canCreate}
              onCreate={openCreate}
              columnPicker={<TableColumnPicker columnVisibility={columnVisibility} />}
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
          columnVisibility={columnVisibility}
          onEditSupplier={openEdit}
        />

        <SuppliersBulkEditDialog
          open={bulkEditOpen}
          onOpenChange={setBulkEditOpen}
          selectedCount={selection.selectedCount}
          isPending={isBulkPending}
          onApply={handleBulkUpdate}
        />

        <SupplierFormDialog
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open)
            if (!open) setEditingSupplier(null)
          }}
          supplier={editingSupplier}
          isPending={isPending}
          onSubmit={handleFormSubmit}
        />
      </div>
    </Page>
  )
}
