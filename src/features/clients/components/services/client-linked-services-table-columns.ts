import type { TableColumnDefinition } from '@/shared/hooks/use-table-column-visibility'

export const CLIENT_LINKED_SERVICES_TABLE_COLUMN_WIDTHS = {
  selection: '2.75rem',
  service: '28%',
  category: '9rem',
  trip: '5.5rem',
  supplier: '16%',
  selling: '8.75rem',
  status: '7.75rem',
  cost: '8.75rem',
  startDate: '7rem',
  actions: '4.5rem',
} as const

export type ClientLinkedServicesTableColumnKey = keyof typeof CLIENT_LINKED_SERVICES_TABLE_COLUMN_WIDTHS

export const CLIENT_LINKED_SERVICES_TABLE_DEFAULT_COLUMN_ORDER: ClientLinkedServicesTableColumnKey[] = [
  'selection',
  'service',
  'category',
  'trip',
  'supplier',
  'selling',
  'status',
  'cost',
  'startDate',
  'actions',
]

export const CLIENT_LINKED_SERVICES_TABLE_DEFAULT_VISIBLE_KEYS: ClientLinkedServicesTableColumnKey[] = [
  'selection',
  'service',
  'category',
  'trip',
  'supplier',
  'selling',
  'status',
  'actions',
]

export const CLIENT_LINKED_SERVICES_TABLE_COLUMN_OPTIONS: TableColumnDefinition<ClientLinkedServicesTableColumnKey>[] =
  [
    { key: 'selection', label: 'Select', locked: true },
    { key: 'service', label: 'Service', locked: true },
    { key: 'category', label: 'Category', defaultVisible: true },
    { key: 'trip', label: 'Trip', defaultVisible: true },
    { key: 'supplier', label: 'Supplier', defaultVisible: true },
    { key: 'selling', label: 'Selling', defaultVisible: true },
    { key: 'status', label: 'Status', defaultVisible: true },
    { key: 'cost', label: 'Cost', defaultVisible: false },
    { key: 'startDate', label: 'Start date', defaultVisible: false },
    { key: 'actions', label: 'Actions', locked: true },
  ]
