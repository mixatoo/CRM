import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDatabaseReady } from '@/app/providers'
import { db } from '@/infrastructure/database/db'

export type CalendarEventKind = 'trip_start' | 'trip_end' | 'reminder'

export interface CalendarEvent {
  id: string
  kind: CalendarEventKind
  title: string
  date: string
  tripId?: string
  reference?: string
  meta?: string
}

function monthKey(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

function isoDate(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function inMonth(iso: string | undefined, year: number, month: number) {
  if (!iso) return false
  const date = new Date(iso)
  return date.getFullYear() === year && date.getMonth() === month
}

export function useCalendarEvents(year: number, month: number) {
  const dbReady = useDatabaseReady()

  return useQuery({
    queryKey: ['calendar', monthKey(year, month)],
    queryFn: async () => {
      const [trips, reminders] = await Promise.all([db.trips.toArray(), db.reminders.toArray()])
      const events: CalendarEvent[] = []

      for (const trip of trips) {
        if (inMonth(trip.startDate, year, month)) {
          events.push({
            id: `${trip.id}-start`,
            kind: 'trip_start',
            title: trip.name,
            date: trip.startDate!.slice(0, 10),
            tripId: trip.id,
            reference: trip.reference,
            meta: 'Trip departure',
          })
        }
        if (trip.endDate && inMonth(trip.endDate, year, month)) {
          events.push({
            id: `${trip.id}-end`,
            kind: 'trip_end',
            title: trip.name,
            date: trip.endDate.slice(0, 10),
            tripId: trip.id,
            reference: trip.reference,
            meta: 'Trip return',
          })
        }
      }

      for (const reminder of reminders) {
        if (reminder.status === 'canceled') continue
        if (inMonth(reminder.dueAt, year, month)) {
          events.push({
            id: reminder.id,
            kind: 'reminder',
            title: reminder.title,
            date: reminder.dueAt.slice(0, 10),
            tripId: reminder.tripId,
            reference: reminder.reference,
            meta: reminder.assigneeName ?? 'Reminder',
          })
        }
      }

      events.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title))

      const grouped = new Map<string, CalendarEvent[]>()
      for (const event of events) {
        const bucket = grouped.get(event.date) ?? []
        bucket.push(event)
        grouped.set(event.date, bucket)
      }

      return {
        events,
        grouped: [...grouped.entries()].map(([date, items]) => ({ date, items })),
      }
    },
    enabled: dbReady,
  })
}

export function useCalendarMonth(offset = 0) {
  return useMemo(() => {
    const base = new Date()
    base.setDate(1)
    base.setMonth(base.getMonth() + offset)
    return {
      year: base.getFullYear(),
      month: base.getMonth(),
      label: base.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
    }
  }, [offset])
}

export function todayIso() {
  return isoDate(new Date())
}
