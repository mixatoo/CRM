import type { MouseEvent, ReactNode } from 'react'
import { useCallback, useMemo } from 'react'
import { Inbox } from 'lucide-react'
import type { Trip } from '@/domain/entities'
import { DataTableEmptyRow } from '@/design-system/components/DataTableEmptyState'
import { Skeleton } from '@/design-system/components/Skeleton'
import { AccountsListTableFrame } from '@/features/clients/components/list/accounts-list-table-frame'
import { clientsTableHeadRowClassName } from '@/features/clients/components/list/clients-table-header-ui'
import { renderTripsTableHeader } from '@/features/trips/components/list/trips-table-column-render'
import { TRIPS_TABLE_COLUMN_WIDTHS } from '@/features/trips/components/list/trips-table-columns'
import { TripsTableColgroup } from '@/features/trips/components/list/TripsTableColgroup'
import { TripsTableRow } from '@/features/trips/components/list/TripsTableRow'
import { useEntityLabelAssignments } from '@/features/labels/hooks/use-labels'
import type { TripsTableLayout } from '@/features/trips/hooks/use-trips-table-layout'
import type { TripRowSelection } from '@/features/trips/hooks/use-trip-row-selection'
import { useTripMutations } from '@/features/trips/hooks/use-trip-mutations'
import {
  isBackgroundTripOpen,
  useTripTabNavigation,
} from '@/features/trips/hooks/use-trip-tab-navigation'
import type { PaginatedResult, PageSizeOption } from '@/types/pagination'
import type { TripSortDir, TripSortField } from '@/repositories/interfaces'
import { tableCellClass, tableSelectionCellClass } from '@/design-system/components/table-styles'

function TripsTableSkeleton({ colCount }: { colCount: number }) {
  return (
    <>
      {Array.from({ length: 12 }).map((_, i) => (
        <tr key={i} className="border-b border-[var(--color-border)]/45">
          {Array.from({ length: colCount }).map((__, j) => (
            <td key={j} className={j === 0 ? tableSelectionCellClass() : tableCellClass('left')}>
              {j === 0 ? (
                <Skeleton className="mx-auto size-5 rounded-full" />
              ) : j === 1 ? (
                <Skeleton className="h-3 w-12 max-w-full" />
              ) : (
                <Skeleton className="h-3.5 w-full max-w-[6rem]" />
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

interface TripsTableProps {
  toolbar?: ReactNode
  selection: TripRowSelection
  result?: PaginatedResult<Trip>
  page: number
  pageSize: number
  sortBy: TripSortField
  sortDir: TripSortDir
  onSort: (field: TripSortField) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: PageSizeOption) => void
  isLoading?: boolean
  isFetching?: boolean
  layout: TripsTableLayout
}

export function TripsTable({
  toolbar,
  selection,
  result,
  page,
  pageSize,
  sortBy,
  sortDir,
  onSort,
  onPageChange,
  onPageSizeChange,
  isLoading,
  isFetching,
  layout,
}: TripsTableProps) {
  const { orderedVisibleKeys } = layout
  const visibleColCount = orderedVisibleKeys.length

  const { cloneTrip, deleteTrip, cloningTripId, deletingTripId } = useTripMutations()
  const { navigateToTrip } = useTripTabNavigation()
  const trips = result?.items ?? []
  const tripIds = useMemo(() => trips.map((trip) => trip.id), [trips])
  const { data: labelsByTarget } = useEntityLabelAssignments('trip', tripIds)
  const total = result?.total ?? 0

  const {
    allPageSelected,
    somePageSelected,
    togglePage,
    handleSelectionPointerDown,
    handleSelectionPointerEnter,
    handleSelectionClick,
    isDragSelecting,
  } = selection

  const onSelectionPointerDown = useCallback(
    (tripId: string, button: number) => {
      handleSelectionPointerDown(tripId, button)
    },
    [handleSelectionPointerDown],
  )

  const openTrip = useCallback(
    (tripId: string, event?: MouseEvent) => {
      navigateToTrip(tripId, {
        background: event ? isBackgroundTripOpen(event) : false,
      })
    },
    [navigateToTrip],
  )

  const handleDelete = useCallback((id: string) => deleteTrip(id), [deleteTrip])

  const headerContext = useMemo(
    () => ({
      sortBy,
      sortDir,
      onSort,
      allPageSelected,
      somePageSelected,
      onTogglePage: togglePage,
    }),
    [allPageSelected, onSort, somePageSelected, sortBy, sortDir, togglePage],
  )

  const colgroup = <TripsTableColgroup orderedKeys={orderedVisibleKeys} />

  return (
    <AccountsListTableFrame
      toolbar={toolbar}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      isLoading={isLoading}
      isFetching={isFetching}
      stickySelectionColumnWidth={TRIPS_TABLE_COLUMN_WIDTHS.selection}
      isDragSelecting={isDragSelecting}
      colgroup={colgroup}
      thead={
        <thead className={clientsTableHeadRowClassName}>
          <tr>
            {orderedVisibleKeys.map((key) => renderTripsTableHeader(key, headerContext))}
          </tr>
        </thead>
      }
      tbody={
        <tbody>
          {isLoading ? (
            <TripsTableSkeleton colCount={visibleColCount} />
          ) : trips.length === 0 ? (
            <DataTableEmptyRow
              colSpan={visibleColCount}
              icon={Inbox}
              title="No trips found"
              description="Adjust search or filters."
            />
          ) : (
            trips.map((trip) => (
              <TripsTableRow
                key={trip.id}
                trip={trip}
                labels={labelsByTarget?.get(trip.id) ?? []}
                orderedVisibleKeys={orderedVisibleKeys}
                isDeleting={deletingTripId === trip.id}
                isCloning={cloningTripId === trip.id}
                isDragSelecting={isDragSelecting}
                onOpen={openTrip}
                onClone={cloneTrip}
                onDelete={handleDelete}
                onSelectionPointerDown={onSelectionPointerDown}
                onSelectionPointerEnter={handleSelectionPointerEnter}
                onSelectionClick={handleSelectionClick}
              />
            ))
          )}
        </tbody>
      }
    />
  )
}
