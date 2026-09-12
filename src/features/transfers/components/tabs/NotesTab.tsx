import { useEffect, useState } from 'react'
import type { Transfer } from '@/domain/entities/transfer'
import { canMutate } from '@/domain/policies/permissions'
import { Button } from '@/design-system/components/Button'
import { NotesInput } from '@/design-system/components/NotesField'
import { CrmFieldGrid, CrmInputCell, CrmPanel } from '@/design-system/layout/CrmPanel'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { useTransferMutations } from '@/features/transfers/hooks/use-transfer-mutations'
import { formInputClassName } from '@/features/trips/components/services/flight/operations/operation-worksheet-ui'

interface NotesTabProps {
  transfer: Transfer
}

export function NotesTab({ transfer }: NotesTabProps) {
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const canEdit = canMutate(role, 'order', 'update')
  const { updateTransfer, isPending } = useTransferMutations()
  const [notes, setNotes] = useState(transfer.notes ?? '')

  useEffect(() => {
    setNotes(transfer.notes ?? '')
  }, [transfer])

  const dirty = notes.trim() !== (transfer.notes ?? '').trim()

  return (
    <div className="space-y-3">
      <CrmPanel title="Notes">
        <CrmFieldGrid columns={2}>
          <CrmInputCell label="Operational notes" className="sm:col-span-2">
            <NotesInput
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className={formInputClassName}
              disabled={!canEdit}
              placeholder="Meet-and-greet, flight number, special requests…"
            />
          </CrmInputCell>
        </CrmFieldGrid>
      </CrmPanel>

      {canEdit ? (
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            disabled={!dirty || isPending}
            onClick={() => updateTransfer.mutate({ id: transfer.id, patch: { notes } })}
          >
            {isPending ? 'Saving…' : 'Save notes'}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
