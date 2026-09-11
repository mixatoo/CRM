import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UiState {
  sidebarCollapsed: boolean
  sidebarGroupsOpen: Record<string, boolean>
  mobileSidebarOpen: boolean
  darkMode: boolean
  toggleSidebar: () => void
  toggleSidebarGroup: (groupId: string) => void
  setSidebarGroupOpen: (groupId: string, open: boolean) => void
  setMobileSidebarOpen: (open: boolean) => void
  toggleDarkMode: () => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      sidebarGroupsOpen: {
        workspace: true,
        directory: true,
        finance: true,
        tools: true,
      },
      mobileSidebarOpen: false,
      darkMode: false,
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      toggleSidebarGroup: (groupId) =>
        set({
          sidebarGroupsOpen: {
            ...get().sidebarGroupsOpen,
            [groupId]: !get().sidebarGroupsOpen[groupId],
          },
        }),
      setSidebarGroupOpen: (groupId, open) =>
        set({
          sidebarGroupsOpen: {
            ...get().sidebarGroupsOpen,
            [groupId]: open,
          },
        }),
      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
      toggleDarkMode: () => {
        const next = !get().darkMode
        document.documentElement.classList.toggle('dark', next)
        set({ darkMode: next })
      },
    }),
    {
      name: 'egyliere-ui',
      version: 3,
      onRehydrateStorage: () => (state) => {
        if (state?.darkMode) {
          document.documentElement.classList.add('dark')
        }
      },
      migrate: (persisted) => {
        const state = persisted as Record<string, unknown>
        if (!state) return persisted as unknown as UiState

        if ('sidebarMode' in state) {
          const mode = state.sidebarMode as string
          return {
            ...state,
            sidebarCollapsed: mode === 'rail',
            sidebarMode: undefined,
            sidebarGroupsOpen: state.sidebarGroupsOpen ?? {
              workspace: true,
              directory: true,
              finance: true,
              tools: true,
            },
          } as unknown as UiState
        }

        if ('sidebarCollapsed' in state && !('sidebarGroupsOpen' in state)) {
          return {
            ...state,
            sidebarGroupsOpen: {
              workspace: true,
              directory: true,
              finance: true,
              tools: true,
            },
          } as unknown as UiState
        }

        return persisted as unknown as UiState
      },
    },
  ),
)
