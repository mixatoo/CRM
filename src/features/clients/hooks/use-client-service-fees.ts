import { useQuery } from '@tanstack/react-query'
import { useDatabaseReady } from '@/app/providers'
import { appContainer } from '@/app/container'
import type { ClientServiceFee } from '@/domain/entities/client-service-fee'

export const CLIENT_SERVICE_FEES_QUERY_KEY = ['client-service-fees'] as const

export function useClientServiceFees(clientId: string | undefined) {
  const dbReady = useDatabaseReady()

  return useQuery<ClientServiceFee[]>({
    queryKey: [...CLIENT_SERVICE_FEES_QUERY_KEY, clientId ?? 'unknown'],
    queryFn: async () => {
      if (!clientId) return []
      return appContainer.uow.clientServiceFees.findByClientId(clientId)
    },
    enabled: dbReady && Boolean(clientId),
  })
}
