import { useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { ListFilter, Plus } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { SearchField } from '@/design-system/components/SearchField'
import { Button } from '@/design-system/components/Button'
import { layout } from '@/design-system/tokens/layout'
import type { SupplierStatus } from '@/domain/entities/supplier'
import { SupplierStatusFilter } from '@/features/suppliers/components/list/SupplierStatusFilter'
import { SuppliersSortMenu } from '@/features/suppliers/components/list/SuppliersSortMenu'
import { SuppliersFilterPanel } from '@/features/suppliers/components/list/SuppliersFilterPanel'
import { SuppliersSelectionInline } from '@/features/suppliers/components/list/SuppliersSelectionInline'
import { countActiveSupplierPanelFilters } from '@/features/suppliers/hooks/use-supplier-filter-options'
import type { SupplierRowSelection } from '@/features/suppliers/hooks/use-supplier-row-selection'
import { clearLabelIdsFromSearchParams } from '@/features/labels/utils/label-filter-navigation'
import type { SupplierPanelFilters, SupplierSortDir, SupplierSortField } from '@/repositories/interfaces'
import { EMPTY_SUPPLIER_PANEL_FILTERS } from '@/repositories/interfaces'
import { cn } from '@/shared/utils/cn'

interface SuppliersFiltersBarProps {
  searchInput: string
  onSearchChange: (value: string) => void
  status: SupplierStatus | 'all'
  onStatusChange: (status: SupplierStatus | 'all') => void
  sortBy: SupplierSortField
  sortDir: SupplierSortDir
  onSort: (field: SupplierSortField) => void
  onSortDirChange: (dir: SupplierSortDir) => void
  panelFilters: SupplierPanelFilters
  onPanelFiltersChange: Dispatch<SetStateAction<SupplierPanelFilters>>
  matchCount?: number
  isFetching?: boolean
  selection?: SupplierRowSelection
  pageSupplierCount?: number
  isBulkPending?: boolean
  onBulkEdit?: () => void
  onBulkDelete?: () => void
  canCreate?: boolean
  onCreate?: () => void
  columnPicker?: ReactNode
  className?: string
}

export function SuppliersFiltersBar({
  searchInput,
  onSearchChange,
  status,
  onStatusChange,
  sortBy,
  sortDir,
  onSort,
  onSortDirChange,
  panelFilters,
  onPanelFiltersChange,
  matchCount,
  isFetching,
  selection,
  pageSupplierCount = 0,
  isBulkPending,
  onBulkEdit,
  onBulkDelete,
  canCreate,
  onCreate,
  columnPicker,
  className,
}: SuppliersFiltersBarProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const panelFilterCount = countActiveSupplierPanelFilters(panelFilters)
  const hasSelection = (selection?.selectedCount ?? 0) > 0
  const hasFilters = searchInput.trim().length > 0 || status !== 'all' || panelFilterCount > 0
  const [searchOpen, setSearchOpen] = useState(() => searchInput.trim().length > 0)
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const selectedIds = useMemo(
    () => (selection ? Array.from(selection.selectedIds) : []),
    [selection?.selectedCount, selection?.selectedIds],
  )

  return (
    <>
      <div className={cn('flex flex-col', className)}>
        <div className="flex flex-col gap-2 border-b border-[var(--color-border)] px-2 py-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 sm:px-4 sm:py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            {hasSelection && selection ? (
              <SuppliersSelectionInline
                selectedCount={selection.selectedCount}
                selectedIds={selectedIds}
                allPageSelected={selection.allPageSelected}
                pageSupplierCount={pageSupplierCount}
                isBulkPending={isBulkPending}
                onTogglePage={selection.togglePage}
                onClear={selection.clear}
                onBulkEdit={() => onBulkEdit?.()}
                onBulkDelete={() => onBulkDelete?.()}
              />
            ) : (
              <h1 className={cn('shrink-0', layout.pageTitle)}>Suppliers</h1>
            )}
            {isFetching && (
              <span className="inline-flex shrink-0 items-center" aria-label="Loading">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-accent)]" />
              </span>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-1.5 sm:ml-auto sm:gap-2">
            <SearchField
              value={searchInput}
              onValueChange={onSearchChange}
              open={searchOpen}
              onOpenChange={setSearchOpen}
              placeholder="Name, email, contact, reference"
              aria-label="Search suppliers by name, email, contact, or reference"
              density="toolbar"
            />

            <SupplierStatusFilter value={status} onChange={onStatusChange} />

            <Button
              variant="secondary"
              size="sm"
              className={cn(
                'relative h-8 shrink-0 gap-1.5 px-2.5 font-normal',
                panelFilterCount > 0 && 'border-[var(--color-accent)] text-[var(--color-accent)]',
              )}
              aria-label="Open filters"
              onClick={() => setFilterPanelOpen(true)}
            >
              <ListFilter className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Filter</span>
              {panelFilterCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-accent)] px-1 text-[10px] font-normal leading-none text-white">
                  {panelFilterCount}
                </span>
              )}
            </Button>

            <SuppliersSortMenu sortBy={sortBy} sortDir={sortDir} onSort={onSort} onSortDirChange={onSortDirChange} />

            {columnPicker}

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 font-normal text-[var(--color-muted)]"
                onClick={() => {
                  onSearchChange('')
                  onStatusChange('all')
                  onPanelFiltersChange(EMPTY_SUPPLIER_PANEL_FILTERS)
                  clearLabelIdsFromSearchParams(searchParams, setSearchParams)
                  setSearchOpen(false)
                }}
              >
                Clear
              </Button>
            )}

            {canCreate ? (
              <Button
                variant="primary"
                size="sm"
                className="h-8 shrink-0 gap-1.5 px-2.5"
                onClick={onCreate}
                aria-label="New supplier"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">New Supplier</span>
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <SuppliersFilterPanel
        open={filterPanelOpen}
        onOpenChange={setFilterPanelOpen}
        filters={panelFilters}
        onFiltersChange={(filters) => {
          onPanelFiltersChange(filters)
          if ((filters.labelIds?.length ?? 0) === 0) {
            clearLabelIdsFromSearchParams(searchParams, setSearchParams)
          }
        }}
        matchCount={matchCount}
        status={status}
      />
    </>
  )
}
