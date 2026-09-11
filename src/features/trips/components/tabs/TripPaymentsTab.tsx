import { useCallback, useMemo, useState } from 'react'
import type { Trip } from '@/domain/entities'
import { tripClientBalanceDue, tripTotalSelling } from '@/domain/entities'
import { canMutate, canRead, shouldMaskFinancials } from '@/domain/policies/permissions'
import { AccountingAmount } from '@/design-system/components/AccountingAmount'
import { DataTableShell } from '@/design-system/layout/DataTableShell'
import { CrmFieldGrid, CrmMetricCell, CrmPanel } from '@/design-system/layout/CrmPanel'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { RecordPaymentDialog } from '@/features/trips/components/payments/RecordPaymentDialog'
import { TripPaymentsTable } from '@/features/trips/components/payments/TripPaymentsTable'
import { TripPaymentsToolbar } from '@/features/trips/components/payments/TripPaymentsToolbar'
import { usePaymentMutations } from '@/features/trips/hooks/use-payment-mutations'
import { useTripInvoices } from '@/features/trips/hooks/use-trip-invoices'
import { useTripPayments } from '@/features/trips/hooks/use-trip-workspace'
import { sumActivePayments } from '@/domain/entities/trip-payment'
import { openInvoiceReceivables } from '@/domain/trip/trip-financial-sync'

interface TripPaymentsTabProps {
  trip: Trip
}

export function TripPaymentsTab({ trip }: TripPaymentsTabProps) {
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const maskFinancials = shouldMaskFinancials(role)
  const canCreate = canMutate(role, 'payment', 'create')
  const canVoid = canMutate(role, 'payment', 'update')

  const { data: payments = [], isLoading, isFetching } = useTripPayments(trip.id)
  const { data: invoices = [] } = useTripInvoices(trip.id)
  const { recordPaymentAsync, voidPayment, isRecording } = usePaymentMutations(trip.id)

  const [search, setSearch] = useState('')
  const [direction, setDirection] = useState<'inbound' | 'outbound' | 'all'>('all')
  const [recordOpen, setRecordOpen] = useState(false)

  const invoiceNumbers = useMemo(
    () => Object.fromEntries(invoices.map((invoice) => [invoice.id, invoice.number])),
    [invoices],
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return payments.filter((payment) => {
      if (direction !== 'all' && payment.direction !== direction) return false
      if (!query) return true
      return (
        payment.reference?.toLowerCase().includes(query) ||
        payment.counterpartyName?.toLowerCase().includes(query) ||
        (payment.invoiceId && invoiceNumbers[payment.invoiceId]?.toLowerCase().includes(query))
      )
    })
  }, [payments, search, direction, invoiceNumbers])

  const inboundTotal = sumActivePayments(payments, 'inbound')
  const outboundTotal = sumActivePayments(payments, 'outbound')
  const openReceivables = openInvoiceReceivables(invoices)

  const handleRecord = useCallback(
    (input: Parameters<typeof recordPaymentAsync>[0]) => {
      void recordPaymentAsync(input, { onSuccess: () => setRecordOpen(false) })
    },
    [recordPaymentAsync],
  )

  if (!canRead(role, 'payment')) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-sm text-[var(--color-muted)]">
        You do not have permission to view trip payments.
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-3">
      <CrmPanel title="Payment summary">
        <CrmFieldGrid columns={4}>
          <CrmMetricCell label="Trip sell">{maskFinancials ? '••••' : tripTotalSelling(trip).toFixed(2)}</CrmMetricCell>
          <CrmMetricCell label="Collected" tone="success">
            {maskFinancials ? '••••' : inboundTotal.toFixed(2)}
          </CrmMetricCell>
          <CrmMetricCell label="Client balance" tone="warning">
            {maskFinancials ? '••••' : tripClientBalanceDue(trip).toFixed(2)}
          </CrmMetricCell>
          <CrmMetricCell label="Open invoices" tone="accent">
            {maskFinancials ? '••••' : openReceivables.toFixed(2)}
          </CrmMetricCell>
        </CrmFieldGrid>
        {!maskFinancials ? (
          <p className="border-t border-[var(--color-border)] px-4 py-2 text-[11px] text-[var(--color-muted)]">
            Supplier disbursements:{' '}
            <AccountingAmount amount={outboundTotal} currency={trip.currency} className="inline-flex" />
          </p>
        ) : null}
      </CrmPanel>

      <DataTableShell
        className="min-h-0 flex-1"
        isFetching={isFetching && !isLoading}
        header={
          <TripPaymentsToolbar
            search={search}
            onSearchChange={setSearch}
            direction={direction}
            onDirectionChange={setDirection}
            canCreate={canCreate}
            onRecordPayment={() => setRecordOpen(true)}
          />
        }
        headerClassName="p-0"
        contentClassName="min-h-0 flex-1 overflow-auto"
      >
        <TripPaymentsTable
          payments={filtered}
          invoiceNumbers={invoiceNumbers}
          isLoading={isLoading}
          canVoid={canVoid}
          onVoid={(payment) => voidPayment(payment.id)}
        />
      </DataTableShell>

      <RecordPaymentDialog
        open={recordOpen}
        onOpenChange={setRecordOpen}
        trip={trip}
        invoices={invoices}
        isPending={isRecording}
        onSubmit={handleRecord}
      />
    </div>
  )
}
