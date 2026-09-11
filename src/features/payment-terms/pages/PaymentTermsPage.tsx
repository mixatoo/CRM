import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react'
import { canMutate } from '@/domain/policies/permissions'
import type { PaymentTerm } from '@/domain/entities/payment-term'
import { useAuthStore } from '@/features/auth/store/auth-store'
import {
  usePaymentTermMutations,
  usePaymentTerms,
} from '@/features/payment-terms/hooks/use-payment-terms'
import { PaymentTermFormDialog } from '@/features/payment-terms/components/PaymentTermFormDialog'
import { Page } from '@/design-system/layout/Page'
import { PageHeader } from '@/design-system/layout/PageHeader'
import { CrmPanel } from '@/design-system/layout/CrmPanel'
import { Button } from '@/design-system/components/Button'
import { Skeleton } from '@/design-system/components/Skeleton'
import { ConfirmDialog } from '@/design-system/components/ConfirmDialog'
import { cn } from '@/shared/utils/cn'
import { layout } from '@/design-system/tokens/layout'

export function PaymentTermsPage() {
  const role = useAuthStore((s) => s.user?.role ?? 'guest')
  const canEdit = canMutate(role, 'settings', 'update')
  const { data: terms = [], isLoading } = usePaymentTerms()
  const { deletePaymentTerm, isPending } = usePaymentTermMutations()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTerm, setEditingTerm] = useState<PaymentTerm | null>(null)
  const [deletingTerm, setDeletingTerm] = useState<PaymentTerm | null>(null)

  const activeCount = useMemo(() => terms.filter((term) => term.isActive).length, [terms])

  const openCreate = () => {
    setEditingTerm(null)
    setDialogOpen(true)
  }

  const openEdit = (term: PaymentTerm) => {
    setEditingTerm(term)
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
        title="Payment terms"
        description="Manage invoice payment terms used across customer accounts."
        actions={
          canEdit ? (
            <Button type="button" size="sm" onClick={openCreate}>
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Add term
            </Button>
          ) : null
        }
      />

      <CrmPanel title={`Terms catalog · ${activeCount} active · ${terms.length} total`}>
        {isLoading ? (
          <div className="space-y-2 px-4 py-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : terms.length === 0 ? (
          <p className="px-4 py-6 text-sm text-[var(--color-muted)]">No payment terms configured yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]/30">
                <tr>
                  <th className="px-4 py-2.5 font-medium text-[var(--color-muted)]">Name</th>
                  <th className="px-4 py-2.5 font-medium text-[var(--color-muted)]">Days</th>
                  <th className="px-4 py-2.5 font-medium text-[var(--color-muted)]">Description</th>
                  <th className="px-4 py-2.5 font-medium text-[var(--color-muted)]">Status</th>
                  {canEdit ? <th className="px-4 py-2.5 text-right font-medium text-[var(--color-muted)]">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {terms.map((term) => (
                  <tr key={term.id} className="border-b border-[var(--color-border)] last:border-b-0">
                    <td className="px-4 py-3 font-medium text-[var(--color-foreground)]">{term.name}</td>
                    <td className="px-4 py-3 font-mono tabular-nums text-[var(--color-foreground)]">{term.days}</td>
                    <td className="max-w-[16rem] px-4 py-3 text-[var(--color-muted)]">
                      {term.description?.trim() || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex rounded-[var(--radius-sm)] px-2 py-0.5 text-[10px] font-medium',
                          term.isActive
                            ? 'bg-[var(--color-success-muted)]/40 text-[var(--color-success)]'
                            : 'bg-[var(--color-surface-muted)] text-[var(--color-muted)]',
                        )}
                      >
                        {term.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {canEdit ? (
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button type="button" variant="ghost" size="sm" className="h-7 px-2" onClick={() => openEdit(term)}>
                            <Pencil className="h-3.5 w-3.5" aria-hidden />
                            <span className="sr-only">Edit {term.name}</span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[var(--color-danger)] hover:text-[var(--color-danger)]"
                            onClick={() => setDeletingTerm(term)}
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
                            <span className="sr-only">Delete {term.name}</span>
                          </Button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CrmPanel>

      <p className={cn(layout.caption, 'mt-4')}>
        Due dates on new invoices are calculated as invoice date plus the selected term&apos;s days.
      </p>

      <PaymentTermFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        term={editingTerm}
      />

      <ConfirmDialog
        open={Boolean(deletingTerm)}
        onOpenChange={(open) => {
          if (!open) setDeletingTerm(null)
        }}
        title="Delete payment term?"
        description={
          deletingTerm
            ? `Remove "${deletingTerm.name}" permanently. This is only allowed when no clients use this term.`
            : undefined
        }
        confirmLabel="Delete"
        variant="danger"
        isPending={isPending}
        onConfirm={() => {
          if (!deletingTerm) return
          deletePaymentTerm.mutate(deletingTerm.id, {
            onSuccess: () => setDeletingTerm(null),
          })
        }}
      />
    </Page>
  )
}
