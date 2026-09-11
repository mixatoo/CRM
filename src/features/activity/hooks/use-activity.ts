import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useDatabaseReady } from '@/app/providers'
import { appContainer } from '@/app/container'
import { db } from '@/infrastructure/database/db'
import { paginatedListQueryOptions } from '@/shared/config/query-options'
import type { ActivityFilters } from '@/repositories/interfaces'

export function useActivityList(filters: ActivityFilters, page: number, pageSize: number) {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: ['activity', 'list', filters, page, pageSize],
    queryFn: () => appContainer.uow.tripActivities.findPaginated(filters, { page, pageSize }),
    enabled: dbReady,
    ...paginatedListQueryOptions,
  })
}

export function useActivityTripRefs(tripIds: string[]) {
  const dbReady = useDatabaseReady()
  const stableIds = useMemo(() => [...tripIds].sort(), [tripIds])
  return useQuery({
    queryKey: ['activity', 'trip-refs', stableIds],
    queryFn: async () => {
      const trips = await db.trips.where('id').anyOf(stableIds).toArray()
      return Object.fromEntries(trips.map((trip) => [trip.id, trip.reference])) as Record<string, string>
    },
    enabled: dbReady && stableIds.length > 0,
    staleTime: 60_000,
  })
}
