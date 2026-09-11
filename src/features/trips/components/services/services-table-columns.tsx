import type { TableColumnDefinition } from '@/shared/hooks/use-table-column-visibility'

/** Trip services table column widths — fixed `rem` for compact cols, `%` for flexible text. */
export const SERVICES_TABLE_COLUMN_WIDTHS = {
  selection: '2.75rem',
  line: '3.25rem',
  date: '7.5rem',
  service: '22%',
  supplier: '13%',
  cost: '8rem',
  selling: '8rem',
  margin: '6.75rem',
  status: '7.75rem',
  actions: '4.5rem',
} as const

export type ServicesTableColumnKey = keyof typeof SERVICES_TABLE_COLUMN_WIDTHS

export const SERVICES_TABLE_COLUMN_ORDER: ServicesTableColumnKey[] = [
  'selection',
  'line',
  'date',
  'service',
  'supplier',
  'cost',
  'selling',
  'margin',
  'status',
  'actions',
]

export const SERVICES_TABLE_COL_COUNT = SERVICES_TABLE_COLUMN_ORDER.length

export const SERVICES_TABLE_COLUMN_OPTIONS: TableColumnDefinition<ServicesTableColumnKey>[] = [
  { key: 'selection', label: 'Select', locked: true },
  { key: 'line', label: '#', locked: true },
  { key: 'date', label: 'Date' },
  { key: 'service', label: 'Service', locked: true },
  { key: 'supplier', label: 'Supplier' },
  { key: 'cost', label: 'Cost' },
  { key: 'selling', label: 'Selling' },
  { key: 'margin', label: 'Margin' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions', locked: true },
]

/** Minimum table width so header labels stay on one row (horizontal scroll below this). */
export const SERVICES_TABLE_MIN_WIDTH_CLASS = 'min-w-[62rem]'

export const SERVICES_TABLE_FROZEN_WIDTH = `calc(${SERVICES_TABLE_COLUMN_WIDTHS.selection} + ${SERVICES_TABLE_COLUMN_WIDTHS.line})`

export function ServicesTableColgroup({
  visibleKeys = new Set(SERVICES_TABLE_COLUMN_ORDER),
}: {
  visibleKeys?: ReadonlySet<ServicesTableColumnKey>
}) {
  return (
    <colgroup>
      {SERVICES_TABLE_COLUMN_ORDER.filter((key) => visibleKeys.has(key)).map((key) => (
        <col key={key} style={{ width: SERVICES_TABLE_COLUMN_WIDTHS[key] }} />
      ))}
    </colgroup>
  )
}
