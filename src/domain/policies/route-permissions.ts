import type { Action, Resource } from './permissions'

export interface RoutePermission {
  resource: Resource
  action: Action
}

export function getRoutePermission(pathname: string): RoutePermission | null {
  const path = pathname.replace(/\/$/, '') || '/'
  if (path === '/') return { resource: 'settings', action: 'read' }
  if (path.startsWith('/home')) return { resource: 'settings', action: 'read' }
  if (path.startsWith('/calendar')) return { resource: 'settings', action: 'read' }
  if (path.startsWith('/pipeline')) return { resource: 'order', action: 'read' }
  if (path.startsWith('/search')) return { resource: 'settings', action: 'read' }
  if (path.startsWith('/invoices')) return { resource: 'invoice', action: 'read' }
  if (path.startsWith('/settings/payment-terms')) return { resource: 'settings', action: 'read' }
  if (path.startsWith('/settings')) return { resource: 'settings', action: 'read' }
  if (path.startsWith('/activity')) return { resource: 'settings', action: 'read' }
  if (path.startsWith('/templates')) return { resource: 'settings', action: 'read' }
  if (path.startsWith('/clients')) return { resource: 'passenger', action: 'read' }
  if (path.startsWith('/travelers')) return { resource: 'passenger', action: 'read' }
  if (path.startsWith('/suppliers')) return { resource: 'directory', action: 'read' }
  if (path.startsWith('/modules/clients')) return { resource: 'passenger', action: 'read' }
  if (path.startsWith('/modules/suppliers')) return { resource: 'directory', action: 'read' }
  if (path.startsWith('/transactions')) return { resource: 'payment', action: 'read' }
  if (path.startsWith('/reports')) return { resource: 'report', action: 'read' }
  if (path.startsWith('/reminders')) return { resource: 'settings', action: 'read' }
  if (path.startsWith('/modules/reminders')) return { resource: 'settings', action: 'read' }
  if (path.startsWith('/modules/transactions')) return { resource: 'payment', action: 'read' }
  if (path.startsWith('/modules/reports')) return { resource: 'report', action: 'read' }
  if (path.startsWith('/trips')) return { resource: 'order', action: 'read' }
  return null
}
