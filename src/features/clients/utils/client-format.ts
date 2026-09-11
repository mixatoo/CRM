import type { UserRole } from '@/domain/entities'
import { shouldMaskPii } from '@/domain/policies/permissions'

export function maskClientField(role: UserRole, value?: string | null): string {
  if (!value?.trim()) return '—'
  if (!shouldMaskPii(role)) return value
  if (value.includes('@')) {
    const [user, domain] = value.split('@')
    return `${user.slice(0, 1)}***@${domain}`
  }
  if (value.length <= 4) return '****'
  return `${value.slice(0, 2)}***${value.slice(-2)}`
}
