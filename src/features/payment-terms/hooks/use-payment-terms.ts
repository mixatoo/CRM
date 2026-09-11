import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDatabaseReady } from '@/app/providers'
import { appContainer } from '@/app/container'
import type { PaymentTerm, PaymentTermInput } from '@/domain/entities/payment-term'
import {
  normalizePaymentTermInput,
  sortPaymentTerms,
  validatePaymentTermInput,
} from '@/domain/entities/payment-term'
import { useToast } from '@/design-system/components/Toast'

export const PAYMENT_TERMS_QUERY_KEY = ['payment-terms'] as const

export function usePaymentTerms() {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: PAYMENT_TERMS_QUERY_KEY,
    queryFn: async () => sortPaymentTerms(await appContainer.uow.paymentTerms.findAll()),
    enabled: dbReady,
  })
}

export function useActivePaymentTerms() {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: [...PAYMENT_TERMS_QUERY_KEY, 'active'],
    queryFn: () => appContainer.uow.paymentTerms.findActive(),
    enabled: dbReady,
  })
}

export function usePaymentTerm(paymentTermId: string | undefined) {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: [...PAYMENT_TERMS_QUERY_KEY, paymentTermId],
    queryFn: async () => {
      if (!paymentTermId) return null
      return appContainer.uow.paymentTerms.findById(paymentTermId)
    },
    enabled: dbReady && Boolean(paymentTermId),
  })
}

function invalidatePaymentTerms(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: PAYMENT_TERMS_QUERY_KEY })
}

export function usePaymentTermMutations() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const createPaymentTerm = useMutation({
    mutationFn: async (input: PaymentTermInput) => {
      const normalized = normalizePaymentTermInput(input)
      const error = validatePaymentTermInput(normalized)
      if (error) throw new Error(error)
      const now = new Date().toISOString()
      return appContainer.uow.paymentTerms.create({
        ...normalized,
        createdAt: now,
        updatedAt: now,
      })
    },
    onSuccess: (term) => {
      invalidatePaymentTerms(queryClient)
      toast({ intent: 'updated', title: 'Payment term created', description: term.name })
    },
    onError: (error: Error) => {
      toast({ intent: 'failed', title: 'Could not create payment term', description: error.message })
    },
  })

  const updatePaymentTerm = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: PaymentTermInput }) => {
      const normalized = normalizePaymentTermInput(input)
      const error = validatePaymentTermInput(normalized)
      if (error) throw new Error(error)
      return appContainer.uow.paymentTerms.update(id, {
        ...normalized,
        updatedAt: new Date().toISOString(),
      })
    },
    onSuccess: (term) => {
      invalidatePaymentTerms(queryClient)
      toast({ intent: 'updated', title: 'Payment term updated', description: term.name })
    },
    onError: (error: Error) => {
      toast({ intent: 'failed', title: 'Could not update payment term', description: error.message })
    },
  })

  const deletePaymentTerm = useMutation({
    mutationFn: async (id: string) => {
      const linked = await appContainer.uow.paymentTerms.countLinkedClients(id)
      if (linked > 0) {
        throw new Error(`This term is assigned to ${linked} client${linked === 1 ? '' : 's'}. Deactivate it instead.`)
      }
      await appContainer.uow.paymentTerms.delete(id)
    },
    onSuccess: () => {
      invalidatePaymentTerms(queryClient)
      toast({ intent: 'deleted', title: 'Payment term deleted' })
    },
    onError: (error: Error) => {
      toast({ intent: 'failed', title: 'Could not delete payment term', description: error.message })
    },
  })

  return {
    createPaymentTerm,
    updatePaymentTerm,
    deletePaymentTerm,
    isPending:
      createPaymentTerm.isPending || updatePaymentTerm.isPending || deletePaymentTerm.isPending,
  }
}

export function paymentTermsToPicklistOptions(terms: PaymentTerm[]) {
  return terms.map((term) => ({
    value: term.id,
    label: term.name,
    description: term.description ? `${term.description} · ${term.days} days` : `${term.days} days`,
  }))
}
