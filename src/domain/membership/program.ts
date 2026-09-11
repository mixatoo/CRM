import {
  DEFAULT_MEMBERSHIP_DURATION_MONTHS,
  addMonthsToMembershipDate,
  membershipStartToIso,
  toMembershipStartDate,
} from '@/domain/membership/term'
import {
  resolveClientMembership,
  type Client,
  type ClientMembership,
} from '@/domain/entities/client'

export const MEMBERSHIP_PROGRAM_BENEFITS = [
  'Member rates on eligible packages and services',
  'Priority response from the operations team',
  'Dedicated handling on trip requests and changes',
  'Early access to selected offers and departures',
] as const

export function formatMembershipNumber(sequence: number): string {
  return `MEM-${String(sequence).padStart(5, '0')}`
}

export type MembershipFields = Pick<
  Client,
  'membership' | 'membershipNumber' | 'membershipEnrolledAt' | 'membershipExpiresAt' | 'membershipNotes'
>

export function resolveMembershipFields(
  existing: Pick<
    Client,
    'membership' | 'membershipNumber' | 'membershipEnrolledAt' | 'membershipExpiresAt' | 'membershipNotes'
  >,
  input: {
    membership?: ClientMembership
    membershipNotes?: string
    membershipEnrolledAt?: string
    membershipExpiresAt?: string
    membershipDurationMonths?: number
  },
  generatedNumber?: string,
): MembershipFields {
  const membership = resolveClientMembership(input.membership ?? existing.membership)
  const membershipNotes =
    input.membershipNotes !== undefined
      ? input.membershipNotes.trim() || undefined
      : existing.membershipNotes?.trim() || undefined

  if (membership === 'non_member') {
    return {
      membership,
      membershipNumber: undefined,
      membershipEnrolledAt: undefined,
      membershipExpiresAt: undefined,
      membershipNotes,
    }
  }

  const startDate = toMembershipStartDate(
    input.membershipEnrolledAt ?? existing.membershipEnrolledAt ?? new Date().toISOString(),
  )
  const expiresAt =
    input.membershipExpiresAt ??
    existing.membershipExpiresAt ??
    addMonthsToMembershipDate(startDate, input.membershipDurationMonths ?? DEFAULT_MEMBERSHIP_DURATION_MONTHS)

  return {
    membership,
    membershipNumber: existing.membershipNumber ?? generatedNumber,
    membershipEnrolledAt: membershipStartToIso(startDate),
    membershipExpiresAt: expiresAt,
    membershipNotes,
  }
}
