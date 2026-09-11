import type { ReactNode } from 'react'
import { ClientDashboardSegmentedControl } from '@/features/clients/components/dashboard/ClientDashboardSegmentedControl'
import {
  dashboardCrmAnalyticsChartBodyClassName,
  dashboardCrmAnalyticsChartClassName,
  dashboardCrmAnalyticsChartHeaderClassName,
  dashboardCrmAnalyticsGridClassName,
  dashboardCrmAnalyticsPanelClassName,
  dashboardCrmAnalyticsToolbarClassName,
  dashboardCrmPanelSubtitleClassName,
  dashboardCrmPanelTitleClassName,
  dashboardCrmSectionEyebrowClassName,
  dashboardToneBarClassName,
} from '@/features/clients/components/dashboard/client-dashboard-modern-ui'
import { cn } from '@/shared/utils/cn'

interface ClientDashboardAnalyticsProps {
  granularity: 'month' | 'year'
  onGranularityChange: (value: 'month' | 'year') => void
  revenueChart: ReactNode
  tripsChart: ReactNode
  variant?: 'panel' | 'flat'
}

const CHART_META = [
  { key: 'revenue', label: 'Revenue trend', description: 'Billable trip selling value', tone: 'accent' as const },
  { key: 'trips', label: 'Trip volume', description: 'Bookings started over time', tone: 'success' as const },
]

export function ClientDashboardAnalytics({
  granularity,
  onGranularityChange,
  revenueChart,
  tripsChart,
  variant = 'panel',
}: ClientDashboardAnalyticsProps) {
  const charts = [revenueChart, tripsChart]

  if (variant === 'flat') {
    return (
      <div className="divide-y divide-[var(--color-border)]/40">
        {CHART_META.map((meta, index) => (
          <div key={meta.key}>
            <div className="flex min-h-10 items-center bg-[var(--color-surface-muted)]/25 px-4">
              <span className={cn('mr-2 h-3 w-0.5 shrink-0 rounded-full', dashboardToneBarClassName(meta.tone))} aria-hidden />
              <div className="min-w-0">
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
                  {meta.label}
                </h4>
              </div>
            </div>
            <div className={dashboardCrmAnalyticsChartBodyClassName}>{charts[index]}</div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <section className={dashboardCrmAnalyticsPanelClassName}>
      <header className={dashboardCrmAnalyticsToolbarClassName}>
        <div className="min-w-0">
          <p className={dashboardCrmSectionEyebrowClassName}>Analytics</p>
          <h2 className={dashboardCrmPanelTitleClassName}>Performance trends</h2>
          <p className={dashboardCrmPanelSubtitleClassName}>Revenue and booking activity over time</p>
        </div>
        <ClientDashboardSegmentedControl
          variant="workspace"
          value={granularity}
          onChange={onGranularityChange}
          ariaLabel="Chart period"
          options={[
            { value: 'month', label: 'Month' },
            { value: 'year', label: 'Year' },
          ]}
        />
      </header>

      <div className={dashboardCrmAnalyticsGridClassName}>
        {CHART_META.map((meta, index) => (
          <div key={meta.key} className={dashboardCrmAnalyticsChartClassName}>
            <div className={dashboardCrmAnalyticsChartHeaderClassName}>
              <span className={cn('h-4 w-0.5 shrink-0 rounded-full', dashboardToneBarClassName(meta.tone))} aria-hidden />
              <div className="min-w-0">
                <p className="text-xs font-medium text-[var(--color-foreground)]">{meta.label}</p>
                <p className="text-[10px] text-[var(--color-muted)]">{meta.description}</p>
              </div>
            </div>
            <div className={dashboardCrmAnalyticsChartBodyClassName}>{charts[index]}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
