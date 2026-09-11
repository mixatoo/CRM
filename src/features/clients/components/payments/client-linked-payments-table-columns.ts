import type { TableColumnDefinition } from '@/shared/hooks/use-table-column-visibility'

export const CLIENT_LINKED_PAYMENTS_TABLE_COLUMN_WIDTHS = {
  selection: '2.75rem',
  invoice: '10rem',
  date: '7rem',
  method: '9rem',
  reference: '10rem',
  amount: '8.75rem',
  status: '7.75rem',
  trip: '5.5rem',
  notes: '16%',
  actions: '4.5rem',
} as const

export type ClientLinkedPaymentsTableColumnKey = keyof typeof CLIENT_LINKED_PAYMENTS_TABLE_COLUMN_WIDTHS

export const CLIENT_LINKED_PAYMENTS_TABLE_DEFAULT_COLUMN_ORDER: ClientLinkedPaymentsTableColumnKey[] = [
  'selection',
  'invoice',
  'date',
  'method',
  'reference',
  'amount',
  'status',
  'trip',
  'notes',
  'actions',
]

export const CLIENT_LINKED_PAYMENTS_TABLE_DEFAULT_VISIBLE_KEYS: ClientLinkedPaymentsTableColumnKey[] = [
  'selection',
  'invoice',
  'date',
  'method',
  'reference',
  'amount',
  'status',
  'actions',
]

export const CLIENT_LINKED_PAYMENTS_TABLE_COLUMN_OPTIONS: TableColumnDefinition<ClientLinkedPaymentsTableColumnKey>[] =
  [
    { key: 'selection', label: 'Select', locked: true },
    { key: 'invoice', label: 'Invoice', locked: true },
    { key: 'date', label: 'Date', defaultVisible: true },
    { key: 'method', label: 'Method', defaultVisible: true },
    { key: 'reference', label: 'Reference', defaultVisible: true },
    { key: 'amount', label: 'Amount', defaultVisible: true },
    { key: 'status', label: 'Status', defaultVisible: true },
    { key: 'trip', label: 'Trip', defaultVisible: false },
    { key: 'notes', label: 'Notes', defaultVisible: false },
    { key: 'actions', label: 'Actions', locked: true },
  ]
