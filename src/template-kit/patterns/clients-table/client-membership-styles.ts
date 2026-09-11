import type { ClientMembership } from '../stubs/domain-client'
import { ACCOUNT_NAME_AVATAR_PALETTE } from './account-name-avatar'

export const CLIENT_MEMBERSHIP_CHIP_SIZE = 'h-6 min-w-[5.5rem]'

export interface ClientMembershipVisual {
  shell: string
  text: string
  dot: string
}

const CLIENT_MEMBERSHIP_ICON_PALETTE_INDEX: Record<ClientMembership, number> = {
  member: 2,
  non_member: 1,
}

export const CLIENT_MEMBERSHIP_ICON_VISUAL: Record<ClientMembership, Pick<ClientMembershipVisual, 'shell' | 'text'>> = {
  member: ACCOUNT_NAME_AVATAR_PALETTE[CLIENT_MEMBERSHIP_ICON_PALETTE_INDEX.member]!,
  non_member: ACCOUNT_NAME_AVATAR_PALETTE[CLIENT_MEMBERSHIP_ICON_PALETTE_INDEX.non_member]!,
}

export const CLIENT_MEMBERSHIP_SHORT_LABELS: Record<ClientMembership, string> = {
  member: 'Member',
  non_member: 'Non-member',
}
