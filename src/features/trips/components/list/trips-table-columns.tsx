import type { TableColumnDefinition } from '@/shared/hooks/use-table-column-visibility'

export const TRIPS_TABLE_COLUMN_WIDTHS = {
  selection: '2.75rem',
  reference: '4.25rem',
  date: '6.5rem',
  client: '14%',
  persons: '4.25rem',
  destination: '13%',
  cost: '8.75rem',
  stage: '7.75rem',
  owner: '11%',
  labels: '10rem',
  name: '18%',
  actions: '4.5rem',
} as const

export type TripsTableColumnKey = keyof typeof TRIPS_TABLE_COLUMN_WIDTHS

export const TRIPS_TABLE_DEFAULT_COLUMN_ORDER: TripsTableColumnKey[] = [
  'selection',
  'reference',
  'date',
  'client',
  'persons',
  'destination',
  'cost',
  'stage',
  'owner',
  'labels',
  'name',
  'actions',
]

export const TRIPS_TABLE_DEFAULT_VISIBLE_KEYS: TripsTableColumnKey[] = [
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

export const TRIPS_TABLE_COLUMN_OPTIONS: TableColumnDefinition<TripsTableColumnKey>[] = [
  { key: 'selection', label: 'Select', locked: true },
  { key: 'reference', label: 'Trip ID', locked: true },
  { key: 'date', label: 'Trip Date', defaultVisible: true },
  { key: 'client', label: 'Client', defaultVisible: true },
  { key: 'persons', label: 'Persons', defaultVisible: true },
  { key: 'destination', label: 'Destination', defaultVisible: true },
  { key: 'cost', label: 'Cost', defaultVisible: true },
  { key: 'stage', label: 'Stage', defaultVisible: true },
  { key: 'owner', label: 'Owner', defaultVisible: true },
  { key: 'labels', label: 'Labels', defaultVisible: false },
  { key: 'name', label: 'Trip name', defaultVisible: false },
  { key: 'actions', label: 'Actions', locked: true },
]
