import { useLocation, useNavigate, useParams } from 'react-router-dom'
import type { TripWorkspaceTab } from '@/domain/entities'
import { useTripTabsStore } from '@/features/trips/store/trip-tabs-store'

interface NavigateToTripOptions {
  /** Add tab without switching view (Ctrl+click / middle-click). */
  background?: boolean
  tab?: TripWorkspaceTab
}

export function useTripTabNavigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const { tripId: activeTripId } = useParams()
  const tabs = useTripTabsStore((state) => state.tabs)
  const openTab = useTripTabsStore((state) => state.openTab)
  const closeTab = useTripTabsStore((state) => state.closeTab)
  const closeAllTabs = useTripTabsStore((state) => state.closeAllTabs)

  const navigateToTrip = (tripId: string, options?: NavigateToTripOptions) => {
    const tab = options?.tab ?? 'dashboard'
    openTab(tripId, tab)
    if (!options?.background) {
      navigate(`/trips/${tripId}/${tab}`)
    }
  }

  const closeTripTab = (tripId: string) => {
    const index = tabs.findIndex((entry) => entry.tripId === tripId)
    const remaining = tabs.filter((entry) => entry.tripId !== tripId)
    closeTab(tripId)

    const onTripRoute = location.pathname.startsWith('/trips/') && Boolean(activeTripId)
    if (activeTripId === tripId && onTripRoute) {
      if (remaining.length > 0) {
        const next = remaining[Math.min(index, remaining.length - 1)]
        navigate(`/trips/${next.tripId}/${next.tab}`)
      } else {
        navigate('/trips')
      }
    }
  }

  const closeAllTripTabs = () => {
    closeAllTabs()
    if (location.pathname.startsWith('/trips/') && activeTripId) {
      navigate('/trips')
    }
  }

  return {
    tabs,
    navigateToTrip,
    closeTripTab,
    closeAllTripTabs,
  }
}

export function isBackgroundTripOpen(event: Pick<MouseEvent, 'button' | 'ctrlKey' | 'metaKey'>) {
  return event.button === 1 || event.ctrlKey || event.metaKey
}
