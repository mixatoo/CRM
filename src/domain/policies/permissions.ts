import type { UserRole } from '@/domain/entities'

export type Action = 'create' | 'read' | 'update' | 'delete' | 'export' | 'approve'
export type Resource =
  | 'order'
  | 'service'
  | 'passenger'
  | 'invoice'
  | 'expense'
  | 'payment'
  | 'user'
  | 'audit'
  | 'report'
  | 'settings'
  | 'directory'

export type PermissionLevel = 'allowed' | 'masked' | 'denied'

const matrix: Record<UserRole, Partial<Record<Resource, Partial<Record<Action, PermissionLevel>>>>> = {
  admin: {},
  operations: {
    order: { create: 'allowed', read: 'allowed', update: 'allowed', delete: 'allowed', export: 'allowed' },
    service: { create: 'allowed', read: 'allowed', update: 'allowed', delete: 'allowed' },
    passenger: { create: 'allowed', read: 'allowed', update: 'allowed', delete: 'allowed', export: 'allowed' },
    invoice: { read: 'allowed', export: 'allowed' },
    expense: { create: 'allowed', read: 'allowed', update: 'allowed' },
    directory: { create: 'allowed', read: 'allowed', update: 'allowed', delete: 'allowed' },
    report: { read: 'allowed', export: 'allowed' },
  },
  finance: {
    order: { read: 'allowed', export: 'allowed' },
    service: { read: 'allowed' },
    invoice: { create: 'allowed', read: 'allowed', update: 'allowed', approve: 'allowed', export: 'allowed' },
    expense: { read: 'allowed', update: 'allowed', approve: 'allowed', export: 'allowed' },
    payment: { create: 'allowed', read: 'allowed', update: 'allowed', export: 'allowed' },
    report: { read: 'allowed', export: 'allowed' },
  },
  sales: {
    order: { create: 'allowed', read: 'allowed', update: 'allowed', export: 'allowed' },
    service: { create: 'allowed', read: 'allowed', update: 'allowed' },
    passenger: { create: 'allowed', read: 'allowed', update: 'allowed' },
    invoice: { read: 'allowed', export: 'allowed' },
    directory: { create: 'allowed', read: 'allowed', update: 'allowed' },
  },
  management: {
    order: { read: 'allowed', export: 'allowed' },
    service: { read: 'allowed' },
    invoice: { read: 'allowed', approve: 'allowed', export: 'allowed' },
    expense: { read: 'allowed', export: 'allowed' },
    payment: { read: 'allowed', export: 'allowed' },
    report: { read: 'allowed', export: 'allowed' },
    audit: { read: 'allowed' },
  },
  readonly: {
    order: { read: 'masked' },
    service: { read: 'allowed' },
    passenger: { read: 'masked' },
    invoice: { read: 'masked' },
    report: { read: 'allowed' },
    directory: { read: 'allowed' },
  },
  guest: {
    order: { read: 'masked' },
    service: { read: 'allowed' },
  },
}

const adminAllowAll: Partial<Record<Resource, Partial<Record<Action, PermissionLevel>>>> = {
  order: { create: 'allowed', read: 'allowed', update: 'allowed', delete: 'allowed', export: 'allowed' },
  service: { create: 'allowed', read: 'allowed', update: 'allowed', delete: 'allowed' },
  passenger: { create: 'allowed', read: 'allowed', update: 'allowed', delete: 'allowed', export: 'allowed' },
  invoice: { create: 'allowed', read: 'allowed', update: 'allowed', delete: 'allowed', approve: 'allowed', export: 'allowed' },
  expense: { create: 'allowed', read: 'allowed', update: 'allowed', delete: 'allowed', approve: 'allowed', export: 'allowed' },
  payment: { create: 'allowed', read: 'allowed', update: 'allowed', delete: 'allowed', export: 'allowed' },
  user: { create: 'allowed', read: 'allowed', update: 'allowed', delete: 'allowed' },
  audit: { read: 'allowed', export: 'allowed' },
  report: { read: 'allowed', export: 'allowed' },
  settings: { read: 'allowed', update: 'allowed' },
  directory: { create: 'allowed', read: 'allowed', update: 'allowed', delete: 'allowed', export: 'allowed' },
}
matrix.admin = adminAllowAll

export function checkPermission(
  role: UserRole,
  resource: Resource,
  action: Action,
): PermissionLevel {
  if (role === 'admin') return 'allowed'
  const level = matrix[role]?.[resource]?.[action]
  return level ?? 'denied'
}

export function canPerform(role: UserRole, resource: Resource, action: Action): boolean {
  const level = checkPermission(role, resource, action)
  return level === 'allowed' || level === 'masked'
}

/** Read access including masked (limited) visibility */
export function canRead(role: UserRole, resource: Resource): boolean {
  const level = checkPermission(role, resource, 'read')
  return level === 'allowed' || level === 'masked'
}

/** Write/export/approve — only fully allowed, never masked */
export function canMutate(role: UserRole, resource: Resource, action: Action): boolean {
  return checkPermission(role, resource, action) === 'allowed'
}

export function assertPermission(
  role: UserRole,
  resource: Resource,
  action: Action,
): import('@/shared/result').Result<void> {
  if (!canMutate(role, resource, action)) {
    return { ok: false, error: { code: 'PERMISSION_DENIED', message: `Permission denied: ${action} ${resource}` } }
  }
  return { ok: true, value: undefined }
}

export function canManageClientStatus(role: UserRole): boolean {
  return role === 'admin'
}

export function shouldMaskFinancials(role: UserRole): boolean {
  return shouldMaskPii(role) || checkPermission(role, 'order', 'read') === 'masked'
}

export function shouldMaskPii(role: UserRole): boolean {
  return role === 'readonly' || role === 'guest'
}

export function maskPassport(passport: string, role: UserRole): string {
  if (!shouldMaskPii(role)) return passport
  if (passport.length <= 4) return '****'
  return '*'.repeat(passport.length - 4) + passport.slice(-4)
}
