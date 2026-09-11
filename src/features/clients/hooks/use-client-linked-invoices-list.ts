import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { db } from '@/infrastructure/database/db'
import { useClientLinkedInvoices } from '@/features/clients/hooks/use-clients'
import {
  paginateClientLinkedInvoices,
  sortClientLinkedInvoices,
  type ClientLinkedInvoiceRow,
  type ClientLinkedInvoiceSortDir,
  type ClientLinkedInvoiceSortField,
} from '@/features/clients/utils/client-linked-invoices-list'

export function useClientLinkedInvoicesList(
  clientId: string | undefined,
  sortBy: ClientLinkedInvoiceSortField,
  sortDir: ClientLinkedInvoiceSortDir,
  page: number,
  pageSize: number,
) {
  const { data: invoices = [], isLoading: invoicesLoading, isFetching: invoicesFetching } =
    useClientLinkedInvoices(clientId)

  const tripIds = useMemo(() => [...new Set(invoices.map((invoice) => invoice.tripId))], [invoices])

  const { data: trips = [], isLoading: tripsLoading, isFetching: tripsFetching } = useQuery({
    queryKey: ['clients', clientId, 'linked-invoices-trip-refs', tripIds],
    queryFn: async () => db.trips.where('id').anyOf(tripIds).toArray(),
    enabled: tripIds.length > 0,
  })

  const enriched = useMemo<ClientLinkedInvoiceRow[]>(() => {
    const tripReferenceById = new Map(trips.map((trip) => [trip.id, trip.reference]))
    return invoices.map((invoice) => ({
      ...invoice,
      tripReference: tripReferenceById.get(invoice.tripId) ?? '',
    }))
  }, [invoices, trips])

  const data = useMemo(
    () => paginateClientLinkedInvoices(sortClientLinkedInvoices(enriched, sortBy, sortDir), page, pageSize),
    [enriched, sortBy, sortDir, page, pageSize],
  )

  const isLoading = invoicesLoading || (tripIds.length > 0 && tripsLoading)
  const isFetching = invoicesFetching || tripsFetching

  return { data, isLoading, isFetching }
}
