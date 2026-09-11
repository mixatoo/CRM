import { useEffect, useState } from 'react'
import type { Supplier } from '@/domain/entities/supplier'
import { canMutate } from '@/domain/policies/permissions'
import { Button } from '@/design-system/components/Button'
import { NotesInput } from '@/design-system/components/NotesField'
import { CrmFieldGrid, CrmInputCell, CrmPanel } from '@/design-system/layout/CrmPanel'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { useSupplierMutations } from '@/features/suppliers/hooks/use-supplier-mutations'
import { formInputClassName } from '@/features/trips/components/services/flight/operations/operation-worksheet-ui'

interface SupplierNotesTabProps {
  supplier: Supplier
}

export function SupplierNotesTab({ supplier }: SupplierNotesTabProps) {
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const canEdit = canMutate(role, 'directory', 'update')
  const { updateSupplier, isPending } = useSupplierMutations()
  const [billingNotes, setBillingNotes] = useState(supplier.billingNotes ?? '')
  const [notes, setNotes] = useState(supplier.notes ?? '')

  useEffect(() => {
    setBillingNotes(supplier.billingNotes ?? '')
    setNotes(supplier.notes ?? '')
  }, [supplier])

  const handleSave = () => {
    if (!canEdit) return
    updateSupplier.mutate({
      id: supplier.id,
      patch: { billingNotes, notes },
    })
  }

  const dirty =
    billingNotes.trim() !== (supplier.billingNotes ?? '').trim() || notes.trim() !== (supplier.notes ?? '').trim()

  return (
    <div className="space-y-3">
      <CrmPanel title="Billing notes">
        <CrmFieldGrid columns={2}>
          <CrmInputCell label="Payment terms and billing correspondence" className="sm:col-span-2">
            <NotesInput
              value={billingNotes}
              onChange={(event) => setBillingNotes(event.target.value)}
              className={formInputClassName}
              disabled={!canEdit}
              placeholder="Net 30, bank details, invoice preferences…"
            />
          </CrmInputCell>
        </CrmFieldGrid>
      </CrmPanel>

      <CrmPanel title="Internal notes">
        <CrmFieldGrid columns={2}>
          <CrmInputCell label="Team-only context" className="sm:col-span-2">
            <NotesInput
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className={formInputClassName}
              disabled={!canEdit}
              placeholder="Contract terms, account manager, escalation contacts…"
            />
          </CrmInputCell>
        </CrmFieldGrid>
      </CrmPanel>

      {canEdit ? (
        <div className="flex justify-end">
          <Button type="button" size="sm" disabled={!dirty || isPending} onClick={handleSave}>
            {isPending ? 'Saving…' : 'Save notes'}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
