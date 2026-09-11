import type { Trip } from '@/domain/entities'
import type { TripService } from '@/domain/entities/trip-service'
import { DataTableShell } from '@/design-system/layout/DataTableShell'
import { TripFlightServiceForm } from '@/features/trips/components/services/flight/TripFlightServiceForm'
import { TripServiceDetailToolbar } from '@/features/trips/components/services/TripServiceDetailToolbar'

interface TripFlightServiceTabProps {
  trip: Trip
  service: TripService
}

export function TripFlightServiceTab({ trip, service }: TripFlightServiceTabProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <DataTableShell
        className="h-full min-h-0 flex-1"
        header={<TripServiceDetailToolbar tripId={trip.id} service={service} activeView="flight" />}
        headerClassName="p-0"
        contentClassName="min-h-0 flex-1 overflow-hidden"
      >
        <TripFlightServiceForm service={service} />
      </DataTableShell>
    </div>
  )
}
