import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react'
import { canMutate } from '@/domain/policies/permissions'
import type { Label } from '@/domain/entities/label'
import {
  LABEL_TARGET_TYPE_LABELS,
  resolveLabelColorVisual,
} from '@/domain/entities/label'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { useLabelMutations, useLabels } from '@/features/labels/hooks/use-labels'
import { LabelFormDialog } from '@/features/labels/components/LabelFormDialog'
import { EntityLabelChips } from '@/features/labels/components/EntityLabelChips'
import { Page } from '@/design-system/layout/Page'
import { PageHeader } from '@/design-system/layout/PageHeader'
import { CrmPanel } from '@/design-system/layout/CrmPanel'
import { Button } from '@/design-system/components/Button'
import { Skeleton } from '@/design-system/components/Skeleton'
import { ConfirmDialog } from '@/design-system/components/ConfirmDialog'
import { cn } from '@/shared/utils/cn'
import { layout } from '@/design-system/tokens/layout'

export function LabelsPage() {
  const role = useAuthStore((s) => s.user?.role ?? 'guest')
  const canEdit = canMutate(role, 'settings', 'update')
  const { data: labels = [], isLoading } = useLabels()
  const { deleteLabel, isPending } = useLabelMutations()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLabel, setEditingLabel] = useState<Label | null>(null)
  const [deletingLabel, setDeletingLabel] = useState<Label | null>(null)

  const activeCount = useMemo(() => labels.filter((label) => label.isActive).length, [labels])

  const openCreate = () => {
    setEditingLabel(null)
    setDialogOpen(true)
  }

  const openEdit = (label: Label) => {
    setEditingLabel(label)
    setDialogOpen(true)
  }

  return (
    <Page className="max-w-4xl">
      <div className="mb-4">
        <Link
          to="/settings"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Back to settings
        </Link>
      </div>

      <PageHeader
        title="Labels"
        description="Reusable colored tags for accounts, trips, suppliers, invoices, and more."
        actions={
          canEdit ? (
            <Button type="button" size="sm" onClick={openCreate}>
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Add label
            </Button>
          ) : null
        }
      />

      <CrmPanel title={`Label catalog · ${activeCount} active · ${labels.length} total`}>
        {isLoading ? (
          <div className="space-y-2 px-4 py-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : labels.length === 0 ? (
          <p className="px-4 py-6 text-sm text-[var(--color-muted)]">No labels configured yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]/30">
                <tr>
                  <th className="px-4 py-2.5 font-medium text-[var(--color-muted)]">Label</th>
                  <th className="px-4 py-2.5 font-medium text-[var(--color-muted)]">Scope</th>
                  <th className="px-4 py-2.5 font-medium text-[var(--color-muted)]">Description</th>
                  <th className="px-4 py-2.5 font-medium text-[var(--color-muted)]">Status</th>
                  {canEdit ? (
                    <th className="px-4 py-2.5 text-right font-medium text-[var(--color-muted)]">
                      Actions
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {labels.map((label) => {
                  const visual = resolveLabelColorVisual(label.color)
                  return (
                    <tr key={label.id} className="border-b border-[var(--color-border)] last:border-b-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', visual.swatch)} />
                          <EntityLabelChips labels={[label]} showEmpty={false} maxVisible={1} />
                        </div>
                      </td>
                      <td className="max-w-[12rem] px-4 py-3 text-[var(--color-muted)]">
                        {label.scopes.length === 0
                          ? 'All tables'
                          : label.scopes.map((scope) => LABEL_TARGET_TYPE_LABELS[scope]).join(', ')}
                      </td>
                      <td className="max-w-[14rem] px-4 py-3 text-[var(--color-muted)]">
                        {label.description?.trim() || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex rounded-[var(--radius-sm)] px-2 py-0.5 text-[10px] font-medium',
                            label.isActive
                              ? 'bg-[var(--color-success-muted)]/40 text-[var(--color-success)]'
                              : 'bg-[var(--color-surface-muted)] text-[var(--color-muted)]',
                          )}
                        >
                          {label.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      {canEdit ? (
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              onClick={() => openEdit(label)}
                            >
                              <Pencil className="h-3.5 w-3.5" aria-hidden />
                              <span className="sr-only">Edit {label.name}</span>
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-[var(--color-danger)] hover:text-[var(--color-danger)]"
                              onClick={() => setDeletingLabel(label)}
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden />
                              <span className="sr-only">Delete {label.name}</span>
                            </Button>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CrmPanel>

      <p className={cn(layout.caption, 'mt-4')}>
        Assign labels from any directory table row or bulk selection toolbar. Filter lists by label
        to focus work queues.
      </p>

      <LabelFormDialog open={dialogOpen} onOpenChange={setDialogOpen} label={editingLabel} />

      <ConfirmDialog
        open={Boolean(deletingLabel)}
        onOpenChange={(open) => {
          if (!open) setDeletingLabel(null)
        }}
        title="Delete label?"
        description={
          deletingLabel
            ? `Remove "${deletingLabel.name}" and clear it from every assigned record.`
            : undefined
        }
        confirmLabel="Delete"
        variant="danger"
        isPending={isPending}
        onConfirm={() => {
          if (!deletingLabel) return
          deleteLabel.mutate(deletingLabel.id, {
            onSuccess: () => setDeletingLabel(null),
          })
        }}
      />
    </Page>
  )
}
