import type { TripService } from '@/domain/entities/trip-service'
import { tripServiceMargin, tripServiceSelling } from '@/features/trips/components/services/trip-service-financial'

export type TripServiceSortField =
  | 'lineNumber'
  | 'category'
  | 'startDate'
  | 'supplierName'
  | 'cost'
  | 'selling'
  | 'margin'
  | 'status'

export type TripServiceSortDir = 'asc' | 'desc'

export function sortTripServices(
  services: TripService[],
  sortBy: TripServiceSortField,
  sortDir: TripServiceSortDir,
): TripService[] {
  const dir = sortDir === 'asc' ? 1 : -1

  const value = (service: TripService) => {
    switch (sortBy) {
      case 'lineNumber':
        return service.lineNumber
      case 'category':
        return service.category
      case 'startDate':
        return service.startDate ?? ''
      case 'supplierName':
        return (service.supplierName ?? '').toLowerCase()
      case 'cost':
        return service.cost
      case 'selling':
        return tripServiceSelling(service)
      case 'margin':
        return tripServiceMargin(service)
      case 'status':
        return service.status
      default:
        return service.lineNumber
    }
  }

  return [...services].sort((a, b) => {
    const left = value(a)
    const right = value(b)
    if (left < right) return -1 * dir
    if (left > right) return 1 * dir
    return a.lineNumber - b.lineNumber
  })
}

export function paginateTripServices<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize
  return items.slice(start, start + pageSize)
}
