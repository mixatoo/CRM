import type { TableColumnDefinition } from '@/shared/hooks/use-table-column-visibility'

/** Fixed `rem` for compact cols; `%` for text-heavy cols — extra viewport width flows into the flexible columns. */
export const FLIGHT_SERVICE_TABLE_COLUMN_WIDTHS = {
  selection: '2.75rem',
  line: '2.75rem',
  title: '4.5rem',
  passenger: '24%',
  pnr: '6.5%',
  flight: '5rem',
  from: '3.5rem',
  to: '3.5rem',
  depDateTime: '14%',
  arrDateTime: '14%',
  cabin: '11%',
  airline: '12%',
  actions: '4.5rem',
} as const

/** Fixed width for sticky selection column offset (not a %). */
export const FLIGHT_SERVICE_TABLE_SELECTION_COL_WIDTH = '2.75rem'

export type FlightServiceTableColumnKey = keyof typeof FLIGHT_SERVICE_TABLE_COLUMN_WIDTHS

export const FLIGHT_SERVICE_TABLE_COLUMN_ORDER: FlightServiceTableColumnKey[] = [
  'selection',
  'line',
  'title',
  'passenger',
  'pnr',
  'flight',
  'from',
  'to',
  'depDateTime',
  'arrDateTime',
  'cabin',
  'airline',
  'actions',
]

/** Floor width before horizontal scroll; table still grows to fill wider viewports. */
export const FLIGHT_SERVICE_TABLE_MIN_WIDTH_CLASS = 'min-w-[52rem]'

export const FLIGHT_SERVICE_TABLE_COL_COUNT = FLIGHT_SERVICE_TABLE_COLUMN_ORDER.length

export const FLIGHT_SERVICE_TABLE_COLUMN_OPTIONS: TableColumnDefinition<FlightServiceTableColumnKey>[] = [
  { key: 'selection', label: 'Select', locked: true },
  { key: 'line', label: '#', locked: true },
  { key: 'title', label: 'Title' },
  { key: 'passenger', label: 'Passenger', locked: true },
  { key: 'pnr', label: 'PNR' },
  { key: 'flight', label: 'Flight' },
  { key: 'from', label: 'From' },
  { key: 'to', label: 'To' },
  { key: 'depDateTime', label: 'Departure' },
  { key: 'arrDateTime', label: 'Arrival' },
  { key: 'cabin', label: 'Class' },
  { key: 'airline', label: 'Airline' },
  { key: 'actions', label: 'Actions', locked: true },
]

export function FlightServiceTableColgroup({
  visibleKeys = new Set(FLIGHT_SERVICE_TABLE_COLUMN_ORDER),
}: {
  visibleKeys?: ReadonlySet<FlightServiceTableColumnKey>
}) {
  return (
    <colgroup>
      {FLIGHT_SERVICE_TABLE_COLUMN_ORDER.filter((key) => visibleKeys.has(key)).map((key) => (
        <col key={key} style={{ width: FLIGHT_SERVICE_TABLE_COLUMN_WIDTHS[key] }} />
      ))}
    </colgroup>
  )
}
