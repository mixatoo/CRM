import { useEffect, useState } from 'react'
import type { Supplier } from '@/domain/entities/supplier'
import { canMutate } from '@/domain/policies/permissions'
import { Button } from '@/design-system/components/Button'
import { SupplierProfileFields, supplierToFormInput } from '@/features/suppliers/components/SupplierProfileFields'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { useSupplierMutations } from '@/features/suppliers/hooks/use-supplier-mutations'
import type { SupplierFormInput } from '@/features/suppliers/hooks/use-supplier-mutations'

interface SupplierProfileTabProps {
  supplier: Supplier
}

export function SupplierProfileTab({ supplier }: SupplierProfileTabProps) {
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const canEdit = canMutate(role, 'directory', 'update')
  const { updateSupplier, isPending } = useSupplierMutations()
  const [form, setForm] = useState<SupplierFormInput>(() => supplierToFormInput(supplier))

  useEffect(() => {
    setForm(supplierToFormInput(supplier))
  }, [supplier])

  const setField = <K extends keyof SupplierFormInput>(key: K, value: SupplierFormInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSave = () => {
    if (!canEdit || form.displayName.trim().length === 0) return
    updateSupplier.mutate({ id: supplier.id, patch: form })
  }

  return (
    <div className="space-y-3">
      <SupplierProfileFields form={form} onChange={setField} disabled={!canEdit} />
      {canEdit ? (
        <div className="flex justify-end">
          <Button type="button" size="sm" disabled={isPending || form.displayName.trim().length === 0} onClick={handleSave}>
            {isPending ? 'Saving…' : 'Save profile'}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
