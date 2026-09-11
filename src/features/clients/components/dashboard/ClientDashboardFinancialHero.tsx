import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { Skeleton } from '@/design-system/components/Skeleton'
import {
  modernDashboardHintClassName,
  modernDashboardLabelClassName,
  modernDashboardTileClassName,
  modernDashboardValueClassName,
  type ModernMetricTone,
} from '@/features/clients/components/dashboard/client-dashboard-modern-ui'
import { cn } from '@/shared/utils/cn'

interface FinancialHeroMetric {
  label: string
  value: ReactNode
  hint?: ReactNode
  tone?: ModernMetricTone
  icon: LucideIcon
  href?: string
  footer?: ReactNode
}

interface ClientDashboardFinancialHeroProps {
  currency: string
  metrics: FinancialHeroMetric[]
  isLoading?: boolean
  className?: string
}

function HeroMetricCell({
  metric,
  isLoading,
  bordered,
}: {
  metric: FinancialHeroMetric
  isLoading?: boolean
  bordered?: boolean
}) {
  const Icon = metric.icon
  const tone = metric.tone ?? 'neutral'

  const body = (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-3 p-4 sm:p-5',
        bordered && 'border-t border-[var(--color-border)]/70 sm:border-t-0 sm:border-l',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className={modernDashboardLabelClassName}>{metric.label}</p>
          {isLoading ? (
            <div className="mt-2 space-y-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          ) : (
            <>
              <p className={cn('mt-2', modernDashboardValueClassName(tone, true))}>{metric.value}</p>
              {metric.hint ? <p className={cn('mt-1.5', modernDashboardHintClassName)}>{metric.hint}</p> : null}
            </>
          )}
        </div>
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)]',
            tone === 'accent' && 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]',
            tone === 'success' && 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
            tone === 'warning' && 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
            tone === 'neutral' && 'bg-[var(--color-surface-muted)] text-[var(--color-muted)]',
          )}
          aria-hidden
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      {!isLoading && metric.footer ? <div>{metric.footer}</div> : null}
    </div>
  )

  if (metric.href && !isLoading) {
    return (
      <Link
        to={metric.href}
        className="block min-w-0 transition-colors hover:bg-[var(--color-surface-muted)]/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-accent)]"
      >
        {body}
      </Link>
    )
  }

  return body
}

export function ClientDashboardFinancialHero({
  currency,
  metrics,
  isLoading,
  className,
}: ClientDashboardFinancialHeroProps) {
  return (
    <section className={cn(modernDashboardTileClassName, className)} aria-label="Financial overview">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)]/70 px-4 py-3 sm:px-5">
        <div>
          <p className={modernDashboardLabelClassName}>Financial overview</p>
          <p className="mt-0.5 text-xs text-[var(--color-muted)]">Billable trips and collections · {currency}</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => (
          <HeroMetricCell
            key={metric.label}
            metric={metric}
            isLoading={isLoading}
            bordered={index > 0}
          />
        ))}
      </div>
    </section>
  )
}
