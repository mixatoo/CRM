import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Client } from '@/domain/entities/client'
import type { Invoice } from '@/domain/entities/invoice'
import { canRead, shouldMaskFinancials } from '@/domain/policies/permissions'
import { ClientInvoiceDetailHost } from '@/features/clients/components/invoices/ClientInvoiceDetailHost'
import { ClientLinkedInvoicesTable } from '@/features/clients/components/invoices/ClientLinkedInvoicesTable'
import { ClientLinkedInvoicesTableColumnPicker } from '@/features/clients/components/invoices/ClientLinkedInvoicesTableColumnPicker'
import { ClientLinkedInvoicesToolbar } from '@/features/clients/components/invoices/ClientLinkedInvoicesToolbar'
import { useClientLinkedInvoicesList } from '@/features/clients/hooks/use-client-linked-invoices-list'
import { useClientLinkedInvoicesRowSelection } from '@/features/clients/hooks/use-client-linked-invoices-row-selection'
import { useClientLinkedInvoicesTableLayout } from '@/features/clients/hooks/use-client-linked-invoices-table-layout'
import type { ClientLinkedInvoiceRow } from '@/features/clients/utils/client-linked-invoices-list'
import type { ClientLinkedInvoiceSortDir, ClientLinkedInvoiceSortField } from '@/features/clients/utils/client-linked-invoices-list'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { TableRowSelectionProvider } from '@/shared/hooks/table-row-selection-context'
import { usePagination } from '@/shared/hooks/use-pagination'
import { CLIENTS_PAGE_SIZE_STORAGE_KEY } from '@/types/pagination'

interface ClientInvoicesTabProps {
  client: Client
}

export function ClientInvoicesTab({ client }: ClientInvoicesTabProps) {
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const maskFinancials = shouldMaskFinancials(role)
  const [sortBy, setSortBy] = useState<ClientLinkedInvoiceSortField>('issued')
  const [sortDir, setSortDir] = useState<ClientLinkedInvoiceSortDir>('desc')
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const { page, pageSize, setPage, setPageSize, resetPage } = usePagination({
    persistKey: CLIENTS_PAGE_SIZE_STORAGE_KEY,
  })
  const tableLayout = useClientLinkedInvoicesTableLayout()
  const { data: result, isLoading, isFetching } = useClientLinkedInvoicesList(
    client.id,
    sortBy,
    sortDir,
    page,
    pageSize,
  )
  const pageInvoiceIds = useMemo(() => result?.items.map((invoice) => invoice.id) ?? [], [result?.items])
  const selection = useClientLinkedInvoicesRowSelection(pageInvoiceIds)

  const handleSort = useCallback((field: ClientLinkedInvoiceSortField) => {
    setSortBy((current) => {
      if (current === field) {
        setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
        return current
      }
      setSortDir('asc')
      return field
    })
  }, [])

  const handleOpen = useCallback((invoice: ClientLinkedInvoiceRow) => {
    setSelectedInvoice(invoice)
    setDetailOpen(true)
  }, [])

  useEffect(() => {
    resetPage()
  }, [client.id, pageSize, sortBy, sortDir, resetPage])

  useEffect(() => {
    if (!selectedInvoice) return
    const fresh = result?.items.find((invoice) => invoice.id === selectedInvoice.id)
    if (fresh && fresh.updatedAt !== selectedInvoice.updatedAt) {
      setSelectedInvoice(fresh)
    }
  }, [result?.items, selectedInvoice])

  const isListRefreshing = isFetching && !isLoading

  if (!canRead(role, 'invoice')) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-sm text-[var(--color-muted)]">
        You do not have permission to view client invoices.
      </div>
    )
  }

  if (maskFinancials) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-sm text-[var(--color-muted)]">
        Financial data is hidden for your role.
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <TableRowSelectionProvider store={selection.store}>
        <ClientLinkedInvoicesTable
          toolbar={
            <ClientLinkedInvoicesToolbar
              total={result?.total}
              isFetching={isListRefreshing}
              columnPicker={<ClientLinkedInvoicesTableColumnPicker layout={tableLayout} />}
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

      <ClientInvoiceDetailHost
        invoice={selectedInvoice}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onDeleted={() => setSelectedInvoice(null)}
      />
    </div>
  )
}
