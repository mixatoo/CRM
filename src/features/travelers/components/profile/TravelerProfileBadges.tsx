import {
  PASSPORT_STATUS_LABELS,
  TRAVELER_STATUS_LABELS,
  TRAVELER_VIP_LEVEL_LABELS,
  VISA_STATUS_LABELS,
  type PassportStatus,
  type TravelerStatus,
  type TravelerVipLevel,
  type VisaStatus,
} from '@/domain/entities/traveler'
import { cn } from '@/shared/utils/cn'

const CHIP =
  'inline-flex items-center justify-center rounded-[var(--radius-sm)] border px-2 text-center text-[11px] font-medium leading-none h-6'

const STATUS_VISUAL: Record<TravelerStatus, { shell: string; text: string }> = {
  active: {
    shell: 'border-[var(--color-success)]/25 bg-[var(--color-success)]/10',
    text: 'text-[var(--color-success)]',
  },
  inactive: {
    shell: 'border-[var(--color-border)] bg-[var(--color-surface-muted)]/60',
    text: 'text-[var(--color-muted)]',
  },
  archived: {
    shell: 'border-[var(--color-border)] bg-[var(--color-surface-muted)]/40',
    text: 'text-[var(--color-subtle)]',
  },
}

const VIP_VISUAL: Record<TravelerVipLevel, { shell: string; text: string }> = {
  standard: {
    shell: 'border-[var(--color-border)] bg-[var(--color-surface-muted)]/50',
    text: 'text-[var(--color-muted)]',
  },
  vip: {
    shell: 'border-[var(--color-vip)]/30 bg-[var(--color-vip-muted)]',
    text: 'text-[var(--color-vip)]',
  },
  vvip: {
    shell: 'border-[var(--color-vip)]/40 bg-[var(--color-vip-muted)]',
    text: 'text-[var(--color-vip)]',
  },
}

const DOC_VISUAL: Record<'valid' | 'expiring_soon' | 'expired' | 'other', { shell: string; text: string }> = {
  valid: {
    shell: 'border-[var(--color-success)]/25 bg-[var(--color-success)]/10',
    text: 'text-[var(--color-success)]',
  },
  expiring_soon: {
    shell: 'border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10',
    text: 'text-[var(--color-warning)]',
  },
  expired: {
    shell: 'border-[var(--color-danger)]/30 bg-[var(--color-danger-muted)]',
    text: 'text-[var(--color-danger)]',
  },
  other: {
    shell: 'border-[var(--color-border)] bg-[var(--color-surface-muted)]/50',
    text: 'text-[var(--color-muted)]',
  },
}

export function TravelerStatusBadge({ status, className }: { status: TravelerStatus; className?: string }) {
  const visual = STATUS_VISUAL[status]
  return (
    <span className={cn(CHIP, visual.shell, visual.text, className)}>
      {TRAVELER_STATUS_LABELS[status]}
    </span>
  )
}

export function TravelerVipBadge({ level, className }: { level: TravelerVipLevel; className?: string }) {
  const visual = VIP_VISUAL[level]
  return (
    <span className={cn(CHIP, visual.shell, visual.text, className)}>
      {TRAVELER_VIP_LEVEL_LABELS[level]}
    </span>
  )
}

export function TravelerNationalityBadge({
  nationality,
  className,
}: {
  nationality: string
  className?: string
}) {
  return (
    <span
      className={cn(
        CHIP,
        'border-[var(--color-border)] bg-[var(--color-surface-muted)]/50 text-[var(--color-foreground)]',
        className,
      )}
    >
      {nationality}
    </span>
  )
}

export function PassportStatusBadge({ status, className }: { status: PassportStatus; className?: string }) {
  const key =
    status === 'valid' || status === 'expiring_soon' || status === 'expired' ? status : 'other'
  const visual = DOC_VISUAL[key]
  return (
    <span className={cn(CHIP, visual.shell, visual.text, className)}>
      {PASSPORT_STATUS_LABELS[status]}
    </span>
  )
}

export function VisaStatusBadge({ status, className }: { status: VisaStatus; className?: string }) {
  const key =
    status === 'valid' || status === 'expiring_soon' || status === 'expired' ? status : 'other'
  const visual = DOC_VISUAL[key]
  return (
    <span className={cn(CHIP, visual.shell, visual.text, className)}>
      {VISA_STATUS_LABELS[status]}
    </span>
  )
}
