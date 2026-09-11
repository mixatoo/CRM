import { useLocation, useNavigate, useParams } from 'react-router-dom'
import type { SupplierWorkspaceTab } from '@/features/suppliers/config/workspace-tabs'
import { useSupplierTabsStore } from '@/features/suppliers/store/supplier-tabs-store'

interface NavigateToSupplierOptions {
  background?: boolean
  tab?: SupplierWorkspaceTab
}

export function useSupplierTabNavigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const { supplierId: activeSupplierId } = useParams()
  const tabs = useSupplierTabsStore((state) => state.tabs)
  const openTab = useSupplierTabsStore((state) => state.openTab)
  const closeTab = useSupplierTabsStore((state) => state.closeTab)
  const closeAllTabs = useSupplierTabsStore((state) => state.closeAllTabs)

  const navigateToSupplier = (supplierId: string, options?: NavigateToSupplierOptions) => {
    const tab = options?.tab ?? 'overview'
    openTab(supplierId, tab)
    if (!options?.background) {
      navigate(`/suppliers/${supplierId}/${tab}`)
    }
  }

  const closeSupplierTab = (supplierId: string) => {
    const index = tabs.findIndex((entry) => entry.supplierId === supplierId)
    const remaining = tabs.filter((entry) => entry.supplierId !== supplierId)
    closeTab(supplierId)

    const onSupplierRoute = location.pathname.startsWith('/suppliers/') && Boolean(activeSupplierId)
    if (activeSupplierId === supplierId && onSupplierRoute) {
      if (remaining.length > 0) {
        const next = remaining[Math.min(index, remaining.length - 1)]
        navigate(`/suppliers/${next.supplierId}/${next.tab}`)
      } else {
        navigate('/suppliers')
      }
    }
  }

  const closeAllSupplierTabs = () => {
    closeAllTabs()
    if (location.pathname.startsWith('/suppliers/') && activeSupplierId) {
      navigate('/suppliers')
    }
  }

  return {
    tabs,
    navigateToSupplier,
    closeSupplierTab,
    closeAllSupplierTabs,
  }
}

export function isBackgroundSupplierOpen(event: Pick<MouseEvent, 'button' | 'ctrlKey' | 'metaKey'>) {
  return event.button === 1 || event.ctrlKey || event.metaKey
}
