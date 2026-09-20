import { Link } from 'react-router-dom'
import { Kanban, TrendingUp } from 'lucide-react'
import { Page } from '@/design-system/layout/Page'
import { PageHeader } from '@/design-system/layout/PageHeader'
import { Skeleton } from '@/design-system/components/Skeleton'
import { TripStageBadge } from '@/features/trips/components/list/TripStageBadge'
import { usePipelineData } from '@/features/pipeline/hooks/use-pipeline-data'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { shouldMaskFinancials } from '@/domain/policies/permissions'
import { formatDate } from '@/shared/utils/date-format'

export function PipelinePage() {
  const role = useAuthStore((s) => s.user?.role ?? 'guest')
  const mask = shouldMaskFinancials(role)
  const { data, isLoading } = usePipelineData()

  return (
    <Page className="min-w-0">
      <PageHeader
        title="Pipeline"
        description="Sales and operations funnel — trip volume and value by stage."
        actions={
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] px-2.5 py-1.5">
              <Kanban className="h-3.5 w-3.5 text-[var(--color-accent)]" />
              {isLoading ? '…' : data?.totalActive ?? 0} active
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] px-2.5 py-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-[var(--color-accent)]" />
              {mask ? '••••' : `${(data?.pipelineValue ?? 0).toLocaleString()} EGP`}
            </span>
          </div>
        }
      />

      {isLoading ? (
        <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-1 pb-4 sm:mx-0 sm:snap-none sm:px-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-[min(17.5rem,calc(100vw-2.75rem))] shrink-0 snap-center sm:w-72" />
          ))}
        </div>
      ) : (
        <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-1 pb-4 sm:mx-0 sm:snap-none sm:px-0">
          {data?.columns.map((column) => (
            <section
              key={column.stage}
              className="flex w-[min(17.5rem,calc(100vw-2.75rem))] shrink-0 snap-center flex-col rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]/30 sm:w-72 sm:snap-align-none"
            >
              <header className="border-b border-[var(--color-border)] px-3 py-2.5">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <TripStageBadge stage={column.stage} />
                  <span className="rounded-full bg-[var(--color-surface)] px-2 py-0.5 text-[10px] font-semibold tabular-nums">
                    {column.count}
                  </span>
                </div>
                <p className="text-[10px] text-[var(--color-muted)]">
                  {mask ? '••••' : `${column.value.toLocaleString()} EGP`}
                </p>
              </header>
              <ul className="flex flex-1 flex-col gap-2 p-2">
                {column.items.length === 0 ? (
                  <li className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] px-3 py-6 text-center text-xs text-[var(--color-muted)]">
                    No trips
                  </li>
                ) : (
                  column.items.map((trip) => (
                    <li key={trip.id}>
                      <Link
                        to={`/trips/${trip.id}/dashboard`}
                        className="block rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-card)] hover:border-[var(--color-accent)]"
                      >
                        <p className="truncate text-sm font-medium">{trip.name}</p>
                        <p className="font-mono text-[10px] text-[var(--color-accent)]">{trip.reference}</p>
                        <p className="mt-1 truncate text-xs text-[var(--color-muted)]">{trip.clientName}</p>
                        <p className="mt-1 text-[10px] text-[var(--color-subtle)]">
                          {trip.destination} · {trip.startDate ? formatDate(trip.startDate) : '—'}
                        </p>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </section>
          ))}
        </div>
      )}
    </Page>
  )
}
