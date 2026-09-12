import { Link } from 'react-router-dom'
import type { Transfer } from '@/domain/entities/transfer'
import { TravelCard } from '@/design-system/layout/TravelCard'
import { formatDate } from '@/shared/utils/date-format'
import { layout } from '@/design-system/tokens/layout'
import { cn } from '@/shared/utils/cn'

interface ActivityTabProps {
  transfer: Transfer
}

export function ActivityTab({ transfer }: ActivityTabProps) {
  return (
    <div className="space-y-3">
      <TravelCard contentClassName="px-4 py-4">
        <h3 className={cn(layout.sectionTitle, 'mb-2')}>Activity</h3>
        {transfer.tripId ? (
          <p className="text-sm text-[var(--color-muted)]">
            Stage changes are tracked on the trip activity feed when linked.{' '}
            <Link
              to={`/trips/${transfer.tripId}/changelog`}
              className="font-medium text-[var(--color-accent)] hover:underline"
            >
              Open trip changelog
            </Link>
          </p>
        ) : (
          <p className="text-sm text-[var(--color-muted)]">
            Stage changes are tracked on the trip activity feed when linked. Link a trip on the Service tab to
            connect activity history.
          </p>
        )}
      </TravelCard>

      <TravelCard contentClassName="px-4 py-4">
        <h3 className={cn(layout.sectionTitle, 'mb-3')}>Record meta</h3>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className={layout.statLabel}>Created</dt>
            <dd className="mt-1 text-sm text-[var(--color-foreground)]">{formatDate(transfer.createdAt)}</dd>
          </div>
          <div>
            <dt className={layout.statLabel}>Updated</dt>
            <dd className="mt-1 text-sm text-[var(--color-foreground)]">{formatDate(transfer.updatedAt)}</dd>
          </div>
          <div>
            <dt className={layout.statLabel}>Reference</dt>
            <dd className="mt-1 text-sm text-[var(--color-foreground)]">{transfer.reference}</dd>
          </div>
          <div>
            <dt className={layout.statLabel}>Stage</dt>
            <dd className="mt-1 text-sm capitalize text-[var(--color-foreground)]">{transfer.stage}</dd>
          </div>
        </dl>
      </TravelCard>
    </div>
  )
}
