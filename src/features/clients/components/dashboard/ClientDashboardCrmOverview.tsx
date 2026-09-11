import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Skeleton } from '@/design-system/components/Skeleton'
import {
  dashboardCrmCurrencyClassName,
  dashboardCrmFinancialGridClassName,
  dashboardCrmMetricHintClassName,
  dashboardCrmMetricLabelClassName,
  dashboardCrmMetricValueClassName,
  dashboardCrmOpsGridClassName,
  dashboardCrmOpsSectionClassName,
  dashboardCrmPanelClassName,
  dashboardCrmPanelHeaderClassName,
  dashboardCrmPanelSubtitleClassName,
  dashboardCrmPanelTitleClassName,
  dashboardCrmPipelineBarClassName,
  dashboardCrmPipelineLegendClassName,
  dashboardCrmPipelineSectionClassName,
  dashboardCrmSectionEyebrowClassName,
  dashboardToneBarClassName,
  dashboardToneDotClassName,
  dashboardToneTextClassName,
  type DashboardMetricTone,
} from '@/features/clients/components/dashboard/client-dashboard-modern-ui'
import { cn } from '@/shared/utils/cn'

export interface DashboardStatItem {
  label: string
  value: ReactNode
  hint?: ReactNode
  tone?: DashboardMetricTone
  href?: string
}

interface ClientDashboardCrmOverviewProps {
  currency: string
  financial: DashboardStatItem[]
  operations: DashboardStatItem[]
  isLoading?: boolean
  pipeline?: { open: number; won: number; lost: number }
  formatCount: (n: number) => string
}

export function ClientDashboardCrmOverview({
  currency,
  financial,
  operations,
  isLoading,
  pipeline,
  formatCount,
}: ClientDashboardCrmOverviewProps) {
  const pipelineTotal = Math.max(1, (pipeline?.open ?? 0) + (pipeline?.won ?? 0) + (pipeline?.lost ?? 0))

  return (
    <article className={dashboardCrmPanelClassName}>
      <header className={dashboardCrmPanelHeaderClassName}>
        <div className="min-w-0">
          <p className={dashboardCrmSectionEyebrowClassName}>Overview</p>
          <h2 className={dashboardCrmPanelTitleClassName}>Account performance</h2>
          <p className={dashboardCrmPanelSubtitleClassName}>Financial health, invoices, and trip pipeline</p>
        </div>
        <span className={dashboardCrmCurrencyClassName}>{currency}</span>
      </header>

      <section aria-label="Financial metrics">
        <div className={dashboardCrmFinancialGridClassName}>
          {financial.map((item) => (
            <CrmMetricCell key={item.label} {...item} isLoading={isLoading} emphasis />
          ))}
        </div>
      </section>

      <section className={dashboardCrmOpsSectionClassName} aria-label="Operations metrics">
        <div className={dashboardCrmOpsGridClassName}>
          {operations.map((item) => (
            <CrmMetricCell key={item.label} {...item} isLoading={isLoading} />
          ))}
        </div>

        {pipeline ? (
          <div className={dashboardCrmPipelineSectionClassName}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className={dashboardCrmMetricLabelClassName}>Trip pipeline</p>
              <div className={dashboardCrmPipelineLegendClassName}>
                <PipelineLegendItem label="Open" value={formatCount(pipeline.open)} tone="accent" isLoading={isLoading} />
                <PipelineLegendItem label="Won" value={formatCount(pipeline.won)} tone="success" isLoading={isLoading} />
                <PipelineLegendItem label="Lost" value={formatCount(pipeline.lost)} tone="warning" isLoading={isLoading} />
              </div>
            </div>
            <div className={dashboardCrmPipelineBarClassName}>
              <div className={cn('h-full', dashboardToneBarClassName('accent'))} style={{ width: `${((pipeline.open ?? 0) / pipelineTotal) * 100}%` }} />
              <div className={cn('h-full', dashboardToneBarClassName('success'))} style={{ width: `${((pipeline.won ?? 0) / pipelineTotal) * 100}%` }} />
              <div className={cn('h-full', dashboardToneBarClassName('warning'))} style={{ width: `${((pipeline.lost ?? 0) / pipelineTotal) * 100}%` }} />
            </div>
          </div>
        ) : null}
      </section>
    </article>
  )
}

function CrmMetricCell({
  label,
  value,
  hint,
  tone = 'neutral',
  href,
  isLoading,
  emphasis = false,
}: DashboardStatItem & { isLoading?: boolean; emphasis?: boolean }) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className={dashboardCrmMetricLabelClassName}>{label}</p>
        {href && !isLoading ? (
          <ArrowUpRight className="h-3 w-3 shrink-0 text-[var(--color-subtle)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100" aria-hidden />
        ) : null}
      </div>
      {isLoading ? (
        <Skeleton className={cn('mt-1.5', emphasis ? 'h-5 w-24' : 'h-4 w-16')} />
      ) : (
        <p className={cn('mt-1', dashboardCrmMetricValueClassName, emphasis && 'text-base sm:text-[17px]', dashboardToneTextClassName(tone))}>
          {value}
        </p>
      )}
      {hint && !isLoading ? (
        <p className={cn('mt-1', dashboardCrmMetricHintClassName, tone !== 'neutral' && dashboardToneTextClassName(tone))}>{hint}</p>
      ) : null}
    </>
  )

  const cellClass = cn(
    'group relative min-w-0 px-3 py-2.5 transition-colors sm:px-4 sm:py-3',
    href && 'hover:bg-[var(--color-surface-muted)]/35',
    emphasis && 'bg-[var(--color-surface)]',
  )

  if (href && !isLoading) {
    return (
      <Link to={href} className={cn(cellClass, 'block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-accent)]/25')}>
        {body}
      </Link>
    )
  }

  return <div className={cellClass}>{body}</div>
}

function PipelineLegendItem({
  label,
  value,
  tone,
  isLoading,
}: {
  label: string
  value: string
  tone: DashboardMetricTone
  isLoading?: boolean
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--color-muted)]">
      <span className={dashboardToneDotClassName(tone)} aria-hidden />
      <span>{label}</span>
      <span className={cn('font-semibold tabular-nums', dashboardToneTextClassName(tone))}>{isLoading ? '—' : value}</span>
    </span>
  )
}

/** @deprecated use ClientDashboardCrmOverview */
export const ClientDashboardStatsPanel = ClientDashboardCrmOverview

export interface ClientDashboardKpiItem extends DashboardStatItem {
  featured?: boolean
  wide?: boolean
}

export function ClientDashboardMetricGrid({ items, isLoading }: { items: ClientDashboardKpiItem[]; isLoading?: boolean }) {
  return (
    <ClientDashboardCrmOverview
      currency=""
      financial={items.slice(0, 4)}
      operations={items.slice(4)}
      isLoading={isLoading}
      formatCount={(n) => String(n)}
    />
  )
}

export const ClientDashboardKpiRail = ClientDashboardMetricGrid
export const ClientDashboardKpiBento = ClientDashboardMetricGrid
export const ClientDashboardMetricStrip = ClientDashboardMetricGrid
