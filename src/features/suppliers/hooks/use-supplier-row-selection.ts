import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface ToggleOptions {
  shiftKey?: boolean
}

type DragMode = 'select' | 'deselect'

interface DragState {
  active: boolean
  moved: boolean
  mode: DragMode
  anchorId: string
}

function getRangeIds(pageIds: string[], fromId: string, toId: string) {
  const fromIndex = pageIds.indexOf(fromId)
  const toIndex = pageIds.indexOf(toId)
  if (fromIndex < 0 || toIndex < 0) return []

  const [start, end] = fromIndex < toIndex ? [fromIndex, toIndex] : [toIndex, fromIndex]
  return pageIds.slice(start, end + 1)
}

export function useSupplierRowSelection(pageSupplierIds: string[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [rangeAnchorId, setRangeAnchorId] = useState<string | null>(null)
  const [isDragSelecting, setIsDragSelecting] = useState(false)
  const dragRef = useRef<DragState | null>(null)

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds])

  const applyRange = useCallback(
    (fromId: string, toId: string, mode: DragMode) => {
      const rangeIds = getRangeIds(pageSupplierIds, fromId, toId)
      if (rangeIds.length === 0) return

      setSelectedIds((prev) => {
        const next = new Set(prev)
        for (const id of rangeIds) {
          if (mode === 'select') next.add(id)
          else next.delete(id)
        }
        return next
      })
    },
    [pageSupplierIds],
  )

  const selectRange = useCallback(
    (fromId: string, toId: string) => {
      applyRange(fromId, toId, 'select')
    },
    [applyRange],
  )

  const toggle = useCallback(
    (id: string, options?: ToggleOptions) => {
      const shiftKey = options?.shiftKey ?? false

      if (shiftKey && rangeAnchorId) {
        selectRange(rangeAnchorId, id)
        setRangeAnchorId(id)
        return
      }

      setSelectedIds((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
      setRangeAnchorId(id)
    },
    [rangeAnchorId, selectRange],
  )

  const clear = useCallback(() => {
    setSelectedIds(new Set())
    setRangeAnchorId(null)
  }, [])

  const endDrag = useCallback(() => {
    if (dragRef.current?.active) {
      dragRef.current.active = false
      setIsDragSelecting(false)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('pointerup', endDrag)
    window.addEventListener('pointercancel', endDrag)
    return () => {
      window.removeEventListener('pointerup', endDrag)
      window.removeEventListener('pointercancel', endDrag)
    }
  }, [endDrag])

  const handleSelectionPointerDown = useCallback(
    (supplierId: string, button: number) => {
      if (button !== 0) return

      const mode: DragMode = selectedIds.has(supplierId) ? 'deselect' : 'select'
      dragRef.current = {
        active: true,
        moved: false,
        mode,
        anchorId: supplierId,
      }
      setIsDragSelecting(true)
      setRangeAnchorId(supplierId)
    },
    [selectedIds],
  )

  const handleSelectionPointerEnter = useCallback(
    (supplierId: string) => {
      const drag = dragRef.current
      if (!drag?.active || drag.anchorId === supplierId) return

      drag.moved = true
      applyRange(drag.anchorId, supplierId, drag.mode)
    },
    [applyRange],
  )

  const handleSelectionClick = useCallback(
    (supplierId: string, shiftKey: boolean) => {
      if (dragRef.current?.moved) {
        dragRef.current.moved = false
        return
      }

      toggle(supplierId, { shiftKey })
    },
    [toggle],
  )

  const pageSelectedCount = useMemo(
    () => pageSupplierIds.filter((id) => selectedIds.has(id)).length,
    [pageSupplierIds, selectedIds],
  )

  const allPageSelected = pageSupplierIds.length > 0 && pageSelectedCount === pageSupplierIds.length
  const somePageSelected = pageSelectedCount > 0 && !allPageSelected

  const togglePage = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (pageSupplierIds.every((id) => next.has(id))) {
        for (const id of pageSupplierIds) next.delete(id)
      } else {
        for (const id of pageSupplierIds) next.add(id)
      }
      return next
    })
    setRangeAnchorId(pageSupplierIds[0] ?? null)
  }, [pageSupplierIds])

  return {
    selectedIds,
    selectedCount: selectedIds.size,
    pageSelectedCount,
    allPageSelected,
    somePageSelected,
    isDragSelecting,
    isSelected,
    toggle,
    togglePage,
    clear,
    handleSelectionPointerDown,
    handleSelectionPointerEnter,
    handleSelectionClick,
  }
}

export type SupplierRowSelection = ReturnType<typeof useSupplierRowSelection>
