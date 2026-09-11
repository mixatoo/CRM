import { memo } from 'react'
import type { Traveler } from '@/domain/entities/traveler'
import { travelerDisplayName } from '@/domain/entities/traveler'
import type { TravelerListItem } from '@/repositories/interfaces'
import { renderTravelersTableCell } from '@/features/travelers/components/list/travelers-table-column-render'
import type { TravelersTableColumnKey } from '@/features/travelers/components/list/travelers-table-columns'
import { useTableRowSelected } from '@/shared/hooks/table-row-selection-context'
import { crmInteractiveTableRowClass } from '@/design-system/components/table-styles'

export interface TravelersTableRowProps {
  traveler: TravelerListItem
  orderedVisibleKeys: readonly TravelersTableColumnKey[]
  isDragSelecting: boolean
  onSelectionPointerDown: (travelerId: string, button: number) => void
  onSelectionPointerEnter: (travelerId: string) => void
  onSelectionClick: (travelerId: string, shiftKey: boolean) => void
  onEdit: (traveler: Traveler) => void
  onDelete: (travelerId: string) => void
  onOpenAccount: (traveler: Traveler) => void
  onOpenProfile?: (traveler: Traveler) => void
  onRowActivate: (traveler: Traveler) => void
  deletingTravelerId?: string
}

export const TravelersTableRow = memo(function TravelersTableRow({
  traveler,
  orderedVisibleKeys,
  isDragSelecting,
  onSelectionPointerDown,
  onSelectionPointerEnter,
  onSelectionClick,
  onEdit,
  onDelete,
  onOpenAccount,
  onOpenProfile,
  onRowActivate,
  deletingTravelerId,
}: TravelersTableRowProps) {
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
    onDelete,
    onOpenAccount,
    onOpenProfile,
    deletingTravelerId,
  }

  return (
    <tr
      data-interactive="true"
      data-selected={selected ? 'true' : undefined}
      tabIndex={0}
      aria-label={name}
      className={crmInteractiveTableRowClass({ selected })}
      onClick={(event) => {
        const target = event.target as HTMLElement
        if (target.closest('[data-client-row-selection], [data-traveler-row-action], a, button')) return
        onRowActivate(traveler)
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        const target = event.target as HTMLElement
        if (target.closest('[data-client-row-selection], [data-traveler-row-action], a, button')) return
        event.preventDefault()
        onRowActivate(traveler)
      }}
    >
      {orderedVisibleKeys.map((key) => renderTravelersTableCell(key, cellContext))}
    </tr>
  )
})
