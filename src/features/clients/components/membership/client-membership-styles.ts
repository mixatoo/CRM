import type { ClientMembership } from '@/domain/entities/client'
import { ACCOUNT_NAME_AVATAR_PALETTE } from '@/features/clients/components/list/account-name-avatar'

export const CLIENT_MEMBERSHIP_CHIP_SIZE = 'h-6 min-w-[5.5rem]'

export interface ClientMembershipVisual {
  shell: string
  text: string
  dot: string
}

/** Fixed palette slots for table icons — same tints as account name avatars, one per membership. */
const CLIENT_MEMBERSHIP_ICON_PALETTE_INDEX: Record<ClientMembership, number> = {
  member: 2,
  non_member: 1,
}

/** Table icon chips — one fixed tint per membership from account name avatar palette. */
export const CLIENT_MEMBERSHIP_ICON_VISUAL: Record<ClientMembership, Pick<ClientMembershipVisual, 'shell' | 'text'>> = {
  member: ACCOUNT_NAME_AVATAR_PALETTE[CLIENT_MEMBERSHIP_ICON_PALETTE_INDEX.member]!,
  non_member: ACCOUNT_NAME_AVATAR_PALETTE[CLIENT_MEMBERSHIP_ICON_PALETTE_INDEX.non_member]!,
}

export const CLIENT_MEMBERSHIP_VISUAL: Record<ClientMembership, ClientMembershipVisual> = {
  member: {
    shell: 'border-[var(--color-accent)]/35 bg-[var(--color-accent-muted)]/50',
    text: 'text-[var(--color-accent)]',
    dot: 'bg-[var(--color-accent)]',
  },
  non_member: {
    shell: 'border-[var(--color-border-strong)] bg-[var(--color-surface-elevated)]',
    text: 'text-[var(--color-muted)]',
    dot: 'bg-[var(--color-subtle)]',
  },
}
