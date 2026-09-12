import { useEffect, useState } from 'react'
import type { Transfer } from '@/domain/entities/transfer'
import { canMutate } from '@/domain/policies/permissions'
import { Button } from '@/design-system/components/Button'
import { CrmFieldGrid, CrmInputCell, CrmPanel } from '@/design-system/layout/CrmPanel'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { useTransferMutations } from '@/features/transfers/hooks/use-transfer-mutations'
import { formInputClassName } from '@/features/trips/components/services/flight/operations/operation-worksheet-ui'

interface RouteTabProps {
  transfer: Transfer
}

export function RouteTab({ transfer }: RouteTabProps) {
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const canEdit = canMutate(role, 'order', 'update')
  const { updateTransfer, isPending } = useTransferMutations()
  const [pickupLocation, setPickupLocation] = useState(transfer.pickupLocation)
  const [dropoffLocation, setDropoffLocation] = useState(transfer.dropoffLocation)
  const [serviceDate, setServiceDate] = useState(transfer.serviceDate ?? '')
  const [serviceTime, setServiceTime] = useState(transfer.serviceTime ?? '')

  useEffect(() => {
    setPickupLocation(transfer.pickupLocation)
    setDropoffLocation(transfer.dropoffLocation)
    setServiceDate(transfer.serviceDate ?? '')
    setServiceTime(transfer.serviceTime ?? '')
  }, [transfer])

  const dirty =
    pickupLocation.trim() !== transfer.pickupLocation.trim() ||
    dropoffLocation.trim() !== transfer.dropoffLocation.trim() ||
    serviceDate.trim() !== (transfer.serviceDate ?? '').trim() ||
    serviceTime.trim() !== (transfer.serviceTime ?? '').trim()

  return (
    <div className="space-y-3">
      <CrmPanel title="Route">
        <CrmFieldGrid columns={2}>
          <CrmInputCell label="Pickup" className="sm:col-span-2">
            <input
              className={formInputClassName}
              value={pickupLocation}
              onChange={(event) => setPickupLocation(event.target.value)}
              disabled={!canEdit}
            />
          </CrmInputCell>
          <CrmInputCell label="Drop-off" className="sm:col-span-2">
            <input
              className={formInputClassName}
              value={dropoffLocation}
              onChange={(event) => setDropoffLocation(event.target.value)}
              disabled={!canEdit}
            />
          </CrmInputCell>
          <CrmInputCell label="Service date">
            <input
              type="date"
              className={formInputClassName}
              value={serviceDate}
              onChange={(event) => setServiceDate(event.target.value)}
              disabled={!canEdit}
            />
          </CrmInputCell>
          <CrmInputCell label="Service time">
            <input
              type="time"
              className={formInputClassName}
              value={serviceTime}
              onChange={(event) => setServiceTime(event.target.value)}
              disabled={!canEdit}
            />
          </CrmInputCell>
        </CrmFieldGrid>
      </CrmPanel>

      {canEdit ? (
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            disabled={!dirty || isPending || !pickupLocation.trim() || !dropoffLocation.trim()}
            onClick={() =>
              updateTransfer.mutate({
                id: transfer.id,
                patch: { pickupLocation, dropoffLocation, serviceDate, serviceTime },
              })
            }
          >
            {isPending ? 'Saving…' : 'Save route'}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
