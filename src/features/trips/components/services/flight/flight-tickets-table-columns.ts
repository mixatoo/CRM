import type { TableColumnDefinition } from '@/shared/hooks/use-table-column-visibility'

export type FlightTicketsTableColumnKey =
  | 'passenger'
  | 'type'
  | 'ticketNumber'
  | 'pnr'
  | 'airline'
  | 'route'
  | 'status'
  | 'cost'
  | 'selling'
  | 'profit'
  | 'due'

export const FLIGHT_TICKETS_TABLE_COLUMN_ORDER: FlightTicketsTableColumnKey[] = [
  'passenger',
  'type',
  'ticketNumber',
  'pnr',
  'airline',
  'route',
  'status',
  'cost',
  'selling',
  'profit',
  'due',
]

export const FLIGHT_TICKETS_TABLE_COLUMN_OPTIONS: TableColumnDefinition<FlightTicketsTableColumnKey>[] = [
  { key: 'passenger', label: 'Passenger', locked: true },
  { key: 'type', label: 'Type' },
  { key: 'ticketNumber', label: 'Ticket #' },
  { key: 'pnr', label: 'PNR' },
  { key: 'airline', label: 'Airline' },
  { key: 'route', label: 'Route' },
  { key: 'status', label: 'Status' },
  { key: 'cost', label: 'Cost' },
  { key: 'selling', label: 'Selling' },
  { key: 'profit', label: 'Profit' },
  { key: 'due', label: 'Due' },
]
