import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { CloseButton } from '@/design-system/components/CloseButton'
import {
  SUPPLIER_CATEGORIES,
  SUPPLIER_CATEGORY_LABELS,
  SUPPLIER_STATUSES,
  type SupplierCategory,
  type SupplierStatus,
} from '@/domain/entities/supplier'
import { Button } from '@/design-system/components/Button'
import { SupplierStatusBadge } from '@/features/suppliers/components/SupplierStatusBadge'
import { cn } from '@/shared/utils/cn'

interface SuppliersBulkEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCount: number
  isPending?: boolean
  onApply: (patch: { status?: SupplierStatus; category?: SupplierCategory }) => void
}

export function SuppliersBulkEditDialog({
  open,
  onOpenChange,
  selectedCount,
  isPending,
  onApply,
}: SuppliersBulkEditDialogProps) {
  const [status, setStatus] = useState<SupplierStatus | ''>('')
  const [category, setCategory] = useState<SupplierCategory | ''>('')

  useEffect(() => {
    if (open) {
      setStatus('')
      setCategory('')
    }
  }, [open])

  const canApply = (status !== '' || category !== '') && !isPending

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[600] bg-black/45" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[601] max-h-[min(36rem,calc(100dvh-1rem))] w-[min(24rem,calc(100vw-1rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xl sm:w-[min(24rem,calc(100vw-2rem))] sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="text-sm font-semibold text-[var(--color-foreground)]">
                Edit {selectedCount} supplier{selectedCount === 1 ? '' : 's'}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm font-normal text-[var(--color-muted)]">
                Apply status or category to all selected records.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <CloseButton />
            </Dialog.Close>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Status</p>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {SUPPLIER_STATUSES.map((option) => {
                  const active = status === option
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setStatus(active ? '' : option)}
                      className={cn(
                        'rounded-[var(--radius-md)] border px-2.5 py-2 text-left transition-colors',
                        active && 'ring-1 ring-inset ring-[var(--color-accent)]/30',
                      )}
                    >
                      <SupplierStatusBadge status={option} />
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Category</p>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {SUPPLIER_CATEGORIES.map((option) => {
                  const active = category === option
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setCategory(active ? '' : option)}
                      className={cn(
                        'rounded-[var(--radius-md)] border px-2.5 py-2 text-left text-xs font-normal transition-colors',
                        active
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)]/40 text-[var(--color-foreground)]'
                          : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-foreground)]',
                      )}
                    >
                      {SUPPLIER_CATEGORY_LABELS[option]}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="secondary" size="sm" disabled={isPending}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              variant="primary"
              size="sm"
              loading={isPending}
              disabled={!canApply}
              onClick={() =>
                onApply({
                  ...(status ? { status } : {}),
                  ...(category ? { category } : {}),
                })
              }
            >
              {isPending ? 'Applying…' : 'Apply to all'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
