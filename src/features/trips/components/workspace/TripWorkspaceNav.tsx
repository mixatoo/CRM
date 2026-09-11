import { NavLink, useParams } from 'react-router-dom'
import { cn } from '@/shared/utils/cn'
import { layout } from '@/design-system/tokens/layout'
import { tripWorkspaceFlushSurfaceClassName } from '@/features/trips/components/workspace/trip-workspace-chrome'
import { getTripWorkspaceTabGroups } from '@/features/trips/config/workspace-tabs'
import { useTrip } from '@/features/trips/hooks/use-trips'
import { TripsPageTitle } from '@/features/trips/components/list/TripsPageTitle'
import {
  clientsToolbarRowClassName,
  clientsToolbarTitleSlotClassName,
} from '@/features/clients/components/list/clients-toolbar-chrome'
import { TripWorkspaceToolbarMeta } from '@/features/trips/components/workspace/TripWorkspaceToolbarMeta'
import { TripWorkspaceTabLink } from '@/features/trips/components/workspace/TripWorkspaceTabLink'
import {
  TRIP_WORKSPACE_GROUP_LABELS,
  tripWorkspaceProgressBandClassName,
  tripWorkspaceTabGroupClassName,
  tripWorkspaceTabGroupDividerClassName,
  tripWorkspaceTabsBandClassName,
  tripWorkspaceTabsRailClassName,
  tripWorkspaceTabsScrollClassName,
} from '@/features/trips/components/workspace/trip-workspace-nav-ui'
import type { ReactNode } from 'react'

interface TripWorkspaceNavProps {
  progressSlot?: ReactNode
}

export function TripWorkspaceNav({ progressSlot }: TripWorkspaceNavProps) {
  const { tripId } = useParams()
  const { data: trip, isLoading } = useTrip(tripId)
  const groups = getTripWorkspaceTabGroups()

  return (
    <nav
      aria-label="Trip workspace"
      className={cn(
        'overflow-hidden bg-[var(--color-surface)]',
        tripWorkspaceFlushSurfaceClassName,
      )}
    >
      <div className={cn(clientsToolbarRowClassName, 'border-b-0')}>
        <div className={clientsToolbarTitleSlotClassName}>
          <NavLink
            to="/trips"
            className="shrink-0 rounded-[var(--radius-md)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/25"
            end
          >
            <TripsPageTitle
              secondaryValue={trip?.reference}
              secondaryLabel="ID"
              isFetching={isLoading && !trip?.reference}
            />
          </NavLink>
        </div>

        <TripWorkspaceToolbarMeta trip={trip} isLoading={isLoading} />
      </div>

      <div className={tripWorkspaceTabsBandClassName}>
        <div
          className={cn(
            tripWorkspaceTabsScrollClassName,
            layout.scrollX,
            layout.hideScrollbar,
          )}
        >
          <div className={tripWorkspaceTabsRailClassName}>
            {groups.map((entry, groupIndex) => (
              <div
                key={entry.group}
                className={tripWorkspaceTabGroupClassName}
                role="group"
                aria-label={TRIP_WORKSPACE_GROUP_LABELS[entry.group]}
              >
                {groupIndex > 0 ? (
                  <span className={tripWorkspaceTabGroupDividerClassName} aria-hidden />
                ) : null}
                {entry.tabs.map((tab) => (
                  <TripWorkspaceTabLink key={tab.id} tab={tab} tripId={tripId!} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {progressSlot ? (
        <div className={tripWorkspaceProgressBandClassName}>{progressSlot}</div>
      ) : null}
    </nav>
  )
}
