import {
  CLIENT_LINKED_PAYMENTS_TABLE_COLUMN_WIDTHS,
  type ClientLinkedPaymentsTableColumnKey,
} from '@/features/clients/components/payments/client-linked-payments-table-columns'

export function ClientLinkedPaymentsTableColgroup({
  orderedKeys,
}: {
  orderedKeys: readonly ClientLinkedPaymentsTableColumnKey[]
}) {
  return (
    <colgroup>
      {orderedKeys.map((key) => (
        <col key={key} style={{ width: CLIENT_LINKED_PAYMENTS_TABLE_COLUMN_WIDTHS[key] }} />
      ))}
    </colgroup>
  )
}
