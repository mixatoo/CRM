import { db } from '@/infrastructure/database/db'
import type { Reminder } from '@/domain/entities/reminder'
import { generateId } from '@/shared/utils/cn'
import { REMINDERS_DIRECTORY_VERSION } from '@/infrastructure/database/bootstrap-versions'

export { REMINDERS_DIRECTORY_VERSION }

export const SEED_REMINDERS: Array<{
  title: string
  description?: string
  status?: Reminder['status']
  priority?: Reminder['priority']
  category: Reminder['category']
  dueInDays: number
  assigneeName?: string
}> = [
  { title: 'Collect balance from client', category: 'payment', priority: 'high', dueInDays: 1, assigneeName: 'Karim Hassan' },
  { title: 'Send updated itinerary PDF', category: 'document', dueInDays: 2, assigneeName: 'Nour El Din' },
  { title: 'Confirm hotel allotment', category: 'supplier', dueInDays: 3, assigneeName: 'Karim Hassan' },
  { title: 'Follow up on visa documents', category: 'client', priority: 'high', dueInDays: 0, assigneeName: 'Nour El Din' },
  { title: 'Issue supplier payment batch', category: 'payment', dueInDays: 4, assigneeName: 'Finance Team' },
  { title: 'Upload signed contract', category: 'document', dueInDays: 5, assigneeName: 'Sales Desk' },
  { title: 'Reconfirm airport transfers', category: 'operations', dueInDays: 2, assigneeName: 'Operations' },
  { title: 'Chase DMC confirmation', category: 'supplier', priority: 'high', dueInDays: 1, assigneeName: 'Karim Hassan' },
  { title: 'Client welcome call', category: 'client', dueInDays: 6, assigneeName: 'Nour El Din' },
  { title: 'Review margin on proposal', category: 'operations', dueInDays: 7, assigneeName: 'Management' },
  { title: 'Send invoice reminder', category: 'payment', dueInDays: 3, assigneeName: 'Finance Team' },
  { title: 'Archive trip documents', category: 'document', status: 'done', dueInDays: -2, assigneeName: 'Operations' },
  { title: 'Supplier SLA check-in', category: 'supplier', dueInDays: 8, assigneeName: 'Karim Hassan' },
  { title: 'Ops handover notes', category: 'operations', dueInDays: 9, assigneeName: 'Operations' },
  { title: 'Renew travel insurance quote', category: 'other', dueInDays: 10, assigneeName: 'Sales Desk' },
  { title: 'Payment reconciliation', category: 'payment', status: 'snoozed', dueInDays: 5, assigneeName: 'Finance Team' },
  { title: 'Client feedback survey', category: 'client', dueInDays: 14, assigneeName: 'Nour El Din' },
  { title: 'Confirm cruise cabin numbers', category: 'supplier', dueInDays: 4, assigneeName: 'Operations' },
]

function formatReminderReference(sequence: number): string {
  return `REM-${String(sequence).padStart(4, '0')}`
}

function dueDateFromOffset(days: number): string {
  const date = new Date()
  date.setHours(9, 0, 0, 0)
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

function buildReminder(
  seed: (typeof SEED_REMINDERS)[number],
  index: number,
  tripId?: string,
): Reminder {
  const now = new Date(Date.now() - index * 3_600_000).toISOString()
  return {
    id: generateId('REM'),
    reference: formatReminderReference(index + 1),
    title: seed.title,
    description: seed.description,
    status: seed.status ?? 'open',
    priority: seed.priority ?? 'normal',
    category: seed.category,
    dueAt: dueDateFromOffset(seed.dueInDays),
    tripId,
    assigneeName: seed.assigneeName,
    createdAt: now,
    updatedAt: now,
  }
}

async function syncSeedReminders(): Promise<Reminder[]> {
  const existing = await db.reminders.toArray()
  const byTitle = new Map(existing.map((reminder) => [reminder.title.trim().toLowerCase(), reminder]))
  const missingSeeds = SEED_REMINDERS.filter((seed) => !byTitle.has(seed.title.trim().toLowerCase()))
  if (missingSeeds.length === 0) return existing

  const trips = await db.trips.orderBy('updatedAt').reverse().toArray()
  let nextRef = existing.reduce((max, reminder) => {
    const match = reminder.reference.match(/^REM-(\d+)$/i)
    return match ? Math.max(max, Number.parseInt(match[1], 10)) : max
  }, 0)

  const toAdd = missingSeeds.map((seed, index) => {
    nextRef += 1
    const trip = trips[(existing.length + index) % Math.max(trips.length, 1)]
    const reminder = buildReminder(seed, nextRef - 1, trip?.id)
    return { ...reminder, reference: formatReminderReference(nextRef) }
  })

  await db.reminders.bulkAdd(toAdd)
  return [...existing, ...toAdd]
}

export async function ensureRemindersDirectory(): Promise<void> {
  const settings = await db.settings.get('SET-001')
  const version = settings?.remindersDirectoryVersion ?? 0
  const count = await db.reminders.count()

  if (count === 0) {
    const trips = await db.trips.orderBy('updatedAt').reverse().toArray()
    const reminders = SEED_REMINDERS.map((seed, index) => {
      const trip = trips[index % Math.max(trips.length, 1)]
      return buildReminder(seed, index, trip?.id)
    })
    await db.reminders.bulkAdd(reminders)
  } else if (version < REMINDERS_DIRECTORY_VERSION || count < SEED_REMINDERS.length) {
    await syncSeedReminders()
  }

  if (settings && (version < REMINDERS_DIRECTORY_VERSION || count < SEED_REMINDERS.length)) {
    await db.settings.update('SET-001', { remindersDirectoryVersion: REMINDERS_DIRECTORY_VERSION })
  }
}

export async function nextReminderReference(): Promise<string> {
  const reminders = await db.reminders.toArray()
  const max = reminders.reduce((value, reminder) => {
    const match = reminder.reference.match(/^REM-(\d+)$/i)
    return match ? Math.max(value, Number.parseInt(match[1], 10)) : value
  }, 0)
  return formatReminderReference(max + 1)
}
