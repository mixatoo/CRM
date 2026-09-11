import type { TableColumnDefinition } from '@/shared/hooks/use-table-column-visibility'

export const SUPPLIERS_TABLE_COLUMN_WIDTHS = {
  selection: '2.75rem',
  reference: '5.75rem',
  name: '14%',
  category: '8rem',
  country: '8rem',
  email: '14%',
  phone: '9rem',
  status: '7.75rem',
  services: '4.25rem',
  labels: '10rem',
  updated: '6.75rem',
  actions: '4.5rem',
} as const

export type SuppliersTableColumnKey = keyof typeof SUPPLIERS_TABLE_COLUMN_WIDTHS

export const SUPPLIERS_TABLE_COLUMN_ORDER: SuppliersTableColumnKey[] = [
  'selection',
  'reference',
  'name',
  'category',
  'country',
  'email',
  'phone',
  'status',
  'services',
  'labels',
  'updated',
  'actions',
]

export const SUPPLIERS_TABLE_COLUMN_OPTIONS: TableColumnDefinition<SuppliersTableColumnKey>[] = [
  { key: 'selection', label: 'Select', locked: true },
  { key: 'reference', label: 'ID', locked: true },
  { key: 'name', label: 'Name' },
  { key: 'category', label: 'Category' },
  { key: 'country', label: 'Country' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'status', label: 'Status' },
  { key: 'services', label: 'Services' },
  { key: 'labels', label: 'Labels' },
  { key: 'updated', label: 'Updated' },
  { key: 'actions', label: 'Actions', locked: true },
]

export function SuppliersTableColgroup({
  visibleKeys = new Set(SUPPLIERS_TABLE_COLUMN_ORDER),
}: {
  visibleKeys?: ReadonlySet<SuppliersTableColumnKey>
}) {
  return (
    <colgroup>
      {SUPPLIERS_TABLE_COLUMN_ORDER.filter((key) => visibleKeys.has(key)).map((key) => (
        <col key={key} style={{ width: SUPPLIERS_TABLE_COLUMN_WIDTHS[key] }} />
      ))}
    </colgroup>
  )
}
