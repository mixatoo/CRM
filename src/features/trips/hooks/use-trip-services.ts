import { useQuery } from '@tanstack/react-query'
import { useDatabaseReady } from '@/app/providers'
import { appContainer } from '@/app/container'

export function useTripServices(tripId: string) {
  const dbReady = useDatabaseReady()

  return useQuery({
    queryKey: ['trip-services', tripId],
    queryFn: () => appContainer.uow.tripServices.findByTripId(tripId),
    enabled: dbReady && !!tripId,
    refetchOnMount: 'always',
  })
}
