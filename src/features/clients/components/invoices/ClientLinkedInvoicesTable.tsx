import { useCallback, useMemo } from 'react'
import { Inbox } from 'lucide-react'
import type { MouseEvent, ReactNode } from 'react'
import { DataTableEmptyRow } from '@/design-system/components/DataTableEmptyState'
import { Skeleton } from '@/design-system/components/Skeleton'
import { AccountsListTableFrame } from '@/features/clients/components/list/accounts-list-table-frame'
import { clientsTableHeadRowClassName } from '@/features/clients/components/list/clients-table-header-ui'
import { renderClientLinkedInvoicesTableHeader } from '@/features/clients/components/invoices/client-linked-invoices-table-column-render'
import { CLIENT_LINKED_INVOICES_TABLE_COLUMN_WIDTHS } from '@/features/clients/components/invoices/client-linked-invoices-table-columns'
import { ClientLinkedInvoicesTableColgroup } from '@/features/clients/components/invoices/ClientLinkedInvoicesTableColgroup'
import { ClientLinkedInvoicesTableRow } from '@/features/clients/components/invoices/ClientLinkedInvoicesTableRow'
import type { ClientLinkedInvoicesTableLayout } from '@/features/clients/hooks/use-client-linked-invoices-table-layout'
import type { ClientLinkedInvoicesRowSelection } from '@/features/clients/hooks/use-client-linked-invoices-row-selection'
import type { ClientLinkedInvoiceRow } from '@/features/clients/utils/client-linked-invoices-list'
import type { ClientLinkedInvoiceSortDir, ClientLinkedInvoiceSortField } from '@/features/clients/utils/client-linked-invoices-list'
import type { PaginatedResult, PageSizeOption } from '@/types/pagination'
import { tableCellClass, tableSelectionCellClass } from '@/design-system/components/table-styles'

function ClientLinkedInvoicesTableSkeleton({ colCount }: { colCount: number }) {
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

interface ClientLinkedInvoicesTableProps {
  toolbar?: ReactNode
  selection: ClientLinkedInvoicesRowSelection
  result?: PaginatedResult<ClientLinkedInvoiceRow>
  page: number
  pageSize: number
  sortBy: ClientLinkedInvoiceSortField
  sortDir: ClientLinkedInvoiceSortDir
  onSort: (field: ClientLinkedInvoiceSortField) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: PageSizeOption) => void
  onOpen: (invoice: ClientLinkedInvoiceRow, event?: MouseEvent) => void
  isLoading?: boolean
  isFetching?: boolean
  layout: ClientLinkedInvoicesTableLayout
}

export function ClientLinkedInvoicesTable({
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
}: ClientLinkedInvoicesTableProps) {
  const { orderedVisibleKeys } = layout
  const visibleColCount = orderedVisibleKeys.length
  const invoices = result?.items ?? []
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
    (invoiceId: string, button: number) => {
      handleSelectionPointerDown(invoiceId, button)
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

  const colgroup = <ClientLinkedInvoicesTableColgroup orderedKeys={orderedVisibleKeys} />

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
      stickySelectionColumnWidth={CLIENT_LINKED_INVOICES_TABLE_COLUMN_WIDTHS.selection}
      isDragSelecting={isDragSelecting}
      colgroup={colgroup}
      thead={
        <thead className={clientsTableHeadRowClassName}>
          <tr>
            {orderedVisibleKeys.map((key) => renderClientLinkedInvoicesTableHeader(key, headerContext))}
          </tr>
        </thead>
      }
      tbody={
        <tbody>
          {isLoading ? (
            <ClientLinkedInvoicesTableSkeleton colCount={visibleColCount} />
          ) : invoices.length === 0 ? (
            <DataTableEmptyRow
              colSpan={visibleColCount}
              icon={Inbox}
              title="No invoices yet"
              description="Invoices issued on this account's trips will appear here."
            />
          ) : (
            invoices.map((invoice) => (
              <ClientLinkedInvoicesTableRow
                key={invoice.id}
                invoice={invoice}
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
