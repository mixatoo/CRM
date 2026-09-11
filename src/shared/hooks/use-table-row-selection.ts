import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import {
  createTableRowSelectionStore,
  type DragState,
  type TableRowSelectionStore,
} from '@/shared/hooks/table-row-selection-store'

interface ToggleOptions {
  shiftKey?: boolean
}

function useSelectionMetrics(store: TableRowSelectionStore, pageIds: string[]) {
  const revision = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)

  return useMemo(() => {
    const pageSelectedCount = store.pageSelectedCount(pageIds)
    return {
      selectedIds: store.getSelectedIds(),
      selectedCount: store.selectedCount,
      pageSelectedCount,
      allPageSelected: pageIds.length > 0 && pageSelectedCount === pageIds.length,
      somePageSelected: pageSelectedCount > 0 && pageSelectedCount < pageIds.length,
    }
  }, [revision, store, pageIds])
}

export function useTableRowSelection(pageIds: string[]) {
  const [store] = useState(() => createTableRowSelectionStore())

  const [isDragSelecting, setIsDragSelecting] = useState(false)

  const pageIdsRef = useRef(pageIds)
  useEffect(() => {
    pageIdsRef.current = pageIds
  }, [pageIds])

  const [rangeAnchorId, setRangeAnchorId] = useState<string | null>(null)

  const dragRef = useRef<DragState | null>(null)
  const dragRafRef = useRef<number | null>(null)

  const metrics = useSelectionMetrics(store, pageIds)

  const flushDragSelection = useCallback(() => {
    dragRafRef.current = null
    const drag = dragRef.current
    if (!drag?.active || drag.pendingEndId == null) return
    if (drag.lastEndId === drag.pendingEndId) return

    drag.lastEndId = drag.pendingEndId
    store.setDragSelection(
      pageIdsRef.current,
      drag.anchorId,
      drag.pendingEndId,
      drag.baseline,
      drag.mode,
    )
  }, [store])

  const scheduleDragSelection = useCallback(
    (endId: string) => {
      const drag = dragRef.current
      if (!drag?.active) return

      drag.pendingEndId = endId
      if (dragRafRef.current != null) return
      dragRafRef.current = requestAnimationFrame(flushDragSelection)
    },
    [flushDragSelection],
  )

  const toggle = useCallback(
    (rowId: string, options?: ToggleOptions) => {
      const shiftKey = options?.shiftKey ?? false

      if (shiftKey && rangeAnchorId) {
        store.applyRange(pageIdsRef.current, rangeAnchorId, rowId, 'select')
        setRangeAnchorId(rowId)
        return
      }

      store.toggle(rowId)
      setRangeAnchorId(rowId)
    },
    [rangeAnchorId, store],
  )

  const clear = useCallback(() => {
    store.clear()
    setRangeAnchorId(null)
  }, [store])

  const endDrag = useCallback(() => {
    if (dragRafRef.current != null) {
      cancelAnimationFrame(dragRafRef.current)
      dragRafRef.current = null
    }

    const drag = dragRef.current
    if (drag?.active) {
      if (drag.pendingEndId != null && drag.lastEndId !== drag.pendingEndId) {
        drag.lastEndId = drag.pendingEndId
        store.setDragSelection(
          pageIdsRef.current,
          drag.anchorId,
          drag.pendingEndId,
          drag.baseline,
          drag.mode,
        )
      }
      dragRef.current = null
    }
    setIsDragSelecting(false)
  }, [store])

  useEffect(() => {
    window.addEventListener('pointerup', endDrag)
    window.addEventListener('pointercancel', endDrag)
    return () => {
      window.removeEventListener('pointerup', endDrag)
      window.removeEventListener('pointercancel', endDrag)
      if (dragRafRef.current != null) cancelAnimationFrame(dragRafRef.current)
    }
  }, [endDrag])

  const handleSelectionPointerDown = useCallback(
    (rowId: string, button: number) => {
      if (button !== 0) return

      const mode = store.isSelected(rowId) ? 'deselect' : 'select'
      dragRef.current = {
        active: true,
        moved: false,
        mode,
        anchorId: rowId,
        lastEndId: rowId,
        baseline: new Set(store.getSelectedIds()),
        pendingEndId: null,
      }
      setIsDragSelecting(true)
      setRangeAnchorId(rowId)
    },
    [store],
  )

  const handleSelectionPointerEnter = useCallback(
    (rowId: string) => {
      const drag = dragRef.current
      if (!drag?.active || drag.anchorId === rowId) return

      drag.moved = true
      scheduleDragSelection(rowId)
    },
    [scheduleDragSelection],
  )

  const handleSelectionClick = useCallback(
    (rowId: string, shiftKey: boolean) => {
      if (dragRef.current?.moved) {
        dragRef.current.moved = false
        return
      }

      toggle(rowId, { shiftKey })
    },
    [toggle],
  )

  const togglePage = useCallback(() => {
    store.togglePage(pageIdsRef.current)
    setRangeAnchorId(pageIdsRef.current[0] ?? null)
  }, [store])

  const isSelected = useCallback((rowId: string) => store.isSelected(rowId), [store])

  return useMemo(
    () => ({
      store,
      selectedIds: metrics.selectedIds,
      selectedCount: metrics.selectedCount,
      pageSelectedCount: metrics.pageSelectedCount,
      allPageSelected: metrics.allPageSelected,
      somePageSelected: metrics.somePageSelected,
      isDragSelecting,
      isSelected,
      toggle,
      togglePage,
      clear,
      handleSelectionPointerDown,
      handleSelectionPointerEnter,
      handleSelectionClick,
    }),
    [
      store,
      metrics,
      isDragSelecting,
      isSelected,
      toggle,
      togglePage,
      clear,
      handleSelectionPointerDown,
      handleSelectionPointerEnter,
      handleSelectionClick,
    ],
  )
}

export type TableRowSelection = ReturnType<typeof useTableRowSelection>
