import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { CloseButton } from '@/design-system/components/CloseButton'
import { CLIENT_STATUSES, CLIENT_TYPES, CLIENT_TYPE_LABELS, type ClientStatus, type ClientType } from '@/domain/entities/client'
import { Button } from '@/design-system/components/Button'
import { ClientStatusBadge } from '@/features/clients/components/ClientStatusBadge'
import { cn } from '@/shared/utils/cn'

interface ClientsBulkEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCount: number
  isPending?: boolean
  canEditStatus?: boolean
  onApply: (patch: { status?: ClientStatus; type?: ClientType }) => void
}

export function ClientsBulkEditDialog({
  open,
  onOpenChange,
  selectedCount,
  isPending,
  canEditStatus = false,
  onApply,
}: ClientsBulkEditDialogProps) {
  const [status, setStatus] = useState<ClientStatus | ''>('')
  const [type, setType] = useState<ClientType | ''>('')

  useEffect(() => {
    if (open) {
      setStatus('')
      setType('')
    }
  }, [open])

  const canApply = (status !== '' || type !== '') && !isPending

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[600] bg-black/45" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[601] max-h-[min(36rem,calc(100dvh-1rem))] w-[min(24rem,calc(100vw-1rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xl sm:w-[min(24rem,calc(100vw-2rem))] sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="text-sm font-semibold text-[var(--color-foreground)]">
                Edit {selectedCount} client{selectedCount === 1 ? '' : 's'}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm font-normal text-[var(--color-muted)]">
                Apply status or type to all selected records.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <CloseButton />
            </Dialog.Close>
          </div>

          <div className="mt-4 space-y-4">
            {canEditStatus ? (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Status</p>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {CLIENT_STATUSES.map((option) => {
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
                        <ClientStatusBadge status={option} />
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Type</p>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {CLIENT_TYPES.map((option) => {
                  const active = type === option
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setType(active ? '' : option)}
                      className={cn(
                        'rounded-[var(--radius-md)] border px-2.5 py-2 text-left text-xs font-normal transition-colors',
                        active
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)]/40 text-[var(--color-foreground)]'
                          : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-foreground)]',
                      )}
                    >
                      {CLIENT_TYPE_LABELS[option]}
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
                  ...(type ? { type } : {}),
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
