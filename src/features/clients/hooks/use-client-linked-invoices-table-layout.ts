import { useCallback, useMemo, useState } from 'react'
import type { TableColumnDefinition } from '@/shared/hooks/use-table-column-visibility'
import {
  CLIENT_LINKED_INVOICES_TABLE_COLUMN_OPTIONS,
  CLIENT_LINKED_INVOICES_TABLE_DEFAULT_COLUMN_ORDER,
  CLIENT_LINKED_INVOICES_TABLE_DEFAULT_VISIBLE_KEYS,
  type ClientLinkedInvoicesTableColumnKey,
} from '@/features/clients/components/invoices/client-linked-invoices-table-columns'
import { CLIENT_LINKED_INVOICES_TABLE_LAYOUT_STORAGE_KEY } from '@/types/table-columns'

const LOCKED_KEYS = new Set<ClientLinkedInvoicesTableColumnKey>(['selection', 'invoice', 'actions'])

export type ClientLinkedInvoicesTableLayoutState = {
  order: ClientLinkedInvoicesTableColumnKey[]
  visible: ClientLinkedInvoicesTableColumnKey[]
}

function isLockedColumn(key: ClientLinkedInvoicesTableColumnKey): boolean {
  return LOCKED_KEYS.has(key)
}

function defaultLayoutState(): ClientLinkedInvoicesTableLayoutState {
  return {
    order: [...CLIENT_LINKED_INVOICES_TABLE_DEFAULT_COLUMN_ORDER],
    visible: [...CLIENT_LINKED_INVOICES_TABLE_DEFAULT_VISIBLE_KEYS],
  }
}

function normalizeOrder(order: ClientLinkedInvoicesTableColumnKey[]): ClientLinkedInvoicesTableColumnKey[] {
  const allowed = new Set(CLIENT_LINKED_INVOICES_TABLE_COLUMN_OPTIONS.map((column) => column.key))
  const next: ClientLinkedInvoicesTableColumnKey[] = []
  const seen = new Set<ClientLinkedInvoicesTableColumnKey>()

  for (const key of order) {
    if (!allowed.has(key) || seen.has(key)) continue
    next.push(key)
    seen.add(key)
  }

  for (const column of CLIENT_LINKED_INVOICES_TABLE_COLUMN_OPTIONS) {
    if (!seen.has(column.key)) {
      next.push(column.key)
      seen.add(column.key)
    }
  }

  return next
}

function normalizeVisible(visible: ClientLinkedInvoicesTableColumnKey[]): Set<ClientLinkedInvoicesTableColumnKey> {
  const allowed = new Set(CLIENT_LINKED_INVOICES_TABLE_COLUMN_OPTIONS.map((column) => column.key))
  const next = new Set<ClientLinkedInvoicesTableColumnKey>()

  for (const key of visible) {
    if (allowed.has(key)) next.add(key)
  }

  for (const column of CLIENT_LINKED_INVOICES_TABLE_COLUMN_OPTIONS) {
    if (column.locked) next.add(column.key)
  }

  if (!CLIENT_LINKED_INVOICES_TABLE_COLUMN_OPTIONS.some((column) => !column.locked && next.has(column.key))) {
    for (const key of CLIENT_LINKED_INVOICES_TABLE_DEFAULT_VISIBLE_KEYS) {
      if (!isLockedColumn(key)) next.add(key)
    }
  }

  return next
}

function migrateLayoutState(parsed: Partial<ClientLinkedInvoicesTableLayoutState>): ClientLinkedInvoicesTableLayoutState {
  const fallback = defaultLayoutState()
  const order = normalizeOrder(Array.isArray(parsed.order) ? parsed.order : fallback.order)
  const visibleSet = normalizeVisible(Array.isArray(parsed.visible) ? parsed.visible : fallback.visible)

  for (const column of CLIENT_LINKED_INVOICES_TABLE_COLUMN_OPTIONS) {
    if (column.defaultVisible && !column.locked && !visibleSet.has(column.key)) {
      visibleSet.add(column.key)
    }
  }

  return { order, visible: [...visibleSet] }
}

function loadLayoutState(): ClientLinkedInvoicesTableLayoutState {
  const fallback = defaultLayoutState()
  if (typeof window === 'undefined') return fallback

  try {
    const raw = window.localStorage.getItem(CLIENT_LINKED_INVOICES_TABLE_LAYOUT_STORAGE_KEY)
    if (!raw) return fallback

    const parsed = JSON.parse(raw) as Partial<ClientLinkedInvoicesTableLayoutState>
    if (!parsed || !Array.isArray(parsed.order) || !Array.isArray(parsed.visible)) return fallback

    return migrateLayoutState(parsed)
  } catch {
    return fallback
  }
}

