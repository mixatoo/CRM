import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TripWorkspaceTab } from '@/domain/entities'

export interface TripTabEntry {
  tripId: string
  tab: TripWorkspaceTab
}

const MAX_OPEN_TRIP_TABS = 12

interface TripTabsState {
  tabs: TripTabEntry[]
  openTab: (tripId: string, tab?: TripWorkspaceTab) => void
  closeTab: (tripId: string) => void
  closeAllTabs: () => void
  setTabWorkspace: (tripId: string, tab: TripWorkspaceTab) => void
}

export const useTripTabsStore = create<TripTabsState>()(
  persist(
    (set, get) => ({
      tabs: [],

      openTab: (tripId, tab = 'dashboard') => {
        const { tabs } = get()
        const existing = tabs.find((entry) => entry.tripId === tripId)

        if (existing) {
          set({
            tabs: tabs.map((entry) =>
              entry.tripId === tripId ? { ...entry, tab } : entry,
            ),
          })
          return
        }

        const next = [...tabs, { tripId, tab }]
        if (next.length > MAX_OPEN_TRIP_TABS) {
          next.shift()
        }
        set({ tabs: next })
      },

      closeTab: (tripId) => {
        set({ tabs: get().tabs.filter((entry) => entry.tripId !== tripId) })
      },

      closeAllTabs: () => set({ tabs: [] }),

      setTabWorkspace: (tripId, tab) => {
        const { tabs } = get()
        if (!tabs.some((entry) => entry.tripId === tripId)) return
        set({
          tabs: tabs.map((entry) => (entry.tripId === tripId ? { ...entry, tab } : entry)),
        })
      },
    }),
    {
      name: 'egyliere-trip-tabs',
      partialize: (state) => ({ tabs: state.tabs }),
    },
  ),
)
