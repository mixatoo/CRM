import type { Trip } from '@/domain/entities'
import type { TripService } from '@/domain/entities/trip-service'
import { DataTableShell } from '@/design-system/layout/DataTableShell'
import { TripFlightOperationsView } from '@/features/trips/components/services/flight/TripFlightOperationsView'
import { TripServiceDetailToolbar } from '@/features/trips/components/services/TripServiceDetailToolbar'

interface TripFlightOperationsTabProps {
  trip: Trip
  service: TripService
}

export function TripFlightOperationsTab({ trip, service }: TripFlightOperationsTabProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <DataTableShell
        className="h-full min-h-0 flex-1"
        header={<TripServiceDetailToolbar tripId={trip.id} service={service} activeView="operations" />}
        headerClassName="p-0"
        contentClassName="min-h-0 flex-1 overflow-hidden"
      >
        <TripFlightOperationsView service={service} />
      </DataTableShell>
    </div>
  )
}
