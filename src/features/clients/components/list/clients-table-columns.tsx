import type { TableColumnDefinition } from '@/shared/hooks/use-table-column-visibility'

import { CLIENT_JOINED_COMPANY_LABEL } from '@/domain/entities/client'
import { CRM_LABELS } from '@/features/clients/config/crm-labels'

export const CLIENTS_TABLE_COLUMN_WIDTHS = {
  selection: '2.75rem',
  reference: '4.25rem',
  name: '32%',
  email: '14%',
  phone: '9rem',
  type: '7.75rem',
  billing: '8rem',
  trips: '3.25rem',
  membership: '7.25rem',
  labels: '10rem',
  updated: '6.5rem',
  status: '7.75rem',
  country: '8rem',
  city: '8rem',
  industry: '9rem',
  actions: '4.5rem',
} as const

export type ClientsTableColumnKey = keyof typeof CLIENTS_TABLE_COLUMN_WIDTHS

/** Full column order including optional data columns (before Actions). */
export const CLIENTS_TABLE_DEFAULT_COLUMN_ORDER: ClientsTableColumnKey[] = [
  'selection',
  'reference',
  'name',
  'type',
  'trips',
  'membership',
  'updated',
  'status',
  'billing',
  'labels',
  'email',
  'phone',
  'country',
  'city',
  'industry',
  'actions',
]

/** Default visible layout for new users and reset. */
export const CLIENTS_TABLE_DEFAULT_VISIBLE_KEYS: ClientsTableColumnKey[] = [
  'selection',
  'reference',
  'name',
  'type',
  'trips',
  'membership',
  'updated',
  'status',
  'actions',
]

export const CLIENTS_TABLE_COLUMN_OPTIONS: TableColumnDefinition<ClientsTableColumnKey>[] = [
  { key: 'selection', label: 'Select', locked: true },
  { key: 'reference', label: 'ID', locked: true },
  { key: 'name', label: `${CRM_LABELS.account} name`, defaultVisible: true },
  { key: 'type', label: 'Account type', defaultVisible: true },
  { key: 'trips', label: 'Trips', defaultVisible: true },
  { key: 'membership', label: 'Membership', defaultVisible: true },
  { key: 'updated', label: CLIENT_JOINED_COMPANY_LABEL, defaultVisible: true },
  { key: 'status', label: 'Account status', defaultVisible: true },
  { key: 'billing', label: 'Billing terms', defaultVisible: false },
  { key: 'labels', label: 'Labels', defaultVisible: false },
  { key: 'email', label: 'Email', defaultVisible: false },
  { key: 'phone', label: 'Phone', defaultVisible: false },
  { key: 'country', label: 'Country', defaultVisible: false },
  { key: 'city', label: 'City', defaultVisible: false },
  { key: 'industry', label: 'Industry', defaultVisible: false },
  { key: 'actions', label: 'Actions', locked: true },
]

export function ClientsTableColgroup({
  orderedKeys,
}: {
  orderedKeys: readonly ClientsTableColumnKey[]
}) {
  return (
    <colgroup>
      {orderedKeys.map((key) => (
        <col key={key} style={{ width: CLIENTS_TABLE_COLUMN_WIDTHS[key] }} />
      ))}
    </colgroup>
  )
}
