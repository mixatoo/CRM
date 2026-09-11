import { useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { resolveClientWorkspaceTab } from '@/features/clients/config/workspace-tabs'
import { useClient } from '@/features/clients/hooks/use-clients'
import { useClientTabsStore } from '@/features/clients/store/client-tabs-store'

export function useClientTabsSync() {
  const location = useLocation()
  const { clientId, tab } = useParams()
  const { data: client } = useClient(clientId)
  const openTab = useClientTabsStore((state) => state.openTab)

  useEffect(() => {
    if (!clientId || !location.pathname.startsWith('/clients/')) return
    const workspaceTab = resolveClientWorkspaceTab(tab, client?.type)
    openTab(clientId, workspaceTab)
  }, [location.pathname, openTab, tab, clientId, client?.type])
}
