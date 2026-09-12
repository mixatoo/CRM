import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Transfer, TransferKind } from '@/domain/entities/transfer'
import { TRANSFER_KIND_LABELS, TRANSFER_KINDS } from '@/domain/entities/transfer'
import { canMutate } from '@/domain/policies/permissions'
import { Button } from '@/design-system/components/Button'
import { FormPicklist } from '@/design-system/components/FormPicklist'
import { CrmFieldGrid, CrmInputCell, CrmPanel } from '@/design-system/layout/CrmPanel'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { useSuppliers } from '@/features/suppliers/hooks/use-suppliers'
import { useTrips } from '@/features/trips/hooks/use-trips'
import { useTransferMutations } from '@/features/transfers/hooks/use-transfer-mutations'
import { formInputClassName } from '@/features/trips/components/services/flight/operations/operation-worksheet-ui'

interface ServiceTabProps {
  transfer: Transfer
}

export function ServiceTab({ transfer }: ServiceTabProps) {
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const canEdit = canMutate(role, 'order', 'update')
  const { updateTransfer, isPending } = useTransferMutations()
  const { data: suppliers = [] } = useSuppliers()
  const { data: trips = [] } = useTrips()

  const [kind, setKind] = useState<TransferKind>(transfer.kind)
  const [supplierId, setSupplierId] = useState(transfer.supplierId ?? '')
  const [tripId, setTripId] = useState(transfer.tripId ?? '')
  const [clientName, setClientName] = useState(transfer.clientName ?? '')

  useEffect(() => {
    setKind(transfer.kind)
    setSupplierId(transfer.supplierId ?? '')
    setTripId(transfer.tripId ?? '')
    setClientName(transfer.clientName ?? '')
  }, [transfer])

  const transportSuppliers = useMemo(
    () => suppliers.filter((supplier) => supplier.category === 'transport' || supplier.id === transfer.supplierId),
    [suppliers, transfer.supplierId],
  )

  const supplierOptions = useMemo(
    () => [
      { value: '', label: 'No supplier' },
      ...transportSuppliers.map((supplier) => ({
        value: supplier.id,
        label: supplier.displayName,
      })),
    ],
    [transportSuppliers],
  )

  const tripOptions = useMemo(
    () => [
      { value: '', label: 'No linked trip' },
      ...trips.slice(0, 40).map((trip) => ({
        value: trip.id,
        label: `${trip.reference} · ${trip.name}`,
      })),
    ],
    [trips],
  )

  const dirty =
    kind !== transfer.kind ||
    supplierId !== (transfer.supplierId ?? '') ||
    tripId !== (transfer.tripId ?? '') ||
    clientName.trim() !== (transfer.clientName ?? '').trim()

  const handleSave = () => {
    const supplier = suppliers.find((item) => item.id === supplierId)
    const trip = trips.find((item) => item.id === tripId)
    updateTransfer.mutate({
      id: transfer.id,
      patch: {
        kind,
        supplierId: supplierId || undefined,
        supplierName: supplier?.displayName,
        tripId: tripId || undefined,
        tripReference: trip?.reference,
        clientName,
      },
    })
  }

  return (
    <div className="space-y-3">
      <CrmPanel title="Service">
        <CrmFieldGrid columns={2}>
          <CrmInputCell label="Transfer kind">
            <FormPicklist
              size="sm"
              value={kind}
              onChange={(value) => setKind(value as TransferKind)}
              options={TRANSFER_KINDS.map((item) => ({ value: item, label: TRANSFER_KIND_LABELS[item] }))}
              panelTitle="Kind"
              ariaLabel="Transfer kind"
              disabled={!canEdit}
            />
          </CrmInputCell>
          <CrmInputCell label="Client name">
            <input
              className={formInputClassName}
              value={clientName}
              onChange={(event) => setClientName(event.target.value)}
              disabled={!canEdit}
              placeholder="Optional client / guest name"
            />
          </CrmInputCell>
          <CrmInputCell label="Supplier">
            <FormPicklist
              size="sm"
              value={supplierId}
              onChange={setSupplierId}
              options={supplierOptions}
              panelTitle="Supplier"
              ariaLabel="Transfer supplier"
              disabled={!canEdit}
            />
          </CrmInputCell>
          <CrmInputCell label="Linked trip">
            <FormPicklist
              size="sm"
              value={tripId}
              onChange={setTripId}
              options={tripOptions}
              panelTitle="Trip"
              ariaLabel="Linked trip"
              disabled={!canEdit}
            />
          </CrmInputCell>
        </CrmFieldGrid>
      </CrmPanel>

      {transfer.tripId ? (
        <p className="text-xs text-[var(--color-muted)]">
          Open trip{' '}
          <Link to={`/trips/${transfer.tripId}/dashboard`} className="font-medium text-[var(--color-accent)] hover:underline">
            {transfer.tripReference ?? transfer.tripId}
          </Link>
        </p>
      ) : null}

      {canEdit ? (
        <div className="flex justify-end">
          <Button type="button" size="sm" disabled={!dirty || isPending} onClick={handleSave}>
            {isPending ? 'Saving…' : 'Save service'}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
