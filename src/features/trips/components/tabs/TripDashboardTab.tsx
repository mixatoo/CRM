import type { Trip } from '@/domain/entities'
import { TripDashboardPanel } from '@/features/trips/components/dashboard/TripDashboardPanel'
import { TripDashboardQuickStats } from '@/features/trips/components/dashboard/TripDashboardQuickStats'

export function TripDashboardTab({ trip }: { trip: Trip }) {
  return (
    <div className="flex flex-col gap-3">
      <TripDashboardQuickStats trip={trip} />
      <TripDashboardPanel trip={trip} />
    </div>
  )
}
