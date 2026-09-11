import type { TableColumnDefinition } from '@/shared/hooks/use-table-column-visibility'

export const CLIENT_LINKED_TRIPS_TABLE_COLUMN_WIDTHS = {
  selection: '2.75rem',
  reference: '4.25rem',
  name: '28%',
  date: '6.5rem',
  destination: '16%',
  cost: '8.75rem',
  stage: '7.75rem',
  persons: '4.25rem',
  labels: '10rem',
  owner: '11%',
  actions: '4.5rem',
} as const

export type ClientLinkedTripsTableColumnKey = keyof typeof CLIENT_LINKED_TRIPS_TABLE_COLUMN_WIDTHS

export const CLIENT_LINKED_TRIPS_TABLE_DEFAULT_COLUMN_ORDER: ClientLinkedTripsTableColumnKey[] = [
  'selection',
  'reference',
  'name',
  'date',
  'destination',
  'cost',
  'stage',
  'persons',
  'labels',
  'owner',
  'actions',
]

export const CLIENT_LINKED_TRIPS_TABLE_DEFAULT_VISIBLE_KEYS: ClientLinkedTripsTableColumnKey[] = [
  'selection',
  'reference',
  'name',
  'date',
  'destination',
  'cost',
  'stage',
  'actions',
]

export const CLIENT_LINKED_TRIPS_TABLE_COLUMN_OPTIONS: TableColumnDefinition<ClientLinkedTripsTableColumnKey>[] =
  [
    { key: 'selection', label: 'Select', locked: true },
    { key: 'reference', label: 'ID', locked: true },
    { key: 'name', label: 'Trip', defaultVisible: true },
    { key: 'date', label: 'Date', defaultVisible: true },
    { key: 'destination', label: 'Destination', defaultVisible: true },
    { key: 'cost', label: 'Cost', defaultVisible: true },
    { key: 'stage', label: 'Stage', defaultVisible: true },
    { key: 'persons', label: 'Persons', defaultVisible: false },
    { key: 'labels', label: 'Labels', defaultVisible: false },
    { key: 'owner', label: 'Owner', defaultVisible: false },
    { key: 'actions', label: 'Actions', locked: true },
  ]
