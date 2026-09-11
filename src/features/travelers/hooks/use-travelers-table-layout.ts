import { useCallback, useMemo, useState } from 'react'
import type { TableColumnDefinition } from '@/shared/hooks/use-table-column-visibility'
import {
  TRAVELERS_TABLE_COLUMN_OPTIONS,
  TRAVELERS_TABLE_DEFAULT_COLUMN_ORDER,
  TRAVELERS_TABLE_DEFAULT_VISIBLE_KEYS,
  type TravelersTableColumnKey,
} from '@/features/travelers/components/list/travelers-table-columns'
import { TRAVELERS_TABLE_LAYOUT_STORAGE_KEY } from '@/types/table-columns'

const LOCKED_KEYS = new Set<TravelersTableColumnKey>(['selection', 'reference', 'name', 'actions'])

export type TravelersTableLayoutState = {
  order: TravelersTableColumnKey[]
  visible: TravelersTableColumnKey[]
}

function isLockedColumn(key: TravelersTableColumnKey): boolean {
  return LOCKED_KEYS.has(key)
}

function defaultLayoutState(): TravelersTableLayoutState {
  return {
    order: [...TRAVELERS_TABLE_DEFAULT_COLUMN_ORDER],
    visible: [...TRAVELERS_TABLE_DEFAULT_VISIBLE_KEYS],
  }
}

function normalizeOrder(order: TravelersTableColumnKey[]): TravelersTableColumnKey[] {
  const allowed = new Set(TRAVELERS_TABLE_COLUMN_OPTIONS.map((column) => column.key))
  const next: TravelersTableColumnKey[] = []
  const seen = new Set<TravelersTableColumnKey>()

  for (const key of order) {
    if (!allowed.has(key) || seen.has(key)) continue
    next.push(key)
    seen.add(key)
  }

  for (const column of TRAVELERS_TABLE_COLUMN_OPTIONS) {
    if (!seen.has(column.key)) {
      next.push(column.key)
      seen.add(column.key)
    }
  }

  return next
}

function normalizeVisible(visible: TravelersTableColumnKey[]): Set<TravelersTableColumnKey> {
  const allowed = new Set(TRAVELERS_TABLE_COLUMN_OPTIONS.map((column) => column.key))
  const next = new Set<TravelersTableColumnKey>()

  for (const key of visible) {
    if (allowed.has(key)) next.add(key)
  }

  for (const column of TRAVELERS_TABLE_COLUMN_OPTIONS) {
    if (column.locked) next.add(column.key)
  }

  if (!TRAVELERS_TABLE_COLUMN_OPTIONS.some((column) => !column.locked && next.has(column.key))) {
    for (const key of TRAVELERS_TABLE_DEFAULT_VISIBLE_KEYS) {
      if (!isLockedColumn(key)) next.add(key)
    }
  }

  return next
}

function migrateLayoutState(parsed: Partial<TravelersTableLayoutState>): TravelersTableLayoutState {
  const fallback = defaultLayoutState()
  const order = normalizeOrder(Array.isArray(parsed.order) ? parsed.order : fallback.order)
  const visibleSet = normalizeVisible(Array.isArray(parsed.visible) ? parsed.visible : fallback.visible)

  for (const column of TRAVELERS_TABLE_COLUMN_OPTIONS) {
    if (column.defaultVisible && !column.locked && !visibleSet.has(column.key)) {
      visibleSet.add(column.key)
    }
  }

  return { order, visible: [...visibleSet] }
}

function loadLayoutState(): TravelersTableLayoutState {
  const fallback = defaultLayoutState()
  if (typeof window === 'undefined') return fallback

  try {
    const raw = window.localStorage.getItem(TRAVELERS_TABLE_LAYOUT_STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<TravelersTableLayoutState>
    if (!parsed || !Array.isArray(parsed.order) || !Array.isArray(parsed.visible)) return fallback
    return migrateLayoutState(parsed)
  } catch {
    return fallback
  }
}

function persistLayoutState(state: TravelersTableLayoutState) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(TRAVELERS_TABLE_LAYOUT_STORAGE_KEY, JSON.stringify(state))
}

