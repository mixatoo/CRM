import type { ReactNode } from 'react'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/design-system/components/Button'
import { CloseButton } from '@/design-system/components/CloseButton'
import { layout } from '@/design-system/tokens/layout'
import { cn } from '@/shared/utils/cn'

export interface ConfirmDialogMetaField {
  label: string
  value: ReactNode
}

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: ReactNode
  /** @deprecated Prefer `meta` for CRM-style record preview */
  eyebrow?: string
  /** @deprecated Prefer `meta` for CRM-style record preview */
  detail?: ReactNode
  meta?: ConfirmDialogMetaField[]
  entityType?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  isPending?: boolean
  variant?: 'danger' | 'default'
}

const recordPanelClassName =
  'overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]/30'
const recordHeaderClassName =
  'border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]/80 px-3 py-2'
const recordTitleClassName =
  'text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-subtle)]'
const recordGridClassName = 'grid divide-y divide-[var(--color-border)] sm:divide-x sm:divide-y-0'
const recordCellClassName = 'min-w-0 px-3 py-2.5'
const recordLabelClassName = 'text-[10px] font-medium uppercase tracking-wide text-[var(--color-subtle)]'
const recordValueClassName = 'mt-1 truncate text-sm font-medium text-[var(--color-foreground)]'

function resolveMeta(
  meta: ConfirmDialogMetaField[] | undefined,
  eyebrow: string | undefined,
  detail: ReactNode | undefined,
): ConfirmDialogMetaField[] {
  if (meta && meta.length > 0) return meta
  const fields: ConfirmDialogMetaField[] = []
  if (eyebrow) fields.push({ label: 'Reference', value: eyebrow })
  if (detail) fields.push({ label: 'Name', value: detail })
  return fields
}

function recordGridClass(count: number) {
  if (count === 2) return 'grid-cols-1 sm:grid-cols-[5.75rem_minmax(0,1fr)]'
  if (count >= 3) return 'grid-cols-1 sm:grid-cols-[5.75rem_minmax(0,1fr)] lg:grid-cols-[5.75rem_minmax(0,1fr)_minmax(0,1fr)]'
  return 'grid-cols-1'
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  eyebrow,
  detail,
  meta,
  entityType,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  isPending = false,
  variant = 'default',
}: ConfirmDialogProps) {
  const isDanger = variant === 'danger'
  const fields = resolveMeta(meta, eyebrow, detail)

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-[600] bg-black/40 backdrop-blur-[1px]" />
        <AlertDialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-[601] w-[min(26rem,calc(100vw-1rem))] -translate-x-1/2 -translate-y-1/2 sm:w-[min(26rem,calc(100vw-2rem))]',
            'max-h-[min(32rem,calc(100dvh-1rem))] overflow-y-auto overscroll-contain rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl outline-none',
          )}
        >
          <header className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3.5">
            <div className="min-w-0">
              {entityType ? (
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-subtle)]">
                  {entityType}
                </p>
              ) : null}
              <AlertDialog.Title className="text-sm font-semibold text-[var(--color-foreground)]">
                {title}
              </AlertDialog.Title>
            </div>
            <AlertDialog.Cancel asChild>
              <CloseButton />
            </AlertDialog.Cancel>
          </header>

          <div className="px-4 py-4">
            {description ? (
              <AlertDialog.Description className={cn(layout.caption, 'leading-relaxed')}>
                {description}
              </AlertDialog.Description>
            ) : null}

            {fields.length > 0 ? (
              <div className={cn(recordPanelClassName, description ? 'mt-3' : undefined)}>
                <div className={recordHeaderClassName}>
                  <p className={recordTitleClassName}>Record preview</p>
                </div>
                <div className={cn(recordGridClassName, recordGridClass(fields.length))}>
                  {fields.map((field, index) => (
                    <div
                      key={field.label}
                      className={cn(recordCellClassName, index === 0 && fields.length >= 2 && 'px-2')}
                    >
                      <p className={recordLabelClassName}>{field.label}</p>
                      <p
                        className={cn(
                          recordValueClassName,
                          index === 0 && 'tabular-nums',
                          index > 0 && fields.length >= 2 && 'whitespace-normal line-clamp-2',
                        )}
                        title={typeof field.value === 'string' ? field.value : undefined}
                      >
                        {field.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {isDanger ? (
              <div className="mt-3 flex items-start gap-2 border-l-2 border-[var(--color-danger)]/70 pl-3">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-danger)]" strokeWidth={2} />
                <p className="text-xs leading-relaxed text-[var(--color-muted)]">
                  Permanent action. Deleted records cannot be restored.
                </p>
              </div>
            ) : null}
          </div>

          <footer className="flex items-center justify-end gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface-muted)]/40 px-4 py-3">
            <AlertDialog.Cancel asChild>
              <Button variant="secondary" size="sm" className="min-w-[5.5rem] font-normal" disabled={isPending}>
                {cancelLabel}
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button
                variant={isDanger ? 'danger' : 'primary'}
                size="sm"
                className="min-w-[5.5rem]"
                disabled={isPending}
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            </AlertDialog.Action>
          </footer>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
