import { cn } from '@/shared/utils/cn'

export const CLIENT_WORKSPACE_GROUP_LABELS = {
  overview: 'Overview',
  profile: 'Account',
  operations: 'Operations',
} as const

/** Tab band — aligned with toolbar horizontal padding. */
export const clientWorkspaceTabsBandClassName =
  'border-t border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5 sm:px-4 sm:py-2'

export const clientWorkspaceTabsScrollClassName =
  'flex min-w-0 items-center overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]'

/** Segmented rail — modern pill track for workspace sections. */
export const clientWorkspaceTabsRailClassName =
  'flex w-max max-w-full min-h-8 items-center gap-0.5 rounded-[var(--radius-md)] bg-[var(--color-surface-muted)]/40 p-0.5 ring-1 ring-inset ring-[var(--color-border)]/65'

export const clientWorkspaceTabGroupClassName = 'flex shrink-0 items-center gap-0.5'

export const clientWorkspaceTabGroupDividerClassName =
  'mx-1 hidden h-4 w-px shrink-0 bg-[var(--color-border)]/75 sm:block'

export function clientWorkspaceTabClassName(isActive: boolean) {
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

export function clientWorkspaceTabIconWrapClassName(isActive: boolean) {
  return cn(
    'flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] transition-colors duration-200',
    isActive
      ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
      : 'text-[var(--color-muted)] group-hover:text-[var(--color-foreground)]',
  )
}

export function clientWorkspaceTabIconClassName(isActive: boolean) {
  return cn(
    'h-3.5 w-3.5 shrink-0 transition-[stroke-width] duration-200',
    isActive ? 'stroke-[2.25]' : 'stroke-[1.75]',
  )
}
