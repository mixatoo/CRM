import {
  CLIENT_LINKED_SERVICES_TABLE_COLUMN_WIDTHS,
  type ClientLinkedServicesTableColumnKey,
} from '@/features/clients/components/services/client-linked-services-table-columns'

export function ClientLinkedServicesTableColgroup({
  orderedKeys,
}: {
  orderedKeys: readonly ClientLinkedServicesTableColumnKey[]
}) {
  return (
    <colgroup>
      {orderedKeys.map((key) => (
        <col key={key} style={{ width: CLIENT_LINKED_SERVICES_TABLE_COLUMN_WIDTHS[key] }} />
      ))}
    </colgroup>
  )
}
