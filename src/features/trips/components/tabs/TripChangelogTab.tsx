import { DataTableEmptyRow } from '@/design-system/components/DataTableEmptyState'
import { StickyDataTable } from '@/design-system/components/StickyDataTable'
import { Skeleton } from '@/design-system/components/Skeleton'
import { tableCellClass } from '@/design-system/components/table-styles'
import {
  ACTIVITY_TYPE_LABELS,
  ACTIVITY_TYPE_TONE,
  formatActivityAction,
} from '@/features/activity/constants/activity-labels'
import { useTripActivities } from '@/features/trips/hooks/use-trip-workspace'
import { formatDateTime } from '@/shared/utils/date-format'
import { cn } from '@/shared/utils/cn'

interface TripChangelogTabProps {
  tripId: string
}

export function TripChangelogTab({ tripId }: TripChangelogTabProps) {
  const { data: activities = [], isLoading } = useTripActivities(tripId)

  if (isLoading) {
    return (
      <div className="space-y-2 p-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <StickyDataTable fill freezeFirstColumn={false}>
      <thead>
        <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]/80">
          <th className={tableCellClass('left', { extra: 'font-medium' })}>When</th>
          <th className={tableCellClass('left', { extra: 'font-medium' })}>Type</th>
          <th className={tableCellClass('left', { extra: 'font-medium' })}>Action</th>
          <th className={tableCellClass('left', { extra: 'font-medium' })}>Summary</th>
        </tr>
      </thead>
      <tbody>
        {activities.length === 0 ? (
          <DataTableEmptyRow
            colSpan={4}
            title="No activity yet"
            description="Changes to services, invoices, payments, and trip details will appear here."
          />
        ) : (
          activities.map((activity) => (
            <tr key={activity.id} className="border-b border-[var(--color-border)]/70">
              <td className={tableCellClass('left', { numeric: true, extra: 'text-xs' })}>
                {formatDateTime(activity.createdAt)}
              </td>
              <td className={tableCellClass('left')}>
                <span className={cn('text-xs font-semibold uppercase tracking-wide', ACTIVITY_TYPE_TONE[activity.type])}>
                  {ACTIVITY_TYPE_LABELS[activity.type]}
                </span>
              </td>
              <td className={tableCellClass('left', { extra: 'text-xs capitalize text-[var(--color-muted)]' })}>
                {formatActivityAction(activity.action)}
              </td>
              <td className={tableCellClass('left', { extra: 'text-sm' })}>{activity.summary}</td>
            </tr>
          ))
        )}
      </tbody>
    </StickyDataTable>
  )
}
