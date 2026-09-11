import { create } from 'zustand'

interface TripsSearchState {
  searchInput: string
  setSearchInput: (value: string) => void
}

export const useTripsSearchStore = create<TripsSearchState>((set) => ({
  searchInput: '',
  setSearchInput: (searchInput) => set({ searchInput }),
}))
