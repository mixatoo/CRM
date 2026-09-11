import type { CSSProperties, ReactNode } from 'react'
import { DataTableShell } from '@/design-system/layout/DataTableShell'
import { Pagination } from '@/design-system/components/Pagination'
import {
  clientsTableBodyGridClassName,
  clientsTableHeaderGridClassName,
} from '@/features/clients/components/list/clients-table-header-ui'
import type { PageSizeOption } from '@/types/pagination'
import { cn } from '@/shared/utils/cn'

const TABLE_BASE_CLASS = 'w-full min-w-full table-fixed border-collapse text-sm'

export interface AccountsListTableFrameProps {
  toolbar?: ReactNode
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: PageSizeOption) => void
  isLoading?: boolean
  isFetching?: boolean
  stickySelectionColumnWidth: string
  isDragSelecting?: boolean
  /** Overrides the default accounts header grid chrome. */
  headerGridClassName?: string
  colgroup: ReactNode
  thead: ReactNode
  tbody: ReactNode
}

export function AccountsListTableFrame({
  toolbar,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  isLoading,
  isFetching,
  stickySelectionColumnWidth,
  isDragSelecting,
  headerGridClassName,
  colgroup,
  thead,
  tbody,
}: AccountsListTableFrameProps) {
  const totalPages = total > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1
  const stickyColStyle = {
    '--sticky-col-1-width': stickySelectionColumnWidth,
  } as CSSProperties

  return (
    <DataTableShell
      className="h-full min-h-0 flex-1 rounded-none shadow-none"
      contentClassName="min-h-0 flex-1"
      header={toolbar}
      headerClassName="p-0"
      isFetching={isFetching && !isLoading}
      footer={
        <Pagination
          compact
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      }
    >
      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--color-surface)]"
        style={stickyColStyle}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-x-auto overflow-y-hidden">
          <div className="shrink-0">
            <table className={cn(TABLE_BASE_CLASS, headerGridClassName ?? clientsTableHeaderGridClassName)}>
              {colgroup}
              {thead}
            </table>
          </div>

          <div
            className={cn(
              'min-h-0 flex-1 overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable]',
              isDragSelecting && 'select-none [&_[data-client-row-selection]]:cursor-grabbing',
            )}
          >
            <table className={cn(TABLE_BASE_CLASS, clientsTableBodyGridClassName)}>
              {colgroup}
              {tbody}
            </table>
          </div>
        </div>
      </div>
    </DataTableShell>
  )
}
