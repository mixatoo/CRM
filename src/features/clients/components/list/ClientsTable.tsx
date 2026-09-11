import type { MouseEvent, ReactNode } from 'react'
import { useCallback, useMemo } from 'react'
import { Inbox } from 'lucide-react'
import type { Client } from '@/domain/entities/client'
import { DataTableEmptyRow } from '@/design-system/components/DataTableEmptyState'
import { Skeleton } from '@/design-system/components/Skeleton'
import { AccountsListTableFrame } from '@/features/clients/components/list/accounts-list-table-frame'
import { ClientsTableRow } from '@/features/clients/components/list/ClientsTableRow'
import { renderClientsTableHeader } from '@/features/clients/components/list/clients-table-column-render'
import { clientsTableHeadRowClassName } from '@/features/clients/components/list/clients-table-header-ui'
import {
  ClientsTableColgroup,
  CLIENTS_TABLE_COLUMN_WIDTHS,
} from '@/features/clients/components/list/clients-table-columns'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { useClientTripCounts } from '@/features/clients/hooks/use-clients'
import { useEntityLabelAssignments } from '@/features/labels/hooks/use-labels'
import type { ClientsTableLayout } from '@/features/clients/hooks/use-clients-table-layout'
import type { ClientRowSelection } from '@/features/clients/hooks/use-client-row-selection'
import { isBackgroundClientOpen, useClientTabNavigation } from '@/features/clients/hooks/use-client-tab-navigation'
import type { PaginatedResult, PageSizeOption } from '@/types/pagination'
import type { ClientSortDir, ClientSortField } from '@/repositories/interfaces'
import { tableCellClass, tableSelectionCellClass } from '@/design-system/components/table-styles'

function ClientsTableSkeleton({ colCount }: { colCount: number }) {
  return (
    <>
      {Array.from({ length: 12 }).map((_, i) => (
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

interface ClientsTableProps {
  toolbar?: ReactNode
  selection: ClientRowSelection
  result?: PaginatedResult<Client>
  page: number
  pageSize: number
  sortBy: ClientSortField
  sortDir: ClientSortDir
  onSort: (field: ClientSortField) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: PageSizeOption) => void
  isLoading?: boolean
  isFetching?: boolean
  layout: ClientsTableLayout
  onEditClient: (client: Client) => void
  onCloneClient?: (client: Client) => void
  onDeleteClient: (id: string) => void
  cloningClientId?: string
  deletingClientId?: string
}

export function ClientsTable({
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
  onEditClient,
  onCloneClient,
  onDeleteClient,
  cloningClientId,
  deletingClientId,
}: ClientsTableProps) {
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const { navigateToClient } = useClientTabNavigation()
  const { orderedVisibleKeys } = layout
  const visibleColCount = orderedVisibleKeys.length

  const clients = result?.items ?? []
  const clientIds = useMemo(() => clients.map((client) => client.id), [clients])
  const { data: tripCounts } = useClientTripCounts(clientIds)
  const { data: labelsByTarget } = useEntityLabelAssignments('client', clientIds)

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
    (clientId: string, button: number) => {
      handleSelectionPointerDown(clientId, button)
    },
    [handleSelectionPointerDown],
  )

  const openClient = useCallback(
    (clientId: string, event?: MouseEvent) => {
      navigateToClient(clientId, {
        background: event ? isBackgroundClientOpen(event) : false,
      })
    },
    [navigateToClient],
  )

  const handleDelete = useCallback((id: string) => onDeleteClient(id), [onDeleteClient])

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

  const colgroup = <ClientsTableColgroup orderedKeys={orderedVisibleKeys} />

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
      stickySelectionColumnWidth={CLIENTS_TABLE_COLUMN_WIDTHS.selection}
      isDragSelecting={isDragSelecting}
      colgroup={colgroup}
      thead={
        <thead className={clientsTableHeadRowClassName}>
          <tr>{orderedVisibleKeys.map((key) => renderClientsTableHeader(key, headerContext))}</tr>
        </thead>
      }
      tbody={
        <tbody>
          {isLoading ? (
            <ClientsTableSkeleton colCount={visibleColCount} />
          ) : clients.length === 0 ? (
            <DataTableEmptyRow
              colSpan={visibleColCount}
              icon={Inbox}
              title="No clients found"
              description="Adjust search or filters."
            />
          ) : (
            clients.map((client) => (
              <ClientsTableRow
                key={client.id}
                client={client}
                role={role}
                tripCount={tripCounts?.[client.id] ?? 0}
                labels={labelsByTarget?.get(client.id) ?? []}
                orderedVisibleKeys={orderedVisibleKeys}
                isDeleting={deletingClientId === client.id}
                isDragSelecting={isDragSelecting}
                onOpen={openClient}
                onEdit={onEditClient}
                onClone={onCloneClient}
                onDelete={handleDelete}
                cloningClientId={cloningClientId}
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
