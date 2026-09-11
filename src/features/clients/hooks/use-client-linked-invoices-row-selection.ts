import { useTableRowSelection } from '@/shared/hooks/use-table-row-selection'

export function useClientLinkedInvoicesRowSelection(pageInvoiceIds: string[]) {
  return useTableRowSelection(pageInvoiceIds)
}

export type ClientLinkedInvoicesRowSelection = ReturnType<typeof useClientLinkedInvoicesRowSelection>
