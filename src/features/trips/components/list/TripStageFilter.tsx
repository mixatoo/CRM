import type { ReactNode } from 'react'
import { Check, ChevronDown, Milestone } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { TRIP_STAGES, TRIP_STAGE_LABELS, type TripStage } from '@/domain/entities'
import { Button } from '@/design-system/components/Button'
import { TRIP_STAGE_VISUAL } from '@/features/trips/components/list/trip-stage-styles'
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

interface TripStageFilterProps {
  value: TripStage | 'all'
  onChange: (value: TripStage | 'all') => void
  variant?: 'button' | 'chip'
}

function TripStageFilterMenu({
  value,
  onChange,
  children,
}: {
  value: TripStage | 'all'
  onChange: (value: TripStage | 'all') => void
  children: ReactNode
}) {
  const activeLabel = value === 'all' ? 'All stages' : TRIP_STAGE_LABELS[value]

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 w-[14.5rem] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg"
          align="start"
          sideOffset={6}
        >
          <div className="border-b border-[var(--color-border)] px-3 py-2.5">
            <p className="text-xs font-semibold text-[var(--color-foreground)]">Stage</p>
            <p className="mt-0.5 truncate text-[11px] font-normal text-[var(--color-muted)]">{activeLabel}</p>
          </div>

          <div className="max-h-[min(18rem,50vh)] overflow-y-auto p-1" role="radiogroup" aria-label="Trip stage">
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
              <span className="min-w-0 flex-1 truncate">All stages</span>
            </button>

            {TRIP_STAGES.map((stage) => {
              const selected = value === stage
              const visual = TRIP_STAGE_VISUAL[stage]
              return (
                <button
                  key={stage}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={cn(
                    MENU_ITEM_CLASS,
                    selected
                      ? 'bg-[var(--color-accent-muted)]/40 font-medium text-[var(--color-foreground)]'
                      : 'font-normal text-[var(--color-foreground)] hover:bg-[var(--color-surface-elevated)]',
                  )}
                  onClick={() => onChange(stage)}
                >
                  <FilterRadio selected={selected} />
                  <span
                    className={cn(
                      'inline-flex h-5 shrink-0 items-center rounded-[var(--radius-sm)] border px-1.5 text-[10px] font-normal leading-none',
                      visual.shell,
                      visual.text,
                    )}
                  >
                    {TRIP_STAGE_LABELS[stage]}
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

export function TripStageFilter({ value, onChange, variant = 'button' }: TripStageFilterProps) {
  const activeLabel = value === 'all' ? 'All stages' : TRIP_STAGE_LABELS[value]

  if (variant === 'chip') {
    return (
      <TripStageFilterMenu value={value} onChange={onChange}>
        <button
          type="button"
          className={cn(
            'inline-flex h-8 min-w-0 shrink-0 items-center gap-1.5 px-2.5 text-left transition-colors',
            'hover:bg-[var(--color-surface-elevated)]/80',
            value !== 'all' && 'text-[var(--color-accent)]',
          )}
          aria-label={`Filter by stage. ${activeLabel}`}
        >
          <Milestone className="h-3.5 w-3.5 shrink-0 text-[var(--color-muted)]" />
          <span className="shrink-0 text-[11px] font-medium leading-none text-[var(--color-foreground)]">Stage</span>
          <span className="shrink-0 text-[11px] leading-none text-[var(--color-muted)]">·</span>
          <span className="min-w-0 truncate text-[11px] font-normal leading-none text-[var(--color-muted)]">
            {value === 'all' ? 'All' : TRIP_STAGE_LABELS[value]}
          </span>
          <ChevronDown className="h-3 w-3 shrink-0 text-[var(--color-subtle)]" />
        </button>
      </TripStageFilterMenu>
    )
  }

  return (
    <TripStageFilterMenu value={value} onChange={onChange}>
      <Button
        variant="secondary"
        size="sm"
        className={cn(
          'h-8 shrink-0 gap-1.5 px-2.5 font-normal',
          value !== 'all' && 'border-[var(--color-accent)] text-[var(--color-accent)]',
        )}
        aria-label={`Filter by stage. ${activeLabel}`}
      >
        <Milestone className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Stage</span>
        <span className="hidden text-[var(--color-muted)] md:inline">·</span>
        <span className="hidden max-w-[7rem] truncate text-[11px] md:inline">
          {value === 'all' ? 'All' : TRIP_STAGE_LABELS[value]}
        </span>
        <ChevronDown className="h-3 w-3 text-[var(--color-subtle)]" />
      </Button>
    </TripStageFilterMenu>
  )
}
