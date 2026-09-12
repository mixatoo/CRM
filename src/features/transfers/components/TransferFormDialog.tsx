import { useState, type FormEvent } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { TransferKind } from '@/domain/entities/transfer'
import { TRANSFER_KIND_LABELS, TRANSFER_KINDS } from '@/domain/entities/transfer'
import { Button } from '@/design-system/components/Button'
import { FormPicklist } from '@/design-system/components/FormPicklist'
import { useTransferMutations, type TransferFormInput } from '@/features/transfers/hooks/use-transfer-mutations'
import { formInputClassName } from '@/features/trips/components/services/flight/operations/operation-worksheet-ui'

interface TransferFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (transferId: string) => void
}

export function TransferFormDialog({ open, onOpenChange, onCreated }: TransferFormDialogProps) {
  const { createTransfer, isPending } = useTransferMutations()
  const [kind, setKind] = useState<TransferKind>('airport_transfer')
  const [pickupLocation, setPickupLocation] = useState('')
  const [dropoffLocation, setDropoffLocation] = useState('')
  const [serviceDate, setServiceDate] = useState('')
  const [passengerCount, setPassengerCount] = useState('1')

  const reset = () => {
    setKind('airport_transfer')
    setPickupLocation('')
    setDropoffLocation('')
    setServiceDate('')
    setPassengerCount('1')
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!pickupLocation.trim() || !dropoffLocation.trim()) return

    const input: TransferFormInput = {
      kind,
      stage: 'draft',
      pickupLocation: pickupLocation.trim(),
      dropoffLocation: dropoffLocation.trim(),
      serviceDate: serviceDate || undefined,
      passengerCount: Math.max(1, Number.parseInt(passengerCount, 10) || 1),
      currency: 'USD',
      sellingPrice: 0,
      supplierCost: 0,
    }

    createTransfer.mutate(input, {
      onSuccess: (transfer) => {
        reset()
        onOpenChange(false)
        onCreated?.(transfer.id)
      },
    })
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-lg">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="text-sm font-semibold text-[var(--color-foreground)]">
                New transfer
              </Dialog.Title>
              <Dialog.Description className="mt-0.5 text-xs text-[var(--color-muted)]">
                Create a draft transfer and finish details in the workspace.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <label className="block space-y-1">
              <span className="text-[11px] font-medium text-[var(--color-muted)]">Kind</span>
              <FormPicklist
                size="sm"
                value={kind}
                onChange={(value) => setKind(value as TransferKind)}
                options={TRANSFER_KINDS.map((item) => ({ value: item, label: TRANSFER_KIND_LABELS[item] }))}
                panelTitle="Kind"
                ariaLabel="Transfer kind"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[11px] font-medium text-[var(--color-muted)]">Pickup</span>
              <input
                required
                className={formInputClassName}
                value={pickupLocation}
                onChange={(event) => setPickupLocation(event.target.value)}
                placeholder="Pickup location"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[11px] font-medium text-[var(--color-muted)]">Drop-off</span>
              <input
                required
                className={formInputClassName}
                value={dropoffLocation}
                onChange={(event) => setDropoffLocation(event.target.value)}
                placeholder="Drop-off location"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-[11px] font-medium text-[var(--color-muted)]">Date</span>
                <input
                  type="date"
                  className={formInputClassName}
                  value={serviceDate}
                  onChange={(event) => setServiceDate(event.target.value)}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[11px] font-medium text-[var(--color-muted)]">Passengers</span>
                <input
                  type="number"
                  min={1}
                  className={formInputClassName}
                  value={passengerCount}
                  onChange={(event) => setPassengerCount(event.target.value)}
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? 'Creating…' : 'Create draft'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
