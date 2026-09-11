import { parseDateInput, toLocalIsoDate } from '@/shared/utils/date-format'
import { isClientMember, type Client } from '@/domain/entities/client'

export const DEFAULT_MEMBERSHIP_DURATION_MONTHS = 12

export const MEMBERSHIP_EXPIRING_SOON_DAYS = 30

export const MEMBERSHIP_DURATION_PRESETS = [
  { months: 6, label: '6 months' },
  { months: 12, label: '1 year' },
  { months: 24, label: '2 years' },
  { months: 36, label: '3 years' },
] as const

export type MembershipTermStatus = 'not_enrolled' | 'active' | 'expiring_soon' | 'expired'

export const MEMBERSHIP_TERM_STATUS_LABELS: Record<MembershipTermStatus, string> = {
  not_enrolled: 'Not enrolled',
  active: 'Active',
  expiring_soon: 'Expiring soon',
  expired: 'Expired',
}

export function toMembershipStartDate(value?: string | null): string {
  const date = parseDateInput(value) ?? new Date()
  return toLocalIsoDate(date)
}

export function addMonthsToMembershipDate(isoDate: string, months: number): string {
  const date = parseDateInput(isoDate)
  if (!date) return toLocalIsoDate(new Date())
  const next = new Date(date)
  next.setMonth(next.getMonth() + months)
  return toLocalIsoDate(next)
}

export function membershipStartToIso(isoDate: string): string {
  const date = parseDateInput(isoDate)
  if (!date) return new Date().toISOString()
  date.setHours(0, 0, 0, 0)
  return date.toISOString()
}

export function getMembershipDurationMonths(start?: string | null, end?: string | null): number | null {
  const startDate = parseDateInput(start)
  const endDate = parseDateInput(end)
  if (!startDate || !endDate) return null
  if (endDate.getTime() < startDate.getTime()) return null

  let months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth())
  if (endDate.getDate() < startDate.getDate()) months -= 1
  return Math.max(months, 0)
}

export function formatMembershipDuration(start?: string | null, end?: string | null): string {
  const months = getMembershipDurationMonths(start, end)
  if (months == null) return '—'
  if (months < 1) return 'Less than 1 month'
  if (months === 1) return '1 month'
  if (months % 12 === 0) {
    const years = months / 12
    return years === 1 ? '1 year' : `${years} years`
  }
  return `${months} months`
}

export function getMembershipTermStatus(
  client: Pick<Client, 'membership' | 'membershipEnrolledAt' | 'membershipExpiresAt'>,
  now = new Date(),
): MembershipTermStatus {
  if (!isClientMember(client.membership)) return 'not_enrolled'
  const expires = parseDateInput(client.membershipExpiresAt)
  if (!expires) return 'active'

  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  expires.setHours(0, 0, 0, 0)

  if (expires.getTime() < today.getTime()) return 'expired'

  const threshold = new Date(today)
  threshold.setDate(threshold.getDate() + MEMBERSHIP_EXPIRING_SOON_DAYS)
  if (expires.getTime() <= threshold.getTime()) return 'expiring_soon'

  return 'active'
}

export function getDaysUntilMembershipExpiry(expiresAt?: string | null, now = new Date()): number | null {
  const expires = parseDateInput(expiresAt)
  if (!expires) return null
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  expires.setHours(0, 0, 0, 0)
  return Math.round((expires.getTime() - today.getTime()) / 86_400_000)
}

export function matchMembershipDurationPreset(start?: string | null, end?: string | null): number | 'custom' {
  const months = getMembershipDurationMonths(start, end)
  if (months == null) return DEFAULT_MEMBERSHIP_DURATION_MONTHS
  const preset = MEMBERSHIP_DURATION_PRESETS.find((item) => item.months === months)
  return preset ? preset.months : 'custom'
}
