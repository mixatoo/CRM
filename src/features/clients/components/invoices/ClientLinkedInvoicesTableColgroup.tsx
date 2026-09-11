import {
  CLIENT_LINKED_INVOICES_TABLE_COLUMN_WIDTHS,
  type ClientLinkedInvoicesTableColumnKey,
} from '@/features/clients/components/invoices/client-linked-invoices-table-columns'

export function ClientLinkedInvoicesTableColgroup({
  orderedKeys,
}: {
  orderedKeys: readonly ClientLinkedInvoicesTableColumnKey[]
}) {
  return (
    <colgroup>
      {orderedKeys.map((key) => (
        <col key={key} style={{ width: CLIENT_LINKED_INVOICES_TABLE_COLUMN_WIDTHS[key] }} />
      ))}
    </colgroup>
  )
}
