import { useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { isTripWorkspaceTab } from '@/features/trips/config/workspace-tabs'
import { useTripTabsStore } from '@/features/trips/store/trip-tabs-store'

function isTripServiceDetailPath(pathname: string) {
  return /^\/trips\/[^/]+\/services\/[^/]+$/.test(pathname)
}

export function useTripTabsSync() {
  const location = useLocation()
  const { tripId, tab } = useParams()
  const openTab = useTripTabsStore((state) => state.openTab)

  useEffect(() => {
    if (!tripId || !location.pathname.startsWith('/trips/')) return
    const workspaceTab = isTripServiceDetailPath(location.pathname)
      ? 'services'
      : isTripWorkspaceTab(tab)
        ? tab
        : 'dashboard'
    openTab(tripId, workspaceTab)
  }, [location.pathname, openTab, tab, tripId])
}
