import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import type { Traveler } from '@/domain/entities/traveler'
import { travelerDisplayName } from '@/domain/entities/traveler'
import { TravelCard } from '@/design-system/layout/TravelCard'
import { TripStageBadge } from '@/features/trips/components/list/TripStageBadge'
import { useTrips } from '@/features/trips/hooks/use-trips'
import { formatDate } from '@/shared/utils/date-format'
import { layout } from '@/design-system/tokens/layout'
import { cn } from '@/shared/utils/cn'

interface TravelerTripsTabProps {
  traveler: Traveler
}

export function TravelerTripsTab({ traveler }: TravelerTripsTabProps) {
  const { data: trips = [], isLoading } = useTrips()
  const name = travelerDisplayName(traveler).trim().toLowerCase()

  const matched = useMemo(
    () =>
      trips.filter((trip) => {
        const contact = trip.mainContactName?.trim().toLowerCase()
        return Boolean(contact && name && contact === name)
      }),
    [name, trips],
  )

  return (
    <TravelCard contentClassName="px-0 py-0">
      <div className="border-b border-[var(--color-border)] px-4 py-3">
        <h3 className={layout.sectionTitle}>Linked trips</h3>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Trips where main contact matches this traveler name.
        </p>
      </div>

      {isLoading ? (
        <p className="px-4 py-6 text-xs text-[var(--color-muted)]">Loading trips…</p>
      ) : matched.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <p className="text-sm text-[var(--color-muted)]">No matching trips found.</p>
          <Link to="/trips" className="mt-2 inline-flex text-xs font-medium text-[var(--color-accent)] hover:underline">
            Browse trips
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-[var(--color-border)]">
          {matched.slice(0, 20).map((trip) => (
            <li key={trip.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{trip.name}</p>
                <p className={cn('truncate', layout.caption)}>
                  {trip.reference}
                  {trip.startDate ? ` · ${formatDate(trip.startDate)}` : ''}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <TripStageBadge stage={trip.stage} />
                <Link
                  to={`/trips/${trip.id}/dashboard`}
                  className="text-xs font-medium text-[var(--color-accent)] hover:underline"
                >
                  Open
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </TravelCard>
  )
}
