import { db } from '@/infrastructure/database/db'
import { DEFAULT_PAGE_SIZE, paginateItems, type PaginatedResult, type PaginationParams } from '@/types/pagination'
import type { Reminder } from '@/domain/entities/reminder'
import type {
  ReminderFilters,
  ReminderRepository,
  ReminderSortDir,
  ReminderSortField,
} from '@/repositories/interfaces'
import { createGenericRepository } from '@/repositories/implementations/dexie-repositories'
import {
  filterItemsByLabelTargetIds,
  resolveTargetIdsForLabelFilter,
} from '@/repositories/implementations/label-filter'

function sortReminders(
  reminders: Reminder[],
  sortBy: ReminderSortField = 'reference',
  sortDir: ReminderSortDir = 'desc',
) {
  const dir = sortDir === 'asc' ? 1 : -1
  return [...reminders].sort((a, b) => {
    let cmp = 0
    switch (sortBy) {
      case 'reference':
        cmp = a.reference.localeCompare(b.reference, undefined, { numeric: true })
        break
      case 'title':
        cmp = a.title.localeCompare(b.title)
        break
      case 'dueAt':
        cmp = new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
        break
      case 'status':
        cmp = a.status.localeCompare(b.status)
        break
      case 'priority': {
        const rank = { high: 0, normal: 1, low: 2 }
        cmp = rank[a.priority] - rank[b.priority]
        break
      }
      case 'updatedAt':
        cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        break
    }
    return cmp * dir
  })
}

export class DexieReminderRepository implements ReminderRepository {
  private generic = createGenericRepository<Reminder>(db.reminders, 'REM')

  findAll() {
    return this.generic.findAll()
  }

  findById(id: string) {
    return this.generic.findById(id)
  }

  create(data: Omit<Reminder, 'id'>) {
    return this.generic.create(data)
  }

  update(id: string, data: Partial<Reminder>) {
    return this.generic.update(id, data)
  }

  delete(id: string) {
    return this.generic.delete(id)
  }

  async findPaginated(
    filters: ReminderFilters = {},
    pagination: PaginationParams = {},
  ): Promise<PaginatedResult<Reminder>> {
    let reminders = await db.reminders.orderBy('dueAt').toArray()

    if (filters.search) {
      const q = filters.search.toLowerCase().trim()
      reminders = reminders.filter(
        (reminder) =>
          reminder.title.toLowerCase().includes(q) ||
          reminder.reference.toLowerCase().includes(q) ||
          (reminder.description?.toLowerCase().includes(q) ?? false) ||
          (reminder.assigneeName?.toLowerCase().includes(q) ?? false),
      )
    }

    if (filters.status && filters.status !== 'all') {
      reminders = reminders.filter((reminder) => reminder.status === filters.status)
    }

    if (filters.priority && filters.priority !== 'all') {
      reminders = reminders.filter((reminder) => reminder.priority === filters.priority)
    }

    if (filters.category && filters.category !== 'all') {
      reminders = reminders.filter((reminder) => reminder.category === filters.category)
    }

    if (filters.assignee && filters.assignee !== 'all') {
      reminders = reminders.filter((reminder) => (reminder.assigneeName ?? '').trim() === filters.assignee)
    }

    const labelTargetIds = await resolveTargetIdsForLabelFilter('reminder', filters.labelIds)
    reminders = filterItemsByLabelTargetIds(reminders, labelTargetIds)

    reminders = sortReminders(reminders, filters.sortBy, filters.sortDir)

    const page = pagination.page ?? 1
    const pageSize = pagination.pageSize ?? DEFAULT_PAGE_SIZE
    return paginateItems(reminders, page, pageSize)
  }
}
