import { useCallback, useMemo, useState } from 'react'
import type { TableColumnDefinition } from '@/shared/hooks/use-table-column-visibility'
import {
  TRIPS_TABLE_COLUMN_OPTIONS,
  TRIPS_TABLE_DEFAULT_COLUMN_ORDER,
  TRIPS_TABLE_DEFAULT_VISIBLE_KEYS,
  type TripsTableColumnKey,
} from '@/features/trips/components/list/trips-table-columns'
import { TRIPS_TABLE_COLUMNS_STORAGE_KEY, TRIPS_TABLE_LAYOUT_STORAGE_KEY } from '@/types/table-columns'

const LOCKED_KEYS = new Set<TripsTableColumnKey>(['selection', 'reference', 'actions'])

export type TripsTableLayoutState = {
  order: TripsTableColumnKey[]
  visible: TripsTableColumnKey[]
}

function isLockedColumn(key: TripsTableColumnKey): boolean {
  return LOCKED_KEYS.has(key)
}

function defaultLayoutState(): TripsTableLayoutState {
  return {
    order: [...TRIPS_TABLE_DEFAULT_COLUMN_ORDER],
    visible: [...TRIPS_TABLE_DEFAULT_VISIBLE_KEYS],
  }
}

function normalizeOrder(order: TripsTableColumnKey[]): TripsTableColumnKey[] {
  const allowed = new Set(TRIPS_TABLE_COLUMN_OPTIONS.map((column) => column.key))
  const next: TripsTableColumnKey[] = []
  const seen = new Set<TripsTableColumnKey>()

  for (const key of order) {
    if (!allowed.has(key) || seen.has(key)) continue
    next.push(key)
    seen.add(key)
  }

  for (const column of TRIPS_TABLE_COLUMN_OPTIONS) {
    if (!seen.has(column.key)) {
      next.push(column.key)
      seen.add(column.key)
    }
  }

  return next
}

function normalizeVisible(visible: TripsTableColumnKey[]): Set<TripsTableColumnKey> {
  const allowed = new Set(TRIPS_TABLE_COLUMN_OPTIONS.map((column) => column.key))
  const next = new Set<TripsTableColumnKey>()

  for (const key of visible) {
    if (allowed.has(key)) next.add(key)
  }

  for (const column of TRIPS_TABLE_COLUMN_OPTIONS) {
    if (column.locked) next.add(column.key)
  }

  if (!TRIPS_TABLE_COLUMN_OPTIONS.some((column) => !column.locked && next.has(column.key))) {
    for (const key of TRIPS_TABLE_DEFAULT_VISIBLE_KEYS) {
      if (!isLockedColumn(key)) next.add(key)
    }
  }

  return next
}

function migrateLayoutState(parsed: Partial<TripsTableLayoutState>): TripsTableLayoutState {
  const fallback = defaultLayoutState()
  const order = normalizeOrder(Array.isArray(parsed.order) ? parsed.order : fallback.order)
  const visibleSet = normalizeVisible(Array.isArray(parsed.visible) ? parsed.visible : fallback.visible)

  for (const column of TRIPS_TABLE_COLUMN_OPTIONS) {
    if (column.defaultVisible && !column.locked && !visibleSet.has(column.key)) {
      visibleSet.add(column.key)
    }
  }

  return { order, visible: [...visibleSet] }
}

function mapLegacyVisibleKey(key: string): TripsTableColumnKey | null {
  if (key === 'tripId') return 'reference'
  if (TRIPS_TABLE_COLUMN_OPTIONS.some((column) => column.key === key)) {
    return key as TripsTableColumnKey
  }
  return null
}

function loadLegacyVisibleKeys(): TripsTableColumnKey[] | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(TRIPS_TABLE_COLUMNS_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as string[]
    if (!Array.isArray(parsed)) return null

    const visible: TripsTableColumnKey[] = []
    for (const key of parsed) {
      const mapped = mapLegacyVisibleKey(key)
      if (mapped) visible.push(mapped)
    }

    return visible.length > 0 ? visible : null
  } catch {
    return null
  }
}

function loadLayoutState(): TripsTableLayoutState {
  const fallback = defaultLayoutState()
  if (typeof window === 'undefined') return fallback

  try {
    const raw = window.localStorage.getItem(TRIPS_TABLE_LAYOUT_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<TripsTableLayoutState>
      if (parsed && Array.isArray(parsed.order) && Array.isArray(parsed.visible)) {
        return migrateLayoutState(parsed)
      }
    }

    const legacyVisible = loadLegacyVisibleKeys()
    if (legacyVisible) {
      return migrateLayoutState({ order: fallback.order, visible: legacyVisible })
    }

    return fallback
  } catch {
    return fallback
  }
}

function persistLayoutState(state: TripsTableLayoutState) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(TRIPS_TABLE_LAYOUT_STORAGE_KEY, JSON.stringify(state))
}

