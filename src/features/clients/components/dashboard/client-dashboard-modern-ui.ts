import type { CrmFieldTone } from '@/design-system/layout/CrmPanel'
import { cn } from '@/shared/utils/cn'

export type DashboardMetricTone = 'accent' | 'success' | 'warning' | 'neutral'

export type DashboardViewId = 'overview' | 'finance' | 'pipeline'

export const DASHBOARD_VIEWS: Array<{ id: DashboardViewId; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'finance', label: 'Finance' },
  { id: 'pipeline', label: 'Pipeline' },
]

export const dashboardShellClassName =
  'flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--color-surface)]'

export const dashboardBodyClassName = 'flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain'

export const dashboardHeaderClassName = 'sr-only'

export const dashboardShellHeaderClassName =
  'flex shrink-0 items-center justify-between gap-3 border-b border-[var(--color-border)]/75 px-3 py-2.5 sm:px-4'

export const dashboardTitleClassName = 'text-sm font-medium text-[var(--color-foreground)]'

export const dashboardSubtitleClassName = 'text-[11px] text-[var(--color-muted)]'

export const dashboardCurrencyBadgeClassName = 'text-[10px] tabular-nums text-[var(--color-muted)]'

/** CRM section panels */
export const dashboardCrmPanelClassName =
  'overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]/80 bg-[var(--color-surface)] shadow-[0_1px_3px_rgba(15,23,42,0.04)]'

export const dashboardCrmPanelHeaderClassName =
  'flex items-start justify-between gap-3 border-b border-[var(--color-border)]/70 bg-[var(--color-surface-muted)]/25 px-3 py-3 sm:px-4'

export const dashboardCrmSectionEyebrowClassName =
  'text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)]'

export const dashboardCrmPanelTitleClassName =
  'text-sm font-semibold tracking-[-0.01em] text-[var(--color-foreground)]'

export const dashboardCrmPanelSubtitleClassName = 'mt-0.5 text-[11px] text-[var(--color-muted)]'

export const dashboardCrmCurrencyClassName =
  'inline-flex shrink-0 items-center rounded-full border border-[var(--color-border)]/70 bg-[var(--color-surface)] px-2.5 py-1 text-[11px] font-semibold tabular-nums text-[var(--color-foreground)] shadow-sm'

export const dashboardCrmFinancialGridClassName =
  'grid grid-cols-2 divide-x divide-y divide-[var(--color-border)]/65 lg:grid-cols-4 lg:divide-y-0'

export const dashboardCrmOpsSectionClassName =
  'border-t border-[var(--color-border)]/65 bg-[var(--color-surface-muted)]/15'

export const dashboardCrmOpsGridClassName =
  'grid grid-cols-2 divide-x divide-y divide-[var(--color-border)]/55 sm:grid-cols-4 sm:divide-y-0'

export const dashboardCrmPipelineSectionClassName = 'space-y-2 border-t border-[var(--color-border)]/55 px-3 py-2.5 sm:px-4'

export const dashboardCrmPipelineBarClassName =
  'flex h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-muted)]/70 ring-1 ring-inset ring-[var(--color-border)]/50'

export const dashboardCrmPipelineLegendClassName = 'flex flex-wrap items-center gap-x-3 gap-y-1'

export const dashboardCrmMetricLabelClassName =
  'text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--color-subtle)]'

export const dashboardCrmMetricValueClassName =
  'font-semibold tabular-nums tracking-tight text-[var(--color-foreground)]'

export const dashboardCrmMetricHintClassName = 'text-[10px] font-medium text-[var(--color-muted)]'

export const dashboardCrmAnalyticsPanelClassName = dashboardCrmPanelClassName

export const dashboardCrmAnalyticsToolbarClassName =
  'flex flex-col gap-2 border-b border-[var(--color-border)]/70 bg-[var(--color-surface-muted)]/20 px-3 py-3 sm:flex-row sm:items-end sm:justify-between sm:px-4'

export const dashboardCrmAnalyticsGridClassName =
  'grid min-w-0 divide-y divide-[var(--color-border)]/65 lg:grid-cols-2 lg:divide-x lg:divide-y-0'

export const dashboardCrmAnalyticsChartClassName = 'flex min-w-0 flex-col'

export const dashboardCrmAnalyticsChartHeaderClassName =
  'flex items-center gap-2 border-b border-[var(--color-border)]/55 bg-[var(--color-surface)] px-3 py-2 sm:px-4'

