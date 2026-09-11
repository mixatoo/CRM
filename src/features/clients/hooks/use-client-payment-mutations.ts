import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Client } from '@/domain/entities/client'
import type { PaymentAllocationInput } from '@/domain/entities/payment-allocation'
import type { PaymentMethod } from '@/domain/entities/trip-payment'
import { recordReceipt } from '@/domain/payment/record-payment'
import { useToast } from '@/design-system/components/Toast'

export interface RecordClientReceiptInput {
  client: Client
  method: PaymentMethod
  amount: number
  currency: string
  paidAt: string
  allocations?: PaymentAllocationInput[]
  reference?: string
  counterpartyName?: string
  notes?: string
  actorName?: string
}

export function useClientPaymentMutations(clientId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const recordMutation = useMutation({
    mutationFn: (input: RecordClientReceiptInput) =>
      recordReceipt({
        clientId: input.client.id,
        direction: 'inbound',
        method: input.method,
        amount: input.amount,
        currency: input.currency,
        paidAt: input.paidAt,
        allocations: input.allocations,
        reference: input.reference,
        counterpartyName: input.counterpartyName,
        notes: input.notes,
        actorName: input.actorName,
      }),
    onSuccess: (payment) => {
      void queryClient.invalidateQueries({ queryKey: ['clients', clientId, 'linked-payments'] })
      void queryClient.invalidateQueries({ queryKey: ['clients', clientId, 'linked-invoices'] })
      void queryClient.invalidateQueries({ queryKey: ['clients', clientId, 'linked-payments-open-invoices'] })
      void queryClient.invalidateQueries({ queryKey: ['transactions'] })
      if (payment.tripId) {
        void queryClient.invalidateQueries({ queryKey: ['trip-payments', payment.tripId] })
        void queryClient.invalidateQueries({ queryKey: ['invoices', payment.tripId] })
        void queryClient.invalidateQueries({ queryKey: ['trips', payment.tripId] })
      }
      toast({
        intent: 'info',
        title: 'Collection recorded',
        description: `${payment.amount.toFixed(2)} ${payment.currency}`,
      })
    },
    onError: (error: Error) => {
      toast({
        intent: 'failed',
        title: 'Collection failed',
        description: error.message || 'Could not record collection.',
      })
    },
  })

  return {
    recordReceipt: recordMutation.mutate,
    recordReceiptAsync: recordMutation.mutateAsync,
    isRecording: recordMutation.isPending,
  }
}
