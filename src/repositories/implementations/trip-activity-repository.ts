import { db } from '@/infrastructure/database/db'
import { DEFAULT_PAGE_SIZE, paginateItems, type PaginatedResult, type PaginationParams } from '@/types/pagination'
import type { TripActivity } from '@/domain/entities/trip-activity'
import type {
  ActivityFilters,
  ActivitySortDir,
  ActivitySortField,
  TripActivityRepository,
} from '@/repositories/interfaces'
import { generateId } from '@/shared/utils/cn'
import {
  filterItemsByLabelTargetIds,
  resolveTargetIdsForLabelFilter,
} from '@/repositories/implementations/label-filter'

function sortActivities(
  activities: TripActivity[],
  sortBy: ActivitySortField = 'createdAt',
  sortDir: ActivitySortDir = 'desc',
) {
  const dir = sortDir === 'asc' ? 1 : -1
  return [...activities].sort((a, b) => {
    let cmp = 0
    switch (sortBy) {
      case 'createdAt':
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
      case 'type':
        cmp = a.type.localeCompare(b.type)
        break
      case 'action':
        cmp = a.action.localeCompare(b.action)
        break
    }
    return cmp * dir
  })
}

export class DexieTripActivityRepository implements TripActivityRepository {
  async findAll() {
    return db.tripActivities.orderBy('createdAt').reverse().toArray()
  }

  async findById(id: string) {
    return (await db.tripActivities.get(id)) ?? null
  }

  async findByTripId(tripId: string) {
    const activities = await db.tripActivities.where('tripId').equals(tripId).toArray()
    return activities.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  async findPaginated(
    filters: ActivityFilters = {},
    pagination: PaginationParams = {},
  ): Promise<PaginatedResult<TripActivity>> {
    let activities = await db.tripActivities.orderBy('createdAt').reverse().toArray()

    if (filters.tripId) {
      activities = activities.filter((activity) => activity.tripId === filters.tripId)
    }

    if (filters.type && filters.type !== 'all') {
      activities = activities.filter((activity) => activity.type === filters.type)
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim()
      activities = activities.filter(
        (activity) =>
          activity.summary.toLowerCase().includes(q) ||
          activity.action.toLowerCase().includes(q) ||
          (activity.actorName?.toLowerCase().includes(q) ?? false),
      )
    }

    const labelTargetIds = await resolveTargetIdsForLabelFilter('activity', filters.labelIds)
    activities = filterItemsByLabelTargetIds(activities, labelTargetIds)

    activities = sortActivities(activities, filters.sortBy, filters.sortDir)

    const page = pagination.page ?? 1
    const pageSize = pagination.pageSize ?? DEFAULT_PAGE_SIZE
    return paginateItems(activities, page, pageSize)
  }

  async create(data: Omit<TripActivity, 'id'>) {
    const item: TripActivity = { ...data, id: generateId('ACT') }
    await db.tripActivities.add(item)
    return item
  }

  async update(id: string, data: Partial<TripActivity>) {
    const existing = await db.tripActivities.get(id)
    if (!existing) throw new Error('Activity not found')
    const updated: TripActivity = { ...existing, ...data }
    await db.tripActivities.put(updated)
    return updated
  }

  async delete(id: string) {
    await db.tripActivities.delete(id)
  }
}
