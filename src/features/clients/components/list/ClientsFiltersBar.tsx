import { useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { ListFilter } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { SearchField } from '@/design-system/components/SearchField'
import { Button } from '@/design-system/components/Button'
import { ClientsCreateMenu } from '@/features/clients/components/list/ClientsCreateMenu'
import { ClientsSortMenu } from '@/features/clients/components/list/ClientsSortMenu'
import { ClientsFilterPanel } from '@/features/clients/components/list/ClientsFilterPanel'
import { ClientsPageTitle } from '@/features/clients/components/list/ClientsPageTitle'
import { ClientsSelectionInline } from '@/features/clients/components/list/ClientsSelectionInline'
import { countActiveClientPanelFilters } from '@/features/clients/hooks/use-client-filter-options'
import type { ClientRowSelection } from '@/features/clients/hooks/use-client-row-selection'
import { clearLabelIdsFromSearchParams } from '@/features/labels/utils/label-filter-navigation'
import type { ClientPanelFilters, ClientSortDir, ClientSortField } from '@/repositories/interfaces'
import { EMPTY_CLIENT_PANEL_FILTERS } from '@/repositories/interfaces'
import { cn } from '@/shared/utils/cn'
import {
  clientsToolbarActionsSlotClassName,
  clientsToolbarRowClassName,
  clientsToolbarTitleSlotClassName,
} from '@/features/clients/components/list/clients-toolbar-chrome'

interface ClientsFiltersBarProps {
  searchInput: string
  onSearchChange: (value: string) => void
  sortBy: ClientSortField
  sortDir: ClientSortDir
  onSort: (field: ClientSortField) => void
  onSortDirChange: (dir: ClientSortDir) => void
  panelFilters: ClientPanelFilters
  onPanelFiltersChange: Dispatch<SetStateAction<ClientPanelFilters>>
  matchCount?: number
  isFetching?: boolean
  selection?: ClientRowSelection
  pageClientCount?: number
  isBulkPending?: boolean
  onBulkEdit?: () => void
  onBulkDelete?: () => void
  canCreate?: boolean
  onCreate?: () => void
  onQuickAdd?: () => void
  onImport?: () => void
  columnPicker?: ReactNode
  className?: string
}

export function ClientsFiltersBar({
  searchInput,
  onSearchChange,
  sortBy,
  sortDir,
  onSort,
  onSortDirChange,
  panelFilters,
  onPanelFiltersChange,
  matchCount,
  isFetching,
  selection,
  pageClientCount = 0,
  isBulkPending,
  onBulkEdit,
  onBulkDelete,
  canCreate,
  onCreate,
  onQuickAdd,
  onImport,
  columnPicker,
  className,
}: ClientsFiltersBarProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const panelFilterCount = countActiveClientPanelFilters(panelFilters)
  const hasSelection = (selection?.selectedCount ?? 0) > 0
  const hasFilters = searchInput.trim().length > 0 || panelFilterCount > 0
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
              <ClientsSelectionInline
                selectedCount={selection.selectedCount}
                selectedIds={selectedIds}
                allPageSelected={selection.allPageSelected}
                pageClientCount={pageClientCount}
                isBulkPending={isBulkPending}
                onTogglePage={selection.togglePage}
                onBulkEdit={() => onBulkEdit?.()}
                onBulkDelete={() => onBulkDelete?.()}
              />
            ) : (
              <ClientsPageTitle
                matchCount={matchCount}
                status={panelFilters.status}
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
              placeholder="Name, email, company, or reference"
              aria-label="Search clients by name, email, company, or reference"
              density="toolbar"
            />

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 font-normal text-[var(--color-muted)]"
                onClick={() => {
                  onSearchChange('')
                  onPanelFiltersChange(EMPTY_CLIENT_PANEL_FILTERS)
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

            <ClientsSortMenu sortBy={sortBy} sortDir={sortDir} onSort={onSort} onSortDirChange={onSortDirChange} />

            {canCreate && onCreate && onQuickAdd ? (
              <ClientsCreateMenu onCreate={onCreate} onQuickAdd={onQuickAdd} onImport={onImport} />
            ) : null}
          </div>
        </div>
      </div>

      <ClientsFilterPanel
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
      />
    </>
  )
}
