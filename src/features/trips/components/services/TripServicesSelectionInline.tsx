import { useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { CheckSquare, ChevronDown, Copy, Pencil, Square, Trash2 } from 'lucide-react'
import { Button } from '@/design-system/components/Button'
import { ConfirmDialog } from '@/design-system/components/ConfirmDialog'
import { cn } from '@/shared/utils/cn'

const menuItemClassName =
  'flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] px-2.5 py-2 text-xs font-normal text-[var(--color-foreground)] outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-[var(--color-surface-elevated)]'

interface TripServicesSelectionInlineProps {
  selectedCount: number
  allPageSelected: boolean
  pageServiceCount: number
  isBulkPending?: boolean
  onTogglePage: () => void
  onBulkClone: () => void
  onBulkEdit: () => void
  onBulkDelete: () => void
}

export function TripServicesSelectionInline({
  selectedCount,
  allPageSelected,
  pageServiceCount,
  isBulkPending,
  onTogglePage,
  onBulkClone,
  onBulkEdit,
  onBulkDelete,
}: TripServicesSelectionInlineProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  return (
    <>
      <div className="flex min-w-0 items-center gap-1.5" role="status" aria-live="polite">
        <span className="shrink-0 text-sm font-semibold tabular-nums text-[var(--color-accent)]">
          {selectedCount}
        </span>
        <span className="shrink-0 text-sm text-[var(--color-muted)]">selected</span>

        {pageServiceCount > 0 && (
          <>
            <span className="mx-0.5 h-4 w-px shrink-0 bg-[var(--color-border)]" aria-hidden />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 gap-1.5 px-2 text-xs font-normal text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
              onClick={onTogglePage}
              disabled={isBulkPending}
            >
              {allPageSelected ? (
                <Square className="h-3.5 w-3.5" strokeWidth={2} />
              ) : (
                <CheckSquare className="h-3.5 w-3.5 text-[var(--color-accent)]" strokeWidth={2} />
              )}
              <span className="hidden sm:inline">{allPageSelected ? 'Deselect page' : 'Select page'}</span>
            </Button>
          </>
        )}

        <span className="mx-0.5 h-4 w-px shrink-0 bg-[var(--color-border)]" aria-hidden />

        <DropdownMenu.Root open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenu.Trigger asChild>
            <Button
              variant="secondary"
              size="sm"
              className="h-8 shrink-0 gap-1 px-2.5 text-xs font-normal"
              disabled={isBulkPending}
              aria-label="Bulk actions for selected services"
            >
              Actions
              <ChevronDown className="h-3.5 w-3.5 text-[var(--color-muted)]" strokeWidth={2.25} />
            </Button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-[500] w-[11rem] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-lg"
              align="start"
              sideOffset={6}
              collisionPadding={12}
            >
              <DropdownMenu.Item
                className={menuItemClassName}
                disabled={isBulkPending}
                onSelect={() => {
                  setMenuOpen(false)
                  onBulkEdit()
                }}
              >
                <Pencil className="h-3.5 w-3.5 text-[var(--color-muted)]" />
                Edit status
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className={menuItemClassName}
                disabled={isBulkPending}
                onSelect={() => {
                  setMenuOpen(false)
                  onBulkClone()
                }}
              >
                <Copy className="h-3.5 w-3.5 text-[var(--color-muted)]" />
                Clone
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="my-1 h-px bg-[var(--color-border)]" />
              <DropdownMenu.Item
                className={cn(menuItemClassName, 'text-[var(--color-danger)] data-[highlighted]:bg-[var(--color-danger-muted)]')}
                disabled={isBulkPending}
                onSelect={() => {
                  setMenuOpen(false)
                  setConfirmDeleteOpen(true)
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        variant="danger"
        entityType="Services"
        title="Delete selected services"
        description="Review your selection before confirming permanent deletion."
        meta={[{ label: 'Selected', value: `${selectedCount} service${selectedCount === 1 ? '' : 's'}` }]}
        confirmLabel={`Delete ${selectedCount}`}
        isPending={isBulkPending}
        onConfirm={() => {
          onBulkDelete()
          setConfirmDeleteOpen(false)
        }}
      />
    </>
  )
}
