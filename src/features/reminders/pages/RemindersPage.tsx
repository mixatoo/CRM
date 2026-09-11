import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, Inbox, Plus, Trash2 } from 'lucide-react'
import type { Reminder } from '@/domain/entities/reminder'
import {
  REMINDER_CATEGORY_LABELS,
  REMINDER_PRIORITY_LABELS,
  REMINDER_STATUS_LABELS,
  type ReminderCategory,
  type ReminderPriority,
  type ReminderStatus,
} from '@/domain/entities/reminder'
import { canMutate } from '@/domain/policies/permissions'
import { Page } from '@/design-system/layout/Page'
import { Button } from '@/design-system/components/Button'
import { SearchField } from '@/design-system/components/SearchField'
import { FormPicklist } from '@/design-system/components/FormPicklist'
import { DataTableEmptyRow } from '@/design-system/components/DataTableEmptyState'
import { DataTableShell } from '@/design-system/layout/DataTableShell'
import { StickyDataTable } from '@/design-system/components/StickyDataTable'
import { Pagination } from '@/design-system/components/Pagination'
import { Skeleton } from '@/design-system/components/Skeleton'
import { ReminderFormDialog } from '@/features/reminders/components/ReminderFormDialog'
import { EntityLabelChips } from '@/features/labels/components/EntityLabelChips'
import { LabelFilterField } from '@/features/labels/components/LabelFilterField'
import { useEntityLabelAssignments } from '@/features/labels/hooks/use-labels'
import { useRemindersList, useReminderTripRefs } from '@/features/reminders/hooks/use-reminders'
import { useReminderMutations } from '@/features/reminders/hooks/use-reminder-mutations'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { usePagination } from '@/shared/hooks/use-pagination'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'
import { REMINDERS_PAGE_SIZE_STORAGE_KEY } from '@/types/pagination'
import type { ReminderFilters, ReminderSortDir, ReminderSortField } from '@/repositories/interfaces'
import { layout } from '@/design-system/tokens/layout'
import { tableCellClass, tableHeadClass } from '@/design-system/components/table-styles'
import { formatDate } from '@/shared/utils/date-format'
import { cn } from '@/shared/utils/cn'
import { useLabelIdsSearchParam } from '@/features/labels/hooks/use-label-ids-search-param'

