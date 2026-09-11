import { keepPreviousData } from '@tanstack/react-query'

/** Keeps the previous page visible while paginated list queries refetch. */
export const paginatedListQueryOptions = {
  placeholderData: keepPreviousData,
} as const
