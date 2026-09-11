import { BadgeCheck, Building2, CircleDashed, UserRound } from 'lucide-react'
import type { ClientMembership, ClientType } from '../stubs/domain-client'
import {
  ACCOUNT_NAME_AVATAR_PALETTE,
  accountNameAvatarPaletteIndex,
  accountNameInitials,
} from './account-name-avatar'
import { CLIENT_MEMBERSHIP_ICON_VISUAL, CLIENT_MEMBERSHIP_SHORT_LABELS } from './client-membership-styles'
import { CLIENT_TYPE_ICON_VISUAL, CLIENT_TYPE_LABELS } from './client-type-styles'
import { cn } from '../../primitives/utils/cn'

export function AccountNameCell({ id, accountName }: { id: string; accountName: string }) {
  const initials = accountNameInitials(accountName)
  const palette = ACCOUNT_NAME_AVATAR_PALETTE[accountNameAvatarPaletteIndex(id)]

  return (
    <span className="flex min-w-0 items-center gap-2">
      <span
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[10px] font-semibold leading-none',
          palette.shell,
          palette.text,
        )}
        aria-hidden
      >
        {initials}
      </span>
      <span className="min-w-0 truncate font-medium">{accountName}</span>
    </span>
  )
}

export function AccountTypeCell({ type }: { type: ClientType }) {
  const Icon = type === 'corporate' ? Building2 : UserRound
  const palette = CLIENT_TYPE_ICON_VISUAL[type]

  return (
    <span className="flex min-w-0 items-center gap-2">
      <span
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)]',
          palette.shell,
        )}
        aria-hidden
      >
        <Icon className={cn('h-3.5 w-3.5', palette.text)} strokeWidth={2} />
      </span>
      <span className="min-w-0 truncate text-xs leading-none">{CLIENT_TYPE_LABELS[type]}</span>
    </span>
  )
}

export function AccountMembershipCell({ membership }: { membership: ClientMembership }) {
  const Icon = membership === 'member' ? BadgeCheck : CircleDashed
  const palette = CLIENT_MEMBERSHIP_ICON_VISUAL[membership]

  return (
    <span className="flex min-w-0 items-center gap-2">
      <span
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)]',
          palette.shell,
        )}
        aria-hidden
      >
        <Icon className={cn('h-3.5 w-3.5', palette.text)} strokeWidth={2} />
      </span>
      <span className="min-w-0 truncate text-xs leading-none">{CLIENT_MEMBERSHIP_SHORT_LABELS[membership]}</span>
    </span>
  )
}
