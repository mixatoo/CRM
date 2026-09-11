import type { ClientActivityPeriodPoint } from '@/features/clients/utils/client-dashboard-analytics'
import { ClientDashboardPanel } from '@/features/clients/components/dashboard/ClientDashboardProStatCard'
import { dashboardPanelClassName } from '@/features/clients/components/dashboard/client-dashboard-modern-ui'
import { cn } from '@/shared/utils/cn'
import {
  ClientAccountWorkChart,
  ClientAccountWorkChartControls,
  type ActivityGranularity,
  type ChartSize,
  type ClientAccountWorkChartVariant,
} from '@/features/clients/components/dashboard/ClientAccountWorkChart'

interface ClientAccountWorkPanelProps {
  monthlySeries: ClientActivityPeriodPoint[]
  yearlySeries: ClientActivityPeriodPoint[]
  currency: string
  maskFinancials?: boolean
  isLoading?: boolean
  className?: string
  variant?: ClientAccountWorkChartVariant
  title?: string
  description?: string
  granularity?: ActivityGranularity
  onGranularityChange?: (value: ActivityGranularity) => void
  showGranularityControls?: boolean
  /** Flat card — chart only, controls live in section header */
  embedded?: boolean
  /** No outer ring — sits inside mega panel */
  flush?: boolean
  compact?: boolean
  size?: ChartSize
}

const PANEL_COPY: Record<ClientAccountWorkChartVariant, { title: string; description: string }> = {
  revenue: {
    title: 'Revenue trend',
    description: 'Bar chart of billable trip selling value',
  },
  trips: {
    title: 'Trip volume',
    description: 'Line chart of bookings started over time',
  },
}

export function ClientAccountWorkPanel({
  monthlySeries,
  yearlySeries,
  currency,
  maskFinancials,
  isLoading,
  className,
  variant = 'revenue',
  title,
  description,
  granularity = 'month',
  onGranularityChange,
  showGranularityControls = false,
  embedded = false,
  flush = false,
  compact,
  size = 'md',
}: ClientAccountWorkPanelProps) {
  const copy = PANEL_COPY[variant]

  const chart = (
    <ClientAccountWorkChart
      monthlySeries={monthlySeries}
      yearlySeries={yearlySeries}
      currency={currency}
      maskFinancials={maskFinancials}
      isLoading={isLoading}
      granularity={granularity}
      variant={variant}
      compact={compact}
      size={size}
    />
  )

  if (embedded) {
    return (
      <section className={cn(!flush && dashboardPanelClassName, flush && 'min-w-0', className)}>
        {chart}
      </section>
    )
  }

  return (
    <ClientDashboardPanel
      className={className}
      title={title ?? copy.title}
      description={description ?? copy.description}
      actions={
        showGranularityControls && onGranularityChange ? (
          <ClientAccountWorkChartControls granularity={granularity} onGranularityChange={onGranularityChange} />
        ) : null
      }
    >
      {chart}
    </ClientDashboardPanel>
  )
}
