import { useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Building2, ChevronDown, IdCard, Pencil, Trash2 } from 'lucide-react'
import type { Traveler } from '@/domain/entities/traveler'
import { travelerDisplayName } from '@/domain/entities/traveler'
import { ConfirmDialog } from '@/design-system/components/ConfirmDialog'
import { tableActionsClass } from '@/design-system/components/table-styles'
import { CRM_LABELS } from '@/features/clients/config/crm-labels'
import { cn } from '@/shared/utils/cn'

const menuItemClassName =
  'flex cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-md)] px-2.5 py-2 text-xs font-normal text-[var(--color-foreground)] outline-none data-[highlighted]:bg-[var(--color-surface-elevated)]'

interface TravelerRowActionsProps {
  traveler: Traveler
  accountName?: string
  onOpenAccount?: (traveler: Traveler) => void
  onOpenProfile?: (traveler: Traveler) => void
  onEdit: (traveler: Traveler) => void
  onDelete: (travelerId: string) => void
  isDeleting?: boolean
}

export function TravelerRowActions({
  traveler,
  accountName,
  onOpenAccount,
  onOpenProfile,
  onEdit,
  onDelete,
  isDeleting,
}: TravelerRowActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const name = travelerDisplayName(traveler)

  return (
    <>
      <div className={tableActionsClass} data-traveler-row-action="">
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
                isDeleting && 'pointer-events-none opacity-40',
              )}
              aria-label={`Actions for ${name}`}
              disabled={isDeleting}
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.25} />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-[500] w-[11rem] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg"
              align="end"
              sideOffset={6}
              onCloseAutoFocus={(event) => event.preventDefault()}
            >
              <div className="p-1">
                {onOpenProfile ? (
                  <DropdownMenu.Item className={menuItemClassName} onSelect={() => onOpenProfile(traveler)}>
                    <span className="flex items-center gap-2">
                      <IdCard className="h-3.5 w-3.5 text-[var(--color-muted)]" />
                      Open profile
                    </span>
                  </DropdownMenu.Item>
                ) : null}
                {onOpenAccount ? (
                  <DropdownMenu.Item className={menuItemClassName} onSelect={() => onOpenAccount(traveler)}>
                    <span className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-[var(--color-muted)]" />
                      Open {CRM_LABELS.account.toLowerCase()}
                    </span>
                  </DropdownMenu.Item>
                ) : null}
                <DropdownMenu.Item className={menuItemClassName} onSelect={() => onEdit(traveler)}>
                  <span className="flex items-center gap-2">
                    <Pencil className="h-3.5 w-3.5 text-[var(--color-muted)]" />
                    Quick edit
                  </span>
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-[var(--color-border)]" />
                <DropdownMenu.Item
                  className={cn(
                    menuItemClassName,
                    'text-[var(--color-danger)] data-[highlighted]:bg-[var(--color-danger-muted)]',
                  )}
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
        entityType={CRM_LABELS.traveler}
        title={`Delete ${CRM_LABELS.traveler.toLowerCase()}`}
        description="This removes the traveler from the directory and their linked account."
        meta={[
          { label: 'Name', value: name },
          ...(accountName ? [{ label: CRM_LABELS.account, value: accountName }] : []),
        ]}
        confirmLabel={`Delete ${CRM_LABELS.traveler.toLowerCase()}`}
        isPending={isDeleting}
        onConfirm={() => {
          onDelete(traveler.id)
          setConfirmOpen(false)
        }}
      />
    </>
  )
}
