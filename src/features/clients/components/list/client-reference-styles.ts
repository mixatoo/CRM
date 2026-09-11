export const CLIENT_REFERENCE_CHIP_SIZE = 'h-6 w-[6.5rem]'

export interface ClientReferenceVisual {
  shell: string
  text: string
}

export const CLIENT_REFERENCE_VISUAL = {
  default: {
    shell: 'border-[var(--color-accent)]/35 bg-[var(--color-accent-muted)]/50',
    text: 'text-[var(--color-accent)]',
  },
  copied: {
    shell: 'border-[var(--color-success)]/30 bg-[var(--color-success-muted)]/45',
    text: 'text-[var(--color-success)]',
  },
} satisfies Record<'default' | 'copied', ClientReferenceVisual>
