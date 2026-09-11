import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useDatabaseReady } from '@/app/providers'
import { appContainer } from '@/app/container'
import { db } from '@/infrastructure/database/db'
import { paginatedListQueryOptions } from '@/shared/config/query-options'
import type { ReminderFilters } from '@/repositories/interfaces'

export function useRemindersList(filters: ReminderFilters, page: number, pageSize: number) {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: ['reminders', 'list', filters, page, pageSize],
    queryFn: () => appContainer.uow.reminders.findPaginated(filters, { page, pageSize }),
    enabled: dbReady,
    ...paginatedListQueryOptions,
  })
}

export function useReminderTripRefs(tripIds: string[]) {
  const dbReady = useDatabaseReady()
  const stableIds = useMemo(() => [...tripIds].sort(), [tripIds])
  return useQuery({
    queryKey: ['reminders', 'trip-refs', stableIds],
    queryFn: async () => {
      const trips = await db.trips.where('id').anyOf(stableIds).toArray()
      return Object.fromEntries(
        trips.map((trip) => [trip.id, { reference: trip.reference, name: trip.name }]),
      ) as Record<string, { reference: string; name: string }>
    },
    enabled: dbReady && stableIds.length > 0,
    staleTime: 60_000,
  })
}

export function useReminderAssignees() {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: ['reminders', 'assignees'],
    queryFn: async () => {
      const reminders = await appContainer.uow.reminders.findAll()
      const set = new Set<string>()
      for (const reminder of reminders) {
        const name = reminder.assigneeName?.trim()
        if (name) set.add(name)
      }
      return [...set].sort((a, b) => a.localeCompare(b))
    },
    enabled: dbReady,
  })
}
