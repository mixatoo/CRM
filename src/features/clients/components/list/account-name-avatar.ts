/** Ten distinct avatar tints for account name initials — stable per client id. */
export const ACCOUNT_NAME_AVATAR_PALETTE = [
  {
    shell: 'bg-[var(--color-accent-muted)]/75 border border-[var(--color-accent)]/30',
    text: 'text-[var(--color-accent)]',
  },
  {
    shell: 'bg-[var(--color-info-muted)]/75 border border-[var(--color-info)]/30',
    text: 'text-[var(--color-info)]',
  },
  {
    shell: 'bg-[var(--color-success-muted)]/80 border border-[var(--color-success)]/30',
    text: 'text-[var(--color-success)]',
  },
  {
    shell: 'bg-[var(--color-warning-muted)]/85 border border-[var(--color-warning)]/30',
    text: 'text-[var(--color-warning)]',
  },
  {
    shell: 'bg-[var(--color-danger-muted)]/80 border border-[var(--color-danger)]/30',
    text: 'text-[var(--color-danger)]',
  },
  {
    shell: 'bg-[var(--color-vip-muted)]/80 border border-[var(--color-vip)]/30',
    text: 'text-[var(--color-vip)]',
  },
  {
    shell: 'bg-[var(--color-stage-negotiation-muted)]/85 border border-[var(--color-stage-negotiation)]/30',
    text: 'text-[var(--color-stage-negotiation)]',
  },
  {
    shell: 'bg-[var(--color-stage-active-muted)]/80 border border-[var(--color-stage-active)]/30',
    text: 'text-[var(--color-stage-active)]',
  },
  {
    shell: 'bg-[var(--color-stage-upcoming-muted)]/80 border border-[var(--color-stage-upcoming)]/30',
    text: 'text-[var(--color-stage-upcoming)]',
  },
  {
    shell: 'bg-[var(--color-stage-recent-muted)]/80 border border-[var(--color-stage-recent)]/30',
    text: 'text-[var(--color-stage-recent)]',
  },
] as const

export function accountNameAvatarPaletteIndex(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return hash % ACCOUNT_NAME_AVATAR_PALETTE.length
}

export function accountNameInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase()
  return `${parts[0]!.charAt(0)}${parts[1]!.charAt(0)}`.toUpperCase()
}
