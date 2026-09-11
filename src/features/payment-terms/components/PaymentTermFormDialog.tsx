import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { CloseButton } from '@/design-system/components/CloseButton'
import type { PaymentTerm, PaymentTermInput } from '@/domain/entities/payment-term'
import { usePaymentTermMutations } from '@/features/payment-terms/hooks/use-payment-terms'
import { paymentTermToFormInput } from '@/domain/entities/payment-term'
import { Button } from '@/design-system/components/Button'
import { Input } from '@/design-system/components/Input'
import { NotesTextarea } from '@/design-system/components/NotesField'
import { layout } from '@/design-system/tokens/layout'

const EMPTY_FORM: PaymentTermInput = {
  name: '',
  days: 30,
  description: '',
  isActive: true,
}

interface PaymentTermFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  term: PaymentTerm | null
}

export function PaymentTermFormDialog({ open, onOpenChange, term }: PaymentTermFormDialogProps) {
  const { createPaymentTerm, updatePaymentTerm, isPending } = usePaymentTermMutations()
  const [form, setForm] = useState<PaymentTermInput>(EMPTY_FORM)

  useEffect(() => {
    if (!open) return
    setForm(term ? paymentTermToFormInput(term) : EMPTY_FORM)
  }, [open, term])

  const isEdit = Boolean(term)
  const canSubmit = form.name.trim().length > 0 && Number.isFinite(form.days) && form.days >= 0 && !isPending

  const handleSubmit = () => {
    if (!canSubmit) return
    const payload: PaymentTermInput = {
      name: form.name.trim(),
      days: Math.max(0, Math.round(form.days)),
      description: form.description?.trim() || undefined,
      isActive: form.isActive,
    }

    if (isEdit && term) {
      updatePaymentTerm.mutate(
        { id: term.id, input: payload },
        { onSuccess: () => onOpenChange(false) },
      )
      return
    }

    createPaymentTerm.mutate(payload, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[600] bg-black/45" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[601] w-[min(24rem,calc(100vw-1rem))] -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xl sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="text-sm font-semibold text-[var(--color-foreground)]">
                {isEdit ? 'Edit payment term' : 'Add payment term'}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-[var(--color-muted)]">
                Used to calculate invoice due dates for linked customers.
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
                placeholder="Net 30"
              />
            </label>

            <label className="block space-y-1.5">
              <span className={layout.statLabel}>Days</span>
              <Input
                type="number"
                min={0}
                value={form.days}
                onChange={(event) =>
                  setForm((current) => ({ ...current, days: Number(event.target.value) || 0 }))
                }
                className="max-w-[8rem] font-mono tabular-nums"
              />
            </label>

            <label className="block space-y-1.5">
              <span className={layout.statLabel}>Description (optional)</span>
              <NotesTextarea
                value={form.description ?? ''}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Payment due within 30 days of invoice date"
                rows={3}
              />
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
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
              {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create term'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
