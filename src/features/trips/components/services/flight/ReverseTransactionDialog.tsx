import { useEffect, useState } from 'react'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { AlertCircle } from 'lucide-react'
import { CloseButton } from '@/design-system/components/CloseButton'
import { Button } from '@/design-system/components/Button'
import { Textarea } from '@/design-system/components/Input'
import { layout } from '@/design-system/tokens/layout'
import { TICKET_TRANSACTION_TYPE_LABELS } from '@/domain/flight/types'
import type { TicketTransaction } from '@/domain/flight/types'
import { cn } from '@/shared/utils/cn'

interface ReverseTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: TicketTransaction | null
  mode?: 'reverse' | 'correct'
  onConfirm: (reason: string) => void
  isPending?: boolean
}

export function ReverseTransactionDialog({
  open,
  onOpenChange,
  transaction,
  mode = 'reverse',
  onConfirm,
  isPending = false,
}: ReverseTransactionDialogProps) {
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (!open) setReason('')
  }, [open])

  if (!transaction) return null

  const label = TICKET_TRANSACTION_TYPE_LABELS[transaction.type]
  const correcting = mode === 'correct'
  const canConfirm = reason.trim().length > 0 && !isPending

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-[600] bg-black/40 backdrop-blur-[1px]" />
        <AlertDialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-[601] w-[min(26rem,calc(100vw-1rem))] -translate-x-1/2 -translate-y-1/2',
            'max-h-[min(34rem,calc(100dvh-1rem))] overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl outline-none',
          )}
        >
          <header className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3.5">
            <div className="min-w-0">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-subtle)]">
                Transaction
              </p>
              <AlertDialog.Title className="text-sm font-semibold text-[var(--color-foreground)]">
                {correcting ? `Correct ${label}` : `Reverse ${label}`}
              </AlertDialog.Title>
            </div>
            <AlertDialog.Cancel asChild>
              <CloseButton className="shrink-0" />
            </AlertDialog.Cancel>
          </header>

          <div className="space-y-3 px-4 py-4">
            <AlertDialog.Description className={cn(layout.caption, 'leading-relaxed')}>
              {correcting
                ? 'The original transaction will be reversed in the ledger, then you can record the corrected amounts.'
                : 'This keeps the audit trail and posts reversing ledger entries. You can record the operation again afterward if needed.'}
            </AlertDialog.Description>

            <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]/30 px-3 py-2.5 text-xs">
              <p className="font-medium text-[var(--color-foreground)]">{label}</p>
              <p className="mt-0.5 text-[var(--color-muted)]">{transaction.createdAt.slice(0, 10)}</p>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted)]">
                Reason
              </label>
              <Textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder={correcting ? 'What needs to be corrected?' : 'Why is this transaction being reversed?'}
                className="min-h-[5.5rem] text-sm"
              />
            </div>

            <div className="flex items-start gap-2 border-l-2 border-[var(--color-danger)]/70 pl-3">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-danger)]" strokeWidth={2} />
              <p className="text-xs leading-relaxed text-[var(--color-muted)]">
                Only the most recent transaction can be reversed. Older mistakes must be unwound one step at a time.
              </p>
            </div>
          </div>

          <footer className="flex items-center justify-end gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface-muted)]/40 px-4 py-3">
            <AlertDialog.Cancel asChild>
              <Button variant="secondary" size="sm" className="min-w-[5.5rem] font-normal" disabled={isPending}>
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <Button
              variant="danger"
              size="sm"
              className="min-w-[5.5rem]"
              loading={isPending}
              disabled={!canConfirm}
              onClick={() => onConfirm(reason.trim())}
            >
              {isPending ? 'Reversing…' : correcting ? 'Reverse & correct' : 'Reverse'}
            </Button>
          </footer>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
