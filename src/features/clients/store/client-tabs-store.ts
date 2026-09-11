import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ClientWorkspaceTab } from '@/features/clients/config/workspace-tabs'

export interface ClientTabEntry {
  clientId: string
  tab: ClientWorkspaceTab
}

const MAX_OPEN_CLIENT_TABS = 12

interface ClientTabsState {
  tabs: ClientTabEntry[]
  openTab: (clientId: string, tab?: ClientWorkspaceTab) => void
  closeTab: (clientId: string) => void
  closeAllTabs: () => void
  setTabWorkspace: (clientId: string, tab: ClientWorkspaceTab) => void
}

export const useClientTabsStore = create<ClientTabsState>()(
  persist(
    (set, get) => ({
      tabs: [],

      openTab: (clientId, tab = 'profile') => {
        const { tabs } = get()
        const existing = tabs.find((entry) => entry.clientId === clientId)

        if (existing) {
          set({
            tabs: tabs.map((entry) =>
              entry.clientId === clientId ? { ...entry, tab } : entry,
            ),
          })
          return
        }

        const next = [...tabs, { clientId, tab }]
        if (next.length > MAX_OPEN_CLIENT_TABS) {
          next.shift()
        }
        set({ tabs: next })
      },

      closeTab: (clientId) => {
        set({ tabs: get().tabs.filter((entry) => entry.clientId !== clientId) })
      },

      closeAllTabs: () => set({ tabs: [] }),

      setTabWorkspace: (clientId, tab) => {
        const { tabs } = get()
        if (!tabs.some((entry) => entry.clientId === clientId)) return
        set({
          tabs: tabs.map((entry) => (entry.clientId === clientId ? { ...entry, tab } : entry)),
        })
      },
    }),
    {
      name: 'egyliere-client-tabs',
      partialize: (state) => ({ tabs: state.tabs }),
    },
  ),
)
