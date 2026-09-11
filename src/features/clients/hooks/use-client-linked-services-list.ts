import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { appContainer } from '@/app/container'
import { useClientLinkedServices } from '@/features/clients/hooks/use-clients'
import {
  paginateClientLinkedServices,
  sortClientLinkedServices,
  type ClientLinkedServiceRow,
  type ClientLinkedServiceSortDir,
  type ClientLinkedServiceSortField,
} from '@/features/clients/utils/client-linked-services-list'

export function useClientLinkedServicesList(
  clientId: string | undefined,
  sortBy: ClientLinkedServiceSortField,
  sortDir: ClientLinkedServiceSortDir,
  page: number,
  pageSize: number,
) {
  const { data: services = [], isLoading: servicesLoading, isFetching: servicesFetching } =
    useClientLinkedServices(clientId)

  const tripIds = useMemo(() => [...new Set(services.map((service) => service.tripId))], [services])

  const { data: trips = [], isLoading: tripsLoading, isFetching: tripsFetching } = useQuery({
    queryKey: ['clients', clientId, 'linked-services-trip-refs', tripIds],
    queryFn: async () => {
      const results = await Promise.all(tripIds.map((id) => appContainer.uow.trips.findById(id)))
      return results.filter((trip) => trip != null)
    },
    enabled: tripIds.length > 0,
  })

  const enriched = useMemo<ClientLinkedServiceRow[]>(() => {
    const tripReferenceById = new Map(trips.map((trip) => [trip.id, trip.reference]))
    return services.map((service) => ({
      ...service,
      tripReference: tripReferenceById.get(service.tripId) ?? '',
    }))
  }, [services, trips])

  const data = useMemo(
    () => paginateClientLinkedServices(sortClientLinkedServices(enriched, sortBy, sortDir), page, pageSize),
    [enriched, sortBy, sortDir, page, pageSize],
  )

  const isLoading = servicesLoading || (tripIds.length > 0 && tripsLoading)
  const isFetching = servicesFetching || tripsFetching

  return { data, isLoading, isFetching }
}
