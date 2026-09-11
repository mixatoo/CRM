import { Check, ChevronDown, CircleDot } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { CLIENT_STATUSES, CLIENT_STATUS_LABELS, type ClientStatus } from '@/domain/entities/client'
import { Button } from '@/design-system/components/Button'
import { ClientStatusBadge } from '@/features/clients/components/ClientStatusBadge'
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

interface ClientStatusFilterProps {
  value: ClientStatus | 'all'
  onChange: (value: ClientStatus | 'all') => void
}

export function ClientStatusFilter({ value, onChange }: ClientStatusFilterProps) {
  const activeLabel = value === 'all' ? 'All statuses' : CLIENT_STATUS_LABELS[value]

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
            {value === 'all' ? 'All' : CLIENT_STATUS_LABELS[value]}
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

          <div className="max-h-[min(18rem,50vh)] overflow-y-auto p-1" role="radiogroup" aria-label="Client status">
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

            {CLIENT_STATUSES.map((status) => {
              const selected = value === status
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
                  <ClientStatusBadge status={status} />
                </button>
              )
            })}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
