import { useEffect, useState } from 'react'
import type { Client } from '@/domain/entities/client'
import { canMutate } from '@/domain/policies/permissions'
import { Button } from '@/design-system/components/Button'
import { NotesInput } from '@/design-system/components/NotesField'
import { CrmFieldGrid, CrmInputCell, CrmPanel } from '@/design-system/layout/CrmPanel'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { useClientMutations } from '@/features/clients/hooks/use-client-mutations'
import { formInputClassName } from '@/features/trips/components/services/flight/operations/operation-worksheet-ui'

interface ClientNotesTabProps {
  client: Client
}

export function ClientNotesTab({ client }: ClientNotesTabProps) {
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const canEdit = canMutate(role, 'passenger', 'update')
  const { updateClient, isPending } = useClientMutations()
  const [billingNotes, setBillingNotes] = useState(client.billingNotes ?? '')
  const [notes, setNotes] = useState(client.notes ?? '')

  useEffect(() => {
    setBillingNotes(client.billingNotes ?? '')
    setNotes(client.notes ?? '')
  }, [client])

  const handleSave = () => {
    if (!canEdit) return
    updateClient.mutate({
      id: client.id,
      patch: { billingNotes, notes },
    })
  }

  const dirty =
    billingNotes.trim() !== (client.billingNotes ?? '').trim() || notes.trim() !== (client.notes ?? '').trim()

  return (
    <div className="space-y-3">
      <CrmPanel title="Billing notes">
        <CrmFieldGrid columns={2}>
          <CrmInputCell label="Shown on invoices and billing correspondence" className="sm:col-span-2">
            <NotesInput
              value={billingNotes}
              onChange={(event) => setBillingNotes(event.target.value)}
              className={formInputClassName}
              disabled={!canEdit}
              placeholder="Payment terms, tax ID, billing preferences…"
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
              placeholder="Relationship history, preferences, VIP flags…"
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
