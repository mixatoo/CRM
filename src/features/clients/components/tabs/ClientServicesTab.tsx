import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Client } from '@/domain/entities/client'
import { ClientLinkedServicesTable } from '@/features/clients/components/services/ClientLinkedServicesTable'
import { ClientLinkedServicesTableColumnPicker } from '@/features/clients/components/services/ClientLinkedServicesTableColumnPicker'
import { ClientLinkedServicesToolbar } from '@/features/clients/components/services/ClientLinkedServicesToolbar'
import { useClientLinkedServicesList } from '@/features/clients/hooks/use-client-linked-services-list'
import { useClientLinkedServicesRowSelection } from '@/features/clients/hooks/use-client-linked-services-row-selection'
import { useClientLinkedServicesTableLayout } from '@/features/clients/hooks/use-client-linked-services-table-layout'
import type { ClientLinkedServiceRow } from '@/features/clients/utils/client-linked-services-list'
import type { ClientLinkedServiceSortDir, ClientLinkedServiceSortField } from '@/features/clients/utils/client-linked-services-list'
import { TableRowSelectionProvider } from '@/shared/hooks/table-row-selection-context'
import { usePagination } from '@/shared/hooks/use-pagination'
import { CLIENTS_PAGE_SIZE_STORAGE_KEY } from '@/types/pagination'

interface ClientServicesTabProps {
  client: Client
}

export function ClientServicesTab({ client }: ClientServicesTabProps) {
  const navigate = useNavigate()
  const [sortBy, setSortBy] = useState<ClientLinkedServiceSortField>('startDate')
  const [sortDir, setSortDir] = useState<ClientLinkedServiceSortDir>('desc')
  const { page, pageSize, setPage, setPageSize, resetPage } = usePagination({
    persistKey: CLIENTS_PAGE_SIZE_STORAGE_KEY,
  })
  const tableLayout = useClientLinkedServicesTableLayout()
  const { data: result, isLoading, isFetching } = useClientLinkedServicesList(
    client.id,
    sortBy,
    sortDir,
    page,
    pageSize,
  )
  const pageServiceIds = useMemo(() => result?.items.map((service) => service.id) ?? [], [result?.items])
  const selection = useClientLinkedServicesRowSelection(pageServiceIds)

  const handleSort = useCallback((field: ClientLinkedServiceSortField) => {
    setSortBy((current) => {
      if (current === field) {
        setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
        return current
      }
      setSortDir('asc')
      return field
    })
  }, [])

  const handleOpen = useCallback(
    (service: ClientLinkedServiceRow, event?: MouseEvent) => {
      const path = `/trips/${service.tripId}/services/${service.id}`
      if (event?.metaKey || event?.ctrlKey || event?.button === 1) {
        window.open(path, '_blank', 'noopener,noreferrer')
        return
      }
      navigate(path)
    },
    [navigate],
  )

  useEffect(() => {
    resetPage()
  }, [client.id, pageSize, sortBy, sortDir, resetPage])

  const isListRefreshing = isFetching && !isLoading

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <TableRowSelectionProvider store={selection.store}>
        <ClientLinkedServicesTable
          toolbar={
            <ClientLinkedServicesToolbar
              total={result?.total}
              isFetching={isListRefreshing}
              columnPicker={<ClientLinkedServicesTableColumnPicker layout={tableLayout} />}
            />
          }
          selection={selection}
          result={result}
          page={page}
          pageSize={pageSize}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onOpen={handleOpen}
          isLoading={isLoading}
          isFetching={isListRefreshing}
          layout={tableLayout}
        />
      </TableRowSelectionProvider>
    </div>
  )
}
