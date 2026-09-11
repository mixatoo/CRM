import { useTableRowSelection } from '@/shared/hooks/use-table-row-selection'

export function useClientRowSelection(pageClientIds: string[]) {
  return useTableRowSelection(pageClientIds)
}

export type ClientRowSelection = ReturnType<typeof useClientRowSelection>
