import { NavLink } from 'react-router-dom'
import type { TripWorkspaceTabConfig } from '@/features/trips/config/workspace-tabs'
import {
  tripWorkspaceTabClassName,
  tripWorkspaceTabIconClassName,
  tripWorkspaceTabIconWrapClassName,
} from '@/features/trips/components/workspace/trip-workspace-nav-ui'

interface TripWorkspaceTabLinkProps {
  tab: TripWorkspaceTabConfig
  tripId: string
}

export function TripWorkspaceTabLink({ tab, tripId }: TripWorkspaceTabLinkProps) {
  const { id, label, description, icon: Icon } = tab

  return (
    <NavLink
      to={`/trips/${tripId}/${id}`}
      end={id === 'dashboard'}
      title={description}
      aria-label={description}
      className={({ isActive }) => tripWorkspaceTabClassName(isActive)}
    >
      {({ isActive }) => (
        <>
          <span className={tripWorkspaceTabIconWrapClassName(isActive)} aria-hidden>
            <Icon className={tripWorkspaceTabIconClassName(isActive)} />
          </span>
          <span className="min-w-0 truncate">{label}</span>
          {isActive ? <span className="sr-only">, current section</span> : null}
        </>
      )}
    </NavLink>
  )
}
