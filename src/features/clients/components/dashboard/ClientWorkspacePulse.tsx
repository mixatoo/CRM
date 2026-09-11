import type { ReactNode } from 'react'
import type { CrmFieldTone } from '@/design-system/layout/CrmPanel'
import { Skeleton } from '@/design-system/components/Skeleton'
import { cn } from '@/shared/utils/cn'
import {
  clientDashboardFlushPanelClassName,
  dashboardMetricGridClassName,
} from '@/features/clients/components/dashboard/client-dashboard-chrome'
import { DashboardFieldCell } from '@/features/clients/components/dashboard/DashboardFieldCell'
import { DashboardSectionPanel } from '@/features/clients/components/dashboard/DashboardSectionPanel'

export interface PulseMetricItem {
  label: string
  value: ReactNode
  tone?: CrmFieldTone
  sub?: ReactNode
  href?: string
}

interface ClientDashboardMetricPanelProps {
  title: string
  items?: PulseMetricItem[]
  columns?: 2 | 4 | 5
  isLoading?: boolean
  headerActions?: ReactNode
  children?: ReactNode
  className?: string
}

export function ClientDashboardMetricPanel({
  title,
  items = [],
  columns = 5,
  isLoading,
  headerActions,
  children,
  className,
}: ClientDashboardMetricPanelProps) {
  const count = items.length || columns
  const gridClassName = dashboardMetricGridClassName(columns)

  return (
    <DashboardSectionPanel
      title={title}
      headerActions={headerActions}
      className={cn(clientDashboardFlushPanelClassName, className)}
    >
      {children ? (
        children
      ) : isLoading ? (
        <MetricSkeleton count={count} gridClassName={gridClassName} />
      ) : (
        <div className={gridClassName}>
          {items.map((item) => (
            <DashboardFieldCell key={item.label} variant="stack" {...item} />
          ))}
        </div>
      )}
    </DashboardSectionPanel>
  )
}

/** @deprecated Use ClientDashboardMetricPanel with title="Workspace pulse" */
export function ClientWorkspacePulse({
  items,
  isLoading,
}: {
  items: PulseMetricItem[]
  isLoading?: boolean
}) {
  return <ClientDashboardMetricPanel title="Workspace pulse" items={items} isLoading={isLoading} />
}

function MetricSkeleton({ count, gridClassName }: { count: number; gridClassName: string }) {
  return (
    <div className={gridClassName}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex flex-col gap-1 px-3 py-2.5 sm:min-h-[4.5rem] sm:px-4">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  )
}