export function RemindersPage() {
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const canCreate = canMutate(role, 'settings', 'create')

  const [searchInput, setSearchInput] = useState('')
  const [status, setStatus] = useState<ReminderStatus | 'all'>('open')
  const [priority, setPriority] = useState<ReminderPriority | 'all'>('all')
  const [category, setCategory] = useState<ReminderCategory | 'all'>('all')
  const [labelIds, setLabelIds] = useState<string[]>([])
  useLabelIdsSearchParam(setLabelIds)
  const [sortBy] = useState<ReminderSortField>('dueAt')
  const [sortDir] = useState<ReminderSortDir>('asc')
  const [formOpen, setFormOpen] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)

  const search = useDebouncedValue(searchInput, 300)
  const { page, pageSize, setPage, setPageSize, resetPage } = usePagination({
    persistKey: REMINDERS_PAGE_SIZE_STORAGE_KEY,
  })

  const filters: ReminderFilters = { search, status, priority, category, labelIds, sortBy, sortDir }
  const { data: result, isLoading, isFetching } = useRemindersList(filters, page, pageSize)
  const { deleteReminder, isPending } = useReminderMutations()

  const reminders = result?.items ?? []
  const reminderIds = useMemo(() => reminders.map((reminder) => reminder.id), [reminders])
  const { data: labelsByTarget } = useEntityLabelAssignments('reminder', reminderIds)

  const tripIds = useMemo(
    () => [...new Set(reminders.map((reminder) => reminder.tripId).filter(Boolean) as string[])],
    [reminders],
  )
  const { data: tripRefs = {} } = useReminderTripRefs(tripIds)

  useEffect(() => {
    resetPage()
  }, [search, status, priority, category, labelIds, pageSize, resetPage])

  const total = result?.total ?? 0
  const totalPages = total > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1
  const hasFilters = searchInput.trim().length > 0 || status !== 'open' || priority !== 'all' || category !== 'all' || labelIds.length > 0

  return (
    <Page className="flex min-h-0 flex-col">
      <DataTableShell
        className="h-full"
        isFetching={isFetching && !isLoading}
        header={
          <div className="flex flex-col gap-2 border-b border-[var(--color-border)] px-2 py-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 sm:px-4 sm:py-2.5">
            <h1 className={cn('shrink-0', layout.pageTitle)}>Reminders</h1>
            <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
              <SearchField
                value={searchInput}
                onValueChange={setSearchInput}
                placeholder="Title, assignee, ID"
                aria-label="Search reminders"
                density="toolbar"
              />
              <FormPicklist
                size="sm"
                fullWidth={false}
                value={status}
                onChange={(value) => setStatus(value as ReminderStatus | 'all')}
                options={[
                  { value: 'all', label: 'All statuses' },
                  { value: 'open', label: 'Open' },
                  { value: 'done', label: 'Done' },
                  { value: 'snoozed', label: 'Snoozed' },
                ]}
                panelTitle="Status"
                ariaLabel="Filter by status"
              />
              <FormPicklist
                size="sm"
                fullWidth={false}
                value={priority}
                onChange={(value) => setPriority(value as ReminderPriority | 'all')}
                options={[
                  { value: 'all', label: 'All priorities' },
                  { value: 'high', label: 'High' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'low', label: 'Low' },
                ]}
                panelTitle="Priority"
                ariaLabel="Filter by priority"
              />
              <LabelFilterField
                value={labelIds}
                onChange={setLabelIds}
                targetType="reminder"
                ariaLabel="Filter reminders by labels"
              />
              {hasFilters ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 font-normal text-[var(--color-muted)]"
                  onClick={() => {
                    setSearchInput('')
                    setStatus('open')
                    setPriority('all')
                    setCategory('all')
                    setLabelIds([])
                  }}
                >
                  Clear
                </Button>
              ) : null}
              {canCreate ? (
                <Button
                  variant="primary"
                  size="sm"
                  className="h-8 gap-1.5"
                  onClick={() => {
                    setEditingReminder(null)
                    setFormOpen(true)
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  New reminder
                </Button>
              ) : null}
            </div>
          </div>
        }
        headerClassName="p-0"
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
        <StickyDataTable fill tableClassName="table-fixed text-sm">
          <thead>
            <tr>
              <th className={tableHeadClass('left')}>ID</th>
              <th className={tableHeadClass('left')}>Title</th>
              <th className={tableHeadClass('left')}>Due</th>
              <th className={tableHeadClass('left')}>Category</th>
              <th className={tableHeadClass('left')}>Assignee</th>
              <th className={tableHeadClass('left')}>Trip</th>
              <th className={tableHeadClass('left')}>Labels</th>
              <th className={tableHeadClass('center')}>Priority</th>
              <th className={tableHeadClass('center')}>Status</th>
              <th className={tableHeadClass('center')} aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="border-b border-[var(--color-border)]">
                  {Array.from({ length: 10 }).map((__, j) => (
                    <td key={j} className={tableCellClass('left')}>
                      <Skeleton className="h-3.5 w-full max-w-[6rem]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : reminders.length === 0 ? (
              <DataTableEmptyRow colSpan={10} icon={Inbox} title="No reminders found" description="Create a reminder or adjust filters." />
            ) : (
              reminders.map((reminder) => {
                const trip = reminder.tripId ? tripRefs[reminder.tripId] : undefined
                return (
                  <tr key={reminder.id} className="border-b border-[var(--color-border)] last:border-0">
                    <td className={tableCellClass('left', { numeric: true, extra: 'font-mono text-xs text-[var(--color-accent)]' })}>
                      {reminder.reference}
                    </td>
                    <td className={tableCellClass('left', { extra: 'truncate font-medium' })} title={reminder.title}>
                      <button
                        type="button"
                        className="truncate text-left hover:text-[var(--color-accent)]"
                        onClick={() => {
                          setEditingReminder(reminder)
                          setFormOpen(true)
                        }}
                      >
                        {reminder.title}
                      </button>
                    </td>
                    <td className={tableCellClass('left', { numeric: true, extra: 'text-xs' })}>{formatDate(reminder.dueAt)}</td>
                    <td className={tableCellClass('left', { muted: true, extra: 'text-xs' })}>
                      {REMINDER_CATEGORY_LABELS[reminder.category]}
                    </td>
                    <td className={tableCellClass('left', { extra: 'truncate text-xs' })}>{reminder.assigneeName ?? '—'}</td>
                    <td className={tableCellClass('left', { extra: 'font-mono text-xs' })}>
                      {trip ? (
                        <Link to={`/trips/${reminder.tripId}/dashboard`} className="text-[var(--color-accent)] hover:underline">
                          {trip.reference}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className={tableCellClass('left', { extra: 'px-2' })}>
                      <EntityLabelChips labels={labelsByTarget?.get(reminder.id) ?? []} maxVisible={2} nowrap />
                    </td>
                    <td className={tableCellClass('center', { extra: 'text-xs' })}>
                      {REMINDER_PRIORITY_LABELS[reminder.priority]}
                    </td>
                    <td className={tableCellClass('center', { extra: 'text-xs' })}>
                      {REMINDER_STATUS_LABELS[reminder.status]}
                    </td>
                    <td className={tableCellClass('center')}>
                      <div className="flex items-center justify-center gap-1">
                        {reminder.tripId ? (
                          <Link
                            to={`/trips/${reminder.tripId}/dashboard`}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-accent)]"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        ) : null}
                        {canCreate ? (
                          <button
                            type="button"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-muted)] hover:bg-[var(--color-danger-muted)] hover:text-[var(--color-danger)]"
                            disabled={isPending}
                            onClick={() => deleteReminder.mutate(reminder.id)}
                            aria-label={`Delete ${reminder.reference}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </StickyDataTable>
      </DataTableShell>

      <ReminderFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        reminder={editingReminder}
      />
    </Page>
  )
}
