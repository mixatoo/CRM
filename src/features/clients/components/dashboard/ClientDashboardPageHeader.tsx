import type { ReactNode } from 'react'
import {
  modernDashboardEyebrowClassName,
  modernDashboardPageDescriptionClassName,
  modernDashboardPageTitleClassName,
} from '@/features/clients/components/dashboard/client-dashboard-modern-ui'
import { cn } from '@/shared/utils/cn'

interface ClientDashboardPageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function ClientDashboardPageHeader({
  eyebrow = 'Dashboard',
  title,
  description,
  actions,
  className,
}: ClientDashboardPageHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        <p className={modernDashboardEyebrowClassName}>{eyebrow}</p>
        <h1 className={cn('mt-1', modernDashboardPageTitleClassName)}>{title}</h1>
        {description ? <p className={modernDashboardPageDescriptionClassName}>{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  )
}

export function ClientDashboardCurrencyBadge({ currency }: { currency: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-muted)] ring-1 ring-[var(--color-border)]/80 shadow-sm">
      Reporting currency
      <span className="ml-2 font-semibold tabular-nums text-[var(--color-foreground)]">{currency}</span>
    </span>
  )
}