function persistLayoutState(state: ClientLinkedInvoicesTableLayoutState) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(CLIENT_LINKED_INVOICES_TABLE_LAYOUT_STORAGE_KEY, JSON.stringify(state))
}

export function resolveClientLinkedInvoicesTableVisibleOrder(
  order: ClientLinkedInvoicesTableColumnKey[],
  visible: Set<ClientLinkedInvoicesTableColumnKey>,
): ClientLinkedInvoicesTableColumnKey[] {
  const normalizedOrder = normalizeOrder(order)
  const visibleOrdered = normalizedOrder.filter((key) => visible.has(key))

  const selection = visibleOrdered.includes('selection') ? (['selection'] as const) : []
  const invoice = visibleOrdered.includes('invoice') ? (['invoice'] as const) : []
  const actions = visibleOrdered.includes('actions') ? (['actions'] as const) : []
  const middle = visibleOrdered.filter((key) => !isLockedColumn(key))

  return [...selection, ...invoice, ...middle, ...actions]
}

export function getClientLinkedInvoicesTableReorderableKeys(
  order: ClientLinkedInvoicesTableColumnKey[],
  visible: Set<ClientLinkedInvoicesTableColumnKey>,
): ClientLinkedInvoicesTableColumnKey[] {
  return resolveClientLinkedInvoicesTableVisibleOrder(order, visible).filter((key) => !isLockedColumn(key))
}

function findColumnDefinition(
  key: ClientLinkedInvoicesTableColumnKey,
): TableColumnDefinition<ClientLinkedInvoicesTableColumnKey> | undefined {
  return CLIENT_LINKED_INVOICES_TABLE_COLUMN_OPTIONS.find((column) => column.key === key)
}

export function useClientLinkedInvoicesTableLayout() {
  const [layout, setLayout] = useState<ClientLinkedInvoicesTableLayoutState>(() => loadLayoutState())

  const visibleSet = useMemo(() => normalizeVisible(layout.visible), [layout.visible])

  const orderedVisibleKeys = useMemo(
    () => resolveClientLinkedInvoicesTableVisibleOrder(layout.order, visibleSet),
    [layout.order, visibleSet],
  )

  const reorderableVisibleKeys = useMemo(
    () => getClientLinkedInvoicesTableReorderableKeys(layout.order, visibleSet),
    [layout.order, visibleSet],
  )

  const toggleableColumns = useMemo(
    () => CLIENT_LINKED_INVOICES_TABLE_COLUMN_OPTIONS.filter((column) => !column.locked),
    [],
  )

  const visibleToggleableCount = useMemo(
    () => toggleableColumns.filter((column) => visibleSet.has(column.key)).length,
    [toggleableColumns, visibleSet],
  )

  const isVisible = useCallback((key: ClientLinkedInvoicesTableColumnKey) => visibleSet.has(key), [visibleSet])

  const toggle = useCallback((key: ClientLinkedInvoicesTableColumnKey) => {
    const column = findColumnDefinition(key)
    if (!column || column.locked) return

    setLayout((current) => {
      const visible = normalizeVisible(current.visible)
      if (visible.has(key)) {
        const remaining = CLIENT_LINKED_INVOICES_TABLE_COLUMN_OPTIONS.filter(
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

  const moveColumn = useCallback((key: ClientLinkedInvoicesTableColumnKey, direction: 'up' | 'down') => {
    if (isLockedColumn(key)) return

    setLayout((current) => {
      const visible = normalizeVisible(current.visible)
      if (!visible.has(key)) return current

      const reorderable = getClientLinkedInvoicesTableReorderableKeys(current.order, visible)
      const index = reorderable.indexOf(key)
      if (index === -1) return current

      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= reorderable.length) return current

      const nextReorderable = [...reorderable]
      ;[nextReorderable[index], nextReorderable[targetIndex]] = [
        nextReorderable[targetIndex]!,
        nextReorderable[index]!,
      ]

      const lockedStart = current.order.filter((entry) => entry === 'selection' || entry === 'invoice')
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
    columns: CLIENT_LINKED_INVOICES_TABLE_COLUMN_OPTIONS,
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

export type ClientLinkedInvoicesTableLayout = ReturnType<typeof useClientLinkedInvoicesTableLayout>
