import { useCallback, useMemo, useState } from 'react'
import type { TableColumnDefinition } from '@/shared/hooks/use-table-column-visibility'
import {
  CLIENT_LINKED_TRIPS_TABLE_COLUMN_OPTIONS,
  CLIENT_LINKED_TRIPS_TABLE_DEFAULT_COLUMN_ORDER,
  CLIENT_LINKED_TRIPS_TABLE_DEFAULT_VISIBLE_KEYS,
  type ClientLinkedTripsTableColumnKey,
} from '@/features/clients/components/trips/client-linked-trips-table-columns'
import { CLIENT_LINKED_TRIPS_TABLE_LAYOUT_STORAGE_KEY } from '@/types/table-columns'

const LOCKED_KEYS = new Set<ClientLinkedTripsTableColumnKey>(['selection', 'reference', 'actions'])

export type ClientLinkedTripsTableLayoutState = {
  order: ClientLinkedTripsTableColumnKey[]
  visible: ClientLinkedTripsTableColumnKey[]
}

function isLockedColumn(key: ClientLinkedTripsTableColumnKey): boolean {
  return LOCKED_KEYS.has(key)
}

function defaultLayoutState(): ClientLinkedTripsTableLayoutState {
  return {
    order: [...CLIENT_LINKED_TRIPS_TABLE_DEFAULT_COLUMN_ORDER],
    visible: [...CLIENT_LINKED_TRIPS_TABLE_DEFAULT_VISIBLE_KEYS],
  }
}

function normalizeOrder(order: ClientLinkedTripsTableColumnKey[]): ClientLinkedTripsTableColumnKey[] {
  const allowed = new Set(CLIENT_LINKED_TRIPS_TABLE_COLUMN_OPTIONS.map((column) => column.key))
  const next: ClientLinkedTripsTableColumnKey[] = []
  const seen = new Set<ClientLinkedTripsTableColumnKey>()

  for (const key of order) {
    if (!allowed.has(key) || seen.has(key)) continue
    next.push(key)
    seen.add(key)
  }

  for (const column of CLIENT_LINKED_TRIPS_TABLE_COLUMN_OPTIONS) {
    if (!seen.has(column.key)) {
      next.push(column.key)
      seen.add(column.key)
    }
  }

  return next
}

function normalizeVisible(visible: ClientLinkedTripsTableColumnKey[]): Set<ClientLinkedTripsTableColumnKey> {
  const allowed = new Set(CLIENT_LINKED_TRIPS_TABLE_COLUMN_OPTIONS.map((column) => column.key))
  const next = new Set<ClientLinkedTripsTableColumnKey>()

  for (const key of visible) {
    if (allowed.has(key)) next.add(key)
  }

  for (const column of CLIENT_LINKED_TRIPS_TABLE_COLUMN_OPTIONS) {
    if (column.locked) next.add(column.key)
  }

  if (!CLIENT_LINKED_TRIPS_TABLE_COLUMN_OPTIONS.some((column) => !column.locked && next.has(column.key))) {
    for (const key of CLIENT_LINKED_TRIPS_TABLE_DEFAULT_VISIBLE_KEYS) {
      if (!isLockedColumn(key)) next.add(key)
    }
  }

  return next
}

function migrateLayoutState(parsed: Partial<ClientLinkedTripsTableLayoutState>): ClientLinkedTripsTableLayoutState {
  const fallback = defaultLayoutState()
  const order = normalizeOrder(Array.isArray(parsed.order) ? parsed.order : fallback.order)
  const visibleSet = normalizeVisible(Array.isArray(parsed.visible) ? parsed.visible : fallback.visible)

  for (const column of CLIENT_LINKED_TRIPS_TABLE_COLUMN_OPTIONS) {
    if (column.defaultVisible && !column.locked && !visibleSet.has(column.key)) {
      visibleSet.add(column.key)
    }
  }

  return { order, visible: [...visibleSet] }
}

