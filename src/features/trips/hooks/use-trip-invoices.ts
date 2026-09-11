import { useQuery } from '@tanstack/react-query'
import { useDatabaseReady } from '@/app/providers'
import { appContainer } from '@/app/container'

export function useTripInvoices(tripId: string) {
  const dbReady = useDatabaseReady()

  return useQuery({
    queryKey: ['invoices', tripId],
    queryFn: () => appContainer.uow.invoices.findByTripId(tripId),
    enabled: dbReady && !!tripId,
  })
}
