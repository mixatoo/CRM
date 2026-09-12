import { useMutation, useQueryClient } from '@tanstack/react-query'
import { appContainer } from '@/app/container'
import type { Transfer } from '@/domain/entities/transfer'
import { transferStageChangePatch } from '@/domain/entities/transfer'
import { nextTransferReference } from '@/infrastructure/database/transfer-seed'
import { useToast } from '@/design-system/components/Toast'
import { TRANSFERS_QUERY_KEY } from '@/features/transfers/hooks/use-transfers'

export type TransferFormInput = Omit<Transfer, 'id' | 'reference' | 'createdAt' | 'updatedAt'>

function withTimestamps(input: TransferFormInput, reference: string): Omit<Transfer, 'id'> {
  const now = new Date().toISOString()
  return {
    ...input,
    reference,
    pickupLocation: input.pickupLocation.trim(),
    dropoffLocation: input.dropoffLocation.trim(),
    clientName: input.clientName?.trim() || undefined,
    supplierName: input.supplierName?.trim() || undefined,
    tripReference: input.tripReference?.trim() || undefined,
    serviceDate: input.serviceDate?.trim() || undefined,
    serviceTime: input.serviceTime?.trim() || undefined,
    vehicleType: input.vehicleType?.trim() || undefined,
    vehiclePlate: input.vehiclePlate?.trim() || undefined,
    driverName: input.driverName?.trim() || undefined,
    passengerNames: input.passengerNames?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  }
}

export function useTransferMutations() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: TRANSFERS_QUERY_KEY })
  }

  const createTransfer = useMutation({
    mutationFn: async (input: TransferFormInput) => {
      const reference = await nextTransferReference()
      return appContainer.uow.transfers.create(withTimestamps(input, reference))
    },
    onSuccess: (transfer) => {
      invalidate()
      toast({ intent: 'updated', title: 'Transfer created', description: transfer.reference })
    },
    onError: (error: Error) => {
      toast({ intent: 'failed', title: 'Could not create transfer', description: error.message })
    },
  })

  const updateTransfer = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<TransferFormInput> }) => {
      const existing = await appContainer.uow.transfers.findById(id)
      if (!existing) throw new Error('Transfer not found')

      const stagePatch =
        patch.stage && patch.stage !== existing.stage
          ? transferStageChangePatch(existing, patch.stage)
          : {}

      return appContainer.uow.transfers.update(id, {
        ...patch,
        ...stagePatch,
        pickupLocation: patch.pickupLocation?.trim() ?? existing.pickupLocation,
        dropoffLocation: patch.dropoffLocation?.trim() ?? existing.dropoffLocation,
        clientName: patch.clientName !== undefined ? patch.clientName.trim() || undefined : existing.clientName,
        supplierName:
          patch.supplierName !== undefined ? patch.supplierName.trim() || undefined : existing.supplierName,
        tripReference:
          patch.tripReference !== undefined ? patch.tripReference.trim() || undefined : existing.tripReference,
        serviceDate: patch.serviceDate !== undefined ? patch.serviceDate.trim() || undefined : existing.serviceDate,
        serviceTime: patch.serviceTime !== undefined ? patch.serviceTime.trim() || undefined : existing.serviceTime,
        vehicleType: patch.vehicleType !== undefined ? patch.vehicleType.trim() || undefined : existing.vehicleType,
        vehiclePlate:
          patch.vehiclePlate !== undefined ? patch.vehiclePlate.trim() || undefined : existing.vehiclePlate,
        driverName: patch.driverName !== undefined ? patch.driverName.trim() || undefined : existing.driverName,
        passengerNames:
          patch.passengerNames !== undefined ? patch.passengerNames.trim() || undefined : existing.passengerNames,
        notes: patch.notes !== undefined ? patch.notes.trim() || undefined : existing.notes,
        updatedAt: new Date().toISOString(),
      })
    },
    onSuccess: (transfer) => {
      invalidate()
      toast({ intent: 'updated', title: 'Transfer updated', description: transfer.reference })
    },
    onError: (error: Error) => {
      toast({ intent: 'failed', title: 'Could not update transfer', description: error.message })
    },
  })

  const deleteTransfer = useMutation({
    mutationFn: async (id: string) => {
      await appContainer.uow.transfers.delete(id)
    },
    onSuccess: () => {
      invalidate()
      toast({ intent: 'deleted', title: 'Transfer deleted' })
    },
    onError: (error: Error) => {
      toast({ intent: 'failed', title: 'Could not delete transfer', description: error.message })
    },
  })

  return {
    createTransfer,
    updateTransfer,
    deleteTransfer,
    isPending: createTransfer.isPending || updateTransfer.isPending || deleteTransfer.isPending,
  }
}
