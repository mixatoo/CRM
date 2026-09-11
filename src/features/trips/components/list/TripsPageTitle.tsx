import { TRIP_STAGE_LABELS, type TripStage } from '@/domain/entities'
import { ClientReferenceCopy } from '@/features/clients/components/ClientReferenceCopy'
import { TripStageFilter } from '@/features/trips/components/list/TripStageFilter'
import { cn } from '@/shared/utils/cn'

interface TripsPageTitleProps {
  matchCount?: number
  stage?: TripStage | 'all'
  onStageChange?: (stage: TripStage | 'all') => void
  hasFilters?: boolean
  isFetching?: boolean
  /** Secondary chip segment — e.g. trip reference + "ID" on workspace nav. */
  secondaryValue?: string
  secondaryLabel?: string
  className?: string
}

function countNoun(count: number, hasFilters: boolean, stage: TripStage | 'all') {
  if (hasFilters && stage === 'all') return 'matched'
  return count === 1 ? 'trip' : 'trips'
}

const CHIP_SEGMENT = 'flex h-8 min-w-0 shrink-0 items-center px-2.5 sm:px-3'

export function TripsPageTitle({
  matchCount,
  stage = 'all',
  onStageChange,
  hasFilters = false,
  isFetching,
  secondaryValue,
  secondaryLabel,
  className,
}: TripsPageTitleProps) {
  const showCount = typeof matchCount === 'number'
  const showSecondary = Boolean(secondaryValue?.trim())
  const isFilteredView = hasFilters || stage !== 'all'
  const noun = showCount ? countNoun(matchCount, hasFilters, stage) : null
  const isWorkspaceChip = showSecondary && !showCount

  return (
    <div
      className={cn(
        'relative inline-flex h-8 max-w-full min-w-0 items-stretch overflow-hidden rounded-[var(--radius-md)]',
        'border border-[var(--color-border)]/90 bg-[var(--color-surface)]',
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_1px_2px_rgba(15,23,42,0.04)]',
        'dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_1px_2px_rgba(0,0,0,0.2)]',
        className,
      )}
    >
      <div
        className={cn(
          'w-[3px] shrink-0 bg-gradient-to-b',
          isFilteredView
            ? 'from-[var(--color-warning)] via-[var(--color-warning)]/80 to-[var(--color-warning)]/25'
            : 'from-[var(--color-accent)] via-[var(--color-accent)]/75 to-[var(--color-accent)]/20',
        )}
        aria-hidden
      />

      {isWorkspaceChip ? (
        <div className="flex min-w-0 flex-1 items-center gap-2.5 bg-gradient-to-r from-[var(--color-accent-muted)]/25 via-transparent to-transparent px-2.5 sm:px-3">
          <h1 className="shrink-0 text-[13px] font-medium leading-none tracking-[-0.01em] text-[var(--color-foreground)]">
            All Trips
          </h1>

          {showSecondary ? (
            <>
              <span className="h-3 w-px shrink-0 bg-[var(--color-border)]" aria-hidden />
              <div className="flex min-w-0 items-baseline gap-1 leading-none">
                <ClientReferenceCopy
                  reference={secondaryValue!}
                  variant="inline"
                  className="text-[13px] font-medium tracking-tight text-[var(--color-foreground)] hover:text-[var(--color-foreground)]/80"
                />
                {secondaryLabel?.trim() ? (
                  <span className="truncate text-[11px] font-normal tracking-wide text-[var(--color-muted)]">
                    {secondaryLabel}
                  </span>
                ) : null}
              </div>
            </>
          ) : isFetching ? (
            <span className="flex items-center gap-1.5" aria-hidden>
              <span className="h-3 w-8 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)]" />
              <span className="h-2.5 w-10 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)]/80" />
            </span>
          ) : null}
        </div>
      ) : (
        <div className="flex min-w-0 items-stretch divide-x divide-[var(--color-border)]/90">
          <div
            className={cn(
              CHIP_SEGMENT,
              'bg-gradient-to-r from-[var(--color-accent-muted)]/25 via-transparent to-transparent',
            )}
          >
            <h1 className="shrink-0 text-[13px] font-medium leading-none tracking-[-0.01em] text-[var(--color-foreground)]">
              All Trips
            </h1>
          </div>

          {showCount ? (
            <div className={cn(CHIP_SEGMENT, 'gap-1 leading-none')}>
              <span className="font-mono text-[13px] font-medium tabular-nums tracking-tight text-[var(--color-foreground)]">
                {matchCount}
              </span>
              <span className="truncate text-[11px] font-normal tracking-wide text-[var(--color-muted)]">{noun}</span>
            </div>
          ) : isFetching ? (
            <div className={cn(CHIP_SEGMENT, 'gap-1.5')} aria-hidden>
              <span className="h-3 w-8 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)]" />
              <span className="h-2.5 w-10 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)]/80" />
            </div>
          ) : null}

          {onStageChange ? (
            <TripStageFilter value={stage} onChange={onStageChange} variant="chip" />
          ) : null}
        </div>
      )}

      <span className="sr-only">
        {showCount
          ? `${matchCount} ${noun}${stage !== 'all' ? `, stage ${TRIP_STAGE_LABELS[stage]}` : ''}${hasFilters && stage === 'all' ? ', filtered' : ''}`
          : showSecondary
            ? `All Trips, ${secondaryValue}${secondaryLabel?.trim() ? ` ${secondaryLabel}` : ''}`
            : isFetching
              ? 'Loading trips'
              : 'All trips'}
      </span>
    </div>
  )
}