export const dashboardCrmAnalyticsChartBodyClassName =
  'min-h-0 flex-1 px-2 py-2.5 sm:px-3 sm:py-3'

export const dashboardContentClassName =
  'flex flex-col gap-3.5 px-3 py-3 sm:gap-4 sm:px-4 sm:py-4'

/** Single dense surface — minimal chrome */
export const dashboardCompactCardClassName = dashboardCrmPanelClassName

export const dashboardStatsGridClassName =
  'grid grid-cols-2 divide-x divide-y divide-[var(--color-border)]/65 sm:grid-cols-4'

export function dashboardStatCellClassName(tone?: DashboardMetricTone) {
  return cn(
    'group relative px-3 py-2.5 transition-colors hover:bg-[var(--color-surface-muted)]/30 sm:py-2',
    tone === 'accent' && 'bg-[var(--color-accent)]/[0.02]',
  )
}

export const dashboardStatsFooterClassName =
  'flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-[var(--color-border)]/65 px-3 py-2 text-[10px] text-[var(--color-muted)]'

export const dashboardPanelClassName = dashboardCompactCardClassName

export const dashboardFloatCardClassName = dashboardCompactCardClassName

export const dashboardPanelMutedClassName =
  'overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-surface-muted)]/25 ring-1 ring-[var(--color-border)]/60'

export const dashboardSectionBlockClassName = 'min-w-0'

export const dashboardSectionEyebrowClassName =
  'text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-subtle)]'

export const dashboardSectionTitleClassName = 'text-xs font-medium text-[var(--color-foreground)]'

export const dashboardSectionSubtitleClassName = 'hidden'

export const dashboardChartCardClassName = dashboardCompactCardClassName

export const dashboardChartToolbarClassName =
  'flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)]/65 px-3 py-1.5'

export const dashboardChartDualGridClassName =
  'grid min-w-0 divide-y divide-[var(--color-border)]/65 lg:grid-cols-2 lg:divide-x lg:divide-y-0'

export const dashboardChartCellHeaderClassName =
  'flex items-center gap-1.5 border-b border-[var(--color-border)]/55 bg-[var(--color-surface-muted)]/15 px-2.5 py-1'

export const dashboardChartGridClassName = dashboardChartDualGridClassName

export const dashboardOpsGridClassName = 'grid gap-3'

export const dashboardOpsCardClassName = cn(dashboardCompactCardClassName, 'p-3')

export const dashboardOpsRowClassName =
  'flex items-center justify-between gap-2 border-b border-[var(--color-border)]/55 py-1.5 last:border-b-0'

export const dashboardPipelineBarClassName = 'flex h-1 overflow-hidden rounded-full bg-[var(--color-surface-muted)]/70'

export const dashboardMetricGridClassName = dashboardStatsGridClassName

export function dashboardMetricCardClassName(tone?: DashboardMetricTone) {
  return dashboardStatCellClassName(tone)
}

export const dashboardMetricLabelClassName =
  'text-[9px] font-medium uppercase tracking-[0.06em] text-[var(--color-subtle)]'

export const dashboardMetricValueClassName =
  'text-sm font-semibold tabular-nums tracking-tight text-[var(--color-foreground)]'

export function dashboardMetricValueSizeClassName(_size?: 'hero' | 'lg' | 'md' | boolean) {
  return 'text-sm font-semibold sm:text-[15px]'
}

export const dashboardMetricHintClassName = 'text-[10px] text-[var(--color-muted)]'

const TONE_TEXT: Record<DashboardMetricTone, string> = {
  accent: 'text-[var(--color-accent)]',
  success: 'text-[var(--color-success)]',
  warning: 'text-[var(--color-warning)]',
  neutral: 'text-[var(--color-foreground)]',
}

const TONE_BG: Record<DashboardMetricTone, string> = {
  accent: 'text-[var(--color-accent)]',
  success: 'text-[var(--color-success)]',
  warning: 'text-[var(--color-warning)]',
  neutral: 'text-[var(--color-muted)]',
}

const TONE_BAR: Record<DashboardMetricTone, string> = {
  accent: 'bg-[var(--color-accent)]',
  success: 'bg-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]',
  neutral: 'bg-[var(--color-border-strong)]',
}

export function dashboardToneTextClassName(tone: DashboardMetricTone = 'neutral') {
  return TONE_TEXT[tone]
}

