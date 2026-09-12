import type { UserRole } from '@/domain/entities'
import type { Resource, Action } from '@/domain/policies/permissions'
import { canRead } from '@/domain/policies/permissions'

export interface NavItem {
  id: string
  to: string
  label: string
  resource: Resource
  action?: Action
  end?: boolean
  group: 'workspace' | 'directory' | 'finance' | 'tools' | 'admin'
}

export const SIDEBAR_GROUPS = [
  { id: 'workspace', label: 'Workspace' },
  { id: 'directory', label: 'Directory' },
  { id: 'finance', label: 'Finance' },
  { id: 'tools', label: 'Tools' },
  { id: 'admin', label: 'Administration' },
] as const

export const sidebarItems: NavItem[] = [
  { id: 'dashboard', to: '/', label: 'Dashboard', resource: 'settings', action: 'read', end: true, group: 'workspace' },
  { id: 'clients', to: '/clients', label: 'Accounts', resource: 'passenger', action: 'read', group: 'workspace' },
  { id: 'travelers', to: '/travelers', label: 'Travelers', resource: 'passenger', action: 'read', group: 'workspace' },
  { id: 'trips', to: '/trips', label: 'Trips', resource: 'order', action: 'read', group: 'workspace' },
  { id: 'transfers', to: '/transfers', label: 'Transfers', resource: 'order', action: 'read', group: 'workspace' },
  { id: 'pipeline', to: '/pipeline', label: 'Pipeline', resource: 'order', action: 'read', group: 'workspace' },
  { id: 'search', to: '/search', label: 'Search', resource: 'settings', action: 'read', group: 'workspace' },
  { id: 'calendar', to: '/calendar', label: 'Calendar', resource: 'settings', action: 'read', group: 'workspace' },
  { id: 'templates', to: '/templates', label: 'Templates', resource: 'settings', action: 'read', group: 'workspace' },
  { id: 'suppliers', to: '/suppliers', label: 'Suppliers', resource: 'directory', action: 'read', group: 'directory' },
  { id: 'transactions', to: '/transactions', label: 'Transactions', resource: 'payment', action: 'read', group: 'finance' },
  { id: 'invoices', to: '/invoices', label: 'Invoices', resource: 'invoice', action: 'read', group: 'finance' },
  { id: 'reports', to: '/reports', label: 'Reports', resource: 'report', action: 'read', group: 'finance' },
  { id: 'reminders', to: '/reminders', label: 'Reminders', resource: 'settings', action: 'read', group: 'tools' },
  { id: 'activity', to: '/activity', label: 'Activity', resource: 'settings', action: 'read', group: 'tools' },
  { id: 'settings', to: '/settings', label: 'Settings', resource: 'settings', action: 'read', group: 'admin' },
]

export function filterSidebarForRole(role: UserRole) {
  return sidebarItems.filter((item) => canRead(role, item.resource))
}
