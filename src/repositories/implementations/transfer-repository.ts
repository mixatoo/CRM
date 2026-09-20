import { db } from '@/infrastructure/database/db'
import { DEFAULT_PAGE_SIZE, paginateItems, type PaginatedResult, type PaginationParams } from '@/types/pagination'
import type { Transfer } from '@/domain/entities/transfer'
import type {
  TransferFilters,
  TransferRepository,
  TransferSortDir,
  TransferSortField,
} from '@/repositories/interfaces'
import { createGenericRepository } from '@/repositories/implementations/dexie-repositories'

function sortTransfers(
  transfers: Transfer[],
  sortBy: TransferSortField = 'reference',
  sortDir: TransferSortDir = 'desc',
) {
  const dir = sortDir === 'asc' ? 1 : -1
  return [...transfers].sort((a, b) => {
    let cmp = 0
    switch (sortBy) {
      case 'reference':
        cmp = a.reference.localeCompare(b.reference, undefined, { numeric: true })
        break
      case 'serviceDate':
        cmp = (a.serviceDate ?? '').localeCompare(b.serviceDate ?? '')
        break
      case 'kind':
        cmp = a.kind.localeCompare(b.kind)
        break
      case 'stage':
        cmp = a.stage.localeCompare(b.stage)
        break
      case 'pickupLocation':
        cmp = a.pickupLocation.localeCompare(b.pickupLocation)
        break
      case 'sellingPrice':
        cmp = a.sellingPrice - b.sellingPrice
        break
      case 'updatedAt':
        cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        break
    }
    return cmp * dir
  })
}

export class DexieTransferRepository implements TransferRepository {
  private generic = createGenericRepository<Transfer>(db.transfers, 'TRF')

  findAll() {
    return this.generic.findAll()
  }

  findById(id: string) {
    return this.generic.findById(id)
  }

  create(data: Omit<Transfer, 'id'>) {
    return this.generic.create(data)
  }

  update(id: string, data: Partial<Transfer>) {
    return this.generic.update(id, data)
  }

  delete(id: string) {
    return this.generic.delete(id)
  }

  async findPaginated(
    filters: TransferFilters = {},
    pagination: PaginationParams = {},
  ): Promise<PaginatedResult<Transfer>> {
    let transfers = await db.transfers.orderBy('updatedAt').reverse().toArray()

    if (filters.search) {
      const q = filters.search.toLowerCase().trim()
      transfers = transfers.filter(
        (transfer) =>
          transfer.reference.toLowerCase().includes(q) ||
          transfer.pickupLocation.toLowerCase().includes(q) ||
          transfer.dropoffLocation.toLowerCase().includes(q) ||
          (transfer.clientName?.toLowerCase().includes(q) ?? false) ||
          (transfer.supplierName?.toLowerCase().includes(q) ?? false) ||
          (transfer.tripReference?.toLowerCase().includes(q) ?? false) ||
          (transfer.driverName?.toLowerCase().includes(q) ?? false) ||
          (transfer.vehiclePlate?.toLowerCase().includes(q) ?? false),
      )
    }

    if (filters.stage && filters.stage !== 'all') {
      transfers = transfers.filter((transfer) => transfer.stage === filters.stage)
    }

    if (filters.kind && filters.kind !== 'all') {
      transfers = transfers.filter((transfer) => transfer.kind === filters.kind)
    }

    if (filters.tripId) {
      transfers = transfers.filter((transfer) => transfer.tripId === filters.tripId)
    }

    if (filters.supplierId) {
      transfers = transfers.filter((transfer) => transfer.supplierId === filters.supplierId)
    }

    transfers = sortTransfers(transfers, filters.sortBy, filters.sortDir)

    const page = pagination.page ?? 1
    const pageSize = pagination.pageSize ?? DEFAULT_PAGE_SIZE
    return paginateItems(transfers, page, pageSize)
  }
}
