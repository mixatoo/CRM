import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Trip } from '@/domain/entities'
import type { PaymentAllocationInput } from '@/domain/entities/payment-allocation'
import type { PaymentDirection, PaymentMethod } from '@/domain/entities/trip-payment'
import { recordReceipt, voidReceipt } from '@/domain/payment/record-payment'
import { useToast } from '@/design-system/components/Toast'

export interface RecordPaymentInput {
  trip: Trip
  direction: PaymentDirection
  method: PaymentMethod
  amount: number
  paidAt: string
  invoiceId?: string
  allocations?: PaymentAllocationInput[]
  reference?: string
  counterpartyName?: string
  notes?: string
  actorName?: string
}

function invalidatePaymentQueries(queryClient: ReturnType<typeof useQueryClient>, tripId: string, clientId?: string) {
  void queryClient.invalidateQueries({ queryKey: ['trip-payments', tripId] })
  void queryClient.invalidateQueries({ queryKey: ['invoices', tripId] })
  void queryClient.invalidateQueries({ queryKey: ['trips', tripId] })
  void queryClient.invalidateQueries({ queryKey: ['trips'] })
  void queryClient.invalidateQueries({ queryKey: ['trip-activities', tripId] })
  if (clientId) {
    void queryClient.invalidateQueries({ queryKey: ['clients', clientId, 'linked-payments'] })
    void queryClient.invalidateQueries({ queryKey: ['clients', clientId, 'linked-invoices'] })
  }
}

export function usePaymentMutations(tripId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const recordMutation = useMutation({
    mutationFn: async (input: RecordPaymentInput) => {
      if (!input.trip.clientId) throw new Error('This trip is not linked to a client account.')
      return recordReceipt({
        clientId: input.trip.clientId,
        tripId: input.trip.id,
        restrictToTripId: input.direction === 'inbound' ? input.trip.id : undefined,
        direction: input.direction,
        method: input.method,
        amount: input.amount,
        currency: input.trip.currency,
        paidAt: input.paidAt,
        invoiceId: input.invoiceId,
        allocations: input.allocations,
        reference: input.reference,
        counterpartyName: input.counterpartyName,
        notes: input.notes,
        actorName: input.actorName,
      })
    },
    onSuccess: (payment, input) => {
      invalidatePaymentQueries(queryClient, tripId, input.trip.clientId)
      toast({
        intent: 'info',
        title: 'Payment recorded',
        description: `${payment.amount.toFixed(2)} ${payment.currency}`,
      })
    },
    onError: (error: Error) => {
      toast({
        intent: 'failed',
        title: 'Payment failed',
        description: error.message || 'Could not record payment.',
      })
    },
  })

  const voidMutation = useMutation({
    mutationFn: voidReceipt,
    onSuccess: (payment) => {
      invalidatePaymentQueries(queryClient, tripId, payment.clientId)
      toast({ intent: 'deleted', title: 'Payment voided' })
    },
    onError: (error: Error) => {
      toast({ intent: 'failed', title: 'Void failed', description: error.message })
    },
  })

  return {
    recordPayment: recordMutation.mutate,
    recordPaymentAsync: recordMutation.mutateAsync,
    voidPayment: voidMutation.mutate,
    isRecording: recordMutation.isPending,
    isVoiding: voidMutation.isPending,
  }
}
