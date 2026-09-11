/**
 * Shared layout / visual-density class strings.
 * Breakpoints follow Tailwind defaults: sm 640, md 768, lg 1024, xl 1280, 2xl 1536.
 */
export const layout = {
  /** Full-width shell — fills space after sidebar (ERP/CRM fluid layout) */
  pageFluid: 'w-full min-w-0',
  /** Narrow reading width — forms, prose, marketing copy only */
  proseMax: 'w-full max-w-3xl',
  formMax: 'w-full max-w-md',
  /** Scrollable content pages: 16px → 24px → 32px horizontal padding */
  pageContent: 'px-4 py-4 sm:px-6 sm:py-6 lg:px-8',
  /** Full-height list/workspace shells: tighter vertical, same horizontal rhythm */
  pageViewport: 'px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4',
  /** Denser workspace chrome — client/trip record shells */
  pageViewportDense: 'px-2 py-1 sm:px-2 sm:py-1.5 lg:px-3 lg:py-2',
  stackTight: 'gap-2',
  stack: 'gap-3 sm:gap-4',
  workspaceCards: 'gap-2 sm:gap-3',
  workspaceCardsDense: 'gap-1.5',
  cardPad: 'px-3 py-3 sm:px-4 sm:py-3 lg:px-6',
  cardHeader: 'border-b border-[var(--color-border)] px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6',
  toolbar: 'px-3 py-2 sm:px-4 lg:px-6',
  pageTitle: 'text-base font-semibold tracking-tight text-[var(--color-foreground)] sm:text-lg',
  sectionTitle: 'text-caption font-semibold uppercase tracking-wide text-[var(--color-muted)]',
  cardTitle: 'text-sm font-semibold text-[var(--color-accent)] sm:text-base',
  entityTitle: 'text-sm font-semibold text-[var(--color-foreground)] sm:text-base',
  body: 'text-sm text-[var(--color-foreground)]',
  caption: 'text-xs text-[var(--color-muted)]',
  stat: 'text-xl font-bold tabular-nums text-[var(--color-accent)] sm:text-2xl',
  statLabel: 'text-caption text-[var(--color-muted)]',
  minWidth0: 'min-w-0',
  touchIcon: 'h-10 w-10 sm:h-9 sm:w-9',
  touchSm: 'h-9 px-3 sm:h-8',
  scrollX: 'overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]',
  hideScrollbar:
    '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
  /** Icon-only exit/close (X) buttons — red icon on hover */
  closeIconButton: 'transition-colors hover:text-[var(--color-danger)]',
} as const

/** Responsive CRM field grids — stack on mobile, expand at sm/lg */
export const responsiveGrid = {
  cols2: 'grid-cols-1 sm:grid-cols-2',
  cols3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  cols4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  cols5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
  fieldGrid: 'divide-y sm:divide-x sm:divide-y-0 divide-[var(--color-border)]',
} as const

export type PageWidth = 'fluid' | 'prose'

/** @deprecated Prefer `PageWidth` — maps legacy size props to fluid layout */
export function resolvePageWidth(size?: PageWidth | 'full' | 'lg' | 'md'): PageWidth {
  if (size === 'prose' || size === 'md') return 'prose'
  return 'fluid'
}
