import { memo, type MouseEvent } from 'react'
import type { Trip } from '@/domain/entities'
import type { Label } from '@/domain/entities/label'
import { renderClientLinkedTripsTableCell } from '@/features/clients/components/trips/client-linked-trips-table-column-render'
import type { ClientLinkedTripsTableColumnKey } from '@/features/clients/components/trips/client-linked-trips-table-columns'
import { useTableRowSelected } from '@/shared/hooks/table-row-selection-context'
import { crmInteractiveTableRowClass } from '@/design-system/components/table-styles'

export interface ClientLinkedTripsTableRowProps {
  trip: Trip
  labels: Label[]
  orderedVisibleKeys: readonly ClientLinkedTripsTableColumnKey[]
  isDeleting: boolean
  isDragSelecting: boolean
  cloningTripId?: string
  onOpen: (tripId: string, event?: MouseEvent) => void
  onClone: (trip: Trip) => void
  onDelete: (tripId: string) => void
  onSelectionPointerDown: (tripId: string, button: number) => void
  onSelectionPointerEnter: (tripId: string) => void
  onSelectionClick: (tripId: string, shiftKey: boolean) => void
}

export const ClientLinkedTripsTableRow = memo(function ClientLinkedTripsTableRow({
  trip,
  labels,
  orderedVisibleKeys,
  isDeleting,
  isDragSelecting,
  cloningTripId,
  onOpen,
  onClone,
  onDelete,
  onSelectionPointerDown,
  onSelectionPointerEnter,
  onSelectionClick,
}: ClientLinkedTripsTableRowProps) {
  const selected = useTableRowSelected(trip.id)
  const rowLabel = `Open trip ${trip.reference}, ${trip.name}`

  const cellContext = {
    trip,
    labels,
    selected,
    isDeleting,
    isDragSelecting,
    cloningTripId,
    onOpen,
    onClone,
    onDelete,
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
        if (target.closest('[data-trip-row-action]')) return
        if (target.closest('[data-client-row-selection]')) return
        onOpen(trip.id, event)
      }}
      onAuxClick={(event) => {
        if (event.button !== 1) return
        event.preventDefault()
        onOpen(trip.id, event)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen(trip.id)
        }
      }}
      className={crmInteractiveTableRowClass({ selected })}
    >
      {orderedVisibleKeys.map((key) => renderClientLinkedTripsTableCell(key, cellContext))}
    </tr>
  )
})
