import type { Client } from '@/domain/entities/client'
import {
  MEMBERSHIP_TERM_STATUS_LABELS,
  getMembershipTermStatus,
  type MembershipTermStatus,
} from '@/domain/membership/term'
import { cn } from '@/shared/utils/cn'

const TERM_STATUS_VISUAL: Record<MembershipTermStatus, { shell: string; text: string }> = {
  not_enrolled: {
    shell: 'border-[var(--color-border-strong)] bg-[var(--color-surface-elevated)]',
    text: 'text-[var(--color-muted)]',
  },
  active: {
    shell: 'border-[var(--color-success)]/30 bg-[var(--color-success-muted)]/45',
    text: 'text-[var(--color-success)]',
  },
  expiring_soon: {
    shell: 'border-[var(--color-warning)]/35 bg-[var(--color-warning-muted)]/40',
    text: 'text-[var(--color-warning)]',
  },
  expired: {
    shell: 'border-[var(--color-danger)]/35 bg-[var(--color-danger-muted)]/45',
    text: 'text-[var(--color-danger)]',
  },
}

export function MembershipTermStatusBadge({
  client,
  className,
}: {
  client: Pick<Client, 'membership' | 'membershipEnrolledAt' | 'membershipExpiresAt'>
  className?: string
}) {
  const status = getMembershipTermStatus(client)
  const visual = TERM_STATUS_VISUAL[status]

  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-[var(--radius-sm)] border px-2 text-[11px] font-medium',
        visual.shell,
        visual.text,
        className,
      )}
    >
      {MEMBERSHIP_TERM_STATUS_LABELS[status]}
    </span>
  )
}
