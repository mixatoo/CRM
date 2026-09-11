type Listener = () => void

type DragMode = 'select' | 'deselect'

export interface DragState {
  active: boolean
  moved: boolean
  mode: DragMode
  anchorId: string
  lastEndId: string
  baseline: Set<string>
  pendingEndId: string | null
}

function setsEqual(a: Set<string>, b: Set<string>) {
  if (a === b) return true
  if (a.size !== b.size) return false
  for (const id of a) {
    if (!b.has(id)) return false
  }
  return true
}

export function getRangeIds(pageIds: string[], fromId: string, toId: string) {
  const fromIndex = pageIds.indexOf(fromId)
  const toIndex = pageIds.indexOf(toId)
  if (fromIndex < 0 || toIndex < 0) return []

  const [start, end] = fromIndex < toIndex ? [fromIndex, toIndex] : [toIndex, fromIndex]
  return pageIds.slice(start, end + 1)
}

export function buildDragSelection(
  baseline: Set<string>,
  pageIds: string[],
  anchorId: string,
  endId: string,
  mode: DragMode,
) {
  const next = new Set(baseline)
  for (const id of getRangeIds(pageIds, anchorId, endId)) {
    if (mode === 'select') next.add(id)
    else next.delete(id)
  }
  return next
}

export class TableRowSelectionStore {
  private selectedIds = new Set<string>()
  private globalListeners = new Set<Listener>()
  private rowListeners = new Map<string, Set<Listener>>()
  private revision = 0

  subscribe = (listener: Listener) => {
    this.globalListeners.add(listener)
    return () => {
      this.globalListeners.delete(listener)
    }
  }

  subscribeRow = (rowId: string, listener: Listener) => {
    let listeners = this.rowListeners.get(rowId)
    if (!listeners) {
      listeners = new Set()
      this.rowListeners.set(rowId, listeners)
    }
    listeners.add(listener)
    return () => {
      listeners?.delete(listener)
      if (listeners?.size === 0) this.rowListeners.delete(rowId)
    }
  }

  getSnapshot = () => this.revision

  getSelectedIds = () => this.selectedIds

  isSelected = (rowId: string) => this.selectedIds.has(rowId)

  get selectedCount() {
    return this.selectedIds.size
  }

  private notifyGlobal() {
    this.revision += 1
    for (const listener of this.globalListeners) listener()
  }

  private notifyRows(changedIds: Iterable<string>) {
    for (const rowId of changedIds) {
      const listeners = this.rowListeners.get(rowId)
      if (!listeners) continue
      for (const listener of listeners) listener()
    }
  }

  private commit(next: Set<string>) {
    if (setsEqual(this.selectedIds, next)) return

    const changed = new Set<string>()
    for (const id of this.selectedIds) {
      if (!next.has(id)) changed.add(id)
    }
    for (const id of next) {
      if (!this.selectedIds.has(id)) changed.add(id)
    }

    this.selectedIds = next
    this.notifyRows(changed)
    this.notifyGlobal()
  }

  toggle(rowId: string) {
    const next = new Set(this.selectedIds)
    if (next.has(rowId)) next.delete(rowId)
    else next.add(rowId)
    this.commit(next)
  }

  applyRange(pageIds: string[], fromId: string, toId: string, mode: DragMode) {
    const rangeIds = getRangeIds(pageIds, fromId, toId)
    if (rangeIds.length === 0) return

    const next = new Set(this.selectedIds)
    for (const id of rangeIds) {
      if (mode === 'select') next.add(id)
      else next.delete(id)
    }
    this.commit(next)
  }

  setDragSelection(pageIds: string[], anchorId: string, endId: string, baseline: Set<string>, mode: DragMode) {
    this.commit(buildDragSelection(baseline, pageIds, anchorId, endId, mode))
  }

  togglePage(pageIds: string[]) {
    const next = new Set(this.selectedIds)
    const allSelected = pageIds.length > 0 && pageIds.every((id) => next.has(id))
    for (const id of pageIds) {
      if (allSelected) next.delete(id)
      else next.add(id)
    }
    this.commit(next)
  }

  clear() {
    if (this.selectedIds.size === 0) return
    const changed = [...this.selectedIds]
    this.selectedIds = new Set()
    this.notifyRows(changed)
    this.notifyGlobal()
  }

  pageSelectedCount(pageIds: string[]) {
    let count = 0
    for (const id of pageIds) {
      if (this.selectedIds.has(id)) count += 1
    }
    return count
  }
}

export function createTableRowSelectionStore() {
  return new TableRowSelectionStore()
}
