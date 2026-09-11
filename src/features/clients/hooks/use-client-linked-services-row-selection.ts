import { useTableRowSelection } from '@/shared/hooks/use-table-row-selection'

export function useClientLinkedServicesRowSelection(pageServiceIds: string[]) {
  return useTableRowSelection(pageServiceIds)
}

export type ClientLinkedServicesRowSelection = ReturnType<typeof useClientLinkedServicesRowSelection>
