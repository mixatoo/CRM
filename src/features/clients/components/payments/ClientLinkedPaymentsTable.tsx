import { useCallback, useMemo } from 'react'
import { Inbox } from 'lucide-react'
import type { MouseEvent, ReactNode } from 'react'
import { DataTableEmptyRow } from '@/design-system/components/DataTableEmptyState'
import { Skeleton } from '@/design-system/components/Skeleton'
import { AccountsListTableFrame } from '@/features/clients/components/list/accounts-list-table-frame'
import { clientsTableHeadRowClassName } from '@/features/clients/components/list/clients-table-header-ui'
import { renderClientLinkedPaymentsTableHeader } from '@/features/clients/components/payments/client-linked-payments-table-column-render'
import { CLIENT_LINKED_PAYMENTS_TABLE_COLUMN_WIDTHS } from '@/features/clients/components/payments/client-linked-payments-table-columns'
import { ClientLinkedPaymentsTableColgroup } from '@/features/clients/components/payments/ClientLinkedPaymentsTableColgroup'
import { ClientLinkedPaymentsTableRow } from '@/features/clients/components/payments/ClientLinkedPaymentsTableRow'
import type { ClientLinkedPaymentsTableLayout } from '@/features/clients/hooks/use-client-linked-payments-table-layout'
import type { ClientLinkedPaymentsRowSelection } from '@/features/clients/hooks/use-client-linked-payments-row-selection'
import type { ClientLinkedPaymentRow } from '@/features/clients/utils/client-linked-payments-list'
import type { ClientLinkedPaymentSortDir, ClientLinkedPaymentSortField } from '@/features/clients/utils/client-linked-payments-list'
import type { PaginatedResult, PageSizeOption } from '@/types/pagination'
import { tableCellClass, tableSelectionCellClass } from '@/design-system/components/table-styles'

function ClientLinkedPaymentsTableSkeleton({ colCount }: { colCount: number }) {
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

interface ClientLinkedPaymentsTableProps {
  toolbar?: ReactNode
  selection: ClientLinkedPaymentsRowSelection
  result?: PaginatedResult<ClientLinkedPaymentRow>
  page: number
  pageSize: number
  sortBy: ClientLinkedPaymentSortField
  sortDir: ClientLinkedPaymentSortDir
  onSort: (field: ClientLinkedPaymentSortField) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: PageSizeOption) => void
  onOpen: (payment: ClientLinkedPaymentRow, event?: MouseEvent) => void
  isLoading?: boolean
  isFetching?: boolean
  layout: ClientLinkedPaymentsTableLayout
}

export function ClientLinkedPaymentsTable({
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
}: ClientLinkedPaymentsTableProps) {
  const { orderedVisibleKeys } = layout
  const visibleColCount = orderedVisibleKeys.length
  const payments = result?.items ?? []
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
    (paymentId: string, button: number) => {
      handleSelectionPointerDown(paymentId, button)
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

  const colgroup = <ClientLinkedPaymentsTableColgroup orderedKeys={orderedVisibleKeys} />

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
      stickySelectionColumnWidth={CLIENT_LINKED_PAYMENTS_TABLE_COLUMN_WIDTHS.selection}
      isDragSelecting={isDragSelecting}
      colgroup={colgroup}
      thead={
        <thead className={clientsTableHeadRowClassName}>
          <tr>
            {orderedVisibleKeys.map((key) => renderClientLinkedPaymentsTableHeader(key, headerContext))}
          </tr>
        </thead>
      }
      tbody={
        <tbody>
          {isLoading ? (
            <ClientLinkedPaymentsTableSkeleton colCount={visibleColCount} />
          ) : payments.length === 0 ? (
            <DataTableEmptyRow
              colSpan={visibleColCount}
              icon={Inbox}
              title="No collections recorded"
              description="Client receipts and invoice allocations will appear here."
            />
          ) : (
            payments.map((payment) => (
              <ClientLinkedPaymentsTableRow
                key={payment.id}
                payment={payment}
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
