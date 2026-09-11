import { db } from '@/infrastructure/database/db'
import { clientPrimaryLabel } from '@/domain/entities/client'
import type { Traveler } from '@/domain/entities/traveler'
import { DEFAULT_PAGE_SIZE, paginateItems, type PaginatedResult, type PaginationParams } from '@/types/pagination'
import type {
  TravelerFilters,
  TravelerListItem,
  TravelerRepository,
  TravelerSortDir,
  TravelerSortField,
} from '@/repositories/interfaces'
import { createGenericRepository } from '@/repositories/implementations/dexie-repositories'
import {
  compareTravelersByField,
  travelerSearchHaystackValues,
} from '@/features/travelers/components/list/travelers-table-column-helpers'

function travelerSearchHaystack(traveler: Traveler, accountName: string): string {
  return travelerSearchHaystackValues(traveler, accountName)
    .map((value) => value?.trim().toLowerCase() ?? '')
    .filter(Boolean)
    .join(' ')
}

function sortTravelers(
  travelers: TravelerListItem[],
  sortBy: TravelerSortField = 'name',
  sortDir: TravelerSortDir = 'asc',
) {
  const dir = sortDir === 'asc' ? 1 : -1
  return [...travelers].sort((a, b) => {
    let cmp = 0
    if (sortBy === 'account') {
      cmp = a.accountName.localeCompare(b.accountName)
    } else {
      cmp = compareTravelersByField(a, b, sortBy)
    }
    if (cmp !== 0) return cmp * dir
    return a.lastName.localeCompare(b.lastName) * dir
  })
}

export class DexieTravelerRepository implements TravelerRepository {
  private generic = createGenericRepository<Traveler>(db.travelers, 'TRV')

  findAll() {
    return this.generic.findAll()
  }

  findById(id: string) {
    return this.generic.findById(id)
  }

  create(data: Omit<Traveler, 'id'>) {
    return this.generic.create(data)
  }

  update(id: string, data: Partial<Traveler>) {
    return this.generic.update(id, data)
  }

  delete(id: string) {
    return this.generic.delete(id)
  }

  async findByAccountId(accountId: string) {
    const travelers = await db.travelers.where('accountId').equals(accountId).toArray()
    return travelers.sort((a, b) => {
      const nameA = `${a.lastName} ${a.firstName}`.toLowerCase()
      const nameB = `${b.lastName} ${b.firstName}`.toLowerCase()
      return nameA.localeCompare(nameB)
    })
  }

  async deleteByAccountId(accountId: string) {
    const travelers = await db.travelers.where('accountId').equals(accountId).toArray()
    await Promise.all(travelers.map((traveler) => db.travelers.delete(traveler.id)))
  }

  async findPaginated(
    filters: TravelerFilters = {},
    pagination: PaginationParams = {},
  ): Promise<PaginatedResult<TravelerListItem>> {
    if (filters.accountId) {
      const [travelers, client] = await Promise.all([
        db.travelers.where('accountId').equals(filters.accountId).toArray(),
        db.clients.get(filters.accountId),
      ])
      const accountName = client ? clientPrimaryLabel(client) : 'Unknown account'

      let items: TravelerListItem[] = travelers.map((traveler) => ({
        ...traveler,
        accountName,
      }))

      if (filters.search) {
        const q = filters.search.toLowerCase().trim()
        items = items.filter((traveler) => travelerSearchHaystack(traveler, accountName).includes(q))
      }

      items = sortTravelers(items, filters.sortBy, filters.sortDir)

      const page = pagination.page ?? 1
      const pageSize = pagination.pageSize ?? DEFAULT_PAGE_SIZE
      return paginateItems(items, page, pageSize)
    }

    const travelers = await db.travelers.toArray()
    const accountIds = [...new Set(travelers.map((traveler) => traveler.accountId))]
    const clients =
      accountIds.length > 0 ? await db.clients.where('id').anyOf(accountIds).toArray() : []
    const accountNames = new Map(
      clients.map((client) => [client.id, clientPrimaryLabel(client)] as const),
    )

    let items: TravelerListItem[] = travelers.map((traveler) => ({
      ...traveler,
      accountName: accountNames.get(traveler.accountId) ?? 'Unknown account',
    }))

    if (filters.search) {
      const q = filters.search.toLowerCase().trim()
      items = items.filter((traveler) => travelerSearchHaystack(traveler, traveler.accountName).includes(q))
    }

    items = sortTravelers(items, filters.sortBy, filters.sortDir)

    const page = pagination.page ?? 1
    const pageSize = pagination.pageSize ?? DEFAULT_PAGE_SIZE
    return paginateItems(items, page, pageSize)
  }
}
