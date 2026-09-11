import { memo, type MouseEvent } from 'react'
import { renderClientLinkedServicesTableCell } from '@/features/clients/components/services/client-linked-services-table-column-render'
import type { ClientLinkedServicesTableColumnKey } from '@/features/clients/components/services/client-linked-services-table-columns'
import type { ClientLinkedServiceRow } from '@/features/clients/utils/client-linked-services-list'
import { useTableRowSelected } from '@/shared/hooks/table-row-selection-context'
import { crmInteractiveTableRowClass } from '@/design-system/components/table-styles'

export interface ClientLinkedServicesTableRowProps {
  service: ClientLinkedServiceRow
  orderedVisibleKeys: readonly ClientLinkedServicesTableColumnKey[]
  isDragSelecting: boolean
  onOpen: (service: ClientLinkedServiceRow, event?: MouseEvent) => void
  onSelectionPointerDown: (serviceId: string, button: number) => void
  onSelectionPointerEnter: (serviceId: string) => void
  onSelectionClick: (serviceId: string, shiftKey: boolean) => void
}

export const ClientLinkedServicesTableRow = memo(function ClientLinkedServicesTableRow({
  service,
  orderedVisibleKeys,
  isDragSelecting,
  onOpen,
  onSelectionPointerDown,
  onSelectionPointerEnter,
  onSelectionClick,
}: ClientLinkedServicesTableRowProps) {
  const selected = useTableRowSelected(service.id)
  const rowLabel = `Open service ${service.name}${service.tripReference ? ` on trip ${service.tripReference}` : ''}`

  const cellContext = {
    service,
    selected,
    isDragSelecting,
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
        if (target.closest('[data-service-row-action]')) return
        if (target.closest('[data-client-row-selection]')) return
        if (target.closest('a')) return
        onOpen(service, event)
      }}
      onAuxClick={(event) => {
        if (event.button !== 1) return
        event.preventDefault()
        onOpen(service, event)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen(service)
        }
      }}
      className={crmInteractiveTableRowClass({ selected })}
    >
      {orderedVisibleKeys.map((key) => renderClientLinkedServicesTableCell(key, cellContext))}
    </tr>
  )
})
