import { CLIENT_JOINED_COMPANY_LABEL } from '@/domain/entities/client'
import { CRM_LABELS } from '@/features/clients/config/crm-labels'
import type { ClientsTableColumnKey } from '@/features/clients/components/list/clients-table-columns'

/** CRM-facing column titles for the accounts list. */
export const CLIENTS_TABLE_CRM_HEADERS: Record<Exclude<ClientsTableColumnKey, 'selection'>, string> = {
  reference: 'ID',
  name: `${CRM_LABELS.account} name`,
  type: 'Account type',
  billing: 'Billing terms',
  trips: 'Trips',
  membership: 'Membership',
  labels: 'Labels',
  /** Column key `updated` — sorted by `createdAt` / joined date. */
  updated: CLIENT_JOINED_COMPANY_LABEL,
  status: 'Account status',
  email: 'Email',
  phone: 'Phone',
  country: 'Country',
  city: 'City',
  industry: 'Industry',
  actions: 'Actions',
}
