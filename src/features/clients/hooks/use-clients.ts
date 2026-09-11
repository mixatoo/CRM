import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useDatabaseReady } from '@/app/providers'
import { appContainer } from '@/app/container'
import { db } from '@/infrastructure/database/db'
import { paginatedListQueryOptions } from '@/shared/config/query-options'
import type { ClientFilters, TripSortDir, TripSortField } from '@/repositories/interfaces'

export function useClients() {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: ['clients'],
    queryFn: () => appContainer.uow.clients.findAll(),
    enabled: dbReady,
  })
}

export function useClientsList(filters: ClientFilters, page: number, pageSize: number) {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: ['clients', 'list', filters, page, pageSize],
    queryFn: () => appContainer.uow.clients.findPaginated(filters, { page, pageSize }),
    enabled: dbReady,
    ...paginatedListQueryOptions,
  })
}

export function useClient(clientId: string | undefined) {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: ['clients', clientId],
    queryFn: () => appContainer.uow.clients.findById(clientId!),
    enabled: dbReady && !!clientId,
  })
}

export function useClientTripCounts(clientIds: string[]) {
  const dbReady = useDatabaseReady()
  const stableIds = useMemo(() => [...clientIds].sort(), [clientIds])
  return useQuery({
    queryKey: ['clients', 'trip-counts', stableIds],
    queryFn: async () => {
      if (stableIds.length === 0) return {} as Record<string, number>

      const counts = Object.fromEntries(stableIds.map((id) => [id, 0])) as Record<string, number>
      const trips = await db.trips.where('clientId').anyOf(stableIds).toArray()
      for (const trip of trips) {
        if (trip.clientId) counts[trip.clientId] = (counts[trip.clientId] ?? 0) + 1
      }
      return counts
    },
    enabled: dbReady && stableIds.length > 0,
    staleTime: 60_000,
  })
}

export function useClientLinkedTrips(clientId: string | undefined) {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: ['clients', clientId, 'linked-trips'],
    queryFn: () => db.trips.where('clientId').equals(clientId!).toArray(),
    enabled: dbReady && !!clientId,
  })
}

export function useClientLinkedTripsList(
  clientId: string | undefined,
  sortBy: TripSortField,
  sortDir: TripSortDir,
  page: number,
  pageSize: number,
) {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: ['clients', clientId, 'linked-trips', 'list', sortBy, sortDir, page, pageSize],
    queryFn: () =>
      appContainer.uow.trips.findPaginated({ clientId, sortBy, sortDir }, { page, pageSize }),
    enabled: dbReady && !!clientId,
    ...paginatedListQueryOptions,
  })
}

export function useClientLinkedServices(clientId: string | undefined) {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: ['clients', clientId, 'linked-services'],
    queryFn: async () => {
      const trips = await db.trips.where('clientId').equals(clientId!).toArray()
      if (trips.length === 0) return []

      const tripIds = trips.map((trip) => trip.id)
      const services = await db.tripServices.where('tripId').anyOf(tripIds).toArray()

      return services.sort((a, b) => {
        const dateA = a.startDate ?? a.updatedAt
        const dateB = b.startDate ?? b.updatedAt
        return dateB.localeCompare(dateA)
      })
    },
    enabled: dbReady && !!clientId,
  })
}

export function useClientLinkedPayments(clientId: string | undefined) {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: ['clients', clientId, 'linked-payments'],
    queryFn: async () => {
      let payments = await db.tripPayments.where('clientId').equals(clientId!).toArray()

      if (payments.length === 0) {
        const trips = await db.trips.where('clientId').equals(clientId!).toArray()
        if (trips.length > 0) {
          const tripIds = trips.map((trip) => trip.id)
          payments = await db.tripPayments.where('tripId').anyOf(tripIds).toArray()
        }
      }

      return payments
        .filter((payment) => payment.direction === 'inbound')
        .sort((left, right) => right.paidAt.localeCompare(left.paidAt))
    },
    enabled: dbReady && !!clientId,
  })
}

export function useClientOpenInvoices(clientId: string | undefined) {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: ['clients', clientId, 'linked-payments-open-invoices'],
    queryFn: async () => {
      const trips = await db.trips.where('clientId').equals(clientId!).toArray()
      if (trips.length === 0) return []

      const tripReferenceById = new Map(trips.map((trip) => [trip.id, trip.reference]))
      const tripIds = trips.map((trip) => trip.id)
      const invoices = await db.invoices.where('tripId').anyOf(tripIds).toArray()

      return invoices
        .filter((invoice) => invoice.status !== 'void' && invoice.status !== 'paid')
        .sort((left, right) => left.dueDate.localeCompare(right.dueDate))
        .map((invoice) => ({
          ...invoice,
          tripReference: tripReferenceById.get(invoice.tripId) ?? '',
        }))
    },
    enabled: dbReady && !!clientId,
  })
}

export function useClientLinkedInvoices(clientId: string | undefined) {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: ['clients', clientId, 'linked-invoices'],
    queryFn: async () => {
      const trips = await db.trips.where('clientId').equals(clientId!).toArray()
      if (trips.length === 0) return []

      const tripIds = trips.map((trip) => trip.id)
      const invoices = await db.invoices.where('tripId').anyOf(tripIds).toArray()

      return invoices.sort((left, right) => right.issuedAt.localeCompare(left.issuedAt))
    },
    enabled: dbReady && !!clientId,
  })
}
