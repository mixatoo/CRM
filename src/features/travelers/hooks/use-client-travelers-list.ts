import { useMemo } from 'react'
import { useClientTravelers } from '@/features/travelers/hooks/use-client-travelers'
import {
  filterClientTravelers,
  paginateClientTravelers,
  sortClientTravelers,
  type ClientTravelerSortDir,
  type ClientTravelerSortField,
} from '@/features/travelers/utils/client-travelers-list'

export function useClientTravelersList(
  accountId: string | undefined,
  sortBy: ClientTravelerSortField,
  sortDir: ClientTravelerSortDir,
  page: number,
  pageSize: number,
  query = '',
) {
  const { data: travelers = [], isLoading, isFetching } = useClientTravelers(accountId)

  const data = useMemo(
    () =>
      paginateClientTravelers(
        sortClientTravelers(filterClientTravelers(travelers, query), sortBy, sortDir),
        page,
        pageSize,
      ),
    [travelers, query, sortBy, sortDir, page, pageSize],
  )

  return { data, isLoading, isFetching }
}
