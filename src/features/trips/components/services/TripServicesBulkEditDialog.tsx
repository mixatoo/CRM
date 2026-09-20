import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { CloseButton } from '@/design-system/components/CloseButton'
import {
  TRIP_SERVICE_STATUSES,
  TRIP_SERVICE_STATUS_LABELS,
  type TripServiceStatus,
} from '@/domain/entities/trip-service'
import { Button } from '@/design-system/components/Button'
import { TRIP_SERVICE_STATUS_VISUAL } from '@/features/trips/components/services/service-styles'
import { cn } from '@/shared/utils/cn'

interface TripServicesBulkEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCount: number
  isPending?: boolean
  onApply: (status: TripServiceStatus) => void
}

export function TripServicesBulkEditDialog({
  open,
  onOpenChange,
  selectedCount,
  isPending,
  onApply,
}: TripServicesBulkEditDialogProps) {
  const [status, setStatus] = useState<TripServiceStatus>('confirmed')

  useEffect(() => {
    if (open) setStatus('confirmed')
  }, [open])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[600] bg-black/45" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[601] max-h-[min(36rem,calc(100dvh-1rem))] w-[min(24rem,calc(100vw-1rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xl sm:w-[min(24rem,calc(100vw-2rem))] sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="text-sm font-semibold text-[var(--color-foreground)]">
                Edit {selectedCount} service{selectedCount === 1 ? '' : 's'}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm font-normal text-[var(--color-muted)]">
                Apply a new status to all selected services.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <CloseButton />
            </Dialog.Close>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Status</p>
            <div className="grid grid-cols-1 gap-1.5">
              {TRIP_SERVICE_STATUSES.map((option) => {
                const visual = TRIP_SERVICE_STATUS_VISUAL[option]
                const active = status === option
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setStatus(option)}
                    className={cn(
                      'rounded-[var(--radius-md)] border px-2.5 py-2 text-left text-xs font-normal transition-colors',
                      active
                        ? cn('ring-1 ring-inset ring-[var(--color-accent)]/30', visual.shell, visual.text)
                        : cn(visual.shell, visual.text, 'opacity-80 hover:opacity-100'),
                    )}
                  >
                    {TRIP_SERVICE_STATUS_LABELS[option]}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="secondary" size="sm" disabled={isPending}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button variant="primary" size="sm" loading={isPending} onClick={() => onApply(status)}>
              {isPending ? 'Applying…' : 'Apply to all'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
