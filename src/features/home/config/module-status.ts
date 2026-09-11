export type ModuleStatus = 'live' | 'partial' | 'planned'

export const MODULE_STATUS_LABEL: Record<ModuleStatus, string> = {
  live: 'Live',
  partial: 'In progress',
  planned: 'Planned',
}

export const MODULE_STATUS_CLASS: Record<ModuleStatus, string> = {
  live: 'bg-[var(--color-success-muted)] text-[var(--color-success)]',
  partial: 'bg-[var(--color-warning-muted)] text-[var(--color-warning)]',
  planned: 'bg-[var(--color-surface-muted)] text-[var(--color-muted)]',
}

export interface ModuleStatusEntry {
  name: string
  status: ModuleStatus
  note: string
}
