import { cn } from '@/shared/utils/cn'

export const TRIP_WORKSPACE_GROUP_LABELS = {
  overview: 'Overview',
  operations: 'Operations',
  finance: 'Finance',
  activity: 'Activity',
} as const

export const tripWorkspaceTabsBandClassName =
  'border-t border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5 sm:px-4 sm:py-2'

export const tripWorkspaceTabsScrollClassName =
  'flex min-w-0 items-center overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]'

export const tripWorkspaceTabsRailClassName =
  'flex w-max max-w-full min-h-8 items-center gap-0.5 rounded-[var(--radius-md)] bg-[var(--color-surface-muted)]/40 p-0.5 ring-1 ring-inset ring-[var(--color-border)]/65'

export const tripWorkspaceTabGroupClassName = 'flex shrink-0 items-center gap-0.5'

export const tripWorkspaceTabGroupDividerClassName =
  'mx-1 hidden h-4 w-px shrink-0 bg-[var(--color-border)]/75 sm:block'

export const tripWorkspaceProgressBandClassName =
  'border-t border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-2 sm:px-4'

export const tripWorkspaceToolbarMetaGridClassName =
  'grid min-w-0 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1.5 sm:h-8 sm:grid-cols-[minmax(0,26fr)_minmax(0,20fr)_minmax(0,22fr)_minmax(0,16fr)] sm:gap-0 sm:divide-x sm:divide-y-0 divide-[var(--color-border)]'

export const tripWorkspaceToolbarCellClassName =
  'flex min-h-0 min-w-0 items-center overflow-hidden sm:h-8 sm:px-2'

export const tripWorkspaceToolbarIdentityCellClassName =
  'min-w-0 flex-col justify-center gap-px py-0'

export const tripWorkspaceToolbarLabelsCellClassName =
  'hidden min-w-0 items-center sm:flex sm:h-8 sm:px-2'

export const tripWorkspaceToolbarFinancialsCellClassName =
  'col-span-2 flex min-h-0 min-w-0 items-center justify-start gap-3 sm:col-span-1 sm:h-8 sm:justify-end sm:px-2'

export const tripWorkspaceToolbarBadgesCellClassName =
  'flex min-w-0 items-center justify-end gap-1 sm:h-8 sm:px-2'

export function tripWorkspaceTabClassName(isActive: boolean) {
  return cn(
    'group relative flex min-h-9 shrink-0 items-center gap-1.5 rounded-[calc(var(--radius-md)-3px)] px-2.5 text-[11px] font-medium leading-none tracking-[-0.01em] whitespace-nowrap transition-[color,background-color,box-shadow,transform] duration-200 ease-out sm:h-7 sm:min-h-0 sm:gap-2 sm:px-3 sm:text-xs',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/25 focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-surface-muted)]',
    isActive
      ? cn(
          'bg-[var(--color-surface)] text-[var(--color-foreground)] shadow-[0_1px_2px_rgba(15,23,42,0.06)]',
          'ring-1 ring-[var(--color-border)]/80',
          'dark:shadow-[0_1px_2px_rgba(0,0,0,0.22)]',
        )
      : 'text-[var(--color-muted)] hover:bg-[var(--color-surface)]/55 hover:text-[var(--color-foreground)] active:scale-[0.98]',
  )
}

export function tripWorkspaceTabIconWrapClassName(isActive: boolean) {
  return cn(
    'flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] transition-colors duration-200',
    isActive
      ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
      : 'text-[var(--color-muted)] group-hover:text-[var(--color-foreground)]',
  )
}

export function tripWorkspaceTabIconClassName(isActive: boolean) {
  return cn(
    'h-3.5 w-3.5 shrink-0 transition-[stroke-width] duration-200',
    isActive ? 'stroke-[2.25]' : 'stroke-[1.75]',
  )
}
