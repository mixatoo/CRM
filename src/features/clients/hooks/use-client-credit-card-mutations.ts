import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/design-system/components/Toast'
import { CLIENT_CREDIT_CARDS_QUERY_KEY } from '@/features/clients/hooks/use-client-credit-cards'
import { appContainer } from '@/app/container'
import type { ClientCreditCardInput } from '@/domain/entities/client-credit-card'
import { normalizeClientCreditCardInput } from '@/domain/entities/client-credit-card'

export function useClientCreditCardMutations(clientId: string | undefined) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [...CLIENT_CREDIT_CARDS_QUERY_KEY, clientId ?? 'unknown'] })
  }

  const createCard = useMutation({
    mutationFn: async (input: ClientCreditCardInput) => {
      const normalized = normalizeClientCreditCardInput(input)
      const now = new Date().toISOString()

      if (normalized.isActive) {
        const existing = await appContainer.uow.clientCreditCards.findByClientId(normalized.clientId)
        for (const card of existing) {
          if (card.isActive) {
            await appContainer.uow.clientCreditCards.update(card.id, { isActive: false, updatedAt: now })
          }
        }
      }

      return appContainer.uow.clientCreditCards.create({
        ...normalized,
        createdAt: now,
        updatedAt: now,
      })
    },
    onSuccess: () => {
      invalidate()
      toast({ intent: 'updated', title: 'Credit card saved' })
    },
    onError: (error: Error) => {
      toast({ intent: 'failed', title: 'Could not save credit card', description: error.message })
    },
  })

  const setActiveCard = useMutation({
    mutationFn: async (cardId: string) => {
      if (!clientId) return
      const now = new Date().toISOString()
      const cards = await appContainer.uow.clientCreditCards.findByClientId(clientId)
      const target = cards.find((c) => c.id === cardId)
      if (!target) throw new Error('Card not found')

      // Ensure only one active card.
      for (const card of cards) {
        if (card.id === cardId && !card.isActive) {
          await appContainer.uow.clientCreditCards.update(card.id, { isActive: true, updatedAt: now })
        } else if (card.id !== cardId && card.isActive) {
          await appContainer.uow.clientCreditCards.update(card.id, { isActive: false, updatedAt: now })
        }
      }
    },
    onSuccess: () => {
      invalidate()
      toast({ intent: 'updated', title: 'Active card updated' })
    },
    onError: (error: Error) => {
      toast({ intent: 'failed', title: 'Could not update active card', description: error.message })
    },
  })

  const setActiveForCard = (cardId: string) => {
    setActiveCard.mutate(cardId)
  }

  const deleteCard = useMutation({
    mutationFn: async (cardId: string) => {
      const existing = await appContainer.uow.clientCreditCards.findById(cardId)
      if (!existing) throw new Error('Card not found')
      if (clientId && existing.clientId !== clientId) throw new Error('Card not found')
      await appContainer.uow.clientCreditCards.delete(cardId)
    },
    onSuccess: () => {
      invalidate()
      toast({ intent: 'deleted', title: 'Credit card removed' })
    },
    onError: (error: Error) => {
      toast({ intent: 'failed', title: 'Could not remove card', description: error.message })
    },
  })

  const isPending = createCard.isPending || setActiveCard.isPending || deleteCard.isPending

  return {
    createCard,
    setActiveForCard,
    deleteCard: deleteCard.mutate,
    isPending,
  }
}

