export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const

export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number]

export const DEFAULT_PAGE_SIZE: PageSizeOption = 25

export function paginateItems<T>(
  items: T[],
  page = 1,
  pageSize: number = DEFAULT_PAGE_SIZE,
): PaginatedResult<T> {
  const size = Math.max(1, Number(pageSize) || DEFAULT_PAGE_SIZE)
  const start = (page - 1) * size
  const slice = items.slice(start, start + size)
  return {
    items: slice,
    total: items.length,
    page,
    pageSize: size,
    totalPages: Math.max(1, Math.ceil(items.length / size)),
  }
}

export const TRIPS_PAGE_SIZE_STORAGE_KEY = 'egyliere.trips.pageSize'

export const TRIP_SERVICES_PAGE_SIZE_STORAGE_KEY = 'egyliere.trip-services.pageSize'

export const TRIP_FLIGHT_SEGMENTS_PAGE_SIZE_STORAGE_KEY = 'egyliere.trip-flight-segments.pageSize'

export const CLIENTS_PAGE_SIZE_STORAGE_KEY = 'egyliere.clients.pageSize'

export const SUPPLIERS_PAGE_SIZE_STORAGE_KEY = 'egyliere.suppliers.pageSize'

export const TRANSACTIONS_PAGE_SIZE_STORAGE_KEY = 'egyliere.transactions.pageSize'

export const REMINDERS_PAGE_SIZE_STORAGE_KEY = 'egyliere.reminders.pageSize'

export const ACTIVITY_PAGE_SIZE_STORAGE_KEY = 'egyliere.activity.pageSize'

export const INVOICES_PAGE_SIZE_STORAGE_KEY = 'egyliere.invoices.pageSize'
