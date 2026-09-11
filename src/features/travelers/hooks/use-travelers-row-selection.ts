import { useTableRowSelection } from '@/shared/hooks/use-table-row-selection'

export function useTravelerRowSelection(pageTravelerIds: string[]) {
  return useTableRowSelection(pageTravelerIds)
}

export type TravelerRowSelection = ReturnType<typeof useTravelerRowSelection>