export function dashboardToneBadgeClassName(tone: DashboardMetricTone = 'neutral') {
  return TONE_BG[tone]
}

export function dashboardToneBarClassName(tone: DashboardMetricTone = 'neutral') {
  return TONE_BAR[tone]
}

export function dashboardToneDotClassName(tone: DashboardMetricTone = 'neutral') {
  return cn('h-1.5 w-1.5 shrink-0 rounded-full', TONE_BAR[tone])
}

export const dashboardSegmentedRailClassName =
  'inline-flex items-center gap-0.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)]/45 p-0.5'

export function dashboardSegmentButtonClassName(isActive: boolean) {
  return cn(
    'rounded-[calc(var(--radius-sm)-1px)] px-2 py-0.5 text-[10px] font-medium leading-none whitespace-nowrap transition-colors',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]/30',
    isActive
      ? 'bg-[var(--color-surface)] text-[var(--color-foreground)] ring-1 ring-[var(--color-border)]/70'
      : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]',
  )
}

export const modernDashboardEyebrowClassName = dashboardSectionEyebrowClassName
export const modernDashboardPageTitleClassName = dashboardTitleClassName
export const modernDashboardPageDescriptionClassName = dashboardSubtitleClassName
export const modernDashboardSectionTitleClassName = dashboardSectionTitleClassName
export const modernDashboardSectionDescriptionClassName = 'text-xs text-[var(--color-muted)]'

export const dashboardCommandHeaderClassName =
  'relative overflow-hidden rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent)]/85 px-4 py-4 text-white'

export const dashboardCommandHeaderGlowClassName =
  'pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10'

/** Modern studio dashboard — airy split layout */
export const modernDashCanvasClassName =
  'flex flex-col gap-6 bg-[var(--color-bg)] p-4 sm:gap-7 sm:p-5 lg:p-6'

export const modernDashCardClassName =
  'overflow-hidden rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface)]'

export const modernDashHeroClassName = modernDashCardClassName

export const modernDashHeroGlowClassName = 'hidden'

export const modernDashHeroGlowSecondaryClassName = 'hidden'

export const modernDashEyebrowClassName =
  'text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-subtle)]'

export const modernDashTitleClassName =
  'text-lg font-semibold tracking-[-0.02em] text-[var(--color-foreground)] sm:text-xl'

export const modernDashKpiLabelClassName =
  'text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-subtle)]'

export const modernDashKpiValueClassName =
  'text-2xl font-semibold tracking-[-0.03em] tabular-nums text-[var(--color-foreground)] sm:text-[1.75rem]'

export const modernDashKpiHintClassName = 'mt-1 text-[11px] text-[var(--color-muted)]'

export const modernDashBentoClassName = 'grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.7fr)] xl:gap-6'

export const modernDashSegmentRailClassName =
  'inline-flex items-center gap-1 rounded-lg bg-[var(--color-surface-muted)]/80 p-1'

export function modernDashSegmentButtonClassName(isActive: boolean) {
  return cn(
    'rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/25',
    isActive
      ? 'bg-[var(--color-surface)] text-[var(--color-foreground)] shadow-sm'
      : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]',
  )
}

export function modernDashKpiToneClassName(tone?: DashboardMetricTone) {
  if (tone === 'accent') return 'text-[var(--color-accent)]'
  if (tone === 'success') return 'text-[var(--color-success)]'
  if (tone === 'warning') return 'text-[var(--color-warning)]'
  return 'text-[var(--color-foreground)]'
}

export function modernDashIconWrapClassName(tone?: DashboardMetricTone) {
  return cn(
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
    tone === 'accent' && 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]',
    tone === 'success' && 'bg-[var(--color-success-muted)] text-[var(--color-success)]',
    tone === 'warning' && 'bg-[var(--color-warning-muted)] text-[var(--color-warning)]',
    (!tone || tone === 'neutral') && 'bg-[var(--color-surface-muted)] text-[var(--color-muted)]',
  )
}

export function modernDashPipelineCardClassName(tone: DashboardMetricTone) {
  return cn(
    'relative flex min-w-0 flex-1 flex-col gap-2 rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface)] px-4 py-4',
    tone === 'accent' && 'hover:border-[var(--color-accent)]/35',
    tone === 'success' && 'hover:border-[var(--color-success)]/35',
    tone === 'warning' && 'hover:border-[var(--color-warning)]/35',
  )
}

