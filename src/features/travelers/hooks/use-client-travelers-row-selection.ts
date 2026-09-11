import { useTableRowSelection } from '@/shared/hooks/use-table-row-selection'

export function useClientTravelersRowSelection(pageTravelerIds: string[]) {
  return useTableRowSelection(pageTravelerIds)
}

export type ClientTravelersRowSelection = ReturnType<typeof useClientTravelersRowSelection>
