import type { TableColumnDefinition } from '@/shared/hooks/use-table-column-visibility'

export const CLIENT_LINKED_INVOICES_TABLE_COLUMN_WIDTHS = {
  selection: '2.75rem',
  invoice: '10rem',
  issued: '7rem',
  due: '7rem',
  trip: '5.5rem',
  total: '8.75rem',
  balance: '8.75rem',
  status: '7.75rem',
  actions: '4.5rem',
} as const

export type ClientLinkedInvoicesTableColumnKey = keyof typeof CLIENT_LINKED_INVOICES_TABLE_COLUMN_WIDTHS

export const CLIENT_LINKED_INVOICES_TABLE_DEFAULT_COLUMN_ORDER: ClientLinkedInvoicesTableColumnKey[] = [
  'selection',
  'invoice',
  'issued',
  'due',
  'trip',
  'total',
  'balance',
  'status',
  'actions',
]

export const CLIENT_LINKED_INVOICES_TABLE_DEFAULT_VISIBLE_KEYS: ClientLinkedInvoicesTableColumnKey[] = [
  'selection',
  'invoice',
  'issued',
  'due',
  'trip',
  'total',
  'balance',
  'status',
  'actions',
]

export const CLIENT_LINKED_INVOICES_TABLE_COLUMN_OPTIONS: TableColumnDefinition<ClientLinkedInvoicesTableColumnKey>[] =
  [
    { key: 'selection', label: 'Select', locked: true },
    { key: 'invoice', label: 'Invoice', locked: true },
    { key: 'issued', label: 'Issued', defaultVisible: true },
    { key: 'due', label: 'Due', defaultVisible: true },
    { key: 'trip', label: 'Trip', defaultVisible: true },
    { key: 'total', label: 'Total', defaultVisible: true },
    { key: 'balance', label: 'Balance', defaultVisible: true },
    { key: 'status', label: 'Status', defaultVisible: true },
    { key: 'actions', label: 'Actions', locked: true },
  ]
