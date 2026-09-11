import { memo } from 'react'
import type { Traveler } from '@/domain/entities/traveler'
import { travelerDisplayName } from '@/domain/entities/traveler'
import { renderClientTravelersTableCell } from '@/features/travelers/components/client-travelers-table-column-render'
import type { ClientTravelersTableColumnKey } from '@/features/travelers/components/client-travelers-table-columns'
import { useTableRowSelected } from '@/shared/hooks/table-row-selection-context'
import { crmInteractiveTableRowClass } from '@/design-system/components/table-styles'

export interface ClientTravelersTableRowProps {
  traveler: Traveler
  orderedVisibleKeys: readonly ClientTravelersTableColumnKey[]
  isDragSelecting: boolean
  onSelectionPointerDown: (travelerId: string, button: number) => void
  onSelectionPointerEnter: (travelerId: string) => void
  onSelectionClick: (travelerId: string, shiftKey: boolean) => void
  onEdit?: (traveler: Traveler) => void
  onOpenProfile?: (traveler: Traveler) => void
  onDelete?: (travelerId: string) => void
  deletingTravelerId?: string
}

export const ClientTravelersTableRow = memo(function ClientTravelersTableRow({
  traveler,
  orderedVisibleKeys,
  isDragSelecting,
  onSelectionPointerDown,
  onSelectionPointerEnter,
  onSelectionClick,
  onEdit,
  onOpenProfile,
  onDelete,
  deletingTravelerId,
}: ClientTravelersTableRowProps) {
  const selected = useTableRowSelected(traveler.id)
  const name = travelerDisplayName(traveler)

  const cellContext = {
    traveler,
    selected,
    isDragSelecting,
    onSelectionPointerDown,
    onSelectionPointerEnter,
    onSelectionClick,
    onEdit,
    onOpenProfile,
    onDelete,
    deletingTravelerId,
  }

  const activate = onOpenProfile ?? onEdit

  return (
    <tr
      data-interactive="true"
      data-selected={selected ? 'true' : undefined}
      tabIndex={0}
      aria-label={name}
      className={crmInteractiveTableRowClass({ selected })}
      onClick={(event) => {
        if (!activate) return
        const target = event.target as HTMLElement
        if (target.closest('[data-client-row-selection], [data-traveler-row-action], a, button')) return
        activate(traveler)
      }}
      onKeyDown={(event) => {
        if (!activate) return
        if (event.key !== 'Enter' && event.key !== ' ') return
        const target = event.target as HTMLElement
        if (target.closest('[data-client-row-selection], [data-traveler-row-action], a, button')) return
        event.preventDefault()
        activate(traveler)
      }}
    >
      {orderedVisibleKeys.map((key) => renderClientTravelersTableCell(key, cellContext))}
    </tr>
  )
})
