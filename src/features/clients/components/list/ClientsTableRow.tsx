import { memo, type MouseEvent } from 'react'
import type { Client } from '@/domain/entities/client'
import { clientPrimaryLabel } from '@/domain/entities/client'
import type { Label } from '@/domain/entities/label'
import { renderClientsTableCell } from '@/features/clients/components/list/clients-table-column-render'
import type { ClientsTableColumnKey } from '@/features/clients/components/list/clients-table-columns'
import { useTableRowSelected } from '@/shared/hooks/table-row-selection-context'
import { crmInteractiveTableRowClass } from '@/design-system/components/table-styles'

export interface ClientsTableRowProps {
  client: Client
  role: string
  tripCount: number
  labels: Label[]
  orderedVisibleKeys: readonly ClientsTableColumnKey[]
  isDeleting: boolean
  isDragSelecting: boolean
  onOpen: (clientId: string, event?: MouseEvent) => void
  onEdit: (client: Client) => void
  onClone?: (client: Client) => void
  onDelete: (id: string) => void
  cloningClientId?: string
  onSelectionPointerDown: (clientId: string, button: number) => void
  onSelectionPointerEnter: (clientId: string) => void
  onSelectionClick: (clientId: string, shiftKey: boolean) => void
}

export const ClientsTableRow = memo(function ClientsTableRow({
  client,
  role,
  tripCount,
  labels,
  orderedVisibleKeys,
  isDeleting,
  isDragSelecting,
  onOpen,
  onEdit,
  onClone,
  onDelete,
  cloningClientId,
  onSelectionPointerDown,
  onSelectionPointerEnter,
  onSelectionClick,
}: ClientsTableRowProps) {
  const selected = useTableRowSelected(client.id)
  const rowLabel = `Open ${clientPrimaryLabel(client)}, ${client.reference}`

  const cellContext = {
    client,
    role,
    tripCount,
    labels,
    selected,
    isDeleting,
    isDragSelecting,
    onOpen,
    onEdit,
    onClone,
    onDelete,
    cloningClientId,
    onSelectionPointerDown,
    onSelectionPointerEnter,
    onSelectionClick,
  }

  return (
    <tr
      data-interactive="true"
      data-selected={selected ? 'true' : undefined}
      tabIndex={0}
      aria-label={rowLabel}
      onClick={(event) => {
        const target = event.target as HTMLElement
        if (target.closest('[data-client-row-action]')) return
        if (target.closest('[data-client-row-selection]')) return
        onOpen(client.id, event)
      }}
      onAuxClick={(event) => {
        if (event.button !== 1) return
        event.preventDefault()
        onOpen(client.id, event)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen(client.id)
        }
      }}
      className={crmInteractiveTableRowClass({ selected })}
    >
      {orderedVisibleKeys.map((key) => renderClientsTableCell(key, cellContext))}
    </tr>
  )
})
