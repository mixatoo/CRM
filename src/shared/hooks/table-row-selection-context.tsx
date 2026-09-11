import { createContext, useContext, useSyncExternalStore } from 'react'
import type { TableRowSelectionStore } from '@/shared/hooks/table-row-selection-store'

const TableRowSelectionContext = createContext<TableRowSelectionStore | null>(null)

export function TableRowSelectionProvider({
  store,
  children,
}: {
  store: TableRowSelectionStore
  children: React.ReactNode
}) {
  return <TableRowSelectionContext.Provider value={store}>{children}</TableRowSelectionContext.Provider>
}

export function useTableRowSelectionStore() {
  const store = useContext(TableRowSelectionContext)
  if (!store) {
    throw new Error('useTableRowSelectionStore must be used within TableRowSelectionProvider')
  }
  return store
}

export function useTableRowSelected(rowId: string) {
  const store = useTableRowSelectionStore()
  return useSyncExternalStore(
    (listener) => store.subscribeRow(rowId, listener),
    () => store.isSelected(rowId),
    () => store.isSelected(rowId),
  )
}
