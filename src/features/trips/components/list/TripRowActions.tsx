import { useState } from 'react'
import { useTripTabNavigation } from '@/features/trips/hooks/use-trip-tab-navigation'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ChevronDown, Copy, Eye, Pencil, Trash2 } from 'lucide-react'
import type { Trip } from '@/domain/entities'
import { ConfirmDialog } from '@/design-system/components/ConfirmDialog'
import { tableActionsClass } from '@/design-system/components/table-styles'
import { cn } from '@/shared/utils/cn'

const menuItemClassName =
  'flex cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-md)] px-2.5 py-2 text-xs font-normal text-[var(--color-foreground)] outline-none data-[highlighted]:bg-[var(--color-surface-elevated)]'

interface TripRowActionsProps {
  trip: Trip
  onClone: (trip: Trip) => void
  onDelete: (tripId: string) => void
  isCloning?: boolean
  isDeleting?: boolean
}

export function TripRowActions({ trip, onClone, onDelete, isCloning, isDeleting }: TripRowActionsProps) {
  const { navigateToTrip } = useTripTabNavigation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const busy = isCloning || isDeleting

  const viewTrip = () => navigateToTrip(trip.id, { tab: 'dashboard' })
  const editTrip = () => navigateToTrip(trip.id, { tab: 'services' })

  return (
    <>
      <div className={tableActionsClass} data-trip-row-action="">
        <DropdownMenu.Root open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className={cn(
                'inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-all',
                'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] shadow-sm',
                'hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-foreground)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/35',
                'data-[state=open]:border-[var(--color-accent)] data-[state=open]:bg-[var(--color-accent-muted)]/40 data-[state=open]:text-[var(--color-accent)] data-[state=open]:shadow-none',
                busy && 'pointer-events-none opacity-40',
              )}
              aria-label={`Actions for trip ${trip.reference}`}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              disabled={busy}
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.25} />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-[500] w-[10.5rem] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg"
              align="end"
              side="bottom"
              sideOffset={6}
              collisionPadding={16}
              onCloseAutoFocus={(event) => event.preventDefault()}
            >
              <div className="border-b border-[var(--color-border)] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-subtle)]">
                Actions
              </div>
              <div className="p-1">
                <DropdownMenu.Item className={menuItemClassName} onSelect={viewTrip}>
                  <span className="flex items-center gap-2">
                    <Eye className="h-3.5 w-3.5 text-[var(--color-muted)]" />
                    View
                  </span>
                </DropdownMenu.Item>
                <DropdownMenu.Item className={menuItemClassName} onSelect={editTrip}>
                  <span className="flex items-center gap-2">
                    <Pencil className="h-3.5 w-3.5 text-[var(--color-muted)]" />
                    Edit
                  </span>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className={menuItemClassName}
                  onSelect={() => onClone(trip)}
                  disabled={isCloning}
                >
                  <span className="flex items-center gap-2">
                    <Copy className="h-3.5 w-3.5 text-[var(--color-muted)]" />
                    Clone
                  </span>
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-[var(--color-border)]" />
                <DropdownMenu.Item
                  className={cn(menuItemClassName, 'text-[var(--color-danger)] data-[highlighted]:bg-[var(--color-danger-muted)]')}
                  onSelect={() => {
                    setMenuOpen(false)
                    setConfirmOpen(true)
                  }}
                  disabled={isDeleting}
                >
                  <span className="flex items-center gap-2">
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </span>
                </DropdownMenu.Item>
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        variant="danger"
        entityType="Trip"
        title="Delete trip"
        description="Review the record below before confirming permanent deletion."
        meta={[
          { label: 'Trip ID', value: `#${trip.reference}` },
          { label: 'Trip name', value: trip.name },
        ]}
        confirmLabel="Delete trip"
        isPending={isDeleting}
        onConfirm={() => {
          onDelete(trip.id)
          setConfirmOpen(false)
        }}
      />
    </>
  )
}
