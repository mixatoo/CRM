import {
  CLIENT_LINKED_TRIPS_TABLE_COLUMN_WIDTHS,
  type ClientLinkedTripsTableColumnKey,
} from '@/features/clients/components/trips/client-linked-trips-table-columns'

export function ClientLinkedTripsTableColgroup({
  orderedKeys,
}: {
  orderedKeys: readonly ClientLinkedTripsTableColumnKey[]
}) {
  return (
    <colgroup>
      {orderedKeys.map((key) => (
        <col key={key} style={{ width: CLIENT_LINKED_TRIPS_TABLE_COLUMN_WIDTHS[key] }} />
      ))}
    </colgroup>
  )
}
