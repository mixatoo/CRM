import { db } from '@/infrastructure/database/db'
import { DEFAULT_PAGE_SIZE, paginateItems, type PaginatedResult, type PaginationParams } from '@/types/pagination'
import type { Trip } from '@/domain/entities'
import { TRIP_STAGES } from '@/domain/entities'
import type { TripFilters, TripRepository, TripSortField, TripSortDir } from '@/repositories/interfaces'
import { createGenericRepository } from '@/repositories/implementations/dexie-repositories'
import {
  filterItemsByLabelTargetIds,
  resolveTargetIdsForLabelFilter,
} from '@/repositories/implementations/label-filter'

function tripDateValue(trip: Trip) {
  return new Date(trip.startDate ?? trip.bookingStartedAt).getTime() || 0
}

function tripDestination(trip: Trip) {
  return trip.destination ?? trip.branch
}

function tripClientName(trip: Trip) {
  return trip.mainContactName?.trim() ?? ''
}

function sortTrips(trips: Trip[], sortBy: TripSortField = 'reference', sortDir: TripSortDir = 'desc') {
  const dir = sortDir === 'asc' ? 1 : -1
  return [...trips].sort((a, b) => {
    let cmp = 0
    switch (sortBy) {
      case 'reference':
        cmp = a.reference.localeCompare(b.reference, undefined, { numeric: true })
        break
      case 'date':
        cmp = tripDateValue(a) - tripDateValue(b)
        break
      case 'client':
        cmp = (a.mainContactName ?? '').localeCompare(b.mainContactName ?? '')
        break
      case 'persons':
        cmp = a.adults + a.minors - (b.adults + b.minors)
        break
      case 'cost':
        cmp = a.totalCost - b.totalCost
        break
      case 'destination':
        cmp = tripDestination(a).localeCompare(tripDestination(b))
        break
      case 'stage':
        cmp = TRIP_STAGES.indexOf(a.stage) - TRIP_STAGES.indexOf(b.stage)
        break
      case 'owner':
        cmp = a.ownerName.localeCompare(b.ownerName)
        break
    }
    return cmp * dir
  })
}

export class DexieTripRepository implements TripRepository {
  private generic = createGenericRepository<Trip>(db.trips, 'TRP')

  findAll() {
    return this.generic.findAll()
  }

  findById(id: string) {
    return this.generic.findById(id)
  }

  create(data: Omit<Trip, 'id'>) {
    return this.generic.create(data)
  }

  update(id: string, data: Partial<Trip>) {
    return this.generic.update(id, data)
  }

  delete(id: string) {
    return this.generic.delete(id)
  }

  async findPaginated(
    filters: TripFilters = {},
    pagination: PaginationParams = {},
  ): Promise<PaginatedResult<Trip>> {
    let trips: Trip[]

    if (filters.clientId) {
      trips = await db.trips.where('clientId').equals(filters.clientId).toArray()
    } else if (filters.stage && filters.stage !== 'all') {
      trips = await db.trips.where('stage').equals(filters.stage).toArray()
    } else {
      trips = await db.trips.orderBy('createdAt').reverse().toArray()
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim()
      trips = trips.filter(
        (trip) =>
          trip.name.toLowerCase().includes(q) ||
          trip.reference.toLowerCase().includes(q) ||
          trip.ownerName.toLowerCase().includes(q) ||
          trip.branch.toLowerCase().includes(q) ||
          (trip.destination?.toLowerCase().includes(q) ?? false) ||
          (trip.mainContactName?.toLowerCase().includes(q) ?? false),
      )
    }

    if (filters.stage && filters.stage !== 'all' && filters.clientId) {
      trips = trips.filter((trip) => trip.stage === filters.stage)
    }

    if (filters.owner && filters.owner !== 'all') {
      trips = trips.filter((trip) => trip.ownerName === filters.owner)
    }

    if (filters.client && filters.client !== 'all' && !filters.clientId) {
      trips = trips.filter((trip) => tripClientName(trip) === filters.client)
    }

    if (filters.destination && filters.destination !== 'all') {
      trips = trips.filter((trip) => tripDestination(trip) === filters.destination)
    }

    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom).getTime()
      trips = trips.filter((trip) => tripDateValue(trip) >= from)
    }

    if (filters.dateTo) {
      const to = new Date(filters.dateTo)
      to.setHours(23, 59, 59, 999)
      trips = trips.filter((trip) => tripDateValue(trip) <= to.getTime())
    }

    const labelTargetIds = await resolveTargetIdsForLabelFilter('trip', filters.labelIds)
    trips = filterItemsByLabelTargetIds(trips, labelTargetIds)

    trips = sortTrips(trips, filters.sortBy ?? 'reference', filters.sortDir ?? 'desc')

    return paginateItems(trips, pagination.page ?? 1, Number(pagination.pageSize) || DEFAULT_PAGE_SIZE)
  }
}

export { createGenericRepository }
