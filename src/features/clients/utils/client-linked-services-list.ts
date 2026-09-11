import type { TripService } from '@/domain/entities/trip-service'
import { formatServiceCategory, TRIP_SERVICE_STATUS_LABELS } from '@/domain/entities/trip-service'
import { paginateItems, type PaginatedResult } from '@/types/pagination'

export type ClientLinkedServiceRow = TripService & {
  tripReference: string
}

export type ClientLinkedServiceSortField =
  | 'service'
  | 'category'
  | 'trip'
  | 'supplier'
  | 'selling'
  | 'status'
  | 'startDate'
  | 'cost'

export type ClientLinkedServiceSortDir = 'asc' | 'desc'

function sortValue(service: ClientLinkedServiceRow, field: ClientLinkedServiceSortField): string | number {
  switch (field) {
    case 'service':
      return service.name.trim().toLowerCase()
    case 'category':
      return formatServiceCategory(service.category).toLowerCase()
    case 'trip':
      return service.tripReference.toLowerCase()
    case 'supplier':
      return service.supplierName?.trim().toLowerCase() ?? ''
    case 'selling':
      return service.selling ?? service.cost
    case 'cost':
      return service.cost
    case 'status':
      return TRIP_SERVICE_STATUS_LABELS[service.status].toLowerCase()
    case 'startDate':
      return service.startDate ?? service.updatedAt
  }
}

export function sortClientLinkedServices(
  services: ClientLinkedServiceRow[],
  sortBy: ClientLinkedServiceSortField,
  sortDir: ClientLinkedServiceSortDir,
): ClientLinkedServiceRow[] {
  const dir = sortDir === 'asc' ? 1 : -1
  return [...services].sort((left, right) => {
    const leftValue = sortValue(left, sortBy)
    const rightValue = sortValue(right, sortBy)

    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      const cmp = leftValue - rightValue
      if (cmp !== 0) return cmp * dir
    } else {
      const cmp = String(leftValue).localeCompare(String(rightValue))
      if (cmp !== 0) return cmp * dir
    }

    return left.name.localeCompare(right.name) * dir
  })
}

export function paginateClientLinkedServices(
  services: ClientLinkedServiceRow[],
  page: number,
  pageSize: number,
): PaginatedResult<ClientLinkedServiceRow> {
  return paginateItems(services, page, pageSize)
}
