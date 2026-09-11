import { db } from '@/infrastructure/database/db'
import { DEFAULT_PAGE_SIZE, paginateItems, type PaginatedResult, type PaginationParams } from '@/types/pagination'
import type { Client } from '@/domain/entities/client'
import { clientPrimaryLabel, resolveClientJoinedAt } from '@/domain/entities/client'
import type { ClientFilters, ClientRepository, ClientSortField, ClientSortDir } from '@/repositories/interfaces'
import { createGenericRepository } from '@/repositories/implementations/dexie-repositories'
import {
  filterItemsByLabelTargetIds,
  resolveTargetIdsForLabelFilter,
} from '@/repositories/implementations/label-filter'

function sortClients(
  clients: Client[],
  sortBy: ClientSortField = 'displayName',
  sortDir: ClientSortDir = 'asc',
) {
  const dir = sortDir === 'asc' ? 1 : -1
  return [...clients].sort((a, b) => {
    let cmp = 0
    switch (sortBy) {
      case 'reference':
        cmp = a.reference.localeCompare(b.reference, undefined, { numeric: true })
        break
      case 'displayName':
        cmp = clientPrimaryLabel(a).localeCompare(clientPrimaryLabel(b))
        break
      case 'company':
        cmp = (a.company ?? '').localeCompare(b.company ?? '')
        break
      case 'email':
        cmp = (a.email ?? '').localeCompare(b.email ?? '')
        break
      case 'status':
        cmp = a.status.localeCompare(b.status)
        break
      case 'type':
        cmp = a.type.localeCompare(b.type)
        break
      case 'createdAt':
        cmp =
          new Date(resolveClientJoinedAt(a)).getTime() - new Date(resolveClientJoinedAt(b)).getTime()
        break
    }
    return cmp * dir
  })
}

const INDEXED_CLIENT_SORT_FIELDS = new Set<ClientSortField>([
  'reference',
  'displayName',
  'email',
  'status',
  'type',
  'createdAt',
])

async function loadClientsForFilters(filters: ClientFilters): Promise<Client[]> {
  const hasSearch = Boolean(filters.search?.trim())
  const hasLabelFilter = Boolean(filters.labelIds?.length)

  if (hasSearch || hasLabelFilter) {
    return db.clients.orderBy('updatedAt').reverse().toArray()
  }

  if (filters.status && filters.status !== 'all') {
    return db.clients.where('status').equals(filters.status).toArray()
  }

  if (filters.type && filters.type !== 'all') {
    return db.clients.where('type').equals(filters.type).toArray()
  }

  const sortBy = filters.sortBy ?? 'displayName'
  if (INDEXED_CLIENT_SORT_FIELDS.has(sortBy)) {
    const collection = db.clients.orderBy(sortBy)
    return filters.sortDir === 'desc' ? collection.reverse().toArray() : collection.toArray()
  }

  return db.clients.orderBy('updatedAt').reverse().toArray()
}

export class DexieClientRepository implements ClientRepository {
  private generic = createGenericRepository<Client>(db.clients, 'CLT')

  findAll() {
    return this.generic.findAll()
  }

  findById(id: string) {
    return this.generic.findById(id)
  }

  create(data: Omit<Client, 'id'>) {
    return this.generic.create(data)
  }

  update(id: string, data: Partial<Client>) {
    return this.generic.update(id, data)
  }

  delete(id: string) {
    return this.generic.delete(id)
  }

  async findPaginated(
    filters: ClientFilters = {},
    pagination: PaginationParams = {},
  ): Promise<PaginatedResult<Client>> {
    let clients = await loadClientsForFilters(filters)

    if (filters.search) {
      const q = filters.search.toLowerCase().trim()
      clients = clients.filter(
        (client) =>
          clientPrimaryLabel(client).toLowerCase().includes(q) ||
          client.reference.toLowerCase().includes(q) ||
          (client.email?.toLowerCase().includes(q) ?? false) ||
          (client.company?.toLowerCase().includes(q) ?? false) ||
          (client.phone?.toLowerCase().includes(q) ?? false) ||
          (client.city?.toLowerCase().includes(q) ?? false),
      )
    }

    if (filters.status && filters.status !== 'all') {
      clients = clients.filter((client) => client.status === filters.status)
    }

    if (filters.type && filters.type !== 'all') {
      clients = clients.filter((client) => client.type === filters.type)
    }

    if (filters.country && filters.country !== 'all') {
      clients = clients.filter((client) => (client.country ?? '').trim() === filters.country)
    }

    if (filters.city && filters.city !== 'all') {
      clients = clients.filter((client) => (client.city ?? '').trim() === filters.city)
    }

    if (filters.company && filters.company !== 'all') {
      clients = clients.filter((client) => (client.company ?? '').trim() === filters.company)
    }

    const labelTargetIds = await resolveTargetIdsForLabelFilter('client', filters.labelIds)
    clients = filterItemsByLabelTargetIds(clients, labelTargetIds)

    clients = sortClients(clients, filters.sortBy, filters.sortDir)

    const page = pagination.page ?? 1
    const pageSize = pagination.pageSize ?? DEFAULT_PAGE_SIZE
    return paginateItems(clients, page, pageSize)
  }

  async countLinkedTrips(clientId: string): Promise<number> {
    return db.trips.where('clientId').equals(clientId).count()
  }
}
