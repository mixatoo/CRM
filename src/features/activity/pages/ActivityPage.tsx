import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, Inbox } from 'lucide-react'
import type { TripActivityType } from '@/domain/entities/trip-activity'
import { Page } from '@/design-system/layout/Page'
import { SearchField } from '@/design-system/components/SearchField'
import { FormPicklist } from '@/design-system/components/FormPicklist'
import { DataTableEmptyRow } from '@/design-system/components/DataTableEmptyState'
import { DataTableShell } from '@/design-system/layout/DataTableShell'
import { StickyDataTable } from '@/design-system/components/StickyDataTable'
import { Pagination } from '@/design-system/components/Pagination'
import { Skeleton } from '@/design-system/components/Skeleton'
import { useActivityList, useActivityTripRefs } from '@/features/activity/hooks/use-activity'
import { EntityLabelChips } from '@/features/labels/components/EntityLabelChips'
import { LabelFilterField } from '@/features/labels/components/LabelFilterField'
import { useEntityLabelAssignments } from '@/features/labels/hooks/use-labels'
import {
  ACTIVITY_TYPE_LABELS,
  ACTIVITY_TYPE_TONE,
  formatActivityAction,
} from '@/features/activity/constants/activity-labels'
import { usePagination } from '@/shared/hooks/use-pagination'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'
import { ACTIVITY_PAGE_SIZE_STORAGE_KEY } from '@/types/pagination'
import type { ActivityFilters } from '@/repositories/interfaces'
import { layout } from '@/design-system/tokens/layout'
import { tableCellClass } from '@/design-system/components/table-styles'
import { formatDateTime } from '@/shared/utils/date-format'
import { cn } from '@/shared/utils/cn'
import { useLabelIdsSearchParam } from '@/features/labels/hooks/use-label-ids-search-param'

const TYPE_OPTIONS: Array<{ value: TripActivityType | 'all'; label: string }> = [
  { value: 'all', label: 'All types' },
  { value: 'trip', label: 'Trip' },
  { value: 'service', label: 'Service' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'payment', label: 'Payment' },
  { value: 'client', label: 'Client' },
]

export function ActivityPage() {
  const [searchInput, setSearchInput] = useState('')
  const [type, setType] = useState<TripActivityType | 'all'>('all')
  const [labelIds, setLabelIds] = useState<string[]>([])
  useLabelIdsSearchParam(setLabelIds)
  const search = useDebouncedValue(searchInput, 300)
  const { page, pageSize, setPage, setPageSize, resetPage } = usePagination({
    persistKey: ACTIVITY_PAGE_SIZE_STORAGE_KEY,
  })

  const filters: ActivityFilters = { search, type, labelIds, sortBy: 'createdAt', sortDir: 'desc' }
  const { data: result, isLoading, isFetching } = useActivityList(filters, page, pageSize)

  const activities = result?.items ?? []
  const activityIds = useMemo(() => activities.map((activity) => activity.id), [activities])
  const { data: labelsByTarget } = useEntityLabelAssignments('activity', activityIds)

  const tripIds = useMemo(
    () => [...new Set(activities.map((activity) => activity.tripId))],
    [activities],
  )
  const { data: tripRefs = {} } = useActivityTripRefs(tripIds)

  useEffect(() => {
    resetPage()
  }, [search, type, labelIds, pageSize, resetPage])

  const total = result?.total ?? 0
  const totalPages = total > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1
  const hasFilters = searchInput.trim().length > 0 || type !== 'all' || labelIds.length > 0

  return (
    <Page className="flex min-h-0 flex-col">
      <DataTableShell
        className="h-full"
        isFetching={isFetching && !isLoading}
        header={
          <div className="flex flex-col gap-2 border-b border-[var(--color-border)] px-2 py-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 sm:px-4 sm:py-2.5">
            <h1 className={cn('shrink-0', layout.pageTitle)}>Activity</h1>
            <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
              <SearchField
                value={searchInput}
                onValueChange={setSearchInput}
                placeholder="Search summary, action, actor…"
                className="w-full min-w-0 sm:max-w-xs"
                collapsible={false}
              />
              <FormPicklist
                size="sm"
                fullWidth={false}
                value={type}
                onChange={(value) => setType(value as TripActivityType | 'all')}
                options={TYPE_OPTIONS}
                panelTitle="Activity type"
                ariaLabel="Filter by type"
              />
              <LabelFilterField
                value={labelIds}
                onChange={setLabelIds}
                targetType="activity"
                ariaLabel="Filter activity by labels"
              />
            </div>
          </div>
        }
        footer={
          <Pagination
            compact
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        }
      >
        {isLoading ? (
          <div className="space-y-2 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <StickyDataTable fill freezeFirstColumn={false}>
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]/80">
                <th className={tableCellClass('left', { extra: 'font-medium' })}>When</th>
                <th className={tableCellClass('left', { extra: 'font-medium' })}>Trip</th>
                <th className={tableCellClass('left', { extra: 'font-medium' })}>Type</th>
                <th className={tableCellClass('left', { extra: 'font-medium' })}>Action</th>
                <th className={tableCellClass('left', { extra: 'font-medium' })}>Summary</th>
                <th className={tableCellClass('left', { extra: 'font-medium' })}>Labels</th>
                <th className={tableCellClass('center', { extra: 'font-medium' })} aria-label="Open" />
              </tr>
            </thead>
            <tbody>
              {activities.length === 0 ? (
                <DataTableEmptyRow
                  colSpan={7}
                  icon={hasFilters ? Inbox : undefined}
                  title={hasFilters ? 'No matching activity' : 'No activity yet'}
                  description={
                    hasFilters
                      ? 'Try clearing filters or broadening your search.'
                      : 'Changes to trips, services, invoices, and payments will appear here.'
                  }
                />
              ) : (
                activities.map((activity) => (
                  <tr key={activity.id} className="border-b border-[var(--color-border)]/70">
                    <td className={tableCellClass('left', { numeric: true, extra: 'text-xs' })}>
                      {formatDateTime(activity.createdAt)}
                    </td>
                    <td className={tableCellClass('left')}>
                      <span className="font-mono text-xs text-[var(--color-accent)]">
                        {tripRefs[activity.tripId] ?? activity.tripId}
                      </span>
                    </td>
                    <td className={tableCellClass('left')}>
                      <span
                        className={cn('text-xs font-semibold uppercase tracking-wide', ACTIVITY_TYPE_TONE[activity.type])}
                      >
                        {ACTIVITY_TYPE_LABELS[activity.type]}
                      </span>
                    </td>
                    <td className={tableCellClass('left', { extra: 'text-xs capitalize text-[var(--color-muted)]' })}>
                      {formatActivityAction(activity.action)}
                      {activity.actorName ? (
                        <span className="mt-0.5 block normal-case text-[var(--color-subtle)]">{activity.actorName}</span>
                      ) : null}
                    </td>
                    <td className={tableCellClass('left', { extra: 'text-sm' })}>{activity.summary}</td>
                    <td className={tableCellClass('left', { extra: 'px-2' })}>
                      <EntityLabelChips labels={labelsByTarget?.get(activity.id) ?? []} maxVisible={2} nowrap />
                    </td>
                    <td className={tableCellClass('center')}>
                      <Link
                        to={`/trips/${activity.tripId}/changelog`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-accent)] hover:underline"
                      >
                        Open
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </StickyDataTable>
        )}
      </DataTableShell>
    </Page>
  )
}