export function resolveTravelersTableVisibleOrder(
  order: TravelersTableColumnKey[],
  visible: Set<TravelersTableColumnKey>,
): TravelersTableColumnKey[] {
  const normalizedOrder = normalizeOrder(order)
  const visibleOrdered = normalizedOrder.filter((key) => visible.has(key))

  const selection = visibleOrdered.includes('selection') ? (['selection'] as const) : []
  const reference = visibleOrdered.includes('reference') ? (['reference'] as const) : []
  const name = visibleOrdered.includes('name') ? (['name'] as const) : []
  const actions = visibleOrdered.includes('actions') ? (['actions'] as const) : []
  const middle = visibleOrdered.filter((key) => !isLockedColumn(key))

  return [...selection, ...reference, ...name, ...middle, ...actions]
}

export function getTravelersTableReorderableKeys(
  order: TravelersTableColumnKey[],
  visible: Set<TravelersTableColumnKey>,
): TravelersTableColumnKey[] {
  return resolveTravelersTableVisibleOrder(order, visible).filter((key) => !isLockedColumn(key))
}

function findColumnDefinition(
  key: TravelersTableColumnKey,
): TableColumnDefinition<TravelersTableColumnKey> | undefined {
  return TRAVELERS_TABLE_COLUMN_OPTIONS.find((column) => column.key === key)
}

export function useTravelersTableLayout() {
  const [layout, setLayout] = useState<TravelersTableLayoutState>(() => loadLayoutState())

  const visibleSet = useMemo(() => normalizeVisible(layout.visible), [layout.visible])

  const orderedVisibleKeys = useMemo(
    () => resolveTravelersTableVisibleOrder(layout.order, visibleSet),
    [layout.order, visibleSet],
  )

  const reorderableVisibleKeys = useMemo(
    () => getTravelersTableReorderableKeys(layout.order, visibleSet),
    [layout.order, visibleSet],
  )

  const toggleableColumns = useMemo(
    () => TRAVELERS_TABLE_COLUMN_OPTIONS.filter((column) => !column.locked),
    [],
  )

  const visibleToggleableCount = useMemo(
    () => toggleableColumns.filter((column) => visibleSet.has(column.key)).length,
    [toggleableColumns, visibleSet],
  )

  const isVisible = useCallback((key: TravelersTableColumnKey) => visibleSet.has(key), [visibleSet])

  const toggle = useCallback((key: TravelersTableColumnKey) => {
    const column = findColumnDefinition(key)
    if (!column || column.locked) return

    setLayout((current) => {
      const visible = normalizeVisible(current.visible)
      if (visible.has(key)) {
        const remaining = TRAVELERS_TABLE_COLUMN_OPTIONS.filter(
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

  const moveColumn = useCallback((key: TravelersTableColumnKey, direction: 'up' | 'down') => {
    if (isLockedColumn(key)) return

    setLayout((current) => {
      const visible = normalizeVisible(current.visible)
      if (!visible.has(key)) return current

      const reorderable = getTravelersTableReorderableKeys(current.order, visible)
      const index = reorderable.indexOf(key)
      if (index === -1) return current

      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= reorderable.length) return current

      const nextReorderable = [...reorderable]
      ;[nextReorderable[index], nextReorderable[targetIndex]] = [
        nextReorderable[targetIndex]!,
        nextReorderable[index]!,
      ]

      const lockedStart = current.order.filter(
        (entry) => entry === 'selection' || entry === 'reference' || entry === 'name',
      )
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
    columns: TRAVELERS_TABLE_COLUMN_OPTIONS,
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

export type TravelersTableLayout = ReturnType<typeof useTravelersTableLayout>
