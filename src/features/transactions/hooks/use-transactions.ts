import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useDatabaseReady } from '@/app/providers'
import { appContainer } from '@/app/container'
import { db } from '@/infrastructure/database/db'
import { paginatedListQueryOptions } from '@/shared/config/query-options'
import type { PaymentFilters } from '@/repositories/interfaces'

export function useTransactionsList(filters: PaymentFilters, page: number, pageSize: number) {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: ['transactions', 'list', filters, page, pageSize],
    queryFn: () => appContainer.uow.payments.findPaginated(filters, { page, pageSize }),
    enabled: dbReady,
    ...paginatedListQueryOptions,
  })
}

export function useTransactionTripRefs(tripIds: string[]) {
  const dbReady = useDatabaseReady()
  const stableIds = useMemo(() => [...tripIds].sort(), [tripIds])
  return useQuery({
    queryKey: ['transactions', 'trip-refs', stableIds],
    queryFn: async () => {
      const trips = await db.trips.where('id').anyOf(stableIds).toArray()
      return Object.fromEntries(trips.map((trip) => [trip.id, trip.reference])) as Record<string, string>
    },
    enabled: dbReady && stableIds.length > 0,
    staleTime: 60_000,
  })
}
