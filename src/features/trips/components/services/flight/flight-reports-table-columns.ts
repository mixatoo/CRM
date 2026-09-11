import type { TableColumnDefinition } from '@/shared/hooks/use-table-column-visibility'

export type FlightReportsTableColumnKey =
  | 'ticketNumber'
  | 'passenger'
  | 'airline'
  | 'route'
  | 'status'
  | 'amount'
  | 'profit'
  | 'date'

export const FLIGHT_REPORTS_TABLE_COLUMN_ORDER: FlightReportsTableColumnKey[] = [
  'ticketNumber',
  'passenger',
  'airline',
  'route',
  'status',
  'amount',
  'profit',
  'date',
]

export const FLIGHT_REPORTS_TABLE_COLUMN_OPTIONS: TableColumnDefinition<FlightReportsTableColumnKey>[] = [
  { key: 'ticketNumber', label: 'Ticket', locked: true },
  { key: 'passenger', label: 'Passenger' },
  { key: 'airline', label: 'Airline' },
  { key: 'route', label: 'Route' },
  { key: 'status', label: 'Status' },
  { key: 'amount', label: 'Amount' },
  { key: 'profit', label: 'Profit' },
  { key: 'date', label: 'Date' },
]
