import { useCallback, useMemo, type ReactNode } from 'react'
import { Inbox, Users } from 'lucide-react'
import type { Traveler } from '@/domain/entities/traveler'
import { DataTableEmptyRow } from '@/design-system/components/DataTableEmptyState'
import { Skeleton } from '@/design-system/components/Skeleton'
import { AccountsListTableFrame } from '@/features/clients/components/list/accounts-list-table-frame'
import { renderClientTravelersTableHeader } from '@/features/travelers/components/client-travelers-table-column-render'
import { CLIENT_TRAVELERS_TABLE_COLUMN_WIDTHS } from '@/features/travelers/components/client-travelers-table-columns'
import {
  clientsTableHeadRowClassName,
} from '@/features/clients/components/list/clients-table-header-ui'
import { ClientTravelersTableColgroup } from '@/features/travelers/components/ClientTravelersTableColgroup'
import { ClientTravelersTableRow } from '@/features/travelers/components/ClientTravelersTableRow'
import type { ClientTravelersTableLayout } from '@/features/travelers/hooks/use-client-travelers-table-layout'
import type { ClientTravelersRowSelection } from '@/features/travelers/hooks/use-client-travelers-row-selection'
import type { ClientTravelerSortDir, ClientTravelerSortField } from '@/features/travelers/utils/client-travelers-list'
import type { PaginatedResult, PageSizeOption } from '@/types/pagination'
import { tableCellClass, tableSelectionCellClass } from '@/design-system/components/table-styles'
import { CRM_LABELS } from '@/features/clients/config/crm-labels'

function ClientTravelersTableSkeleton({ colCount }: { colCount: number }) {
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

interface ClientTravelersTableProps {
  toolbar?: ReactNode
  selection: ClientTravelersRowSelection
  result?: PaginatedResult<Traveler>
  page: number
  pageSize: number
  sortBy: ClientTravelerSortField
  sortDir: ClientTravelerSortDir
  onSort: (field: ClientTravelerSortField) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: PageSizeOption) => void
  isLoading?: boolean
  isFetching?: boolean
  layout: ClientTravelersTableLayout
  hasActiveSearch?: boolean
  onEditTraveler?: (traveler: Traveler) => void
  onOpenProfile?: (traveler: Traveler) => void
  onDeleteTraveler?: (id: string) => void
  deletingTravelerId?: string
}

export function ClientTravelersTable({
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
  deletingTravelerId,
}: ClientTravelersTableProps) {
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

  const colgroup = <ClientTravelersTableColgroup orderedKeys={orderedVisibleKeys} />

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
      stickySelectionColumnWidth={CLIENT_TRAVELERS_TABLE_COLUMN_WIDTHS.selection}
      isDragSelecting={isDragSelecting}
      colgroup={colgroup}
      thead={
        <thead className={clientsTableHeadRowClassName}>
          <tr>
            {orderedVisibleKeys.map((key) => renderClientTravelersTableHeader(key, headerContext))}
          </tr>
        </thead>
      }
      tbody={
        <tbody>
          {isLoading ? (
            <ClientTravelersTableSkeleton colCount={visibleColCount} />
          ) : travelers.length === 0 ? (
            <DataTableEmptyRow
              colSpan={visibleColCount}
              icon={hasActiveSearch ? Inbox : Users}
              title={hasActiveSearch ? 'No matching travelers' : 'No travelers linked'}
              description={
                hasActiveSearch
                  ? 'Try a different name, role, email, or phone.'
                  : `People linked to this ${CRM_LABELS.account.toLowerCase()} will appear here.`
              }
            />
          ) : (
            travelers.map((traveler) => (
              <ClientTravelersTableRow
                key={traveler.id}
                traveler={traveler}
                orderedVisibleKeys={orderedVisibleKeys}
                isDragSelecting={isDragSelecting}
                onSelectionPointerDown={onSelectionPointerDown}
                onSelectionPointerEnter={handleSelectionPointerEnter}
                onSelectionClick={handleSelectionClick}
                onEdit={onEditTraveler}
                onOpenProfile={onOpenProfile}
                onDelete={onDeleteTraveler}
                deletingTravelerId={deletingTravelerId}
              />
            ))
          )}
        </tbody>
      }
    />
  )
}
