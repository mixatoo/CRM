import { FileUp, FoldVertical, Pencil, Plus, Save, UnfoldVertical } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/design-system/components/Button'
import { layout } from '@/design-system/tokens/layout'
import { TripFlightClearAllButton } from '@/features/trips/components/services/flight/TripFlightClearAllButton'
import { TripFlightSelectionInline } from '@/features/trips/components/services/flight/TripFlightSelectionInline'
import type { TripRowSelection } from '@/features/trips/hooks/use-trip-row-selection'
import { cn } from '@/shared/utils/cn'

interface TripFlightServiceToolbarProps {
  readOnly: boolean
  isSaving: boolean
  canAddSegment: boolean
  canToggleCollapseAll: boolean
  hasCollapsedPassengers: boolean
  hasTableData: boolean
  tablePassengerCount: number
  tableTicketCount: number
  tableSegmentCount: number
  totalRowCount: number
  allRowIds: string[]
  selection: TripRowSelection
  pageRowCount: number
  onAddPassenger: () => void
  onAddSegment: () => void
  onToggleCollapseAll: () => void
  onSelectAllRows: () => void
  onBulkDelete: () => void
  onClearAll: () => void
  onSave: () => void
  onEdit: () => void
  onImportTicket: () => void
  columnPicker?: ReactNode
}

export function TripFlightServiceToolbar({
  readOnly,
  isSaving,
  canAddSegment,
  canToggleCollapseAll,
  hasCollapsedPassengers,
  hasTableData,
  tablePassengerCount,
  tableTicketCount,
  tableSegmentCount,
  totalRowCount,
  allRowIds,
  selection,
  pageRowCount,
  onAddPassenger,
  onAddSegment,
  onToggleCollapseAll,
  onSelectAllRows,
  onBulkDelete,
  onClearAll,
  onSave,
  onEdit,
  onImportTicket,
  columnPicker,
}: TripFlightServiceToolbarProps) {
  const hasSelection = !readOnly && selection.selectedCount > 0
  const allRowsSelected = selection.allSelected(allRowIds)

  return (
    <div
      className={cn(
        'flex flex-nowrap items-center gap-2 overflow-x-auto border-b border-[var(--color-border)] px-2 py-2 sm:px-3',
        layout.hideScrollbar,
      )}
    >
      {hasSelection ? (
        <TripFlightSelectionInline
          selectedCount={selection.selectedCount}
          allPageSelected={selection.allPageSelected}
          allRowsSelected={allRowsSelected}
          pageRowCount={pageRowCount}
          totalRowCount={totalRowCount}
          onTogglePage={selection.togglePage}
          onSelectAllRows={onSelectAllRows}
          onClear={selection.clear}
          onBulkDelete={onBulkDelete}
        />
      ) : (
        <>
          {!readOnly ? (
            <>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 shrink-0 gap-1.5 px-2.5 font-normal"
                onClick={onAddPassenger}
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Add passenger</span>
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 shrink-0 gap-1.5 px-2.5 font-normal"
                onClick={onImportTicket}
              >
                <FileUp className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Import ticket</span>
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 shrink-0 gap-1.5 px-2.5 font-normal"
                onClick={onAddSegment}
                disabled={!canAddSegment}
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Add segment</span>
              </Button>
            </>
          ) : null}

          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-8 shrink-0 gap-1.5 px-2.5 font-normal"
            onClick={onToggleCollapseAll}
            disabled={!canToggleCollapseAll}
            aria-label={hasCollapsedPassengers ? 'Expand all passengers' : 'Collapse all passengers'}
          >
            {hasCollapsedPassengers ? (
              <UnfoldVertical className="h-3.5 w-3.5" />
            ) : (
              <FoldVertical className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">{hasCollapsedPassengers ? 'Expand all' : 'Collapse all'}</span>
          </Button>

          {!readOnly && hasTableData ? (
            <TripFlightClearAllButton
              passengerCount={tablePassengerCount}
              ticketCount={tableTicketCount}
              segmentCount={tableSegmentCount}
              onConfirm={onClearAll}
            />
          ) : null}

          {columnPicker}

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 gap-1.5 px-2.5 font-normal"
              onClick={onEdit}
              disabled={!readOnly}
            >
              <Pencil className="h-3.5 w-3.5" />
              <span>Edit</span>
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              className="h-8 gap-1.5 px-2.5 font-normal"
              onClick={onSave}
              disabled={readOnly || isSaving}
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSaving ? 'Saving…' : 'Save'}</span>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
