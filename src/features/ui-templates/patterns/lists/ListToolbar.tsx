import { useState, type ReactNode } from 'react'
import { ListFilter, Plus } from 'lucide-react'
import { Button } from '@/design-system/components/Button'
import { SearchField } from '@/design-system/components/SearchField'
import { layout } from '@/design-system/tokens/layout'
import { cn } from '@/shared/utils/cn'

export interface ListToolbarProps {
  title: string
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filterCount?: number
  onFilterClick?: () => void
  sortSlot?: ReactNode
  columnsSlot?: ReactNode
  primaryActionLabel?: string
  onPrimaryAction?: () => void
  onClear?: () => void
  showClear?: boolean
  className?: string
}

/** Toolbar pattern used on list pages (search, filter, sort, primary action). */
export function ListToolbar({
  title,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Type to filter…',
  filterCount = 0,
  onFilterClick,
  sortSlot,
  columnsSlot,
  primaryActionLabel = 'New',
  onPrimaryAction,
  onClear,
  showClear = false,
  className,
}: ListToolbarProps) {
  const [searchOpen, setSearchOpen] = useState(() => searchValue.trim().length > 0)

  return (
    <div className={cn('flex flex-col gap-2 border-b border-[var(--color-border)] px-2 py-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 sm:px-4 sm:py-2.5', className)}>
      <h1 className={cn('shrink-0', layout.pageTitle)}>{title}</h1>

      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-1.5 sm:ml-auto sm:gap-2">
        <SearchField
          value={searchValue}
          onValueChange={onSearchChange}
          open={searchOpen}
          onOpenChange={setSearchOpen}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          density="toolbar"
        />

        {onFilterClick ? (
          <Button
            variant="secondary"
            size="sm"
            className={cn(
              'h-8 shrink-0 gap-1.5 px-2.5 font-normal',
              filterCount > 0 && 'border-[var(--color-accent)] text-[var(--color-accent)]',
            )}
            onClick={onFilterClick}
          >
            <ListFilter className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {filterCount > 0 ? (
              <span className="rounded-full bg-[var(--color-accent)] px-1.5 py-px text-[10px] font-semibold text-white">
                {filterCount}
              </span>
            ) : null}
          </Button>
        ) : null}

        {sortSlot}

        {columnsSlot}

        {showClear && onClear ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 font-normal text-[var(--color-muted)]"
            onClick={() => {
              onClear()
              setSearchOpen(false)
            }}
          >
            Clear
          </Button>
        ) : null}

        {onPrimaryAction ? (
          <Button variant="primary" size="sm" className="h-8 shrink-0 gap-1.5" onClick={onPrimaryAction}>
            <Plus className="h-3.5 w-3.5" />
            {primaryActionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
