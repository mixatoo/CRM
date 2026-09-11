import type { ClientType } from '../stubs/domain-client'
import { ACCOUNT_NAME_AVATAR_PALETTE } from './account-name-avatar'

export const CLIENT_TYPE_CHIP_SIZE = 'h-6 w-[6.5rem]'

export interface ClientTypeVisual {
  shell: string
  text: string
}

const CLIENT_TYPE_ICON_PALETTE_INDEX: Record<ClientType, number> = {
  corporate: 6,
  individual: 5,
}

export const CLIENT_TYPE_ICON_VISUAL: Record<ClientType, ClientTypeVisual> = {
  corporate: ACCOUNT_NAME_AVATAR_PALETTE[CLIENT_TYPE_ICON_PALETTE_INDEX.corporate]!,
  individual: ACCOUNT_NAME_AVATAR_PALETTE[CLIENT_TYPE_ICON_PALETTE_INDEX.individual]!,
}

export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  corporate: 'Corporate',
  individual: 'Individual',
}

export const CLIENT_TYPE_VISUAL: Record<ClientType, ClientTypeVisual> = {
  individual: {
    shell: 'border-[var(--color-warning)]/35 bg-[var(--color-warning-muted)]/50',
    text: 'text-[var(--color-warning)]',
  },
  corporate: {
    shell: 'border-[var(--color-info)]/35 bg-[var(--color-info-muted)]/50',
    text: 'text-[var(--color-info)]',
  },
}
