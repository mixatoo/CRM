import { Check } from 'lucide-react'
import { SearchField } from '../../primitives/components/SearchField'
import type { FacetListOption } from './types'
import { cn } from '../../primitives/utils/cn'
import { initials } from '../../primitives/utils/cn'

const STICKY_BAR_CLASS =
  'bg-[var(--color-surface)]/95 backdrop-blur-sm supports-[backdrop-filter]:bg-[var(--color-surface)]/90'

export interface FacetListPickerProps {
  labelColumn: string
  secondaryCountColumn?: string
  countColumn?: string
  allLabel: string
  searchPlaceholder: string
  emptyMessage: string
  query: string
  onQueryChange: (value: string) => void
  value: string
  onChange: (value: string) => void
  options: FacetListOption[]
  totalCount: number
  totalSecondaryCount?: number
  showAvatar?: boolean
  className?: string
}

export function FacetListPicker({
  labelColumn,
  secondaryCountColumn,
  countColumn = 'Trips',
  allLabel,
  searchPlaceholder,
  emptyMessage,
  query,
  onQueryChange,
  value,
  onChange,
  options,
  totalCount,
  totalSecondaryCount = 0,
  showAvatar = true,
  className,
}: FacetListPickerProps) {
  const hasSecondary = Boolean(secondaryCountColumn)

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
      <div className="shrink-0 pb-2">
        <SearchField
          value={query}
          onValueChange={onQueryChange}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          density="compact"
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div
          className={cn(
            'grid shrink-0 gap-2 border-b border-[var(--color-border)] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-subtle)]',
            hasSecondary
              ? 'grid-cols-[minmax(0,1fr)_2.5rem_2.75rem]'
              : 'grid-cols-[minmax(0,1fr)_2.75rem]',
            STICKY_BAR_CLASS,
          )}
        >
          <span>{labelColumn}</span>
          {hasSecondary ? <span className="text-right">{secondaryCountColumn}</span> : null}
          <span className="text-right">{countColumn}</span>
        </div>

        <FacetListRow
          name={allLabel}
          count={totalCount}
          secondaryCount={hasSecondary ? totalSecondaryCount : undefined}
          selected={value === 'all'}
          onSelect={() => onChange('all')}
          variant="all"
          hasSecondary={hasSecondary}
        />

        <div className="min-h-0 flex-1 overflow-y-auto">
          {options.length === 0 ? (
            <p className="px-2.5 py-2 text-[11px] font-normal text-[var(--color-muted)]">{emptyMessage}</p>
          ) : (
            options.map((item) => (
              <FacetListRow
                key={item.value}
                name={item.value}
                count={item.count}
                secondaryCount={hasSecondary ? item.activeCount ?? 0 : undefined}
                selected={value === item.value}
                onSelect={() => onChange(item.value)}
                avatar={showAvatar ? initials(item.value) : undefined}
                hasSecondary={hasSecondary}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function FacetListRow({
  name,
  count,
  secondaryCount,
  selected,
  onSelect,
  avatar,
  variant = 'item',
  hasSecondary,
}: {
  name: string
  count: number
  secondaryCount?: number
  selected: boolean
  onSelect: () => void
  avatar?: string
  variant?: 'all' | 'item'
  hasSecondary: boolean
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'grid w-full items-center gap-2 border-t border-[var(--color-border)] px-2.5 py-1.5 text-left transition-colors first:border-t-0',
        hasSecondary ? 'grid-cols-[minmax(0,1fr)_2.5rem_2.75rem]' : 'grid-cols-[minmax(0,1fr)_2.75rem]',
        variant === 'all' && 'border-b',
        selected
          ? 'bg-[var(--color-accent-muted)]/35'
          : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)]',
      )}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        <span
          className={cn(
            'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border transition-colors',
            selected
              ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
              : 'border-[var(--color-border-strong)] bg-[var(--color-surface)]',
          )}
          aria-hidden
        >
          {selected && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
        </span>
        {avatar ? (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[9px] font-semibold text-[var(--color-foreground)]">
            {avatar}
          </span>
        ) : null}
        <span
          className={cn(
            'truncate text-xs',
            selected || variant === 'all'
              ? 'font-medium text-[var(--color-foreground)]'
              : 'font-normal text-[var(--color-foreground)]',
          )}
        >
          {name}
        </span>
      </span>

      {hasSecondary ? (
        <span
          className={cn(
            'text-right text-xs tabular-nums',
            selected ? 'font-semibold text-[var(--color-accent)]' : 'font-medium text-[var(--color-muted)]',
          )}
        >
          {secondaryCount}
        </span>
      ) : null}

      <span
        className={cn(
          'text-right text-xs tabular-nums',
          selected ? 'font-semibold text-[var(--color-accent)]' : 'font-medium text-[var(--color-muted)]',
        )}
      >
        {count}
      </span>
    </button>
  )
}
