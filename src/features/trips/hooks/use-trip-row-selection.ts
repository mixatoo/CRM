import { useTableRowSelection } from '@/shared/hooks/use-table-row-selection'

export function useTripRowSelection(pageTripIds: string[]) {
  return useTableRowSelection(pageTripIds)
}

export type TripRowSelection = ReturnType<typeof useTripRowSelection>
