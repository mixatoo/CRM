import type { CrmFieldTone } from '@/design-system/layout/CrmPanel'
import { Skeleton } from '@/design-system/components/Skeleton'
import { ClientDashboardInfoCard, type DashboardFieldSection } from '@/features/clients/components/dashboard/ClientDashboardInfoCard'
import type { DashboardMetricTone } from '@/features/clients/components/dashboard/client-dashboard-modern-ui'
import {
  dashboardCrmPipelineBarClassName,
  dashboardCrmPipelineLegendClassName,
  dashboardToneBarClassName,
  dashboardToneDotClassName,
  dashboardToneTextClassName,
} from '@/features/clients/components/dashboard/client-dashboard-modern-ui'
import { cn } from '@/shared/utils/cn'

function toCrmTone(tone?: DashboardMetricTone): CrmFieldTone {
  if (tone === 'accent') return 'accent'
  if (tone === 'success') return 'success'
  if (tone === 'warning') return 'warning'
  return 'default'
}

interface DashboardMetricField {
  label: string
  value: string
  hint?: string
  tone?: DashboardMetricTone
  href?: string
}

interface ClientDashboardPerformancePanelProps {
  currency: string
  financial: DashboardMetricField[]
  operations: DashboardMetricField[]
  pipeline?: { open: number; won: number; lost: number }
  formatCount: (n: number) => string
  isLoading?: boolean
}

export function ClientDashboardPerformancePanel({
  currency,
  financial,
  operations,
  pipeline,
  formatCount,
  isLoading,
}: ClientDashboardPerformancePanelProps) {
  const sections: DashboardFieldSection[] = [
    {
      title: 'Financial summary',
      fields: financial.map((field) => ({
        label: field.label,
        value: field.value,
        href: field.href,
        tone: toCrmTone(field.tone),
        sub: field.hint,
      })),
    },
    {
      title: 'Operations',
      fields: operations.map((field) => ({
        label: field.label,
        value: field.value,
        href: field.href,
        tone: toCrmTone(field.tone),
        sub: field.hint,
      })),
    },
  ]

  const pipelineTotal = Math.max(1, (pipeline?.open ?? 0) + (pipeline?.won ?? 0) + (pipeline?.lost ?? 0))

  return (
    <div>
      <ClientDashboardInfoCard sections={sections} isLoading={isLoading} variant="flat" />

      {pipeline ? (
        <div className="border-t border-[var(--color-border)]/40">
          <div className="flex min-h-10 items-center bg-[var(--color-surface-muted)]/25 px-4">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
              Trip pipeline
            </h4>
          </div>

          <div className="space-y-3 px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[12px] text-[var(--color-muted)]">
                {isLoading ? '—' : `${formatCount(pipeline.open + pipeline.won + pipeline.lost)} total deals · ${currency}`}
              </p>
              <div className={dashboardCrmPipelineLegendClassName}>
                <PipelineLegendItem label="Open" value={formatCount(pipeline.open)} tone="accent" isLoading={isLoading} />
                <PipelineLegendItem label="Won" value={formatCount(pipeline.won)} tone="success" isLoading={isLoading} />
                <PipelineLegendItem label="Lost" value={formatCount(pipeline.lost)} tone="warning" isLoading={isLoading} />
              </div>
            </div>

            {isLoading ? (
              <Skeleton className="h-1.5 w-full rounded-full" />
            ) : (
              <div className={dashboardCrmPipelineBarClassName}>
                <div className={cn('h-full', dashboardToneBarClassName('accent'))} style={{ width: `${(pipeline.open / pipelineTotal) * 100}%` }} />
                <div className={cn('h-full', dashboardToneBarClassName('success'))} style={{ width: `${(pipeline.won / pipelineTotal) * 100}%` }} />
                <div className={cn('h-full', dashboardToneBarClassName('warning'))} style={{ width: `${(pipeline.lost / pipelineTotal) * 100}%` }} />
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
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
