import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { CloseButton } from '@/design-system/components/CloseButton'
import type { Supplier } from '@/domain/entities/supplier'
import { Button } from '@/design-system/components/Button'
import {
  SupplierProfileFields,
  EMPTY_SUPPLIER_FORM,
  supplierToFormInput,
} from '@/features/suppliers/components/SupplierProfileFields'
import type { SupplierFormInput } from '@/features/suppliers/hooks/use-supplier-mutations'

interface SupplierFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier?: Supplier | null
  isPending?: boolean
  onSubmit: (input: SupplierFormInput) => void
}

export function SupplierFormDialog({ open, onOpenChange, supplier, isPending, onSubmit }: SupplierFormDialogProps) {
  const isEdit = !!supplier
  const [form, setForm] = useState<SupplierFormInput>(EMPTY_SUPPLIER_FORM)

  useEffect(() => {
    if (!open) return
    setForm(supplier ? supplierToFormInput(supplier) : EMPTY_SUPPLIER_FORM)
  }, [open, supplier])

  const canSubmit = form.displayName.trim().length > 0 && !isPending

  const setField = <K extends keyof SupplierFormInput>(key: K, value: SupplierFormInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit(form)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[600] bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[601] flex max-h-[min(90vh,48rem)] w-[min(42rem,calc(100vw-1rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl outline-none">
          <header className="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
            <div>
              <Dialog.Title className="text-sm font-semibold">
                {isEdit ? 'Edit supplier' : 'New supplier'}
              </Dialog.Title>
              <Dialog.Description className="text-xs text-[var(--color-muted)]">
                {isEdit ? supplier?.reference : 'Add a record to the global suppliers directory'}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <CloseButton variant="elevated" />
            </Dialog.Close>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <SupplierProfileFields form={form} onChange={setField} />
          </div>

          <footer className="flex shrink-0 justify-end gap-2 border-t border-[var(--color-border)] px-4 py-3">
            <Dialog.Close asChild>
              <Button type="button" variant="ghost" size="sm">
                Cancel
              </Button>
            </Dialog.Close>
            <Button type="button" size="sm" disabled={!canSubmit} onClick={handleSubmit}>
              {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create supplier'}
            </Button>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
