import {
  hasSectionAccentHeaderDivider,
  type DashboardSectionTheme,
} from '@/features/clients/components/dashboard/client-dashboard-themes'
import { clientWorkspaceFlushSurfaceClassName } from '@/features/clients/components/workspace/client-workspace-chrome'
import { cn } from '@/shared/utils/cn'

/** Single hairline used for every neutral dashboard divider (1px). */
export const dashboardHairlineClassName = 'border-[var(--color-border)]'

/** Vertical stack dividers between field rows. */
export const dashboardDivideYClassName = 'divide-y divide-[var(--color-border)]'

/** Grid dividers for horizontal pulse/profile metric cells. */
export const dashboardGridDivideClassName =
  'divide-y sm:divide-x sm:divide-y-0 divide-[var(--color-border)]'

export const dashboardHeaderClassName = cn(
  'border-b bg-[var(--color-surface-muted)]/40 px-3 py-2 sm:px-4 sm:py-2.5',
  dashboardHairlineClassName,
)

export const dashboardOverviewGridClassName =
  'grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 xl:items-start'

export const dashboardPulseGridClassName =
  'grid min-w-0 flex-1 grid-cols-1 divide-y divide-[var(--color-border)] sm:grid-cols-2 sm:divide-x sm:divide-y-0 md:grid-cols-3 xl:grid-cols-5'

export const dashboardMetricGrid4ClassName =
  'grid min-w-0 flex-1 grid-cols-1 divide-y divide-[var(--color-border)] sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4'

export const dashboardMetricGrid2ClassName =
  'grid min-w-0 flex-1 grid-cols-1 divide-y divide-[var(--color-border)] sm:grid-cols-2 sm:divide-x sm:divide-y-0'

export function dashboardMetricGridClassName(columns: 2 | 4 | 5): string {
  if (columns === 2) return dashboardMetricGrid2ClassName
  if (columns === 4) return dashboardMetricGrid4ClassName
  return dashboardPulseGridClassName
}

/** Stacked dashboard blocks with breathing room between sections. */
export const clientDashboardSectionStackClassName =
  'flex min-h-0 flex-1 flex-col gap-1.5 bg-[var(--color-bg)] p-1.5 sm:p-2'

export const clientDashboardSectionClassName = cn(
  'min-w-0 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]',
)

/** Flush dashboard section inside the client workspace shell. */
export const clientDashboardFlushPanelClassName = cn(clientWorkspaceFlushSurfaceClassName, 'min-w-0')

export function dashboardSectionHeaderClassName(title: string, theme?: DashboardSectionTheme) {
  const base = 'bg-[var(--color-surface-muted)]/40 px-4 py-2 border-b'

  if (hasSectionAccentHeaderDivider(title) && theme?.headerDivider) {
    return cn(base, theme.headerDivider)
  }

  return cn(base, dashboardHairlineClassName)
}

export function dashboardSectionSeparatorClassName() {
  return cn('border-t', dashboardHairlineClassName)
}

export function dashboardTitleRowClassName(theme?: DashboardSectionTheme) {
  return cn(
    'flex items-center gap-2 border-l pl-2',
    theme?.borderAccent ?? 'border-l-[var(--color-accent)]',
  )
}

export const dashboardTitleClassName =
  'text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-foreground)]'

export function dashboardSectionIconWrapClassName(theme?: DashboardSectionTheme) {
  return cn('flex shrink-0 items-center justify-center', theme?.iconWrap ?? 'text-[var(--color-accent)]')
}

export const dashboardSectionIconClassName = 'h-3.5 w-3.5'

export const dashboardFieldCellClassName = 'min-w-0 px-4 py-2.5'

export const dashboardFieldLabelClassName =
  'text-xs font-medium leading-snug text-[var(--color-muted)]'

export const dashboardFieldValueClassName =
  'text-xs font-normal leading-snug text-[var(--color-foreground)]'
