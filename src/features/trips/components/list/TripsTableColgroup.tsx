import {
  TRIPS_TABLE_COLUMN_WIDTHS,
  type TripsTableColumnKey,
} from '@/features/trips/components/list/trips-table-columns'

export function TripsTableColgroup({
  orderedKeys,
}: {
  orderedKeys: readonly TripsTableColumnKey[]
}) {
  return (
    <colgroup>
      {orderedKeys.map((key) => (
        <col key={key} style={{ width: TRIPS_TABLE_COLUMN_WIDTHS[key] }} />
      ))}
    </colgroup>
  )
}
