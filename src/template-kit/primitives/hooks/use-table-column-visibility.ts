import { useCallback, useMemo, useState } from 'react'

export interface TableColumnDefinition<T extends string> {
  key: T
  label: string
  locked?: boolean
  defaultVisible?: boolean
}

function defaultVisibleKeys<T extends string>(columns: TableColumnDefinition<T>[]): Set<T> {
  return new Set(columns.filter((column) => column.locked || column.defaultVisible !== false).map((column) => column.key))
}

function loadVisibleKeys<T extends string>(storageKey: string, columns: TableColumnDefinition<T>[]): Set<T> {
  const fallback = defaultVisibleKeys(columns)
  if (typeof window === 'undefined') return fallback

  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return fallback

    const parsed = JSON.parse(raw) as T[]
    if (!Array.isArray(parsed)) return fallback

    const allowed = new Set(columns.map((column) => column.key))
    const visible = new Set<T>()

    for (const key of parsed) {
      if (allowed.has(key)) visible.add(key)
    }

    for (const column of columns) {
      if (column.locked) visible.add(column.key)
    }

    const hasToggleableVisible = columns.some((column) => !column.locked && visible.has(column.key))
    return hasToggleableVisible ? visible : fallback
  } catch {
    return fallback
  }
}


function persistVisibleKeys<T extends string>(storageKey: string, visible: Set<T>) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(storageKey, JSON.stringify([...visible]))
}

export function useTableColumnVisibility<T extends string>(
  storageKey: string,
  columns: readonly TableColumnDefinition<T>[],
) {
  const [visibleKeys, setVisibleKeys] = useState<Set<T>>(() => loadVisibleKeys(storageKey, [...columns]))

  const isVisible = useCallback(
    (key: T) => {
      const column = columns.find((entry) => entry.key === key)
      if (column?.locked) return true
      return visibleKeys.has(key)
    },
    [columns, visibleKeys],
  )

  const toggle = useCallback(
    (key: T) => {
      const column = columns.find((entry) => entry.key === key)
      if (!column || column.locked) return

      setVisibleKeys((current) => {
        const next = new Set(current)
        if (next.has(key)) {
          const remaining = columns.filter((entry) => !entry.locked && entry.key !== key && next.has(entry.key))
          if (remaining.length === 0) return current
          next.delete(key)
        } else {
          next.add(key)
        }
        persistVisibleKeys(storageKey, next)
        return next
      })
    },
    [columns, storageKey],
  )

  const showAll = useCallback(() => {
    const next = defaultVisibleKeys([...columns])
    setVisibleKeys(next)
    persistVisibleKeys(storageKey, next)
  }, [columns, storageKey])

  const reset = useCallback(() => {
    const next = defaultVisibleKeys([...columns])
    setVisibleKeys(next)
    persistVisibleKeys(storageKey, next)
  }, [columns, storageKey])

  const visibleColumns = useMemo(
    () => columns.filter((column) => isVisible(column.key)),
    [columns, isVisible],
  )

  const toggleableColumns = useMemo(() => columns.filter((column) => !column.locked), [columns])

  const visibleToggleableCount = useMemo(
    () => toggleableColumns.filter((column) => isVisible(column.key)).length,
    [toggleableColumns, isVisible],
  )

  return {
    columns,
    visibleColumns,
    toggleableColumns,
    visibleToggleableCount,
    isVisible,
    toggle,
    showAll,
    reset,
  }
}

export type TableColumnVisibility<T extends string> = ReturnType<typeof useTableColumnVisibility<T>>
