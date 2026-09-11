import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Client } from '@/domain/entities/client'
import type { Invoice } from '@/domain/entities/invoice'
import { canMutate, canRead, shouldMaskFinancials } from '@/domain/policies/permissions'
import { ClientInvoiceDetailHost } from '@/features/clients/components/invoices/ClientInvoiceDetailHost'
import { ClientLinkedPaymentsTable } from '@/features/clients/components/payments/ClientLinkedPaymentsTable'
import { ClientLinkedPaymentsTableColumnPicker } from '@/features/clients/components/payments/ClientLinkedPaymentsTableColumnPicker'
import { ClientLinkedPaymentsToolbar } from '@/features/clients/components/payments/ClientLinkedPaymentsToolbar'
import { RecordClientReceiptDialog } from '@/features/clients/components/payments/RecordClientReceiptDialog'
import { useClientPaymentMutations } from '@/features/clients/hooks/use-client-payment-mutations'
import { useClientLinkedPaymentsList } from '@/features/clients/hooks/use-client-linked-payments-list'
import { useClientLinkedPaymentsRowSelection } from '@/features/clients/hooks/use-client-linked-payments-row-selection'
import { useClientLinkedPaymentsTableLayout } from '@/features/clients/hooks/use-client-linked-payments-table-layout'
import type { ClientLinkedPaymentRow } from '@/features/clients/utils/client-linked-payments-list'
import type { ClientLinkedPaymentSortDir, ClientLinkedPaymentSortField } from '@/features/clients/utils/client-linked-payments-list'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { TableRowSelectionProvider } from '@/shared/hooks/table-row-selection-context'
import { usePagination } from '@/shared/hooks/use-pagination'
import { CLIENTS_PAGE_SIZE_STORAGE_KEY } from '@/types/pagination'

interface ClientPaymentsTabProps {
  client: Client
}

export function ClientPaymentsTab({ client }: ClientPaymentsTabProps) {
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const maskFinancials = shouldMaskFinancials(role)
  const canCreate = canMutate(role, 'payment', 'create')
  const [sortBy, setSortBy] = useState<ClientLinkedPaymentSortField>('date')
  const [sortDir, setSortDir] = useState<ClientLinkedPaymentSortDir>('desc')
  const [detailOpen, setDetailOpen] = useState(false)
  const [recordOpen, setRecordOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const { page, pageSize, setPage, setPageSize, resetPage } = usePagination({
    persistKey: CLIENTS_PAGE_SIZE_STORAGE_KEY,
  })
  const tableLayout = useClientLinkedPaymentsTableLayout()
  const { recordReceiptAsync, isRecording } = useClientPaymentMutations(client.id)
  const { data: result, isLoading, isFetching } = useClientLinkedPaymentsList(
    client.id,
    sortBy,
    sortDir,
    page,
    pageSize,
  )
  const pagePaymentIds = useMemo(() => result?.items.map((payment) => payment.id) ?? [], [result?.items])
  const selection = useClientLinkedPaymentsRowSelection(pagePaymentIds)

  const handleSort = useCallback((field: ClientLinkedPaymentSortField) => {
    setSortBy((current) => {
      if (current === field) {
        setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
        return current
      }
      setSortDir('asc')
      return field
    })
  }, [])

  const handleOpen = useCallback((payment: ClientLinkedPaymentRow) => {
    if (!payment.linkedInvoice) return
    setSelectedInvoice(payment.linkedInvoice)
    setDetailOpen(true)
  }, [])

  const handleRecord = useCallback(
    (input: Parameters<typeof recordReceiptAsync>[0]) => {
      void recordReceiptAsync(input, { onSuccess: () => setRecordOpen(false) })
    },
    [recordReceiptAsync],
  )

  useEffect(() => {
    resetPage()
  }, [client.id, pageSize, sortBy, sortDir, resetPage])

  useEffect(() => {
    if (!selectedInvoice) return
    const fresh = result?.items
      .flatMap((payment) => payment.allocations.map((row) => row.invoice))
      .find((invoice) => invoice?.id === selectedInvoice.id)
    if (fresh && fresh.updatedAt !== selectedInvoice.updatedAt) {
      setSelectedInvoice(fresh)
    }
  }, [result?.items, selectedInvoice])

  const isListRefreshing = isFetching && !isLoading

  if (!canRead(role, 'payment')) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-sm text-[var(--color-muted)]">
        You do not have permission to view client collections.
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
        <ClientLinkedPaymentsTable
          toolbar={
            <ClientLinkedPaymentsToolbar
              total={result?.total}
              isFetching={isListRefreshing}
              canCreate={canCreate}
              onRecordCollection={() => setRecordOpen(true)}
              columnPicker={<ClientLinkedPaymentsTableColumnPicker layout={tableLayout} />}
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

      <RecordClientReceiptDialog
        open={recordOpen}
        onOpenChange={setRecordOpen}
        client={client}
        isPending={isRecording}
        onSubmit={handleRecord}
      />
    </div>
  )
}
