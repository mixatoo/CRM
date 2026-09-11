import { useState, type ReactNode } from 'react'
import { Plus } from 'lucide-react'
import type { ServiceCategory } from '@/domain/entities'
import type { TripServiceStatus } from '@/domain/entities/trip-service'
import { Button } from '@/design-system/components/Button'
import { SearchField } from '@/design-system/components/SearchField'
import {
  TripServiceCategoryFilter,
  TripServiceStatusFilter,
} from '@/features/trips/components/services/TripServicesFacetFilters'
import { TripServicesSortMenu } from '@/features/trips/components/services/TripServicesSortMenu'
import { TripServicesSelectionInline } from '@/features/trips/components/services/TripServicesSelectionInline'
import type { TripRowSelection } from '@/features/trips/hooks/use-trip-row-selection'
import type {
  TripServiceSortDir,
  TripServiceSortField,
} from '@/features/trips/components/services/trip-services-list'

interface TripServicesToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  category: ServiceCategory | 'all'
  onCategoryChange: (value: ServiceCategory | 'all') => void
  status: TripServiceStatus | 'all'
  onStatusChange: (value: TripServiceStatus | 'all') => void
  sortBy: TripServiceSortField
  sortDir: TripServiceSortDir
  onSort: (field: TripServiceSortField) => void
  onSortDirChange: (dir: TripServiceSortDir) => void
  onAddService: () => void
  canCreate?: boolean
  canBulkMutate?: boolean
  selection?: TripRowSelection
  pageServiceCount?: number
  isBulkPending?: boolean
  onBulkClone?: () => void
  onBulkEdit?: () => void
  onBulkDelete?: () => void
  columnPicker?: ReactNode
}

export function TripServicesToolbar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  sortBy,
  sortDir,
  onSort,
  onSortDirChange,
  onAddService,
  canCreate = true,
  canBulkMutate = true,
  selection,
  pageServiceCount = 0,
  isBulkPending,
  onBulkClone,
  onBulkEdit,
  onBulkDelete,
  columnPicker,
}: TripServicesToolbarProps) {
  const hasFilters = search.trim().length > 0 || category !== 'all' || status !== 'all'
  const hasSelection = (selection?.selectedCount ?? 0) > 0
  const [searchOpen, setSearchOpen] = useState(() => search.trim().length > 0)

  return (
    <div className="flex flex-col gap-2 px-2 py-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 sm:px-3 sm:py-2.5">
      {hasSelection && selection && canBulkMutate ? (
        <div className="flex min-w-0 items-center gap-2">
          <TripServicesSelectionInline
            selectedCount={selection.selectedCount}
            allPageSelected={selection.allPageSelected}
            pageServiceCount={pageServiceCount}
            isBulkPending={isBulkPending}
            onTogglePage={selection.togglePage}
            onBulkClone={() => onBulkClone?.()}
            onBulkEdit={() => onBulkEdit?.()}
            onBulkDelete={() => onBulkDelete?.()}
          />
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
        <SearchField
          value={search}
          onValueChange={onSearchChange}
          open={searchOpen}
          onOpenChange={setSearchOpen}
          placeholder="Service or supplier"
          aria-label="Search services by name or supplier"
          density="toolbar"
        />

        {columnPicker}

        <TripServiceCategoryFilter value={category} onChange={onCategoryChange} />

        <TripServiceStatusFilter value={status} onChange={onStatusChange} />

        <TripServicesSortMenu
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={onSort}
          onSortDirChange={onSortDirChange}
        />

        {hasFilters ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 font-normal text-[var(--color-muted)]"
            onClick={() => {
              onSearchChange('')
              onCategoryChange('all')
              onStatusChange('all')
              setSearchOpen(false)
            }}
          >
            Clear
          </Button>
        ) : null}

        {canCreate ? (
          <Button variant="primary" size="sm" className="h-8 shrink-0 gap-1.5" onClick={onAddService}>
            <Plus className="h-3.5 w-3.5" />
            Add service
          </Button>
        ) : null}
      </div>
    </div>
  )
}
