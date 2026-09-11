import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Skeleton } from '@/design-system/components/Skeleton'
import {
  dashboardMetricHintClassName,
  dashboardMetricLabelClassName,
  dashboardMetricValueClassName,
  dashboardPanelClassName,
  dashboardPanelMutedClassName,
  dashboardToneDotClassName,
  dashboardToneTextClassName,
  type DashboardMetricTone,
} from '@/features/clients/components/dashboard/client-dashboard-modern-ui'
import { cn } from '@/shared/utils/cn'

interface ClientDashboardStatBlockProps {
  label: string
  value: ReactNode
  hint?: ReactNode
  tone?: DashboardMetricTone
  href?: string
  isLoading?: boolean
  className?: string
}

export function ClientDashboardStatBlock({
  label,
  value,
  hint,
  tone = 'neutral',
  href,
  isLoading,
  className,
}: ClientDashboardStatBlockProps) {
  const body = (
    <div className={cn('p-4 sm:p-5', className)}>
      <div className="flex items-center gap-2">
        <span className={dashboardToneDotClassName(tone)} aria-hidden />
        <p className={dashboardMetricLabelClassName}>{label}</p>
      </div>
      {isLoading ? (
        <div className="mt-3 space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-28" />
        </div>
      ) : (
        <>
          <p className={cn('mt-2 text-xl font-semibold tabular-nums sm:text-2xl', dashboardToneTextClassName(tone))}>
            {value}
          </p>
          {hint ? <p className={cn('mt-1.5', dashboardMetricHintClassName)}>{hint}</p> : null}
        </>
      )}
    </div>
  )

  const shellClassName = cn(dashboardPanelClassName, href && !isLoading && 'transition-colors hover:bg-[var(--color-surface-muted)]/35')

  if (href && !isLoading) {
    return (
      <Link to={href} className={cn(shellClassName, 'block')}>
        {body}
      </Link>
    )
  }

  return <div className={shellClassName}>{body}</div>
}

interface ClientDashboardPanelProps {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}

export function ClientDashboardPanel({ title, description, actions, children, className }: ClientDashboardPanelProps) {
  return (
    <section className={cn(dashboardPanelClassName, 'flex min-h-0 flex-col', className)}>
      <header className="flex items-start justify-between gap-3 border-b border-[var(--color-border)]/70 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[var(--color-foreground)]">{title}</h3>
          {description ? <p className="mt-0.5 text-xs text-[var(--color-muted)]">{description}</p> : null}
        </div>
        {actions}
      </header>
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  )
}

interface ClientDashboardInsightRowProps {
  label: string
  value: ReactNode
  tone?: DashboardMetricTone
  href?: string
}

export function ClientDashboardInsightRow({
  label,
  value,
  tone = 'neutral',
  href,
}: ClientDashboardInsightRowProps) {
  const row = (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border)]/70 px-4 py-3 last:border-b-0 sm:px-5">
      <span className="text-sm text-[var(--color-muted)]">{label}</span>
      <span className={cn('text-sm font-semibold tabular-nums', dashboardToneTextClassName(tone))}>{value}</span>
    </div>
  )

  if (href) {
    return (
      <Link to={href} className="block transition-colors hover:bg-[var(--color-surface-muted)]/35">
        {row}
      </Link>
    )
  }

  return row
}

interface ClientDashboardCollectionBarProps {
  rate: number
  label: string
  isLoading?: boolean
  embedded?: boolean
}

export function ClientDashboardCollectionBar({ rate, label, isLoading, embedded = false }: ClientDashboardCollectionBarProps) {
  const clamped = Math.min(100, Math.max(0, rate))

  return (
    <section className={cn(!embedded && dashboardPanelMutedClassName, embedded && 'h-full', !embedded && 'p-4 sm:p-5')}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={dashboardMetricLabelClassName}>Collection rate</p>
          <p className={cn('mt-1 text-2xl font-semibold tabular-nums sm:text-3xl', dashboardToneTextClassName('accent'))}>
            {isLoading ? '—' : `${clamped.toFixed(1)}%`}
          </p>
        </div>
        <p className="max-w-[11rem] text-right text-[11px] leading-snug text-[var(--color-muted)]">{label}</p>
      </div>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[var(--color-surface-muted)]/60 ring-1 ring-inset ring-[var(--color-border)]/60">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-success)] transition-[width] duration-500"
          style={{ width: isLoading ? '0%' : `${clamped}%` }}
        />
      </div>
    </section>
  )
}

/** @deprecated use ClientDashboardStatBlock */
export const ClientDashboardProStatCard = ClientDashboardStatBlock
/** @deprecated */
export const ClientDashboardCollectionRing = ClientDashboardCollectionBar
