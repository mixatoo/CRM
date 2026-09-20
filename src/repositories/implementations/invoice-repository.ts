import { db } from '@/infrastructure/database/db'
import { DEFAULT_PAGE_SIZE, paginateItems, type PaginationParams } from '@/types/pagination'
import type { Invoice } from '@/domain/entities/invoice'
import { invoiceBalanceDue } from '@/domain/entities/invoice'
import type {
  InvoiceFilters,
  InvoiceRepository,
  InvoiceSortDir,
  InvoiceSortField,
} from '@/repositories/interfaces'
import { generateId } from '@/shared/utils/cn'
import { syncTripFinancials } from '@/infrastructure/database/trip-sync'
import {
  filterItemsByLabelTargetIds,
  resolveTargetIdsForLabelFilter,
} from '@/repositories/implementations/label-filter'

function daysUntilDue(dueDate: string): number {
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function invoiceAgingBucket(invoice: Pick<Invoice, 'status' | 'dueDate'>): 'current' | 'due_soon' | 'overdue' | 'settled' {
  if (invoice.status === 'paid' || invoice.status === 'void') return 'settled'
  const offset = daysUntilDue(invoice.dueDate)
  if (offset < 0) return 'overdue'
  if (offset <= 7) return 'due_soon'
  return 'current'
}

function sortInvoices(invoices: Invoice[], sortBy: InvoiceSortField = 'number', sortDir: InvoiceSortDir = 'desc') {
  const dir = sortDir === 'asc' ? 1 : -1
  return [...invoices].sort((a, b) => {
    let cmp = 0
    switch (sortBy) {
      case 'issuedAt':
        cmp = new Date(a.issuedAt).getTime() - new Date(b.issuedAt).getTime()
        break
      case 'dueDate':
        cmp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        break
      case 'total':
        cmp = a.total - b.total
        break
      case 'number':
        cmp = a.number.localeCompare(b.number, undefined, { numeric: true })
        break
      case 'status':
        cmp = a.status.localeCompare(b.status)
        break
      case 'clientName':
        cmp = a.clientName.localeCompare(b.clientName)
        break
    }
    return cmp * dir
  })
}

export class DexieInvoiceRepository implements InvoiceRepository {
  async findAll() {
    return db.invoices.orderBy('issuedAt').reverse().toArray()
  }

  async findById(id: string) {
    return (await db.invoices.get(id)) ?? null
  }

  async findByTripId(tripId: string) {
    const invoices = await db.invoices.where('tripId').equals(tripId).toArray()
    return invoices.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  async countByTripId(tripId: string) {
    return db.invoices.where('tripId').equals(tripId).count()
  }

  async findPaginated(filters: InvoiceFilters = {}, pagination: PaginationParams = {}) {
    let invoices = await db.invoices.orderBy('issuedAt').reverse().toArray()

    if (filters.tripId) invoices = invoices.filter((i) => i.tripId === filters.tripId)
    if (filters.status && filters.status !== 'all') invoices = invoices.filter((i) => i.status === filters.status)
    if (filters.aging && filters.aging !== 'all') {
      invoices = invoices.filter((i) => {
        const bucket = invoiceAgingBucket(i)
        if (filters.aging === 'overdue') return bucket === 'overdue'
        if (filters.aging === 'due_soon') return bucket === 'due_soon'
        if (filters.aging === 'current') return bucket === 'current' || bucket === 'settled'
        return true
      })
    }
    if (filters.search) {
      const q = filters.search.toLowerCase().trim()
      invoices = invoices.filter(
        (i) =>
          i.number.toLowerCase().includes(q) ||
          i.clientName.toLowerCase().includes(q) ||
          (i.clientEmail?.toLowerCase().includes(q) ?? false),
      )
    }

    const labelTargetIds = await resolveTargetIdsForLabelFilter('invoice', filters.labelIds)
    invoices = filterItemsByLabelTargetIds(invoices, labelTargetIds)

    invoices = sortInvoices(invoices, filters.sortBy, filters.sortDir)
    return paginateItems(invoices, pagination.page ?? 1, pagination.pageSize ?? DEFAULT_PAGE_SIZE)
  }

  async create(data: Omit<Invoice, 'id'>) {
    const item: Invoice = { ...data, id: generateId('INV') }
    await db.invoices.add(item)
    await syncTripFinancials(data.tripId)
    return item
  }

  async update(id: string, data: Partial<Invoice>) {
    const existing = await db.invoices.get(id)
    if (!existing) throw new Error('Invoice not found')
    const updated: Invoice = { ...existing, ...data, updatedAt: new Date().toISOString() }
    await db.invoices.put(updated)
    await syncTripFinancials(updated.tripId)
    return updated
  }

  async delete(id: string) {
    const existing = await db.invoices.get(id)
    await db.invoices.delete(id)
    if (existing) await syncTripFinancials(existing.tripId)
  }
}

export function sumInvoiceBalanceDue(invoices: Invoice[]) {
  return invoices.reduce((sum, invoice) => sum + invoiceBalanceDue(invoice), 0)
}
