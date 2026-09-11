import { Check, ChevronDown, LayoutGrid, CircleDot } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {
  SERVICE_CATEGORIES,
  SERVICE_CATEGORY_LABELS,
  type ServiceCategory,
} from '@/domain/entities'
import {
  TRIP_SERVICE_STATUSES,
  TRIP_SERVICE_STATUS_LABELS,
  type TripServiceStatus,
} from '@/domain/entities/trip-service'
import { Button } from '@/design-system/components/Button'
import {
  TRIP_SERVICE_CATEGORY_ICON,
  TRIP_SERVICE_CATEGORY_SHELL,
  TRIP_SERVICE_CATEGORY_VISUAL,
  TRIP_SERVICE_STATUS_VISUAL,
} from '@/features/trips/components/services/service-styles'
import { cn } from '@/shared/utils/cn'

const MENU_ITEM_CLASS =
  'flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2.5 py-2 text-left text-xs transition-colors'

function FilterRadio({ selected }: { selected: boolean }) {
  return (
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
  )
}

interface TripServiceCategoryFilterProps {
  value: ServiceCategory | 'all'
  onChange: (value: ServiceCategory | 'all') => void
}

export function TripServiceCategoryFilter({ value, onChange }: TripServiceCategoryFilterProps) {
  const activeLabel = value === 'all' ? 'All categories' : SERVICE_CATEGORY_LABELS[value]

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className={cn(
            'h-8 shrink-0 gap-1.5 px-2.5 font-normal',
            value !== 'all' && 'border-[var(--color-accent)] text-[var(--color-accent)]',
          )}
          aria-label={`Filter by category. ${activeLabel}`}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Category</span>
          <span className="hidden text-[var(--color-muted)] md:inline">·</span>
          <span className="hidden max-w-[7rem] truncate text-[11px] md:inline">
            {value === 'all' ? 'All' : SERVICE_CATEGORY_LABELS[value]}
          </span>
          <ChevronDown className="h-3 w-3 text-[var(--color-subtle)]" />
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 w-[14.5rem] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg"
          align="start"
          sideOffset={6}
        >
          <div className="border-b border-[var(--color-border)] px-3 py-2.5">
            <p className="text-xs font-semibold text-[var(--color-foreground)]">Category</p>
            <p className="mt-0.5 truncate text-[11px] font-normal text-[var(--color-muted)]">{activeLabel}</p>
          </div>

          <div className="max-h-[min(18rem,50vh)] overflow-y-auto p-1" role="radiogroup" aria-label="Service category">
            <button
              type="button"
              role="radio"
              aria-checked={value === 'all'}
              className={cn(
                MENU_ITEM_CLASS,
                value === 'all'
                  ? 'bg-[var(--color-accent-muted)]/40 font-medium text-[var(--color-foreground)]'
                  : 'font-normal text-[var(--color-foreground)] hover:bg-[var(--color-surface-elevated)]',
              )}
              onClick={() => onChange('all')}
            >
              <FilterRadio selected={value === 'all'} />
              <span className="min-w-0 flex-1 truncate">All categories</span>
            </button>

            {SERVICE_CATEGORIES.map((category) => {
              const selected = value === category
              const Icon = TRIP_SERVICE_CATEGORY_ICON[category]
              return (
                <button
                  key={category}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={cn(
                    MENU_ITEM_CLASS,
                    selected
                      ? 'bg-[var(--color-accent-muted)]/40 font-medium text-[var(--color-foreground)]'
                      : 'font-normal text-[var(--color-foreground)] hover:bg-[var(--color-surface-elevated)]',
                  )}
                  onClick={() => onChange(category)}
                >
                  <FilterRadio selected={selected} />
                  <span
                    className={cn(
                      'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border',
                      TRIP_SERVICE_CATEGORY_SHELL[category],
                    )}
                  >
                    <Icon className={cn('h-3 w-3', TRIP_SERVICE_CATEGORY_VISUAL[category])} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{SERVICE_CATEGORY_LABELS[category]}</span>
                </button>
              )
            })}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

interface TripServiceStatusFilterProps {
  value: TripServiceStatus | 'all'
  onChange: (value: TripServiceStatus | 'all') => void
}

export function TripServiceStatusFilter({ value, onChange }: TripServiceStatusFilterProps) {
  const activeLabel = value === 'all' ? 'All statuses' : TRIP_SERVICE_STATUS_LABELS[value]

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className={cn(
            'h-8 shrink-0 gap-1.5 px-2.5 font-normal',
            value !== 'all' && 'border-[var(--color-accent)] text-[var(--color-accent)]',
          )}
          aria-label={`Filter by status. ${activeLabel}`}
        >
          <CircleDot className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Status</span>
          <span className="hidden text-[var(--color-muted)] md:inline">·</span>
          <span className="hidden max-w-[7rem] truncate text-[11px] md:inline">
            {value === 'all' ? 'All' : TRIP_SERVICE_STATUS_LABELS[value]}
          </span>
          <ChevronDown className="h-3 w-3 text-[var(--color-subtle)]" />
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 w-[14.5rem] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg"
          align="start"
          sideOffset={6}
        >
          <div className="border-b border-[var(--color-border)] px-3 py-2.5">
            <p className="text-xs font-semibold text-[var(--color-foreground)]">Status</p>
            <p className="mt-0.5 truncate text-[11px] font-normal text-[var(--color-muted)]">{activeLabel}</p>
          </div>

          <div className="p-1" role="radiogroup" aria-label="Service status">
            <button
              type="button"
              role="radio"
              aria-checked={value === 'all'}
              className={cn(
                MENU_ITEM_CLASS,
                value === 'all'
                  ? 'bg-[var(--color-accent-muted)]/40 font-medium text-[var(--color-foreground)]'
                  : 'font-normal text-[var(--color-foreground)] hover:bg-[var(--color-surface-elevated)]',
              )}
              onClick={() => onChange('all')}
            >
              <FilterRadio selected={value === 'all'} />
              <span className="min-w-0 flex-1 truncate">All statuses</span>
            </button>

            {TRIP_SERVICE_STATUSES.map((status) => {
              const selected = value === status
              const visual = TRIP_SERVICE_STATUS_VISUAL[status]
              return (
                <button
                  key={status}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={cn(
                    MENU_ITEM_CLASS,
                    selected
                      ? 'bg-[var(--color-accent-muted)]/40 font-medium text-[var(--color-foreground)]'
                      : 'font-normal text-[var(--color-foreground)] hover:bg-[var(--color-surface-elevated)]',
                  )}
                  onClick={() => onChange(status)}
                >
                  <FilterRadio selected={selected} />
                  <span
                    className={cn(
                      'inline-flex h-5 shrink-0 items-center gap-1 rounded-[var(--radius-sm)] border px-1.5 text-[10px] font-normal leading-none',
                      visual.shell,
                      visual.text,
                    )}
                  >
                    <span className={cn('size-1.5 rounded-full', visual.dot)} aria-hidden />
                    {TRIP_SERVICE_STATUS_LABELS[status]}
                  </span>
                </button>
              )
            })}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
