import { useState } from 'react'
import { Button } from '@/design-system/components/Button'
import { ConfirmDialog } from '@/design-system/components/ConfirmDialog'
import { CardSkeleton, Skeleton, TableSkeleton } from '@/design-system/components/Skeleton'
import { SearchField } from '@/design-system/components/SearchField'
import { ToastPlayground } from '@/features/ui-templates/components/ToastPlayground'
import { TemplateSection } from '@/features/ui-templates/components/TemplateSection'

export function FeedbackShowcase() {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [searchCompact, setSearchCompact] = useState('')
  const [searchGlobal, setSearchGlobal] = useState('')

  return (
    <div className="space-y-8">
      <TemplateSection
        title="Confirm dialog"
        description="Alert dialog with record preview meta grid. Used for bulk delete and destructive actions."
        path="src/design-system/components/ConfirmDialog.tsx"
      >
        <div className="flex flex-wrap gap-2">
          <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
            Delete record
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setConfirmOpen(true)}>
            Confirm action
          </Button>
        </div>

        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          entityType="Trip"
          title="Delete selected trips?"
          description="This will permanently remove the selected records from this browser profile."
          meta={[
            { label: 'ID', value: '#504567' },
            { label: 'Name', value: 'Advanced Webinar Series — Cairo' },
            { label: 'Owner', value: 'Ibrahim Mahmoud' },
          ]}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={() => setDeleteOpen(false)}
        />

        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          entityType="Service"
          title="Mark service as confirmed?"
          description="Supplier booking will move to confirmed status."
          meta={[
            { label: 'Service', value: 'CAI → DXB · MS 777' },
            { label: 'Passengers', value: '12' },
          ]}
          confirmLabel="Confirm"
          onConfirm={() => setConfirmOpen(false)}
        />
      </TemplateSection>

      <TemplateSection
        title="Toast notifications"
        description="Ops Signal — dark bottom-right stack with intent glow, countdown ring, swipe dismiss, and optional CTA."
        path="src/design-system/components/Toast.tsx"
      >
        <ToastPlayground />
      </TemplateSection>

      <TemplateSection
        title="Search field densities"
        description="Collapsible search used in list toolbars and the global header."
        path="src/design-system/components/SearchField.tsx"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <p className="mb-2 text-xs font-medium text-[var(--color-muted)]">Toolbar (collapsible icon)</p>
            <SearchField
              value={searchCompact}
              onValueChange={setSearchCompact}
              placeholder="ID, client, destination"
              density="toolbar"
            />
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <p className="mb-2 text-xs font-medium text-[var(--color-muted)]">Global header</p>
            <SearchField
              value={searchGlobal}
              onValueChange={setSearchGlobal}
              placeholder="Search trips, clients, services…"
              density="global"
              collapsible={false}
            />
          </div>
        </div>
      </TemplateSection>

      <TemplateSection
        title="Loading skeletons"
        description="Placeholder states while data loads."
        path="src/design-system/components/Skeleton.tsx"
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <CardSkeleton />
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <Skeleton className="mb-3 h-4 w-24" />
            <TableSkeleton rows={4} cols={3} />
          </div>
        </div>
      </TemplateSection>
    </div>
  )
}
