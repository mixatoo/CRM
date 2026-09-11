import { useQuery } from '@tanstack/react-query'
import { useDatabaseReady } from '@/app/providers'
import { appContainer } from '@/app/container'

export function useTripService(serviceId: string | undefined) {
  const dbReady = useDatabaseReady()

  return useQuery({
    queryKey: ['trip-service', serviceId],
    queryFn: () => appContainer.uow.tripServices.findById(serviceId!),
    enabled: dbReady && !!serviceId,
  })
}
