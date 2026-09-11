import { useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { isSupplierWorkspaceTab } from '@/features/suppliers/config/workspace-tabs'
import { useSupplierTabsStore } from '@/features/suppliers/store/supplier-tabs-store'

export function useSupplierTabsSync() {
  const location = useLocation()
  const { supplierId, tab } = useParams()
  const openTab = useSupplierTabsStore((state) => state.openTab)

  useEffect(() => {
    if (!supplierId || !location.pathname.startsWith('/suppliers/')) return
    const workspaceTab = isSupplierWorkspaceTab(tab) ? tab : 'overview'
    openTab(supplierId, workspaceTab)
  }, [location.pathname, openTab, tab, supplierId])
}
