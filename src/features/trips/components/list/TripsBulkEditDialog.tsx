import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { CloseButton } from '@/design-system/components/CloseButton'
import { TRIP_STAGES, TRIP_STAGE_LABELS, type TripStage } from '@/domain/entities'
import { Button } from '@/design-system/components/Button'
import { TRIP_STAGE_VISUAL } from '@/features/trips/components/list/trip-stage-styles'
import { cn } from '@/shared/utils/cn'

interface TripsBulkEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCount: number
  isPending?: boolean
  onApply: (stage: TripStage) => void
}

export function TripsBulkEditDialog({
  open,
  onOpenChange,
  selectedCount,
  isPending,
  onApply,
}: TripsBulkEditDialogProps) {
  const [stage, setStage] = useState<TripStage>('draft')

  useEffect(() => {
    if (open) setStage('draft')
  }, [open])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[600] bg-black/45" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[601] max-h-[min(36rem,calc(100dvh-1rem))] w-[min(24rem,calc(100vw-1rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xl sm:w-[min(24rem,calc(100vw-2rem))] sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="text-sm font-semibold text-[var(--color-foreground)]">
                Edit {selectedCount} trip{selectedCount === 1 ? '' : 's'}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm font-normal text-[var(--color-muted)]">
                Apply a new stage to all selected trips.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <CloseButton />
            </Dialog.Close>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Stage</p>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {TRIP_STAGES.map((option) => {
                const visual = TRIP_STAGE_VISUAL[option]
                const active = stage === option
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setStage(option)}
                    className={cn(
                      'rounded-[var(--radius-md)] border px-2.5 py-2 text-left text-xs font-normal transition-colors',
                      active
                        ? cn('ring-1 ring-inset ring-[var(--color-accent)]/30', visual.shell, visual.text)
                        : cn(visual.shell, visual.text, 'opacity-80 hover:opacity-100'),
                    )}
                  >
                    {TRIP_STAGE_LABELS[option]}
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
            <Button
              variant="primary"
              size="sm"
              disabled={isPending}
              onClick={() => onApply(stage)}
            >
              Apply to all
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
