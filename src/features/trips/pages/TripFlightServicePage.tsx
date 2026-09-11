import { Link, Navigate, useParams } from 'react-router-dom'
import { Button } from '@/design-system/components/Button'
import { TripFlightServiceTab } from '@/features/trips/components/services/flight/TripFlightServiceTab'
import { useTripService } from '@/features/trips/hooks/use-trip-service'
import { useTrip } from '@/features/trips/hooks/use-trips'
import {
  TripWorkspaceLayout,
  tripWorkspaceNotFound,
} from '@/features/trips/components/workspace/TripWorkspaceLayout'

export function TripFlightServicePage() {
  const { tripId, serviceId } = useParams()
  const { data: trip, isLoading: tripLoading } = useTrip(tripId)
  const { data: service, isLoading: serviceLoading } = useTripService(serviceId)

  if (!tripId || !serviceId) return <Navigate to="/trips" replace />

  const isLoading = tripLoading || serviceLoading
  const notFound = !isLoading && (!trip || !service || service.tripId !== tripId)

  if (!isLoading && service && service.category !== 'flight') {
    return <Navigate to={`/trips/${tripId}/services/${serviceId}`} replace />
  }

  return (
    <TripWorkspaceLayout
      loading={isLoading}
      scroll={false}
      notFound={
        notFound
          ? tripWorkspaceNotFound(
              'Service not found',
              'This service may have been removed or the link is invalid.',
              <Button asChild variant="secondary" size="sm" className="mt-4">
                <Link to={trip ? `/trips/${trip.id}/services` : '/trips'}>Back to services</Link>
              </Button>,
            )
          : undefined
      }
    >
      {trip && service ? <TripFlightServiceTab trip={trip} service={service} /> : null}
    </TripWorkspaceLayout>
  )
}
