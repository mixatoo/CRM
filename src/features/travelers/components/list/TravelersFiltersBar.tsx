import { useState, type ReactNode } from 'react'
import { SearchField } from '@/design-system/components/SearchField'
import { Button } from '@/design-system/components/Button'
import { ClientsPageTitle } from '@/features/clients/components/list/ClientsPageTitle'
import {
  clientsToolbarActionsSlotClassName,
  clientsToolbarRowClassName,
  clientsToolbarTitleSlotClassName,
} from '@/features/clients/components/list/clients-toolbar-chrome'
import { TravelersCreateMenu } from '@/features/travelers/components/list/TravelersCreateMenu'
import { TravelersSelectionInline } from '@/features/travelers/components/list/TravelersSelectionInline'
import type { TravelerRowSelection } from '@/features/travelers/hooks/use-travelers-row-selection'
import { CRM_LABELS } from '@/features/clients/config/crm-labels'
import { cn } from '@/shared/utils/cn'

interface TravelersFiltersBarProps {
  searchInput: string
  onSearchChange: (value: string) => void
  matchCount?: number
  isFetching?: boolean
  selection?: TravelerRowSelection
  pageTravelerCount?: number
  isBulkPending?: boolean
  onBulkDelete?: () => void
  canCreate?: boolean
  onCreate?: () => void
  onQuickAdd?: () => void
  onImport?: () => void
  columnPicker?: ReactNode
  className?: string
}

export function TravelersFiltersBar({
  searchInput,
  onSearchChange,
  matchCount,
  isFetching,
  selection,
  pageTravelerCount = 0,
  isBulkPending,
  onBulkDelete,
  canCreate,
  onCreate,
  onQuickAdd,
  onImport,
  columnPicker,
  className,
}: TravelersFiltersBarProps) {
  const hasSelection = (selection?.selectedCount ?? 0) > 0
  const hasFilters = searchInput.trim().length > 0
  const [searchOpen, setSearchOpen] = useState(() => searchInput.trim().length > 0)

  return (
    <div className={cn('flex flex-col', className)}>
      <div className={clientsToolbarRowClassName}>
        <div className={clientsToolbarTitleSlotClassName}>
          {hasSelection && selection ? (
            <TravelersSelectionInline
              selectedCount={selection.selectedCount}
              allPageSelected={selection.allPageSelected}
              pageTravelerCount={pageTravelerCount}
              isBulkPending={isBulkPending}
              onTogglePage={selection.togglePage}
              onBulkDelete={() => onBulkDelete?.()}
            />
          ) : (
            <ClientsPageTitle
              title={CRM_LABELS.allTravelers}
              matchCount={matchCount}
              hasFilters={hasFilters}
              isFetching={isFetching}
              countSingular={CRM_LABELS.traveler.toLowerCase()}
              countPlural={CRM_LABELS.travelers.toLowerCase()}
            />
          )}
        </div>

        <div className={clientsToolbarActionsSlotClassName}>
          <SearchField
            value={searchInput}
            onValueChange={onSearchChange}
            open={searchOpen}
            onOpenChange={setSearchOpen}
            placeholder="ID, name, account, role, email, or phone"
            aria-label="Search travelers by ID, name, account, role, email, or phone"
            density="toolbar"
          />

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 font-normal text-[var(--color-muted)]"
              onClick={() => {
                onSearchChange('')
                setSearchOpen(false)
              }}
            >
              Clear
            </Button>
          )}

          {columnPicker}

          {canCreate && onCreate ? (
            <TravelersCreateMenu onCreate={onCreate} onQuickAdd={onQuickAdd} onImport={onImport} />
          ) : null}
        </div>
      </div>
    </div>
  )
}
