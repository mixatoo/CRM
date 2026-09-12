import { useEffect, useState } from 'react'
import type { Transfer } from '@/domain/entities/transfer'
import { canMutate } from '@/domain/policies/permissions'
import { Button } from '@/design-system/components/Button'
import { NotesInput } from '@/design-system/components/NotesField'
import { CrmFieldGrid, CrmInputCell, CrmPanel } from '@/design-system/layout/CrmPanel'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { useTransferMutations } from '@/features/transfers/hooks/use-transfer-mutations'
import { formInputClassName } from '@/features/trips/components/services/flight/operations/operation-worksheet-ui'

interface PassengersTabProps {
  transfer: Transfer
}

export function PassengersTab({ transfer }: PassengersTabProps) {
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const canEdit = canMutate(role, 'order', 'update')
  const { updateTransfer, isPending } = useTransferMutations()
  const [passengerCount, setPassengerCount] = useState(String(transfer.passengerCount))
  const [passengerNames, setPassengerNames] = useState(transfer.passengerNames ?? '')

  useEffect(() => {
    setPassengerCount(String(transfer.passengerCount))
    setPassengerNames(transfer.passengerNames ?? '')
  }, [transfer])

  const countValue = Math.max(0, Number.parseInt(passengerCount, 10) || 0)
  const dirty =
    countValue !== transfer.passengerCount ||
    passengerNames.trim() !== (transfer.passengerNames ?? '').trim()

  return (
    <div className="space-y-3">
      <CrmPanel title="Passengers">
        <CrmFieldGrid columns={2}>
          <CrmInputCell label="Passenger count">
            <input
              type="number"
              min={0}
              className={formInputClassName}
              value={passengerCount}
              onChange={(event) => setPassengerCount(event.target.value)}
              disabled={!canEdit}
            />
          </CrmInputCell>
          <CrmInputCell label="Passenger names" className="sm:col-span-2">
            <NotesInput
              value={passengerNames}
              onChange={(event) => setPassengerNames(event.target.value)}
              className={formInputClassName}
              disabled={!canEdit}
              placeholder="Comma-separated names or group description"
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
            onClick={() =>
              updateTransfer.mutate({
                id: transfer.id,
                patch: { passengerCount: countValue, passengerNames },
              })
            }
          >
            {isPending ? 'Saving…' : 'Save passengers'}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
