import { ArrowDownUp, Check } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Button } from '@/design-system/components/Button'
import type { SortDirection, SortMenuOption } from '@/features/ui-templates/patterns/lists/types'
import { cn } from '@/shared/utils/cn'

function getSortDirLabels(field: string): { asc: string; desc: string } {
  if (field === 'date') return { asc: 'Oldest first', desc: 'Newest first' }
  if (field === 'cost') return { asc: 'Low to high', desc: 'High to low' }
  if (field === 'persons') return { asc: 'Fewest first', desc: 'Most first' }
  return { asc: 'A → Z', desc: 'Z → A' }
}

export interface SortDropdownMenuProps<T extends string> {
  title: string
  sortBy: T
  sortDir: SortDirection
  options: SortMenuOption<T>[]
  defaultSortBy: T
  defaultSortDir?: SortDirection
  onSort: (field: T) => void
  onSortDirChange: (dir: SortDirection) => void
}

export function SortDropdownMenu<T extends string>({
  title,
  sortBy,
  sortDir,
  options,
  defaultSortBy,
  defaultSortDir = 'desc',
  onSort,
  onSortDirChange,
}: SortDropdownMenuProps<T>) {
  const dirLabels = getSortDirLabels(sortBy)
  const activeOption = options.find((item) => item.field === sortBy)
  const activeLabel = `${activeOption?.label ?? sortBy} · ${sortDir === 'asc' ? dirLabels.asc : dirLabels.desc}`
  const isDefaultSort = sortBy === defaultSortBy && sortDir === defaultSortDir

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className={cn(
            'h-8 shrink-0 gap-1.5 px-2.5 font-normal',
            !isDefaultSort && 'border-[var(--color-accent)] text-[var(--color-accent)]',
          )}
          aria-label={`Sort. ${activeLabel}`}
        >
          <ArrowDownUp className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sort</span>
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 w-[15.5rem] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg"
          align="end"
          sideOffset={6}
        >
          <div className="border-b border-[var(--color-border)] px-3 py-2.5">
            <p className="text-xs font-semibold text-[var(--color-foreground)]">{title}</p>
            <p className="mt-0.5 truncate text-[11px] font-normal text-[var(--color-muted)]">{activeLabel}</p>
          </div>

          <div className="max-h-[min(18rem,50vh)] overflow-y-auto p-1" role="radiogroup" aria-label="Sort field">
            {options.map((option) => {
              const selected = sortBy === option.field
              return (
                <button
                  key={option.field}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2.5 py-2 text-left text-xs transition-colors',
                    selected
                      ? 'bg-[var(--color-accent-muted)]/40 font-medium text-[var(--color-foreground)]'
                      : 'font-normal text-[var(--color-foreground)] hover:bg-[var(--color-surface-elevated)]',
                  )}
                  onClick={() => onSort(option.field)}
                >
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
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                </button>
              )
            })}
          </div>

          <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-muted)]/40 p-2.5">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-subtle)]">Order</p>
            <div className="grid grid-cols-2 gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5">
              {(['asc', 'desc'] as const).map((dir) => {
                const selected = sortDir === dir
                return (
                  <button
                    key={dir}
                    type="button"
                    className={cn(
                      'rounded-[var(--radius-sm)] px-2 py-1.5 text-[11px] font-medium transition-colors',
                      selected
                        ? 'bg-[var(--color-accent)] text-white shadow-sm'
                        : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-foreground)]',
                    )}
                    onPointerDown={(event) => event.preventDefault()}
                    onClick={() => onSortDirChange(dir)}
                  >
                    {dir === 'asc' ? dirLabels.asc : dirLabels.desc}
                  </button>
                )
              })}
            </div>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
