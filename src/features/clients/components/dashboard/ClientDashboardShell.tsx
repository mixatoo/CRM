import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  DASHBOARD_VIEWS,
  dashboardShellHeaderClassName,
  dashboardSubtitleClassName,
  dashboardTitleClassName,
  dashboardViewTabClassName,
  type DashboardViewId,
} from '@/features/clients/components/dashboard/client-dashboard-modern-ui'

export {
  ClientDashboardCrmOverview,
  ClientDashboardCrmOverview as ClientDashboardStatsPanel,
  ClientDashboardMetricGrid,
  ClientDashboardMetricGrid as ClientDashboardKpiRail,
  ClientDashboardMetricGrid as ClientDashboardKpiBento,
  ClientDashboardMetricGrid as ClientDashboardMetricStrip,
} from '@/features/clients/components/dashboard/ClientDashboardCrmOverview'
export type { ClientDashboardKpiItem } from '@/features/clients/components/dashboard/ClientDashboardCrmOverview'

interface ClientDashboardShellProps {
  title?: string
  subtitle?: string
  currency: string
  view: DashboardViewId
  onViewChange: (view: DashboardViewId) => void
  children: ReactNode
}

export function ClientDashboardShell({
  title = 'Account dashboard',
  subtitle = 'Performance snapshot for this client',
  currency,
  view,
  onViewChange,
  children,
}: ClientDashboardShellProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
      <div className={dashboardShellHeaderClassName}>
        <div className="min-w-0">
          <h1 className={dashboardTitleClassName}>{title}</h1>
          <p className={dashboardSubtitleClassName}>{subtitle}</p>
        </div>
        <span className="inline-flex w-fit items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)]/50 px-3 py-1 text-xs text-[var(--color-muted)]">
          Currency
          <span className="ml-2 font-semibold tabular-nums text-[var(--color-foreground)]">{currency}</span>
        </span>
      </div>

      <div className="border-b border-[var(--color-border)] px-4 sm:px-5">
        <div className="flex gap-1 overflow-x-auto rounded-[var(--radius-md)] bg-[var(--color-surface-muted)]/40 p-0.5 ring-1 ring-inset ring-[var(--color-border)]/65 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {DASHBOARD_VIEWS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onViewChange(item.id)}
              className={dashboardViewTabClassName(view === item.id)}
              aria-current={view === item.id ? 'page' : undefined}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4 sm:gap-6 sm:p-5">{children}</div>
    </div>
  )
}

export function useDashboardView(initial: DashboardViewId = 'overview') {
  const [view, setView] = useState<DashboardViewId>(initial)
  return { view, setView }
}
