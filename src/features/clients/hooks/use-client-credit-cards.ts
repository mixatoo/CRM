import { useQuery } from '@tanstack/react-query'
import { useDatabaseReady } from '@/app/providers'
import { appContainer } from '@/app/container'
import type { ClientCreditCard } from '@/domain/entities/client-credit-card'

export const CLIENT_CREDIT_CARDS_QUERY_KEY = ['client-credit-cards'] as const

export function useClientCreditCards(clientId: string | undefined) {
  const dbReady = useDatabaseReady()

  return useQuery<ClientCreditCard[]>({
    queryKey: [...CLIENT_CREDIT_CARDS_QUERY_KEY, clientId ?? 'unknown'],
    queryFn: async () => {
      if (!clientId) return []
      return appContainer.uow.clientCreditCards.findByClientId(clientId)
    },
    enabled: dbReady && Boolean(clientId),
  })
}