function loadLayoutState(): ClientLinkedTripsTableLayoutState {
  const fallback = defaultLayoutState()
  if (typeof window === 'undefined') return fallback

  try {
    const raw = window.localStorage.getItem(CLIENT_LINKED_TRIPS_TABLE_LAYOUT_STORAGE_KEY)
    if (!raw) return fallback

    const parsed = JSON.parse(raw) as Partial<ClientLinkedTripsTableLayoutState>
    if (!parsed || !Array.isArray(parsed.order) || !Array.isArray(parsed.visible)) return fallback

    return migrateLayoutState(parsed)
  } catch {
    return fallback
  }
}

function persistLayoutState(state: ClientLinkedTripsTableLayoutState) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(CLIENT_LINKED_TRIPS_TABLE_LAYOUT_STORAGE_KEY, JSON.stringify(state))
}

export function resolveClientLinkedTripsTableVisibleOrder(
  order: ClientLinkedTripsTableColumnKey[],
  visible: Set<ClientLinkedTripsTableColumnKey>,
): ClientLinkedTripsTableColumnKey[] {
  const normalizedOrder = normalizeOrder(order)
  const visibleOrdered = normalizedOrder.filter((key) => visible.has(key))

  const selection = visibleOrdered.includes('selection') ? (['selection'] as const) : []
  const reference = visibleOrdered.includes('reference') ? (['reference'] as const) : []
  const actions = visibleOrdered.includes('actions') ? (['actions'] as const) : []
  const middle = visibleOrdered.filter((key) => !isLockedColumn(key))

  return [...selection, ...reference, ...middle, ...actions]
}

export function getClientLinkedTripsTableReorderableKeys(
  order: ClientLinkedTripsTableColumnKey[],
  visible: Set<ClientLinkedTripsTableColumnKey>,
): ClientLinkedTripsTableColumnKey[] {
  return resolveClientLinkedTripsTableVisibleOrder(order, visible).filter((key) => !isLockedColumn(key))
}

function findColumnDefinition(
  key: ClientLinkedTripsTableColumnKey,
): TableColumnDefinition<ClientLinkedTripsTableColumnKey> | undefined {
  return CLIENT_LINKED_TRIPS_TABLE_COLUMN_OPTIONS.find((column) => column.key === key)
}

export function useClientLinkedTripsTableLayout() {
  const [layout, setLayout] = useState<ClientLinkedTripsTableLayoutState>(() => loadLayoutState())

  const visibleSet = useMemo(() => normalizeVisible(layout.visible), [layout.visible])

  const orderedVisibleKeys = useMemo(
    () => resolveClientLinkedTripsTableVisibleOrder(layout.order, visibleSet),
    [layout.order, visibleSet],
  )

  const reorderableVisibleKeys = useMemo(
    () => getClientLinkedTripsTableReorderableKeys(layout.order, visibleSet),
    [layout.order, visibleSet],
  )

  const toggleableColumns = useMemo(
    () => CLIENT_LINKED_TRIPS_TABLE_COLUMN_OPTIONS.filter((column) => !column.locked),
    [],
  )

  const visibleToggleableCount = useMemo(
    () => toggleableColumns.filter((column) => visibleSet.has(column.key)).length,
    [toggleableColumns, visibleSet],
  )

  const isVisible = useCallback((key: ClientLinkedTripsTableColumnKey) => visibleSet.has(key), [visibleSet])

  const toggle = useCallback((key: ClientLinkedTripsTableColumnKey) => {
    const column = findColumnDefinition(key)
    if (!column || column.locked) return

    setLayout((current) => {
      const visible = normalizeVisible(current.visible)
      if (visible.has(key)) {
        const remaining = CLIENT_LINKED_TRIPS_TABLE_COLUMN_OPTIONS.filter(
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

  const moveColumn = useCallback((key: ClientLinkedTripsTableColumnKey, direction: 'up' | 'down') => {
    if (isLockedColumn(key)) return

    setLayout((current) => {
      const visible = normalizeVisible(current.visible)
      if (!visible.has(key)) return current

      const reorderable = getClientLinkedTripsTableReorderableKeys(current.order, visible)
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
    columns: CLIENT_LINKED_TRIPS_TABLE_COLUMN_OPTIONS,
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

export type ClientLinkedTripsTableLayout = ReturnType<typeof useClientLinkedTripsTableLayout>
