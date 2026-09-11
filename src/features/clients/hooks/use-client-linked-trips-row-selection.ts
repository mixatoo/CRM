import { useTableRowSelection } from '@/shared/hooks/use-table-row-selection'

export function useClientLinkedTripsRowSelection(pageTripIds: string[]) {
  return useTableRowSelection(pageTripIds)
}

export type ClientLinkedTripsRowSelection = ReturnType<typeof useClientLinkedTripsRowSelection>
