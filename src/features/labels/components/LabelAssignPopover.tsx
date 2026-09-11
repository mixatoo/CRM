import { useMemo, useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { Check, Tags } from 'lucide-react'
import type { LabelTargetType } from '@/domain/entities/label'
import { resolveLabelColorVisual } from '@/domain/entities/label'
import { Button } from '@/design-system/components/Button'
import {
  useLabelAssignmentMutations,
  useLabelsForTarget,
} from '@/features/labels/hooks/use-labels'
import { cn } from '@/shared/utils/cn'

const EMPTY_LABEL_IDS: string[] = []

interface LabelAssignPopoverProps {
  targetType: LabelTargetType
  /** Current label IDs when editing a single target. Ignored in bulk add mode. */
  currentLabelIds?: string[]
  /** One or more record IDs. When multiple, labels are ADDED (not replaced). */
  targetIds: string[]
  mode?: 'replace' | 'add'
  triggerLabel?: string
  iconOnly?: boolean
  disabled?: boolean
  className?: string
  onApplied?: () => void
}

export function LabelAssignPopover({
  targetType,
  currentLabelIds = EMPTY_LABEL_IDS,
  targetIds,
  mode,
  triggerLabel,
  iconOnly = false,
  disabled,
  className,
  onApplied,
}: LabelAssignPopoverProps) {
  const resolvedMode = mode ?? (targetIds.length > 1 ? 'add' : 'replace')
  const { data: availableLabels = [] } = useLabelsForTarget(targetType)
  const { setLabelsForTarget, addLabelsToTargets, isPending } = useLabelAssignmentMutations()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>(EMPTY_LABEL_IDS)

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) return
    setSelected(resolvedMode === 'replace' ? [...currentLabelIds] : [])
  }

  const selectedSet = useMemo(() => new Set(selected), [selected])
  const canApply = selected.length > 0 || resolvedMode === 'replace'

  const toggle = (labelId: string) => {
    setSelected((current) =>
      current.includes(labelId) ? current.filter((id) => id !== labelId) : [...current, labelId],
    )
  }

  const handleApply = () => {
    if (targetIds.length === 0) return

    if (resolvedMode === 'replace' && targetIds.length === 1) {
      setLabelsForTarget.mutate(
        { targetType, targetId: targetIds[0], labelIds: selected },
        {
          onSuccess: () => {
            setOpen(false)
            onApplied?.()
          },
        },
      )
      return
    }

    if (selected.length === 0) return

    addLabelsToTargets.mutate(
      { targetType, targetIds, labelIds: selected },
      {
        onSuccess: () => {
          setOpen(false)
          onApplied?.()
        },
      },
    )
  }

  const buttonLabel =
    triggerLabel ??
    (resolvedMode === 'add'
      ? `Add labels${targetIds.length > 1 ? ` (${targetIds.length})` : ''}`
      : 'Labels')

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <Button
          type="button"
          variant="secondary"
          size={iconOnly ? 'icon' : 'sm'}
          disabled={disabled || targetIds.length === 0}
          aria-label={iconOnly ? buttonLabel : undefined}
          className={cn(
            iconOnly
              ? 'h-[1.375rem] w-[1.375rem] shrink-0 rounded-[var(--radius-sm)] p-0 font-normal'
              : 'h-8 shrink-0 gap-1.5 px-2.5 font-normal',
            className,
          )}
        >
          <Tags className="h-3.5 w-3.5" aria-hidden />
          {iconOnly ? null : buttonLabel}
        </Button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-[700] w-[min(18rem,calc(100vw-1.5rem))] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-xl"
        >
          <div className="mb-2">
            <p className="text-xs font-semibold text-[var(--color-foreground)]">
              {resolvedMode === 'add' ? 'Add labels' : 'Manage labels'}
            </p>
            <p className="mt-0.5 text-[10px] text-[var(--color-muted)]">
              {resolvedMode === 'add'
                ? `Selected labels will be added to ${targetIds.length} record${targetIds.length === 1 ? '' : 's'}.`
                : 'Choose which labels apply to this record.'}
            </p>
          </div>

          {availableLabels.length === 0 ? (
            <p className="py-3 text-xs text-[var(--color-muted)]">
              No active labels available. Create labels in Settings.
            </p>
          ) : (
            <div className="max-h-56 space-y-0.5 overflow-y-auto">
              {availableLabels.map((label) => {
                const isSelected = selectedSet.has(label.id)
                const visual = resolveLabelColorVisual(label.color)
                return (
                  <button
                    key={label.id}
                    type="button"
                    onClick={() => toggle(label.id)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 text-left transition-colors',
                      isSelected
                        ? 'bg-[var(--color-accent-muted)]/60'
                        : 'hover:bg-[var(--color-surface-muted)]',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border',
                        isSelected
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                          : 'border-[var(--color-border-strong)] bg-[var(--color-surface)]',
                      )}
                      aria-hidden
                    >
                      {isSelected ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : null}
                    </span>
                    <span className={cn('h-2 w-2 shrink-0 rounded-full', visual.swatch)} aria-hidden />
                    <span className="min-w-0 flex-1 truncate text-xs font-medium text-[var(--color-foreground)]">
                      {label.name}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          <div className="mt-3 flex justify-end gap-2 border-t border-[var(--color-border)] pt-3">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!canApply || isPending || availableLabels.length === 0}
              onClick={handleApply}
            >
              {isPending ? 'Saving…' : resolvedMode === 'add' ? 'Add' : 'Save'}
            </Button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