export function resolveTripsTableVisibleOrder(
  order: TripsTableColumnKey[],
  visible: Set<TripsTableColumnKey>,
): TripsTableColumnKey[] {
  const normalizedOrder = normalizeOrder(order)
  const visibleOrdered = normalizedOrder.filter((key) => visible.has(key))

  const selection = visibleOrdered.includes('selection') ? (['selection'] as const) : []
  const reference = visibleOrdered.includes('reference') ? (['reference'] as const) : []
  const actions = visibleOrdered.includes('actions') ? (['actions'] as const) : []
  const middle = visibleOrdered.filter((key) => !isLockedColumn(key))

  return [...selection, ...reference, ...middle, ...actions]
}

export function getTripsTableReorderableKeys(
  order: TripsTableColumnKey[],
  visible: Set<TripsTableColumnKey>,
): TripsTableColumnKey[] {
  return resolveTripsTableVisibleOrder(order, visible).filter((key) => !isLockedColumn(key))
}

function findColumnDefinition(key: TripsTableColumnKey): TableColumnDefinition<TripsTableColumnKey> | undefined {
  return TRIPS_TABLE_COLUMN_OPTIONS.find((column) => column.key === key)
}

export function useTripsTableLayout() {
  const [layout, setLayout] = useState<TripsTableLayoutState>(() => loadLayoutState())

  const visibleSet = useMemo(() => normalizeVisible(layout.visible), [layout.visible])

  const orderedVisibleKeys = useMemo(
    () => resolveTripsTableVisibleOrder(layout.order, visibleSet),
    [layout.order, visibleSet],
  )

  const reorderableVisibleKeys = useMemo(
    () => getTripsTableReorderableKeys(layout.order, visibleSet),
    [layout.order, visibleSet],
  )

  const toggleableColumns = useMemo(
    () => TRIPS_TABLE_COLUMN_OPTIONS.filter((column) => !column.locked),
    [],
  )

  const visibleToggleableCount = useMemo(
    () => toggleableColumns.filter((column) => visibleSet.has(column.key)).length,
    [toggleableColumns, visibleSet],
  )

  const isVisible = useCallback((key: TripsTableColumnKey) => visibleSet.has(key), [visibleSet])

  const toggle = useCallback((key: TripsTableColumnKey) => {
    const column = findColumnDefinition(key)
    if (!column || column.locked) return

    setLayout((current) => {
      const visible = normalizeVisible(current.visible)
      if (visible.has(key)) {
        const remaining = TRIPS_TABLE_COLUMN_OPTIONS.filter(
          (entry) => !entry.locked && entry.key !== key && visible.has(entry.key),
        )
        if (remaining.length === 0) return current
        visible.delete(key)
      } else {
        visible.add(key)
      }

      const next = { ...current, visible: [...visible] }
      persistLayoutState(next)
      return next
    })
  }, [])

  const moveColumn = useCallback((key: TripsTableColumnKey, direction: 'up' | 'down') => {
    if (isLockedColumn(key)) return

    setLayout((current) => {
      const visible = normalizeVisible(current.visible)
      if (!visible.has(key)) return current

      const reorderable = getTripsTableReorderableKeys(current.order, visible)
      const index = reorderable.indexOf(key)
      if (index === -1) return current

      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= reorderable.length) return current

      const nextReorderable = [...reorderable]
      ;[nextReorderable[index], nextReorderable[targetIndex]] = [
        nextReorderable[targetIndex]!,
        nextReorderable[index]!,
      ]

      const lockedStart = current.order.filter((entry) => entry === 'selection' || entry === 'reference')
      const lockedEnd = current.order.filter((entry) => entry === 'actions')
      const hidden = current.order.filter((entry) => !visible.has(entry) && !isLockedColumn(entry))
      const nextOrder = normalizeOrder([...lockedStart, ...nextReorderable, ...hidden, ...lockedEnd])

      const next = { ...current, order: nextOrder }
      persistLayoutState(next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    const next = defaultLayoutState()
    setLayout(next)
    persistLayoutState(next)
  }, [])

  const isDefaultLayout = useMemo(() => {
    const defaults = defaultLayoutState()
    if (layout.visible.length !== defaults.visible.length) return false
    if (!defaults.visible.every((key) => visibleSet.has(key))) return false
    if (layout.order.length !== defaults.order.length) return false
    return layout.order.every((key, index) => key === defaults.order[index])
  }, [layout.order, layout.visible.length, visibleSet])

  return {
    columns: TRIPS_TABLE_COLUMN_OPTIONS,
    toggleableColumns,
    visibleToggleableCount,
    orderedVisibleKeys,
    reorderableVisibleKeys,
    isVisible,
    toggle,
    moveColumn,
    reset,
    isDefaultLayout,
  }
}

export type TripsTableLayout = ReturnType<typeof useTripsTableLayout>
