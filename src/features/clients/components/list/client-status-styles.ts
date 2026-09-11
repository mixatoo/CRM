import type { ClientStatus } from '@/domain/entities/client'

export const CLIENT_STATUS_CHIP_SIZE = 'h-6 w-[6.5rem]'

export interface ClientStatusVisual {
  shell: string
  text: string
}

/** Distinct palette per client status — matches trip stage badge shell pattern. */
export const CLIENT_STATUS_VISUAL: Record<ClientStatus, ClientStatusVisual> = {
  active: {
    shell: 'border-[var(--color-success)]/30 bg-[var(--color-success-muted)]/45',
    text: 'text-[var(--color-success)]',
  },
  inactive: {
    shell: 'border-[var(--color-border-strong)] bg-[var(--color-surface-elevated)]',
    text: 'text-[var(--color-subtle)]',
  },
  blocked: {
    shell: 'border-[var(--color-danger)]/35 bg-[var(--color-danger-muted)]/45',
    text: 'text-[var(--color-danger)]',
  },
}
