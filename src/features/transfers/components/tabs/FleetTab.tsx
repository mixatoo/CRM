import { useEffect, useState } from 'react'
import type { Transfer } from '@/domain/entities/transfer'
import { TRANSFER_VEHICLE_TYPES } from '@/domain/entities/transfer'
import { canMutate } from '@/domain/policies/permissions'
import { Button } from '@/design-system/components/Button'
import { FormPicklist } from '@/design-system/components/FormPicklist'
import { CrmFieldGrid, CrmInputCell, CrmPanel } from '@/design-system/layout/CrmPanel'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { useTransferMutations } from '@/features/transfers/hooks/use-transfer-mutations'
import { formInputClassName } from '@/features/trips/components/services/flight/operations/operation-worksheet-ui'

interface FleetTabProps {
  transfer: Transfer
}

export function FleetTab({ transfer }: FleetTabProps) {
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const canEdit = canMutate(role, 'order', 'update')
  const { updateTransfer, isPending } = useTransferMutations()
  const [vehicleType, setVehicleType] = useState(transfer.vehicleType ?? '')
  const [vehiclePlate, setVehiclePlate] = useState(transfer.vehiclePlate ?? '')
  const [driverName, setDriverName] = useState(transfer.driverName ?? '')

  useEffect(() => {
    setVehicleType(transfer.vehicleType ?? '')
    setVehiclePlate(transfer.vehiclePlate ?? '')
    setDriverName(transfer.driverName ?? '')
  }, [transfer])

  const dirty =
    vehicleType.trim() !== (transfer.vehicleType ?? '').trim() ||
    vehiclePlate.trim() !== (transfer.vehiclePlate ?? '').trim() ||
    driverName.trim() !== (transfer.driverName ?? '').trim()

  return (
    <div className="space-y-3">
      <CrmPanel title="Fleet">
        <CrmFieldGrid columns={2}>
          <CrmInputCell label="Vehicle type">
            <FormPicklist
              size="sm"
              value={vehicleType}
              onChange={setVehicleType}
              options={[
                { value: '', label: 'Select vehicle' },
                ...TRANSFER_VEHICLE_TYPES.map((type) => ({ value: type, label: type })),
              ]}
              panelTitle="Vehicle"
              ariaLabel="Vehicle type"
              disabled={!canEdit}
            />
          </CrmInputCell>
          <CrmInputCell label="Plate">
            <input
              className={formInputClassName}
              value={vehiclePlate}
              onChange={(event) => setVehiclePlate(event.target.value)}
              disabled={!canEdit}
              placeholder="CAI-1234"
            />
          </CrmInputCell>
          <CrmInputCell label="Driver" className="sm:col-span-2">
            <input
              className={formInputClassName}
              value={driverName}
              onChange={(event) => setDriverName(event.target.value)}
              disabled={!canEdit}
              placeholder="Driver name"
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
                patch: { vehicleType, vehiclePlate, driverName },
              })
            }
          >
            {isPending ? 'Saving…' : 'Save fleet'}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
