import { cn } from '@/shared/utils/cn'

/** Master-detail: section list | detail pane */
export const clientProfileBrowseGridClassName =
  'grid-cols-1 md:grid-cols-[13.5rem_minmax(0,1fr)]'

export const clientProfileListColumnClassName =
  'flex min-h-0 flex-col overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]/25 md:border-b-0 md:border-r md:py-3 md:pl-2 md:pr-2'

export const clientProfileListHeaderClassName =
  'hidden px-2.5 pb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-subtle)] md:block'

export const clientProfileListNavClassName =
  'flex gap-1 overflow-x-auto overscroll-x-contain px-2 py-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] md:flex-col md:gap-0.5 md:overflow-y-auto md:overflow-x-hidden md:px-0 md:py-0 md:[scrollbar-width:thin] [&::-webkit-scrollbar]:hidden md:[&::-webkit-scrollbar]:auto'

export function clientProfileListItemClassName(isActive: boolean, locked?: boolean) {
  return cn(
    'group flex w-full min-w-0 shrink-0 items-center gap-2.5 rounded-[var(--radius-md)] px-2.5 py-2 text-left transition-[background-color,box-shadow,color] duration-200 md:w-full',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/25 focus-visible:ring-offset-1',
    locked && 'cursor-not-allowed opacity-45',
    isActive
      ? 'bg-[var(--color-surface)] shadow-[0_1px_2px_rgba(15,23,42,0.05)] ring-1 ring-[var(--color-border)]/80 md:shadow-none'
      : 'hover:bg-[var(--color-surface)]/70 md:hover:bg-[var(--color-surface)]/55',
  )
}

export function clientProfileListItemIconClassName(isActive: boolean, isComplete: boolean) {
  return cn(
    'flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] transition-colors',
    isActive
      ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
      : isComplete
        ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
        : 'bg-[var(--color-surface)]/80 text-[var(--color-muted)] ring-1 ring-[var(--color-border)]/60 group-hover:text-[var(--color-foreground)]',
  )
}

export function clientProfileListItemLabelClassName(isActive: boolean) {
  return cn(
    'min-w-0 flex-1 truncate text-xs font-medium leading-tight',
    isActive ? 'text-[var(--color-foreground)]' : 'text-[var(--color-muted)] group-hover:text-[var(--color-foreground)]',
  )
}

export const clientProfileDetailColumnClassName =
  'flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-[var(--color-surface)]'

export const clientProfileDetailHeaderClassName =
  'sticky top-0 z-[1] shrink-0 border-b border-[var(--color-border)]/80 bg-[var(--color-surface)]/95 px-4 py-3.5 backdrop-blur-sm supports-[backdrop-filter]:bg-[var(--color-surface)]/90 sm:px-5 sm:py-4'

export const clientProfileDetailTitleClassName =
  'text-[15px] font-semibold tracking-[-0.02em] text-[var(--color-foreground)] sm:text-base'

export const clientProfileDetailDescClassName =
  'mt-1 text-[12px] leading-relaxed text-[var(--color-muted)]'

export const clientProfileDetailBodyClassName =
  'flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain'

export const clientProfileDetailScrollClassName =
  'min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2 sm:px-4 sm:py-3'

export const clientProfileContentFadeClassName = 'animate-fade-in'

export const clientProfileFooterClassName =
  'shrink-0 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 sm:px-4 sm:py-2.5'

export const clientProfileFooterInnerClassName =
  'flex w-full items-center gap-3'

/** Legacy aliases for form wizard sidebar */
export const clientProfileBrowseBandClassName = ''
export const clientProfileTabBandClassName = ''
export const clientProfileStepRailClassName = clientProfileListNavClassName
export const clientProfileMobileStepRailClassName = clientProfileListNavClassName
