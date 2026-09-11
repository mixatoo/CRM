import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Skeleton } from '@/design-system/components/Skeleton'
import {
  dashboardCurrencyBadgeClassName,
  dashboardHeroClassName,
  dashboardHeroMiniGridClassName,
  dashboardHeroMiniStatClassName,
  dashboardMetricHintClassName,
  dashboardMetricLabelClassName,
  dashboardMetricValueClassName,
  dashboardMetricValueSizeClassName,
  dashboardToneBadgeClassName,
  dashboardToneTextClassName,
  type DashboardMetricTone,
} from '@/features/clients/components/dashboard/client-dashboard-modern-ui'
import { cn } from '@/shared/utils/cn'

interface ClientDashboardHeroProps {
  currency: string
  revenue: ReactNode
  revenueHint?: ReactNode
  href?: string
  isLoading?: boolean
  stats: Array<{
    label: string
    value: ReactNode
    hint?: ReactNode
    tone?: DashboardMetricTone
  }>
}

export function ClientDashboardHero({
  currency,
  revenue,
  revenueHint,
  href,
  isLoading,
  stats,
}: ClientDashboardHeroProps) {
  const headline = (
    <div className="relative z-[1] min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <p className={dashboardMetricLabelClassName}>Total revenue</p>
        <span className={dashboardCurrencyBadgeClassName}>{currency}</span>
      </div>
      {isLoading ? (
        <div className="mt-3 space-y-2">
          <Skeleton className="h-10 w-48 sm:h-12 sm:w-56" />
          <Skeleton className="h-3 w-24" />
        </div>
      ) : (
        <div className="mt-2">
          <p className={cn(dashboardMetricValueClassName, dashboardMetricValueSizeClassName('hero'), dashboardToneTextClassName('accent'))}>
            {revenue}
          </p>
          {revenueHint ? <p className={cn('mt-1.5', dashboardMetricHintClassName)}>{revenueHint}</p> : null}
        </div>
      )}
    </div>
  )

  return (
    <article className={dashboardHeroClassName}>
      <div className="relative z-[1] flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        {href && !isLoading ? (
          <Link
            to={href}
            className="group min-w-0 flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/30 focus-visible:ring-offset-2"
          >
            <div className="flex items-start justify-between gap-2">
              {headline}
              <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-[var(--color-subtle)] opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
            </div>
          </Link>
        ) : (
          <div className="min-w-0 flex-1">{headline}</div>
        )}

        <div className={cn(dashboardHeroMiniGridClassName, 'w-full lg:max-w-md')}>
          {stats.map((stat) => (
            <div key={stat.label} className={dashboardHeroMiniStatClassName}>
              <p className={dashboardMetricLabelClassName}>{stat.label}</p>
              {isLoading ? (
                <Skeleton className="mt-1.5 h-6 w-20" />
              ) : (
                <>
                  <p className={cn('mt-1 text-base font-semibold tabular-nums', dashboardToneTextClassName(stat.tone))}>
                    {stat.value}
                  </p>
                  {stat.hint ? (
                    <span className={cn('mt-0.5 inline-block', stat.tone && stat.tone !== 'neutral' ? dashboardToneBadgeClassName(stat.tone) : dashboardMetricHintClassName)}>
                      {stat.hint}
                    </span>
                  ) : null}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}
