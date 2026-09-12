import { Navigate, useParams } from 'react-router-dom'
import { tripStageChangePatch } from '@/domain/entities'
import { useTrip } from '@/features/trips/hooks/use-trips'
import { isTripWorkspaceTab } from '@/features/trips/config/workspace-tabs'
import { TripProgressBar } from '@/features/trips/components/workspace/TripProgressBar'
import { useTripWorkspaceMutations } from '@/features/trips/hooks/use-trip-workspace'
import { TripTabContent } from '@/features/trips/components/workspace/TripTabContent'
import {
  TripWorkspaceLayout,
  tripWorkspaceNotFound,
} from '@/features/trips/components/workspace/TripWorkspaceLayout'

export function TripWorkspacePage() {
  const { tripId, tab } = useParams()
  const activeTab = isTripWorkspaceTab(tab) ? tab : 'dashboard'
  const { data: trip, isLoading } = useTrip(tripId)
  const { updateTrip } = useTripWorkspaceMutations(tripId ?? '')

  if (!tripId) return <Navigate to="/trips" replace />

  const progressSlot = trip ? (
    <TripProgressBar
      stage={trip.stage}
      lastPipelineStage={trip.lastPipelineStage}
      onStageChange={(nextStage) => updateTrip(tripStageChangePatch(trip, nextStage))}
    />
  ) : undefined

  return (
    <TripWorkspaceLayout
      loading={isLoading}
      scroll={activeTab !== 'services'}
      progressSlot={progressSlot}
      notFound={
        !isLoading && !trip
          ? tripWorkspaceNotFound('Trip not found')
          : undefined
      }
    >
      {trip ? <TripTabContent tab={activeTab} trip={trip} /> : null}
    </TripWorkspaceLayout>
  )
}
