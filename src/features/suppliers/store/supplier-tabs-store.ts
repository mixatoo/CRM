import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SupplierWorkspaceTab } from '@/features/suppliers/config/workspace-tabs'

export interface SupplierTabEntry {
  supplierId: string
  tab: SupplierWorkspaceTab
}

const MAX_OPEN_SUPPLIER_TABS = 12

interface SupplierTabsState {
  tabs: SupplierTabEntry[]
  openTab: (supplierId: string, tab?: SupplierWorkspaceTab) => void
  closeTab: (supplierId: string) => void
  closeAllTabs: () => void
  setTabWorkspace: (supplierId: string, tab: SupplierWorkspaceTab) => void
}

export const useSupplierTabsStore = create<SupplierTabsState>()(
  persist(
    (set, get) => ({
      tabs: [],

      openTab: (supplierId, tab = 'overview') => {
        const { tabs } = get()
        const existing = tabs.find((entry) => entry.supplierId === supplierId)

        if (existing) {
          set({
            tabs: tabs.map((entry) =>
              entry.supplierId === supplierId ? { ...entry, tab } : entry,
            ),
          })
          return
        }

        const next = [...tabs, { supplierId, tab }]
        if (next.length > MAX_OPEN_SUPPLIER_TABS) {
          next.shift()
        }
        set({ tabs: next })
      },

      closeTab: (supplierId) => {
        set({ tabs: get().tabs.filter((entry) => entry.supplierId !== supplierId) })
      },

      closeAllTabs: () => set({ tabs: [] }),

      setTabWorkspace: (supplierId, tab) => {
        const { tabs } = get()
        if (!tabs.some((entry) => entry.supplierId === supplierId)) return
        set({
          tabs: tabs.map((entry) => (entry.supplierId === supplierId ? { ...entry, tab } : entry)),
        })
      },
    }),
    {
      name: 'egyliere-supplier-tabs',
      partialize: (state) => ({ tabs: state.tabs }),
    },
  ),
)
