import { useState } from 'react'
import { CheckSquare, Square, Trash2 } from 'lucide-react'
import { Button } from '@/design-system/components/Button'
import { CloseButton } from '@/design-system/components/CloseButton'
import { ConfirmDialog } from '@/design-system/components/ConfirmDialog'

interface TripFlightSelectionInlineProps {
  selectedCount: number
  allPageSelected: boolean
  allRowsSelected: boolean
  pageRowCount: number
  totalRowCount: number
  onTogglePage: () => void
  onSelectAllRows: () => void
  onClear: () => void
  onBulkDelete: () => void
}

export function TripFlightSelectionInline({
  selectedCount,
  allPageSelected,
  allRowsSelected,
  pageRowCount,
  totalRowCount,
  onTogglePage,
  onSelectAllRows,
  onClear,
  onBulkDelete,
}: TripFlightSelectionInlineProps) {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const deletingAll = allRowsSelected && totalRowCount > 0

  return (
    <>
      <div className="flex min-w-0 items-center gap-1.5" role="status" aria-live="polite">
        <span className="shrink-0 text-sm font-semibold tabular-nums text-[var(--color-accent)]">
          {selectedCount}
        </span>
        <span className="shrink-0 text-sm text-[var(--color-muted)]">selected</span>

        {pageRowCount > 0 ? (
          <>
            <span className="mx-0.5 h-4 w-px shrink-0 bg-[var(--color-border)]" aria-hidden />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 gap-1.5 px-2 text-xs font-normal text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
              onClick={onTogglePage}
            >
              {allPageSelected ? (
                <Square className="h-3.5 w-3.5" strokeWidth={2} />
              ) : (
                <CheckSquare className="h-3.5 w-3.5 text-[var(--color-accent)]" strokeWidth={2} />
              )}
              <span className="hidden sm:inline">{allPageSelected ? 'Deselect page' : 'Select page'}</span>
            </Button>
          </>
        ) : null}

        {totalRowCount > pageRowCount && !allRowsSelected ? (
          <>
            <span className="mx-0.5 h-4 w-px shrink-0 bg-[var(--color-border)]" aria-hidden />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 gap-1.5 px-2 text-xs font-normal text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
              onClick={onSelectAllRows}
            >
              <CheckSquare className="h-3.5 w-3.5 text-[var(--color-accent)]" strokeWidth={2} />
              <span className="hidden sm:inline">Select all {totalRowCount}</span>
            </Button>
          </>
        ) : null}

        <span className="mx-0.5 h-4 w-px shrink-0 bg-[var(--color-border)]" aria-hidden />

        <Button
          variant="ghost"
          size="sm"
          className="h-8 shrink-0 gap-1.5 px-2 text-xs font-normal text-[var(--color-danger)] hover:bg-[var(--color-danger-muted)]"
          onClick={() => setConfirmDeleteOpen(true)}
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Delete</span>
        </Button>

        <CloseButton
          iconSize="sm"
          className="shrink-0"
          onClick={onClear}
          aria-label="Clear selection"
        />
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        variant="danger"
        entityType="Segments"
        title={deletingAll ? 'Delete all segments and tickets' : 'Delete selected segments'}
        description={
          deletingAll
            ? 'This removes every passenger, ticket, and segment from the flight table. Save to persist the cleared itinerary.'
            : 'Review your selection before confirming removal.'
        }
        meta={[
          {
            label: 'Selected',
            value: deletingAll
              ? `All ${totalRowCount} segment${totalRowCount === 1 ? '' : 's'}`
              : `${selectedCount} segment${selectedCount === 1 ? '' : 's'}`,
          },
        ]}
        confirmLabel={deletingAll ? 'Delete all' : `Delete ${selectedCount}`}
        onConfirm={() => {
          onBulkDelete()
          setConfirmDeleteOpen(false)
        }}
      />
    </>
  )
}
