import { db } from '@/infrastructure/database/db'
import { DEFAULT_PAGE_SIZE, paginateItems, type PaginatedResult, type PaginationParams } from '@/types/pagination'
import type { Supplier } from '@/domain/entities/supplier'
import type {
  SupplierFilters,
  SupplierRepository,
  SupplierSortDir,
  SupplierSortField,
} from '@/repositories/interfaces'
import { createGenericRepository } from '@/repositories/implementations/dexie-repositories'
import {
  filterItemsByLabelTargetIds,
  resolveTargetIdsForLabelFilter,
} from '@/repositories/implementations/label-filter'

function sortSuppliers(
  suppliers: Supplier[],
  sortBy: SupplierSortField = 'displayName',
  sortDir: SupplierSortDir = 'asc',
) {
  const dir = sortDir === 'asc' ? 1 : -1
  return [...suppliers].sort((a, b) => {
    let cmp = 0
    switch (sortBy) {
      case 'reference':
        cmp = a.reference.localeCompare(b.reference, undefined, { numeric: true })
        break
      case 'displayName':
        cmp = a.displayName.localeCompare(b.displayName)
        break
      case 'category':
        cmp = a.category.localeCompare(b.category)
        break
      case 'country':
        cmp = (a.country ?? '').localeCompare(b.country ?? '')
        break
      case 'email':
        cmp = (a.email ?? '').localeCompare(b.email ?? '')
        break
      case 'status':
        cmp = a.status.localeCompare(b.status)
        break
      case 'updatedAt':
        cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        break
    }
    return cmp * dir
  })
}

export class DexieSupplierRepository implements SupplierRepository {
  private generic = createGenericRepository<Supplier>(db.suppliers, 'SUP')

  findAll() {
    return this.generic.findAll()
  }

  findById(id: string) {
    return this.generic.findById(id)
  }

  create(data: Omit<Supplier, 'id'>) {
    return this.generic.create(data)
  }

  update(id: string, data: Partial<Supplier>) {
    return this.generic.update(id, data)
  }

  delete(id: string) {
    return this.generic.delete(id)
  }

  async findPaginated(
    filters: SupplierFilters = {},
    pagination: PaginationParams = {},
  ): Promise<PaginatedResult<Supplier>> {
    let suppliers = await db.suppliers.orderBy('updatedAt').reverse().toArray()

    if (filters.search) {
      const q = filters.search.toLowerCase().trim()
      suppliers = suppliers.filter(
        (supplier) =>
          supplier.displayName.toLowerCase().includes(q) ||
          supplier.reference.toLowerCase().includes(q) ||
          (supplier.email?.toLowerCase().includes(q) ?? false) ||
          (supplier.contactName?.toLowerCase().includes(q) ?? false) ||
          (supplier.phone?.toLowerCase().includes(q) ?? false) ||
          (supplier.city?.toLowerCase().includes(q) ?? false),
      )
    }

    if (filters.status && filters.status !== 'all') {
      suppliers = suppliers.filter((supplier) => supplier.status === filters.status)
    }

    if (filters.category && filters.category !== 'all') {
      suppliers = suppliers.filter((supplier) => supplier.category === filters.category)
    }

    if (filters.country && filters.country !== 'all') {
      suppliers = suppliers.filter((supplier) => (supplier.country ?? '').trim() === filters.country)
    }

    if (filters.city && filters.city !== 'all') {
      suppliers = suppliers.filter((supplier) => (supplier.city ?? '').trim() === filters.city)
    }

    const labelTargetIds = await resolveTargetIdsForLabelFilter('supplier', filters.labelIds)
    suppliers = filterItemsByLabelTargetIds(suppliers, labelTargetIds)

    suppliers = sortSuppliers(suppliers, filters.sortBy, filters.sortDir)

    const page = pagination.page ?? 1
    const pageSize = pagination.pageSize ?? DEFAULT_PAGE_SIZE
    return paginateItems(suppliers, page, pageSize)
  }

  async countLinkedServices(supplierId: string): Promise<number> {
    const supplier = await this.findById(supplierId)
    if (!supplier) return 0

    const byId = await db.tripServices.where('supplierId').equals(supplierId).count()
    if (byId > 0) return byId

    const name = supplier.displayName.trim().toLowerCase()
    if (!name) return 0

    const services = await db.tripServices.toArray()
    return services.filter((service) => service.supplierName?.trim().toLowerCase() === name).length
  }
}
