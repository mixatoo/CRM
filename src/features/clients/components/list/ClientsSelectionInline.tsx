import { useState } from 'react'
import { CheckSquare, Pencil, Square, Trash2 } from 'lucide-react'
import { Button } from '@/design-system/components/Button'
import { ConfirmDialog } from '@/design-system/components/ConfirmDialog'
import { LabelAssignPopover } from '@/features/labels/components/LabelAssignPopover'

interface ClientsSelectionInlineProps {
  selectedCount: number
  selectedIds: string[]
  allPageSelected: boolean
  pageClientCount: number
  isBulkPending?: boolean
  onTogglePage: () => void
  onBulkEdit: () => void
  onBulkDelete: () => void
}

export function ClientsSelectionInline({
  selectedCount,
  selectedIds,
  allPageSelected,
  pageClientCount,
  isBulkPending,
  onTogglePage,
  onBulkEdit,
  onBulkDelete,
}: ClientsSelectionInlineProps) {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  return (
    <>
      <div className="flex min-w-0 flex-wrap items-center gap-1.5" role="status" aria-live="polite">
        <span className="shrink-0 text-sm font-semibold tabular-nums text-[var(--color-accent)]">
          {selectedCount}
        </span>
        <span className="shrink-0 text-sm text-[var(--color-muted)]">selected</span>

        {pageClientCount > 0 ? (
          <>
            <span className="mx-0.5 h-4 w-px shrink-0 bg-[var(--color-border)]" aria-hidden />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 gap-1.5 px-2 text-xs font-normal text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
              onClick={onTogglePage}
              disabled={isBulkPending}
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

        <span className="mx-0.5 h-4 w-px shrink-0 bg-[var(--color-border)]" aria-hidden />

        <LabelAssignPopover targetType="client" targetIds={selectedIds} mode="add" disabled={isBulkPending} />

        <Button
          variant="secondary"
          size="sm"
          className="h-8 shrink-0 gap-1.5 px-2.5 font-normal"
          disabled={isBulkPending}
          onClick={onBulkEdit}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>

        <Button
          variant="danger"
          size="sm"
          className="h-8 shrink-0 gap-1.5 font-normal"
          disabled={isBulkPending}
          onClick={() => setConfirmDeleteOpen(true)}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        variant="danger"
        entityType="Clients"
        title="Delete selected clients"
        description="Clients linked to trips cannot be deleted until those trips are unlinked."
        meta={[{ label: 'Selected', value: `${selectedCount} client${selectedCount === 1 ? '' : 's'}` }]}
        confirmLabel={`Delete ${selectedCount}`}
        isPending={isBulkPending}
        onConfirm={() => {
          onBulkDelete()
          setConfirmDeleteOpen(false)
        }}
      />
    </>
  )
}
