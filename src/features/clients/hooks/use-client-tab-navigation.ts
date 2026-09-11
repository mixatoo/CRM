import { useLocation, useNavigate, useParams } from 'react-router-dom'
import type { ClientWorkspaceTab } from '@/features/clients/config/workspace-tabs'
import { useClientTabsStore } from '@/features/clients/store/client-tabs-store'

interface NavigateToClientOptions {
  background?: boolean
  tab?: ClientWorkspaceTab
}

export function useClientTabNavigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const { clientId: activeClientId } = useParams()
  const tabs = useClientTabsStore((state) => state.tabs)
  const openTab = useClientTabsStore((state) => state.openTab)
  const closeTab = useClientTabsStore((state) => state.closeTab)
  const closeAllTabs = useClientTabsStore((state) => state.closeAllTabs)

  const navigateToClient = (clientId: string, options?: NavigateToClientOptions) => {
    const tab = options?.tab ?? 'profile'
    openTab(clientId, tab)
    if (!options?.background) {
      navigate(`/clients/${clientId}/${tab}`)
    }
  }

  const closeClientTab = (clientId: string) => {
    const index = tabs.findIndex((entry) => entry.clientId === clientId)
    const remaining = tabs.filter((entry) => entry.clientId !== clientId)
    closeTab(clientId)

    const onClientRoute = location.pathname.startsWith('/clients/') && Boolean(activeClientId)
    if (activeClientId === clientId && onClientRoute) {
      if (remaining.length > 0) {
        const next = remaining[Math.min(index, remaining.length - 1)]
        navigate(`/clients/${next.clientId}/${next.tab}`)
      } else {
        navigate('/clients')
      }
    }
  }

  const closeAllClientTabs = () => {
    closeAllTabs()
    if (location.pathname.startsWith('/clients/') && activeClientId) {
      navigate('/clients')
    }
  }

  return {
    tabs,
    navigateToClient,
    closeClientTab,
    closeAllClientTabs,
  }
}

export function isBackgroundClientOpen(event: Pick<MouseEvent, 'button' | 'ctrlKey' | 'metaKey'>) {
  return event.button === 1 || event.ctrlKey || event.metaKey
}
