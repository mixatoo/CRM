import { db } from '@/infrastructure/database/db'
import { DEFAULT_PAGE_SIZE, paginateItems, type PaginatedResult, type PaginationParams } from '@/types/pagination'
import type { TripPayment } from '@/domain/entities/trip-payment'
import type {
  PaymentFilters,
  PaymentSortDir,
  PaymentSortField,
  TripPaymentRepository,
} from '@/repositories/interfaces'
import { generateId } from '@/shared/utils/cn'
import { syncTripFinancials } from '@/infrastructure/database/trip-sync'
import {
  filterItemsByLabelTargetIds,
  resolveTargetIdsForLabelFilter,
} from '@/repositories/implementations/label-filter'

function sortPayments(
  payments: TripPayment[],
  sortBy: PaymentSortField = 'paidAt',
  sortDir: PaymentSortDir = 'desc',
) {
  const dir = sortDir === 'asc' ? 1 : -1
  return [...payments].sort((a, b) => {
    let cmp = 0
    switch (sortBy) {
      case 'paidAt':
        cmp = new Date(a.paidAt).getTime() - new Date(b.paidAt).getTime()
        break
      case 'amount':
        cmp = a.amount - b.amount
        break
      case 'direction':
        cmp = a.direction.localeCompare(b.direction)
        break
      case 'status':
        cmp = a.status.localeCompare(b.status)
        break
      case 'method':
        cmp = a.method.localeCompare(b.method)
        break
    }
    return cmp * dir
  })
}

export class DexieTripPaymentRepository implements TripPaymentRepository {
  async findAll() {
    return db.tripPayments.orderBy('paidAt').reverse().toArray()
  }

  async findById(id: string) {
    return (await db.tripPayments.get(id)) ?? null
  }

  async findByTripId(tripId: string) {
    const payments = await db.tripPayments.where('tripId').equals(tripId).toArray()
    return payments.sort((a, b) => b.paidAt.localeCompare(a.paidAt))
  }

  async findByClientId(clientId: string) {
    const payments = await db.tripPayments.where('clientId').equals(clientId).toArray()
    return payments.sort((a, b) => b.paidAt.localeCompare(a.paidAt))
  }

  async findPaginated(
    filters: PaymentFilters = {},
    pagination: PaginationParams = {},
  ): Promise<PaginatedResult<TripPayment>> {
    let payments = await db.tripPayments.orderBy('paidAt').reverse().toArray()

    if (filters.tripId) {
      payments = payments.filter((payment) => payment.tripId === filters.tripId)
    }

    if (filters.clientId) {
      payments = payments.filter((payment) => payment.clientId === filters.clientId)
    }

    if (filters.direction && filters.direction !== 'all') {
      payments = payments.filter((payment) => payment.direction === filters.direction)
    }

    if (filters.status && filters.status !== 'all') {
      payments = payments.filter((payment) => payment.status === filters.status)
    }

    if (filters.method && filters.method !== 'all') {
      payments = payments.filter((payment) => payment.method === filters.method)
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim()
      payments = payments.filter(
        (payment) =>
          payment.reference?.toLowerCase().includes(q) ||
          payment.counterpartyName?.toLowerCase().includes(q) ||
          payment.notes?.toLowerCase().includes(q),
      )
    }

    const labelTargetIds = await resolveTargetIdsForLabelFilter('payment', filters.labelIds)
    payments = filterItemsByLabelTargetIds(payments, labelTargetIds)

    payments = sortPayments(payments, filters.sortBy, filters.sortDir)

    const page = pagination.page ?? 1
    const pageSize = pagination.pageSize ?? DEFAULT_PAGE_SIZE
    return paginateItems(payments, page, pageSize)
  }

  async create(data: Omit<TripPayment, 'id'>) {
    const item: TripPayment = { ...data, id: generateId('PAY') }
    await db.tripPayments.add(item)
    if (data.tripId) await syncTripFinancials(data.tripId)
    return item
  }

  async update(id: string, data: Partial<TripPayment>) {
    const existing = await db.tripPayments.get(id)
    if (!existing) throw new Error('Payment not found')
    const updated: TripPayment = { ...existing, ...data, updatedAt: new Date().toISOString() }
    await db.tripPayments.put(updated)
    if (updated.tripId) await syncTripFinancials(updated.tripId)
    return updated
  }

  async delete(id: string) {
    const existing = await db.tripPayments.get(id)
    if (!existing) return
    await db.tripPayments.delete(id)
    if (existing.tripId) await syncTripFinancials(existing.tripId)
  }
}
