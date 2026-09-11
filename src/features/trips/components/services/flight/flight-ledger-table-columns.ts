import type { TableColumnDefinition } from '@/shared/hooks/use-table-column-visibility'

export type FlightLedgerTableColumnKey =
  | 'date'
  | 'type'
  | 'description'
  | 'debit'
  | 'credit'
  | 'ref'
  | 'user'

export const FLIGHT_LEDGER_TABLE_COLUMN_ORDER: FlightLedgerTableColumnKey[] = [
  'date',
  'type',
  'description',
  'debit',
  'credit',
  'ref',
  'user',
]

export const FLIGHT_LEDGER_TABLE_COLUMN_OPTIONS: TableColumnDefinition<FlightLedgerTableColumnKey>[] = [
  { key: 'date', label: 'Date', locked: true },
  { key: 'type', label: 'Type' },
  { key: 'description', label: 'Description' },
  { key: 'debit', label: 'Debit' },
  { key: 'credit', label: 'Credit' },
  { key: 'ref', label: 'Ref' },
  { key: 'user', label: 'User' },
]
