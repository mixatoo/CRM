import type { Traveler } from '@/domain/entities/traveler'
import { paginateItems, type PaginatedResult } from '@/types/pagination'
import {
  compareTravelersByField,
  travelerSearchHaystackValues,
  type TravelerTableSortField,
} from '@/features/travelers/components/list/travelers-table-column-helpers'

export type ClientTravelerSortField = TravelerTableSortField
export type ClientTravelerSortDir = 'asc' | 'desc'

function travelerSearchHaystack(traveler: Traveler): string {
  return travelerSearchHaystackValues(traveler)
    .map((value) => value?.trim().toLowerCase() ?? '')
    .filter(Boolean)
    .join(' ')
}

export function filterClientTravelers(travelers: Traveler[], query: string): Traveler[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return travelers
  return travelers.filter((traveler) => travelerSearchHaystack(traveler).includes(normalized))
}

export function sortClientTravelers(
  travelers: Traveler[],
  sortBy: ClientTravelerSortField,
  sortDir: ClientTravelerSortDir,
): Traveler[] {
  const dir = sortDir === 'asc' ? 1 : -1
  return [...travelers].sort((left, right) => {
    const cmp = compareTravelersByField(left, right, sortBy)
    if (cmp !== 0) return cmp * dir
    return left.lastName.localeCompare(right.lastName) * dir
  })
}

export function paginateClientTravelers(
  travelers: Traveler[],
  page: number,
  pageSize: number,
): PaginatedResult<Traveler> {
  return paginateItems(travelers, page, pageSize)
}
