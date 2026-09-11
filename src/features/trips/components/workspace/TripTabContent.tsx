import type { Trip, TripWorkspaceTab } from '@/domain/entities'
import { TripDashboardTab } from '@/features/trips/components/tabs/TripDashboardTab'
import { TripDocumentsTab } from '@/features/trips/components/tabs/TripDocumentsTab'
import { TripClientsTab } from '@/features/trips/components/tabs/TripClientsTab'
import { TripPaymentsTab } from '@/features/trips/components/tabs/TripPaymentsTab'
import { TripRevenueTab } from '@/features/trips/components/tabs/TripRevenueTab'
import { TripChangelogTab } from '@/features/trips/components/tabs/TripChangelogTab'
import { TripServicesTab } from '@/features/trips/components/services/TripServicesTab'
import { TripTasksTab } from '@/features/trips/components/tabs/TripTasksTab'
import { TripItineraryTab } from '@/features/trips/components/tabs/TripItineraryTab'

interface TripTabContentProps {
  tab: TripWorkspaceTab
  trip: Trip
}

export function TripTabContent({ tab, trip }: TripTabContentProps) {
  if (tab === 'dashboard') return <TripDashboardTab trip={trip} />
  if (tab === 'clients') return <TripClientsTab trip={trip} />
  if (tab === 'services') {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <TripServicesTab trip={trip} />
      </div>
    )
  }
  if (tab === 'itinerary') return <TripItineraryTab trip={trip} />
  if (tab === 'documents') {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <TripDocumentsTab trip={trip} />
      </div>
    )
  }
  if (tab === 'payments') return <TripPaymentsTab trip={trip} />
  if (tab === 'revenue') return <TripRevenueTab trip={trip} />
  if (tab === 'tasks') return <TripTasksTab trip={trip} />
  if (tab === 'changelog') return <TripChangelogTab tripId={trip.id} />
  return null
}
