import { useQuery } from '@tanstack/react-query'
import { useDatabaseReady } from '@/app/providers'
import { appContainer } from '@/app/container'
import { paginatedListQueryOptions } from '@/shared/config/query-options'
import type { TravelerFilters } from '@/repositories/interfaces'
import { CLIENT_TRAVELERS_QUERY_KEY } from '@/features/travelers/hooks/use-client-travelers'

export const TRAVELERS_QUERY_KEY = ['travelers'] as const

export function useTravelers() {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: TRAVELERS_QUERY_KEY,
    queryFn: () => appContainer.uow.travelers.findAll(),
    enabled: dbReady,
  })
}

export function useTravelersList(filters: TravelerFilters, page: number, pageSize: number) {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: [...TRAVELERS_QUERY_KEY, 'list', filters, page, pageSize],
    queryFn: () => appContainer.uow.travelers.findPaginated(filters, { page, pageSize }),
    enabled: dbReady,
    ...paginatedListQueryOptions,
  })
}

export function useTraveler(travelerId: string | undefined) {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: [...TRAVELERS_QUERY_KEY, travelerId],
    queryFn: () => appContainer.uow.travelers.findById(travelerId!),
    enabled: dbReady && !!travelerId,
  })
}

export { CLIENT_TRAVELERS_QUERY_KEY }
