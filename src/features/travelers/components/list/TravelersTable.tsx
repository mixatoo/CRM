import { useCallback, useMemo } from 'react'
import { Inbox, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Traveler } from '@/domain/entities/traveler'
import type { TravelerListItem, TravelerSortDir, TravelerSortField } from '@/repositories/interfaces'
import { DataTableEmptyRow } from '@/design-system/components/DataTableEmptyState'
import { Skeleton } from '@/design-system/components/Skeleton'
import { AccountsListTableFrame } from '@/features/clients/components/list/accounts-list-table-frame'
import { renderTravelersTableHeader } from '@/features/travelers/components/list/travelers-table-column-render'
import { TRAVELERS_TABLE_COLUMN_WIDTHS } from '@/features/travelers/components/list/travelers-table-columns'
import {
  clientsTableHeadRowClassName,
} from '@/features/clients/components/list/clients-table-header-ui'
import { TravelersTableColgroup } from '@/features/travelers/components/list/TravelersTableColgroup'
import { TravelersTableRow } from '@/features/travelers/components/list/TravelersTableRow'
import type { TravelersTableLayout } from '@/features/travelers/hooks/use-travelers-table-layout'
import type { TravelerRowSelection } from '@/features/travelers/hooks/use-travelers-row-selection'
import type { PaginatedResult, PageSizeOption } from '@/types/pagination'
import { tableCellClass, tableSelectionCellClass } from '@/design-system/components/table-styles'
import { CRM_LABELS } from '@/features/clients/config/crm-labels'

function TravelersTableSkeleton({ colCount }: { colCount: number }) {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="border-b border-[var(--color-border)]/40">
          {Array.from({ length: colCount }).map((__, j) => (
            <td
              key={j}
              className={
                j === 0
                  ? tableSelectionCellClass('!py-2.5')
                  : tableCellClass('left', { extra: '!py-2.5' })
              }
            >
              {j === 0 ? (
                <Skeleton className="mx-auto size-5 rounded-full" />
              ) : j === 1 ? (
                <Skeleton className="h-3 w-12 max-w-full" />
              ) : j === 2 ? (
                <span className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 shrink-0 rounded-[var(--radius-sm)]" />
                  <Skeleton className="h-3.5 w-28 max-w-full" />
                </span>
              ) : (
                <Skeleton className="h-3.5 w-full max-w-[7.5rem]" />
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

interface TravelersTableProps {
  toolbar?: ReactNode
  selection: TravelerRowSelection
  result?: PaginatedResult<TravelerListItem>
  page: number
  pageSize: number
  sortBy: TravelerSortField
  sortDir: TravelerSortDir
  onSort: (field: TravelerSortField) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: PageSizeOption) => void
  isLoading?: boolean
  isFetching?: boolean
  layout: TravelersTableLayout
  hasActiveSearch?: boolean
  onEditTraveler: (traveler: Traveler) => void
  onOpenProfile: (traveler: Traveler) => void
  onDeleteTraveler: (id: string) => void
  onOpenAccount: (traveler: Traveler) => void
  deletingTravelerId?: string
}

export function TravelersTable({
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
  hasActiveSearch = false,
  onEditTraveler,
  onOpenProfile,
  onDeleteTraveler,
  onOpenAccount,
  deletingTravelerId,
}: TravelersTableProps) {
  const { orderedVisibleKeys } = layout
  const visibleColCount = orderedVisibleKeys.length
  const travelers = result?.items ?? []
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
    (travelerId: string, button: number) => {
      handleSelectionPointerDown(travelerId, button)
    },
    [handleSelectionPointerDown],
  )

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

  const colgroup = <TravelersTableColgroup orderedKeys={orderedVisibleKeys} />

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
      stickySelectionColumnWidth={TRAVELERS_TABLE_COLUMN_WIDTHS.selection}
      isDragSelecting={isDragSelecting}
      colgroup={colgroup}
      thead={
        <thead className={clientsTableHeadRowClassName}>
          <tr>
            {orderedVisibleKeys.map((key) => renderTravelersTableHeader(key, headerContext))}
          </tr>
        </thead>
      }
      tbody={
        <tbody>
          {isLoading ? (
            <TravelersTableSkeleton colCount={visibleColCount} />
          ) : travelers.length === 0 ? (
            <DataTableEmptyRow
              colSpan={visibleColCount}
              icon={hasActiveSearch ? Inbox : Users}
              title={hasActiveSearch ? 'No matching travelers' : `No ${CRM_LABELS.travelers.toLowerCase()} yet`}
              description={
                hasActiveSearch
                  ? 'Try a different name, account, role, email, or phone.'
                  : `Add passengers, bookers, and contacts across all ${CRM_LABELS.accounts.toLowerCase()}.`
              }
            />
          ) : (
            travelers.map((traveler) => (
              <TravelersTableRow
                key={traveler.id}
                traveler={traveler}
                orderedVisibleKeys={orderedVisibleKeys}
                isDragSelecting={isDragSelecting}
                onSelectionPointerDown={onSelectionPointerDown}
                onSelectionPointerEnter={handleSelectionPointerEnter}
                onSelectionClick={handleSelectionClick}
                onEdit={onEditTraveler}
                onDelete={onDeleteTraveler}
                onOpenAccount={onOpenAccount}
                onOpenProfile={onOpenProfile}
                onRowActivate={onOpenProfile}
                deletingTravelerId={deletingTravelerId}
              />
            ))
          )}
        </tbody>
      }
    />
  )
}
