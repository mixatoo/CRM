import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { db } from '@/infrastructure/database/db'
import { useClientLinkedPayments } from '@/features/clients/hooks/use-clients'
import {
  formatClientPaymentInvoiceLabel,
  paginateClientLinkedPayments,
  resolveClientPaymentUnallocated,
  sortClientLinkedPayments,
  type ClientLinkedPaymentAllocation,
  type ClientLinkedPaymentRow,
  type ClientLinkedPaymentSortDir,
  type ClientLinkedPaymentSortField,
} from '@/features/clients/utils/client-linked-payments-list'

export function useClientLinkedPaymentsList(
  clientId: string | undefined,
  sortBy: ClientLinkedPaymentSortField,
  sortDir: ClientLinkedPaymentSortDir,
  page: number,
  pageSize: number,
) {
  const { data: payments = [], isLoading: paymentsLoading, isFetching: paymentsFetching } =
    useClientLinkedPayments(clientId)

  const paymentIds = useMemo(() => payments.map((payment) => payment.id), [payments])

  const { data: allocations = [], isLoading: allocationsLoading, isFetching: allocationsFetching } = useQuery({
    queryKey: ['clients', clientId, 'linked-payments-allocations', paymentIds],
    queryFn: async () => db.paymentAllocations.where('paymentId').anyOf(paymentIds).toArray(),
    enabled: paymentIds.length > 0,
  })

  const tripIds = useMemo(() => {
    const ids = new Set<string>()
    for (const payment of payments) {
      if (payment.tripId) ids.add(payment.tripId)
    }
    return [...ids]
  }, [payments])

  const invoiceIds = useMemo(() => {
    const ids = new Set<string>()
    for (const payment of payments) {
      if (payment.invoiceId) ids.add(payment.invoiceId)
    }
    for (const allocation of allocations) {
      ids.add(allocation.invoiceId)
    }
    return [...ids]
  }, [payments, allocations])

  const { data: trips = [], isLoading: tripsLoading, isFetching: tripsFetching } = useQuery({
    queryKey: ['clients', clientId, 'linked-payments-trip-refs', tripIds],
    queryFn: async () => db.trips.where('id').anyOf(tripIds).toArray(),
    enabled: tripIds.length > 0,
  })

  const { data: invoices = [], isLoading: invoicesLoading, isFetching: invoicesFetching } = useQuery({
    queryKey: ['clients', clientId, 'linked-payments-invoice-refs', invoiceIds],
    queryFn: async () => db.invoices.where('id').anyOf(invoiceIds).toArray(),
    enabled: invoiceIds.length > 0,
  })

  const enriched = useMemo<ClientLinkedPaymentRow[]>(() => {
    const tripReferenceById = new Map(trips.map((trip) => [trip.id, trip.reference]))
    const invoiceById = new Map(invoices.map((invoice) => [invoice.id, invoice]))
    const allocationsByPaymentId = new Map<string, ClientLinkedPaymentAllocation[]>()

    for (const allocation of allocations) {
      const invoice = invoiceById.get(allocation.invoiceId)
      const rows = allocationsByPaymentId.get(allocation.paymentId) ?? []
      rows.push({
        ...allocation,
        invoice,
        invoiceNumber: invoice?.number ?? '',
      })
      allocationsByPaymentId.set(allocation.paymentId, rows)
    }

    return payments.map((payment) => {
      let linkedAllocations = allocationsByPaymentId.get(payment.id) ?? []

      if (linkedAllocations.length === 0 && payment.invoiceId) {
        const legacyInvoice = invoiceById.get(payment.invoiceId)
        if (legacyInvoice) {
          linkedAllocations = [
            {
              id: `legacy-${payment.id}`,
              paymentId: payment.id,
              invoiceId: payment.invoiceId,
              amount: payment.amount,
              createdAt: payment.createdAt,
              invoice: legacyInvoice,
              invoiceNumber: legacyInvoice.number,
            },
          ]
        }
      }

      const tripRefs = new Set(
        linkedAllocations
          .map((row) => row.invoice?.tripId)
          .filter((tripId): tripId is string => !!tripId)
          .map((tripId) => tripReferenceById.get(tripId) ?? '')
          .filter(Boolean),
      )

      let tripReference = ''
      if (payment.tripId) {
        tripReference = tripReferenceById.get(payment.tripId) ?? ''
      } else if (tripRefs.size === 1) {
        tripReference = [...tripRefs][0] ?? ''
      } else if (tripRefs.size > 1) {
        const first = [...tripRefs][0] ?? ''
        tripReference = `${first} +${tripRefs.size - 1}`
      }

      const linkedInvoice = linkedAllocations[0]?.invoice
      const unallocatedAmount = resolveClientPaymentUnallocated(payment, linkedAllocations)

      return {
        ...payment,
        tripReference,
        invoiceNumber: formatClientPaymentInvoiceLabel({
          ...payment,
          tripReference,
          invoiceNumber: '',
          allocations: linkedAllocations,
          unallocatedAmount,
        }),
        linkedInvoice,
        allocations: linkedAllocations,
        unallocatedAmount,
      }
    })
  }, [payments, allocations, trips, invoices])

  const data = useMemo(
    () => paginateClientLinkedPayments(sortClientLinkedPayments(enriched, sortBy, sortDir), page, pageSize),
    [enriched, sortBy, sortDir, page, pageSize],
  )

  const isLoading =
    paymentsLoading ||
    (paymentIds.length > 0 && allocationsLoading) ||
    (tripIds.length > 0 && tripsLoading) ||
    (invoiceIds.length > 0 && invoicesLoading)
  const isFetching = paymentsFetching || allocationsFetching || tripsFetching || invoicesFetching

  return { data, isLoading, isFetching }
}
