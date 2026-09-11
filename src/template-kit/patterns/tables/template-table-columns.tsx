import type { TableColumnDefinition } from '../../primitives/hooks/use-table-column-visibility'

/** Template list table column widths — copy and adjust per feature. */
export const TEMPLATE_TABLE_COLUMN_WIDTHS = {
  selection: '2.75rem',
  reference: '5.75rem',
  date: '6.75rem',
  client: '14%',
  persons: '4.25rem',
  destination: '13%',
  cost: '8.75rem',
  stage: '7.75rem',
  owner: '11%',
  actions: '4.5rem',
} as const

export type TemplateTableColumnKey = keyof typeof TEMPLATE_TABLE_COLUMN_WIDTHS

export const TEMPLATE_TABLE_COLUMN_ORDER: TemplateTableColumnKey[] = [
  'selection',
  'reference',
  'date',
  'client',
  'persons',
  'destination',
  'cost',
  'stage',
  'owner',
  'actions',
]

export const TEMPLATE_TABLE_COL_COUNT = TEMPLATE_TABLE_COLUMN_ORDER.length

export const TEMPLATE_TABLE_COLUMN_OPTIONS: TableColumnDefinition<TemplateTableColumnKey>[] = [
  { key: 'selection', label: 'Select', locked: true },
  { key: 'reference', label: 'Trip ID', locked: true },
  { key: 'date', label: 'Trip Date' },
  { key: 'client', label: 'Client' },
  { key: 'persons', label: 'Persons' },
  { key: 'destination', label: 'Destination' },
  { key: 'cost', label: 'Cost' },
  { key: 'stage', label: 'Stage' },
  { key: 'owner', label: 'Owner' },
  { key: 'actions', label: 'Actions', locked: true },
]

export function TemplateTableColgroup({
  visibleKeys = new Set(TEMPLATE_TABLE_COLUMN_ORDER),
}: {
  visibleKeys?: ReadonlySet<TemplateTableColumnKey>
}) {
  return (
    <colgroup>
      {TEMPLATE_TABLE_COLUMN_ORDER.filter((key) => visibleKeys.has(key)).map((key) => (
        <col key={key} style={{ width: TEMPLATE_TABLE_COLUMN_WIDTHS[key] }} />
      ))}
    </colgroup>
  )
}
