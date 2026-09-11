import {
  CLIENT_TRAVELERS_TABLE_COLUMN_WIDTHS,
  type ClientTravelersTableColumnKey,
} from '@/features/travelers/components/client-travelers-table-columns'

export function ClientTravelersTableColgroup({
  orderedKeys,
}: {
  orderedKeys: readonly ClientTravelersTableColumnKey[]
}) {
  return (
    <colgroup>
      {orderedKeys.map((key) => (
        <col key={key} style={{ width: CLIENT_TRAVELERS_TABLE_COLUMN_WIDTHS[key] }} />
      ))}
    </colgroup>
  )
}
