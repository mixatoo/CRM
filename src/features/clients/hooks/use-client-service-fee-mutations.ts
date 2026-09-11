import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/design-system/components/Toast'
import { CLIENT_SERVICE_FEES_QUERY_KEY } from '@/features/clients/hooks/use-client-service-fees'
import { appContainer } from '@/app/container'
import type { ClientServiceFeeInput } from '@/domain/entities/client-service-fee'
import { normalizeClientServiceFeeInput } from '@/domain/entities/client-service-fee'

export function useClientServiceFeeMutations(clientId: string | undefined) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [...CLIENT_SERVICE_FEES_QUERY_KEY, clientId ?? 'unknown'] })
  }

  const createFee = useMutation({
    mutationFn: async (input: ClientServiceFeeInput) => {
      const normalized = normalizeClientServiceFeeInput(input)
      const now = new Date().toISOString()
      return appContainer.uow.clientServiceFees.create({
        ...normalized,
        createdAt: now,
        updatedAt: now,
      })
    },
    onSuccess: () => {
      invalidate()
      toast({ intent: 'updated', title: 'Service fee saved' })
    },
    onError: (error: Error) => {
      toast({ intent: 'failed', title: 'Could not save service fee', description: error.message })
    },
  })

  const updateFee = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: ClientServiceFeeInput }) => {
      const normalized = normalizeClientServiceFeeInput(input)
      const existing = await appContainer.uow.clientServiceFees.findById(id)
      if (!existing) throw new Error('Service fee not found')
      if (clientId && existing.clientId !== clientId) throw new Error('Service fee not found')

      return appContainer.uow.clientServiceFees.update(id, {
        ...normalized,
        updatedAt: new Date().toISOString(),
      })
    },
    onSuccess: () => {
      invalidate()
      toast({ intent: 'updated', title: 'Service fee updated' })
    },
    onError: (error: Error) => {
      toast({ intent: 'failed', title: 'Could not update service fee', description: error.message })
    },
  })

  const deleteFee = useMutation({
    mutationFn: async (feeId: string) => {
      const existing = await appContainer.uow.clientServiceFees.findById(feeId)
      if (!existing) throw new Error('Service fee not found')
      if (clientId && existing.clientId !== clientId) throw new Error('Service fee not found')
      await appContainer.uow.clientServiceFees.delete(feeId)
    },
    onSuccess: () => {
      invalidate()
      toast({ intent: 'deleted', title: 'Service fee removed' })
    },
    onError: (error: Error) => {
      toast({ intent: 'failed', title: 'Could not remove service fee', description: error.message })
    },
  })

  const isPending = createFee.isPending || updateFee.isPending || deleteFee.isPending

  return {
    createFee,
    updateFee,
    deleteFee: deleteFee.mutate,
    isPending,
  }
}
