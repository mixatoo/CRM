import { useCallback, useMemo } from 'react'
import { Inbox } from 'lucide-react'
import type { ReactNode } from 'react'
import { DataTableEmptyRow } from '@/design-system/components/DataTableEmptyState'
import { Skeleton } from '@/design-system/components/Skeleton'
import { AccountsListTableFrame } from '@/features/clients/components/list/accounts-list-table-frame'
import { clientsTableHeadRowClassName } from '@/features/clients/components/list/clients-table-header-ui'
import { renderClientLinkedServicesTableHeader } from '@/features/clients/components/services/client-linked-services-table-column-render'
import { CLIENT_LINKED_SERVICES_TABLE_COLUMN_WIDTHS } from '@/features/clients/components/services/client-linked-services-table-columns'
import { ClientLinkedServicesTableColgroup } from '@/features/clients/components/services/ClientLinkedServicesTableColgroup'
import { ClientLinkedServicesTableRow } from '@/features/clients/components/services/ClientLinkedServicesTableRow'
import type { ClientLinkedServicesTableLayout } from '@/features/clients/hooks/use-client-linked-services-table-layout'
import type { ClientLinkedServicesRowSelection } from '@/features/clients/hooks/use-client-linked-services-row-selection'
import type { ClientLinkedServiceRow } from '@/features/clients/utils/client-linked-services-list'
import type { ClientLinkedServiceSortDir, ClientLinkedServiceSortField } from '@/features/clients/utils/client-linked-services-list'
import type { PaginatedResult, PageSizeOption } from '@/types/pagination'
import { tableCellClass, tableSelectionCellClass } from '@/design-system/components/table-styles'
import type { MouseEvent } from 'react'

function ClientLinkedServicesTableSkeleton({ colCount }: { colCount: number }) {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <tr key={i} className="border-b border-[var(--color-border)]/45">
          {Array.from({ length: colCount }).map((__, j) => (
            <td key={j} className={j === 0 ? tableSelectionCellClass() : tableCellClass('left')}>
              {j === 0 ? (
                <Skeleton className="mx-auto size-5 rounded-full" />
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

interface ClientLinkedServicesTableProps {
  toolbar?: ReactNode
  selection: ClientLinkedServicesRowSelection
  result?: PaginatedResult<ClientLinkedServiceRow>
  page: number
  pageSize: number
  sortBy: ClientLinkedServiceSortField
  sortDir: ClientLinkedServiceSortDir
  onSort: (field: ClientLinkedServiceSortField) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: PageSizeOption) => void
  onOpen: (service: ClientLinkedServiceRow, event?: MouseEvent) => void
  isLoading?: boolean
  isFetching?: boolean
  layout: ClientLinkedServicesTableLayout
}

export function ClientLinkedServicesTable({
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
  onOpen,
  isLoading,
  isFetching,
  layout,
}: ClientLinkedServicesTableProps) {
  const { orderedVisibleKeys } = layout
  const visibleColCount = orderedVisibleKeys.length
  const services = result?.items ?? []
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
    (serviceId: string, button: number) => {
      handleSelectionPointerDown(serviceId, button)
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

  const colgroup = <ClientLinkedServicesTableColgroup orderedKeys={orderedVisibleKeys} />

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
      stickySelectionColumnWidth={CLIENT_LINKED_SERVICES_TABLE_COLUMN_WIDTHS.selection}
      isDragSelecting={isDragSelecting}
      colgroup={colgroup}
      thead={
        <thead className={clientsTableHeadRowClassName}>
          <tr>
            {orderedVisibleKeys.map((key) => renderClientLinkedServicesTableHeader(key, headerContext))}
          </tr>
        </thead>
      }
      tbody={
        <tbody>
          {isLoading ? (
            <ClientLinkedServicesTableSkeleton colCount={visibleColCount} />
          ) : services.length === 0 ? (
            <DataTableEmptyRow
              colSpan={visibleColCount}
              icon={Inbox}
              title="No trip services"
              description="Services on this account's trips will appear here."
            />
          ) : (
            services.map((service) => (
              <ClientLinkedServicesTableRow
                key={service.id}
                service={service}
                orderedVisibleKeys={orderedVisibleKeys}
                isDragSelecting={isDragSelecting}
                onOpen={onOpen}
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
