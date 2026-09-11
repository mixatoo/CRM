import type { SupplierStatus } from '@/domain/entities/supplier'

export const SUPPLIER_STATUS_CHIP_SIZE = 'h-6 w-[6.5rem]'

export interface SupplierStatusVisual {
  shell: string
  text: string
}

/** Distinct palette per supplier status — matches trip stage badge shell pattern. */
export const SUPPLIER_STATUS_VISUAL: Record<SupplierStatus, SupplierStatusVisual> = {
  active: {
    shell: 'border-[var(--color-success)]/30 bg-[var(--color-success-muted)]/45',
    text: 'text-[var(--color-success)]',
  },
  inactive: {
    shell: 'border-[var(--color-border-strong)] bg-[var(--color-surface-elevated)]',
    text: 'text-[var(--color-subtle)]',
  },
  prospect: {
    shell: 'border-[var(--color-warning)]/35 bg-[var(--color-warning-muted)]/35',
    text: 'text-[var(--color-warning)]',
  },
}
