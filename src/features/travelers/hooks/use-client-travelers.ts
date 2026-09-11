import { useQuery } from '@tanstack/react-query'
import { useDatabaseReady } from '@/app/providers'
import { appContainer } from '@/app/container'
import type { Traveler } from '@/domain/entities/traveler'

export const CLIENT_TRAVELERS_QUERY_KEY = ['client-travelers'] as const

export function useClientTravelers(accountId: string | undefined) {
  const dbReady = useDatabaseReady()

  return useQuery<Traveler[]>({
    queryKey: [...CLIENT_TRAVELERS_QUERY_KEY, accountId ?? 'unknown'],
    queryFn: async () => {
      if (!accountId) return []
      return appContainer.uow.travelers.findByAccountId(accountId)
    },
    enabled: dbReady && Boolean(accountId),
  })
}
