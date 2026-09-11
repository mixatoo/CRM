import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { Skeleton } from '@/design-system/components/Skeleton'
import { cn } from '@/shared/utils/cn'
import {
  dashboardMetricHintClassName,
  dashboardMetricLabelClassName,
  dashboardMetricValueClassName,
  dashboardPanelClassName,
  dashboardToneDotClassName,
  dashboardToneTextClassName,
  type DashboardMetricTone,
} from '@/features/clients/components/dashboard/client-dashboard-modern-ui'
import { ClientDashboardPanel } from '@/features/clients/components/dashboard/ClientDashboardProStatCard'

/** @deprecated Prefer ClientDashboardStatBlock */
export function ClientDashboardKpiTile({
  label,
  value,
  hint,
  tone = 'neutral',
  icon: Icon,
  href,
  isLoading,
  large,
  className,
  footer,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  tone?: DashboardMetricTone
  icon?: LucideIcon
  href?: string
  isLoading?: boolean
  large?: boolean
  className?: string
  footer?: ReactNode
}) {
  const body = (
    <div className={cn('p-4 sm:p-5', className)}>
      <div className="flex items-center gap-2">
        {Icon ? <Icon className="h-4 w-4 text-[var(--color-muted)]" aria-hidden /> : null}
        <p className={dashboardMetricLabelClassName}>{label}</p>
        <span className={dashboardToneDotClassName(tone)} aria-hidden />
      </div>
      {isLoading ? (
        <Skeleton className="mt-3 h-8 w-28" />
      ) : (
        <>
          <p className={cn('mt-2', dashboardMetricValueClassName, dashboardToneTextClassName(tone), large && 'text-3xl')}>
            {value}
          </p>
          {hint ? <p className={cn('mt-1', dashboardMetricHintClassName)}>{hint}</p> : null}
          {footer}
        </>
      )}
    </div>
  )

  if (href && !isLoading) {
    return (
      <Link to={href} className={cn(dashboardPanelClassName, 'block hover:bg-[var(--color-surface-muted)]/35')}>
        {body}
      </Link>
    )
  }

  return <div className={dashboardPanelClassName}>{body}</div>
}

/** @deprecated */
export function ClientDashboardMiniStat({
  label,
  value,
  href,
}: {
  label: string
  value: ReactNode
  tone?: DashboardMetricTone
  href?: string
}) {
  const row = (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] px-4 py-3">
      <span className="text-sm text-[var(--color-muted)]">{label}</span>
      <span className="text-sm font-semibold tabular-nums">{value}</span>
    </div>
  )

  if (href) return <Link to={href}>{row}</Link>
  return row
}

export { ClientDashboardPanel }
