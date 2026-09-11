import { useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ChevronDown, Eye, Pencil, Trash2 } from 'lucide-react'
import type { Supplier } from '@/domain/entities/supplier'
import { ConfirmDialog } from '@/design-system/components/ConfirmDialog'
import { supplierPrimaryLabel } from '@/domain/entities/supplier'
import { tableActionsClass } from '@/design-system/components/table-styles'
import { cn } from '@/shared/utils/cn'

const menuItemClassName =
  'flex cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-md)] px-2.5 py-2 text-xs font-normal text-[var(--color-foreground)] outline-none data-[highlighted]:bg-[var(--color-surface-elevated)]'

interface SupplierRowActionsProps {
  supplier: Supplier
  onView: (supplier: Supplier) => void
  onEdit: (supplier: Supplier) => void
  onDelete: (supplierId: string) => void
  isDeleting?: boolean
}

export function SupplierRowActions({ supplier, onView, onEdit, onDelete, isDeleting }: SupplierRowActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <>
      <div className={tableActionsClass} data-supplier-row-action="">
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
              aria-label={`Actions for supplier ${supplier.reference}`}
              disabled={isDeleting}
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
              sideOffset={6}
              onCloseAutoFocus={(event) => event.preventDefault()}
            >
              <div className="p-1">
                <DropdownMenu.Item className={menuItemClassName} onSelect={() => onView(supplier)}>
                  <span className="flex items-center gap-2">
                    <Eye className="h-3.5 w-3.5 text-[var(--color-muted)]" />
                    View
                  </span>
                </DropdownMenu.Item>
                <DropdownMenu.Item className={menuItemClassName} onSelect={() => onEdit(supplier)}>
                  <span className="flex items-center gap-2">
                    <Pencil className="h-3.5 w-3.5 text-[var(--color-muted)]" />
                    Edit
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
        entityType="Supplier"
        title="Delete supplier"
        description="This removes the supplier from the global directory. Linked trip services must be unlinked first."
        meta={[
          { label: 'Reference', value: supplier.reference },
          { label: 'Name', value: supplierPrimaryLabel(supplier) },
        ]}
        confirmLabel="Delete supplier"
        isPending={isDeleting}
        onConfirm={() => {
          onDelete(supplier.id)
          setConfirmOpen(false)
        }}
      />
    </>
  )
}
