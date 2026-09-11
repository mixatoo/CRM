import {
  TRAVELERS_TABLE_COLUMN_WIDTHS,
  type TravelersTableColumnKey,
} from '@/features/travelers/components/list/travelers-table-columns'

export function TravelersTableColgroup({
  orderedKeys,
}: {
  orderedKeys: readonly TravelersTableColumnKey[]
}) {
  return (
    <colgroup>
      {orderedKeys.map((key) => (
        <col key={key} style={{ width: TRAVELERS_TABLE_COLUMN_WIDTHS[key] }} />
      ))}
    </colgroup>
  )
}
