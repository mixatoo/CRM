import { useState, type MouseEvent, type PointerEvent } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { MoreHorizontal, Star, Trash2 } from 'lucide-react'
import type { ClientCreditCard } from '@/domain/entities/client-credit-card'
import {
  formatClientCreditCardLabel,
  formatClientCreditCardMask,
} from '@/domain/entities/client-credit-card'
import { ConfirmDialog } from '@/design-system/components/ConfirmDialog'
import { tableActionsClass } from '@/design-system/components/table-styles'
import { cn } from '@/shared/utils/cn'

const menuItemClassName =
  'flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] px-2.5 py-2 text-xs font-normal text-[var(--color-foreground)] outline-none data-[highlighted]:bg-[var(--color-surface-elevated)]'

interface CreditCardRowActionsProps {
  card: ClientCreditCard
  onSetActive?: (cardId: string) => void
  onDelete?: (cardId: string) => void
  busy?: boolean
}

export function CreditCardRowActions({
  card,
  onSetActive,
  onDelete,
  busy,
}: CreditCardRowActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const stopRowActivation = (event: MouseEvent | PointerEvent) => {
    event.stopPropagation()
  }

  const canSetPrimary = Boolean(onSetActive) && !card.isActive
  const canDelete = Boolean(onDelete)

  if (!canSetPrimary && !canDelete) {
    return <span className="text-xs text-[var(--color-muted)]">—</span>
  }

  return (
    <>
      <div className={tableActionsClass} data-client-row-action="">
        <DropdownMenu.Root open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className={cn(
                'inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-md)] transition-colors',
                'text-[var(--color-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-foreground)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/35',
                'data-[state=open]:bg-[var(--color-accent-muted)]/40 data-[state=open]:text-[var(--color-accent)]',
                busy && 'pointer-events-none opacity-40',
              )}
              aria-label={`Actions for card ending ${card.last4}`}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              disabled={busy}
              onClick={stopRowActivation}
              onPointerDown={stopRowActivation}
            >
              <MoreHorizontal className="h-4 w-4" strokeWidth={2} />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-[500] w-[11rem] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg"
              align="end"
              side="bottom"
              sideOffset={4}
              collisionPadding={16}
              onCloseAutoFocus={(event) => event.preventDefault()}
            >
              <div className="border-b border-[var(--color-border)] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-subtle)]">
                Actions
              </div>
              <div className="p-1">
                {canSetPrimary ? (
                  <DropdownMenu.Item
                    className={menuItemClassName}
                    onSelect={() => onSetActive?.(card.id)}
                    disabled={busy}
                  >
                    <Star className="h-3.5 w-3.5 text-[var(--color-muted)]" />
                    Set as primary
                  </DropdownMenu.Item>
                ) : null}
                {canSetPrimary && canDelete ? (
                  <DropdownMenu.Separator className="my-1 h-px bg-[var(--color-border)]" />
                ) : null}
                {canDelete ? (
                  <DropdownMenu.Item
                    className={cn(
                      menuItemClassName,
                      'text-[var(--color-danger)] data-[highlighted]:bg-[var(--color-danger-muted)]',
                    )}
                    onSelect={() => {
                      setMenuOpen(false)
                      setConfirmOpen(true)
                    }}
                    disabled={busy}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </DropdownMenu.Item>
                ) : null}
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {canDelete ? (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          variant="danger"
          entityType="Credit card"
          title="Remove card"
          description="Only the last four digits were stored. This removes the card from this account."
          meta={[
            { label: 'Card', value: formatClientCreditCardLabel(card) },
            { label: 'Number', value: formatClientCreditCardMask(card) },
          ]}
          confirmLabel="Remove card"
          isPending={busy}
          onConfirm={() => {
            onDelete?.(card.id)
            setConfirmOpen(false)
          }}
        />
      ) : null}
    </>
  )
}
