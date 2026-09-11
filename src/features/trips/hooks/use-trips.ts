import { useQuery } from '@tanstack/react-query'
import { useDatabaseReady } from '@/app/providers'
import { appContainer } from '@/app/container'
import { paginatedListQueryOptions } from '@/shared/config/query-options'
import type { TripFilters } from '@/repositories/interfaces'

export function useTrips() {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: ['trips'],
    queryFn: () => appContainer.uow.trips.findAll(),
    enabled: dbReady,
  })
}

export function useTripsList(filters: TripFilters, page: number, pageSize: number) {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: ['trips', 'list', filters, page, pageSize],
    queryFn: () => appContainer.uow.trips.findPaginated(filters, { page, pageSize }),
    enabled: dbReady,
    ...paginatedListQueryOptions,
  })
}

export function useTrip(tripId: string | undefined) {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: ['trips', tripId],
    queryFn: () => appContainer.uow.trips.findById(tripId!),
    enabled: dbReady && !!tripId,
  })
}
