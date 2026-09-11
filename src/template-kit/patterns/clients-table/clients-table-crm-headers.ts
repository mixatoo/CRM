export const CLIENTS_TABLE_CRM_HEADERS = {
  selection: '',
  reference: 'Reference',
  name: 'Account name',
  type: 'Type',
  billing: 'Billing',
  trips: 'Trips',
  membership: 'Membership',
  labels: 'Labels',
  updated: 'Joined',
  status: 'Status',
  email: 'Email',
  phone: 'Phone',
  country: 'Country',
  city: 'City',
  industry: 'Industry',
  actions: 'Actions',
} as const

export type ClientsTableColumnKey = keyof typeof CLIENTS_TABLE_CRM_HEADERS