export function modernDashPipelineAccentClassName(tone: DashboardMetricTone) {
  return cn(
    'h-1 w-8 rounded-full',
    tone === 'accent' && 'bg-[var(--color-accent)]',
    tone === 'success' && 'bg-[var(--color-success)]',
    tone === 'warning' && 'bg-[var(--color-warning)]',
    tone === 'neutral' && 'bg-[var(--color-border)]',
  )
}

export const modernDashOpsStripClassName =
  'grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-border)]/70 sm:grid-cols-4'

export const modernDashQuickLinkClassName =
  'text-[12px] font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)]'

export const modernDashMetricRailClassName =
  'grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-border)]/70 sm:grid-cols-3 xl:grid-cols-6'

export const modernDashMetricCellClassName =
  'group relative bg-[var(--color-surface)] px-4 py-4 transition-colors hover:bg-[var(--color-surface-elevated)] sm:px-5 sm:py-5'

export const modernDashChartStackClassName = 'flex flex-col gap-5'

export const modernDashAsideClassName = 'flex flex-col gap-5'

/** @deprecated */
export const dashboardCanvasClassName = dashboardShellClassName
export const dashboardHeroClassName = dashboardCompactCardClassName
export const dashboardHeroMiniGridClassName = dashboardStatsGridClassName
export const dashboardHeroMiniStatClassName = dashboardStatCellClassName()
export const dashboardKpiRailClassName = dashboardStatsGridClassName
export const dashboardKpiBentoClassName = dashboardStatsGridClassName
export const dashboardKpiGridClassName = dashboardStatsGridClassName
export function dashboardKpiRailCellClassName(tone?: DashboardMetricTone) {
  return dashboardStatCellClassName(tone)
}
export function dashboardKpiCardClassName(opts?: { featured?: boolean; wide?: boolean; tone?: DashboardMetricTone }) {
  return dashboardStatCellClassName(opts?.tone)
}
export const dashboardMegaPanelClassName = dashboardCompactCardClassName
export const dashboardMegaSectionClassName = ''
export const dashboardTabBarClassName = ''
export function dashboardTabButtonClassName(isActive: boolean) {
  return dashboardSegmentButtonClassName(isActive)
}
export const dashboardOpsPanelClassName = dashboardOpsCardClassName
export const dashboardPipelineFlowClassName = 'flex gap-1.5'
export const dashboardPipelineStepClassName = dashboardStatCellClassName()
export const dashboardPipelineChipClassName = dashboardStatCellClassName()
export const dashboardOpsAsideClassName = 'space-y-2'
export const dashboardStatRowClassName = 'flex flex-wrap gap-2'
export const dashboardStatTileClassName = dashboardStatCellClassName()
export const dashboardStatChipClassName = dashboardStatCellClassName()
export const dashboardStatsRowClassName = dashboardStatRowClassName
export const dashboardMetricStripClassName = dashboardStatsGridClassName
export const dashboardMetricCellClassName = ''
export const dashboardToolbarClassName = dashboardHeaderClassName
export const dashboardViewTabClassName = dashboardSegmentButtonClassName

/** @deprecated */
export type DashboardSectionId = 'financial' | 'activity' | 'operations'
export type ModernMetricTone = DashboardMetricTone
export const dashboardCardClassName = dashboardCompactCardClassName
export const dashboardCardInteractiveClassName = ''
export const modernDashboardCanvasClassName = dashboardShellClassName
export const modernDashboardCardClassName = dashboardCompactCardClassName
export const modernDashboardTileClassName = dashboardCompactCardClassName
export const modernDashboardLabelClassName = dashboardMetricLabelClassName
export const modernDashboardHintClassName = dashboardMetricHintClassName
export function dashboardIconWrapClassName() {
  return 'hidden'
}
export function dashboardCardToneRingClassName() {
  return ''
}
export function modernDashboardIconWrapClassName() {
  return 'hidden'
}
export function modernDashboardAccentBarClassName() {
  return 'hidden'
}
export function modernDashboardValueClassName() {
  return dashboardMetricValueClassName
}
export function dashboardMetricValueClassNameLegacy() {
  return dashboardMetricValueClassName
}
export function crmToneToModern(tone?: CrmFieldTone): DashboardMetricTone {
  if (tone === 'success') return 'success'
  if (tone === 'warning') return 'warning'
  if (tone === 'accent') return 'accent'
  return 'neutral'
}
export { dashboardMetricValueClassName as dashboardMetricValueClassNameWithTone }
