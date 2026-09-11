import { useQuery } from '@tanstack/react-query'
import { useDatabaseReady } from '@/app/providers'
import { db } from '@/infrastructure/database/db'

export interface AppNotification {
  id: string
  title: string
  meta: string
  unread: boolean
  href?: string
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.floor(hours / 24)
  return days === 1 ? 'Yesterday' : `${days} days ago`
}

export function useNotifications() {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const [reminders, activities] = await Promise.all([
        db.reminders.where('status').equals('open').toArray(),
        db.tripActivities.orderBy('createdAt').reverse().limit(5).toArray(),
      ])

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const items: AppNotification[] = []

      for (const reminder of reminders) {
        const due = new Date(reminder.dueAt)
        due.setHours(0, 0, 0, 0)
        const overdue = due < today
        items.push({
          id: `rem-${reminder.id}`,
          title: overdue ? `Overdue: ${reminder.title}` : reminder.title,
          meta: relativeTime(reminder.dueAt),
          unread: overdue || due.getTime() === today.getTime(),
          href: reminder.tripId ? `/trips/${reminder.tripId}/dashboard` : '/reminders',
        })
      }

      for (const activity of activities) {
        items.push({
          id: `act-${activity.id}`,
          title: activity.summary,
          meta: relativeTime(activity.createdAt),
          unread: Date.now() - new Date(activity.createdAt).getTime() < 86_400_000,
          href: `/trips/${activity.tripId}/changelog`,
        })
      }

      items.sort((a, b) => (a.unread === b.unread ? 0 : a.unread ? -1 : 1))
      return items.slice(0, 10)
    },
    enabled: dbReady,
    refetchInterval: 60_000,
  })
}
