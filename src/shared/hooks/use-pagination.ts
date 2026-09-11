import { useCallback, useMemo, useState } from 'react'
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  type PageSizeOption,
} from '@/types/pagination'

export interface UsePaginationOptions {
  initialPageSize?: PageSizeOption
  persistKey?: string
}

function isPageSizeOption(value: number): value is PageSizeOption {
  return (PAGE_SIZE_OPTIONS as readonly number[]).includes(value)
}

function loadPersistedPageSize(key: string, fallback: PageSizeOption): PageSizeOption {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = Number(raw)
    return isPageSizeOption(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

function savePersistedPageSize(key: string, size: PageSizeOption) {
  try {
    localStorage.setItem(key, String(size))
  } catch {
    // ignore storage errors (private mode, quota, etc.)
  }
}

export function usePagination(options?: UsePaginationOptions | PageSizeOption) {
  const config: UsePaginationOptions =
    typeof options === 'number' ? { initialPageSize: options } : (options ?? {})

  const fallback = config.initialPageSize ?? DEFAULT_PAGE_SIZE
  const persistKey = config.persistKey

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<PageSizeOption>(() =>
    persistKey ? loadPersistedPageSize(persistKey, fallback) : fallback,
  )

  const resetPage = useCallback(() => setPage(1), [])

  const setPageSizeAndReset = useCallback(
    (size: PageSizeOption) => {
      setPageSize(size)
      setPage(1)
      if (persistKey) savePersistedPageSize(persistKey, size)
    },
    [persistKey],
  )

  return useMemo(
    () => ({
      page,
      pageSize,
      setPage,
      setPageSize: setPageSizeAndReset,
      resetPage,
      pageSizeOptions: PAGE_SIZE_OPTIONS,
    }),
    [page, pageSize, setPageSizeAndReset, resetPage],
  )
}
