import { BadgeCheck } from 'lucide-react'
import {
  CLIENT_MEMBERSHIP_SHORT_LABELS,
  resolveClientMembership,
  type ClientMembership,
} from '@/domain/entities/client'
import {
  CLIENT_MEMBERSHIP_CHIP_SIZE,
  CLIENT_MEMBERSHIP_VISUAL,
} from '@/features/clients/components/membership/client-membership-styles'
import { cn } from '@/shared/utils/cn'

interface ClientMembershipBadgeProps {
  membership?: ClientMembership
  className?: string
  showIcon?: boolean
}

export function ClientMembershipBadge({ membership, className, showIcon = true }: ClientMembershipBadgeProps) {
  const resolved = resolveClientMembership(membership)
  const visual = CLIENT_MEMBERSHIP_VISUAL[resolved]
  const isMember = resolved === 'member'

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center gap-1 rounded-[var(--radius-sm)] border px-2 text-center text-xs font-medium leading-none',
        CLIENT_MEMBERSHIP_CHIP_SIZE,
        visual.shell,
        visual.text,
        className,
      )}
    >
      {showIcon && isMember ? <BadgeCheck className="h-3 w-3 shrink-0" aria-hidden /> : null}
      <span className="truncate">{CLIENT_MEMBERSHIP_SHORT_LABELS[resolved]}</span>
    </span>
  )
}
