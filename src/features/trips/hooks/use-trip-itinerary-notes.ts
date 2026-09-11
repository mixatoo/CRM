import { useQuery } from '@tanstack/react-query'
import { useDatabaseReady } from '@/app/providers'
import { appContainer } from '@/app/container'

export function useTripItineraryNotes(tripId: string) {
  const dbReady = useDatabaseReady()

  return useQuery({
    queryKey: ['trip-itinerary-notes', tripId],
    queryFn: () => appContainer.uow.tripItineraryNotes.findByTripId(tripId),
    enabled: dbReady && !!tripId,
    refetchOnMount: 'always',
  })
}
