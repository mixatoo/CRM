import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useDatabaseReady } from '@/app/providers'
import { appContainer } from '@/app/container'
import { db } from '@/infrastructure/database/db'
import { paginatedListQueryOptions } from '@/shared/config/query-options'
import type { InvoiceFilters } from '@/repositories/interfaces'

export function useInvoicesList(filters: InvoiceFilters, page: number, pageSize: number) {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: ['invoices', 'list', filters, page, pageSize],
    queryFn: () => appContainer.uow.invoices.findPaginated(filters, { page, pageSize }),
    enabled: dbReady,
    ...paginatedListQueryOptions,
  })
}

export function useInvoiceTripRefs(tripIds: string[]) {
  const dbReady = useDatabaseReady()
  const stableIds = useMemo(() => [...tripIds].sort(), [tripIds])
  return useQuery({
    queryKey: ['invoices', 'trip-refs', stableIds],
    queryFn: async () => {
      const trips = await db.trips.where('id').anyOf(stableIds).toArray()
      return Object.fromEntries(trips.map((trip) => [trip.id, trip.reference])) as Record<string, string>
    },
    enabled: dbReady && stableIds.length > 0,
    staleTime: 60_000,
  })
}

export function useInvoicesSummary() {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: ['invoices', 'summary'],
    queryFn: async () => {
      const invoices = await appContainer.uow.invoices.findAll()
      const open = invoices.filter((i) => !['paid', 'void'].includes(i.status))
      const overdue = open.filter((i) => new Date(i.dueDate) < new Date())
      const outstanding = open.reduce((sum, i) => sum + Math.max(0, i.total - i.amountPaid), 0)
      return { total: invoices.length, open: open.length, overdue: overdue.length, outstanding }
    },
    enabled: dbReady,
  })
}
