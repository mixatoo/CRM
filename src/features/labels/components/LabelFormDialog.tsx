import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { CloseButton } from '@/design-system/components/CloseButton'
import type { Label, LabelInput, LabelColorId, LabelTargetType } from '@/domain/entities/label'
import {
  LABEL_COLOR_OPTIONS,
  LABEL_TARGET_TYPES,
  LABEL_TARGET_TYPE_LABELS,
  labelToFormInput,
} from '@/domain/entities/label'
import { useLabelMutations } from '@/features/labels/hooks/use-labels'
import { Button } from '@/design-system/components/Button'
import { Input } from '@/design-system/components/Input'
import { NotesTextarea } from '@/design-system/components/NotesField'
import { layout } from '@/design-system/tokens/layout'
import { cn } from '@/shared/utils/cn'

const EMPTY_FORM: LabelInput = {
  name: '',
  color: 'blue',
  description: '',
  scopes: [],
  isActive: true,
}

interface LabelFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  label: Label | null
}

export function LabelFormDialog({ open, onOpenChange, label }: LabelFormDialogProps) {
  const { createLabel, updateLabel, isPending } = useLabelMutations()
  const [form, setForm] = useState<LabelInput>(EMPTY_FORM)

  useEffect(() => {
    if (!open) return
    setForm(label ? labelToFormInput(label) : EMPTY_FORM)
  }, [open, label])

  const isEdit = Boolean(label)
  const canSubmit = form.name.trim().length > 0 && !isPending

  const toggleScope = (scope: LabelTargetType) => {
    setForm((current) => ({
      ...current,
      scopes: current.scopes.includes(scope)
        ? current.scopes.filter((item) => item !== scope)
        : [...current.scopes, scope],
    }))
  }

  const handleSubmit = () => {
    if (!canSubmit) return
    const payload: LabelInput = {
      name: form.name.trim(),
      color: form.color,
      description: form.description?.trim() || undefined,
      scopes: form.scopes,
      isActive: form.isActive,
    }

    if (isEdit && label) {
      updateLabel.mutate({ id: label.id, input: payload }, { onSuccess: () => onOpenChange(false) })
      return
    }

    createLabel.mutate(payload, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[600] bg-black/45" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[601] w-[min(28rem,calc(100vw-1rem))] max-h-[min(90vh,40rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xl sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="text-sm font-semibold text-[var(--color-foreground)]">
                {isEdit ? 'Edit label' : 'Add label'}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-[var(--color-muted)]">
                Labels can be attached to accounts, trips, suppliers, and finance records.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <CloseButton />
            </Dialog.Close>
          </div>

          <div className="mt-4 space-y-4">
            <label className="block space-y-1.5">
              <span className={layout.statLabel}>Name</span>
              <Input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="VIP"
              />
            </label>

            <div className="space-y-1.5">
              <span className={layout.statLabel}>Color</span>
              <div className="flex flex-wrap gap-1.5">
                {LABEL_COLOR_OPTIONS.map((option) => {
                  const selected = form.color === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      title={option.label}
                      onClick={() =>
                        setForm((current) => ({ ...current, color: option.id as LabelColorId }))
                      }
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full border-2 transition-transform',
                        selected
                          ? 'scale-110 border-[var(--color-foreground)]'
                          : 'border-transparent hover:scale-105',
                      )}
                    >
                      <span className={cn('h-4 w-4 rounded-full', option.swatch)} />
                      <span className="sr-only">{option.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <label className="block space-y-1.5">
              <span className={layout.statLabel}>Description (optional)</span>
              <NotesTextarea
                value={form.description ?? ''}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="When this label should be used"
                rows={2}
              />
            </label>

            <div className="space-y-1.5">
              <span className={layout.statLabel}>Available on</span>
              <p className="text-[10px] text-[var(--color-muted)]">
                Leave all unchecked to allow this label on every table.
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {LABEL_TARGET_TYPES.map((scope) => {
                  const checked = form.scopes.includes(scope)
                  return (
                    <label
                      key={scope}
                      className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-2 py-1.5"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleScope(scope)}
                        className="h-3.5 w-3.5 rounded border-[var(--color-border-strong)]"
                      />
                      <span className="text-xs text-[var(--color-foreground)]">
                        {LABEL_TARGET_TYPE_LABELS[scope]}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  setForm((current) => ({ ...current, isActive: event.target.checked }))
                }
                className="h-3.5 w-3.5 rounded border-[var(--color-border-strong)]"
              />
              <span className="text-xs font-medium text-[var(--color-foreground)]">Active</span>
            </label>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button type="button" variant="ghost" size="sm">
                Cancel
              </Button>
            </Dialog.Close>
            <Button type="button" size="sm" disabled={!canSubmit} onClick={handleSubmit}>
              {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create label'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
