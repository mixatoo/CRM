import { useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { ListFilter, Plus } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { TripsSortMenu } from '@/features/trips/components/list/TripsSortMenu'
import { SearchField } from '@/design-system/components/SearchField'
import { Button } from '@/design-system/components/Button'
import type { TripStage } from '@/domain/entities'
import { TripsFilterPanel } from '@/features/trips/components/list/TripsFilterPanel'
import { TripsPageTitle } from '@/features/trips/components/list/TripsPageTitle'
import { TripsSelectionInline } from '@/features/trips/components/list/TripsSelectionInline'
import { countActivePanelFilters } from '@/features/trips/hooks/use-trip-filter-options'
import type { TripRowSelection } from '@/features/trips/hooks/use-trip-row-selection'
import { clearLabelIdsFromSearchParams } from '@/features/labels/utils/label-filter-navigation'
import type { TripPanelFilters, TripSortDir, TripSortField } from '@/repositories/interfaces'
import { EMPTY_TRIP_PANEL_FILTERS } from '@/repositories/interfaces'
import {
  clientsToolbarActionsSlotClassName,
  clientsToolbarRowClassName,
  clientsToolbarTitleSlotClassName,
} from '@/features/clients/components/list/clients-toolbar-chrome'
import { cn } from '@/shared/utils/cn'

interface TripsFiltersBarProps {
  searchInput: string
  onSearchChange: (value: string) => void
  stage: TripStage | 'all'
  onStageChange: (stage: TripStage | 'all') => void
  sortBy: TripSortField
  sortDir: TripSortDir
  onSort: (field: TripSortField) => void
  onSortDirChange: (dir: TripSortDir) => void
  panelFilters: TripPanelFilters
  onPanelFiltersChange: Dispatch<SetStateAction<TripPanelFilters>>
  matchCount?: number
  isFetching?: boolean
  selection?: TripRowSelection
  pageTripCount?: number
  isBulkPending?: boolean
  onBulkClone?: () => void
  onBulkEdit?: () => void
  onBulkDelete?: () => void
  columnPicker?: ReactNode
  canCreate?: boolean
  onNewTrip?: () => void
  className?: string
}

export function TripsFiltersBar({
  searchInput,
  onSearchChange,
  stage,
  onStageChange,
  sortBy,
  sortDir,
  onSort,
  onSortDirChange,
  panelFilters,
  onPanelFiltersChange,
  matchCount,
  isFetching,
  selection,
  pageTripCount = 0,
  isBulkPending,
  onBulkClone,
  onBulkEdit,
  onBulkDelete,
  columnPicker,
  canCreate,
  onNewTrip,
  className,
}: TripsFiltersBarProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const panelFilterCount = countActivePanelFilters(panelFilters)
  const hasSelection = (selection?.selectedCount ?? 0) > 0
  const hasFilters =
    searchInput.trim().length > 0 || stage !== 'all' || panelFilterCount > 0
  const [searchOpen, setSearchOpen] = useState(() => searchInput.trim().length > 0)
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const selectedIds = useMemo(
    () => (selection ? Array.from(selection.selectedIds) : []),
    [selection?.selectedCount, selection?.selectedIds],
  )

  return (
    <>
      <div className={cn('flex flex-col', className)}>
        <div className={clientsToolbarRowClassName}>
          <div className={clientsToolbarTitleSlotClassName}>
            {hasSelection && selection ? (
              <TripsSelectionInline
                selectedCount={selection.selectedCount}
                selectedIds={selectedIds}
                allPageSelected={selection.allPageSelected}
                pageTripCount={pageTripCount}
                isBulkPending={isBulkPending}
                onTogglePage={selection.togglePage}
                onClear={selection.clear}
                onBulkClone={() => onBulkClone?.()}
                onBulkEdit={() => onBulkEdit?.()}
                onBulkDelete={() => onBulkDelete?.()}
              />
            ) : (
              <TripsPageTitle
                matchCount={matchCount}
                stage={stage}
                onStageChange={onStageChange}
                hasFilters={hasFilters}
                isFetching={isFetching}
              />
            )}
          </div>

          <div className={clientsToolbarActionsSlotClassName}>
            <SearchField
              value={searchInput}
              onValueChange={onSearchChange}
              open={searchOpen}
              onOpenChange={setSearchOpen}
              placeholder="ID, client, destination"
              aria-label="Search trips by ID, client, or destination"
              density="toolbar"
            />

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 font-normal text-[var(--color-muted)]"
                onClick={() => {
                  onSearchChange('')
                  onStageChange('all')
                  onPanelFiltersChange(EMPTY_TRIP_PANEL_FILTERS)
                  clearLabelIdsFromSearchParams(searchParams, setSearchParams)
                  setSearchOpen(false)
                }}
              >
                Clear
              </Button>
            )}

            {columnPicker}

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

            <TripsSortMenu sortBy={sortBy} sortDir={sortDir} onSort={onSort} onSortDirChange={onSortDirChange} />

            {canCreate ? (
              <Button
                variant="primary"
                size="sm"
                className="h-8 shrink-0 gap-1.5 px-2.5"
                onClick={() => onNewTrip?.()}
                aria-label="New trip"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">New Trip</span>
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <TripsFilterPanel
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
        stage={stage}
      />
    </>
  )
}
