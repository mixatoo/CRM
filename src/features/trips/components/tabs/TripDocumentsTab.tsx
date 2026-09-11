import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Trip } from '@/domain/entities'
import type { Invoice, InvoiceStatus } from '@/domain/entities/invoice'
import { canMutate, canRead } from '@/domain/policies/permissions'
import { DataTableShell } from '@/design-system/layout/DataTableShell'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { CreateInvoiceDialog } from '@/features/trips/components/invoices/CreateInvoiceDialog'
import { InvoiceDetailDialog } from '@/features/trips/components/invoices/InvoiceDetailDialog'
import { TripInvoicesTable } from '@/features/trips/components/invoices/TripInvoicesTable'
import { TripInvoicesToolbar } from '@/features/trips/components/invoices/TripInvoicesToolbar'
import { useInvoiceMutations } from '@/features/trips/hooks/use-invoice-mutations'
import { useTripInvoices } from '@/features/trips/hooks/use-trip-invoices'
import { useTripServices } from '@/features/trips/hooks/use-trip-services'
import type { CreateInvoiceInput } from '@/features/trips/utils/create-invoice'

interface TripDocumentsTabProps {
  trip: Trip
}

export function TripDocumentsTab({ trip }: TripDocumentsTabProps) {
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const canCreate = canMutate(role, 'invoice', 'create')
  const canView = canRead(role, 'invoice')
  const { data: invoices = [], isLoading, isFetching } = useTripInvoices(trip.id)
  const { data: services = [] } = useTripServices(trip.id)
  const {
    createInvoiceAsync,
    updateInvoiceStatus,
    deleteInvoice,
    isCreatePending,
    isUpdatePending,
    isDeletePending,
  } = useInvoiceMutations(trip.id)

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<InvoiceStatus | 'all'>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase()
    return invoices.filter((invoice) => {
      if (status !== 'all' && invoice.status !== status) return false
      if (!query) return true
      return (
        invoice.number.toLowerCase().includes(query) ||
        invoice.clientName.toLowerCase().includes(query) ||
        (invoice.clientEmail?.toLowerCase().includes(query) ?? false)
      )
    })
  }, [invoices, search, status])

  const nextSequence = invoices.length + 1

  useEffect(() => {
    setSelectedInvoice(null)
    setDetailOpen(false)
  }, [trip.id])

  useEffect(() => {
    if (!selectedInvoice) return
    const fresh = invoices.find((invoice) => invoice.id === selectedInvoice.id)
    if (fresh && fresh.updatedAt !== selectedInvoice.updatedAt) {
      setSelectedInvoice(fresh)
    }
  }, [invoices, selectedInvoice])

  const handleSelectInvoice = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setDetailOpen(true)
  }, [])

  const handleCreate = useCallback(
    (input: CreateInvoiceInput) => {
      void createInvoiceAsync(
        { trip, input },
        {
          onSuccess: (invoice) => {
            setCreateOpen(false)
            setSelectedInvoice(invoice)
            setDetailOpen(true)
          },
        },
      )
    },
    [createInvoiceAsync, trip],
  )

  if (!canView) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-sm text-[var(--color-muted)]">
        You do not have permission to view trip invoices.
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <DataTableShell
        className="h-full min-h-0 flex-1"
        isFetching={isFetching && !isLoading}
        header={
          <TripInvoicesToolbar
            search={search}
            onSearchChange={setSearch}
            status={status}
            onStatusChange={setStatus}
            canCreate={canCreate}
            onCreateInvoice={() => setCreateOpen(true)}
          />
        }
        headerClassName="p-0"
        contentClassName="min-h-0 flex-1 overflow-auto"
      >
        <TripInvoicesTable
          invoices={filteredInvoices}
          selectedId={selectedInvoice?.id}
          onSelect={handleSelectInvoice}
          isLoading={isLoading}
        />
      </DataTableShell>

      <CreateInvoiceDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        trip={trip}
        services={services}
        nextSequence={nextSequence}
        isPending={isCreatePending}
        onCreate={handleCreate}
      />

      {selectedInvoice ? (
        <InvoiceDetailDialog
          open={detailOpen}
          onOpenChange={setDetailOpen}
          trip={trip}
          invoice={selectedInvoice}
          services={services}
          role={role}
          isUpdating={isUpdatePending}
          isDeleting={isDeletePending}
          onStatusChange={(nextStatus) =>
            updateInvoiceStatus({ invoiceId: selectedInvoice.id, status: nextStatus })
          }
          onDelete={() =>
            deleteInvoice(selectedInvoice.id, {
              onSuccess: () => {
                setDetailOpen(false)
                setSelectedInvoice(null)
              },
            })
          }
        />
      ) : null}
    </div>
  )
}
