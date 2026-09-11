import { useTableRowSelection } from '@/shared/hooks/use-table-row-selection'

export function useClientLinkedPaymentsRowSelection(pagePaymentIds: string[]) {
  return useTableRowSelection(pagePaymentIds)
}

export type ClientLinkedPaymentsRowSelection = ReturnType<typeof useClientLinkedPaymentsRowSelection>
