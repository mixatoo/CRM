import { INVOICE_STATUS_LABELS, type InvoiceStatus } from '@/domain/entities/invoice'
import { cn } from '@/shared/utils/cn'

const INVOICE_STATUS_VISUAL: Record<
  InvoiceStatus,
  { shell: string; text: string; dot: string }
> = {
  draft: {
    shell: 'border-[var(--color-border)] bg-[var(--color-surface-muted)]/60',
    text: 'text-[var(--color-muted)]',
    dot: 'bg-[var(--color-muted)]',
  },
  pending: {
    shell: 'border-[var(--color-warning)]/25 bg-[var(--color-warning-muted)]/40',
    text: 'text-[var(--color-warning)]',
    dot: 'bg-[var(--color-warning)]',
  },
  sent: {
    shell: 'border-[var(--color-accent)]/25 bg-[var(--color-accent-muted)]/40',
    text: 'text-[var(--color-accent)]',
    dot: 'bg-[var(--color-accent)]',
  },
  paid: {
    shell: 'border-[var(--color-success)]/25 bg-[var(--color-success-muted)]/40',
    text: 'text-[var(--color-success)]',
    dot: 'bg-[var(--color-success)]',
  },
  void: {
    shell: 'border-[var(--color-border)] bg-[var(--color-surface-muted)]/40',
    text: 'text-[var(--color-subtle)] line-through',
    dot: 'bg-[var(--color-border-strong)]',
  },
}

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus
  className?: string
}

export function InvoiceStatusBadge({ status, className }: InvoiceStatusBadgeProps) {
  const visual = INVOICE_STATUS_VISUAL[status]

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border px-2 py-0.5 text-center text-[11px] font-medium leading-none',
        visual.shell,
        visual.text,
        className,
      )}
    >
      <span className={cn('size-1.5 shrink-0 rounded-full', visual.dot)} aria-hidden />
      <span className="truncate">{INVOICE_STATUS_LABELS[status]}</span>
    </span>
  )
}

export function invoiceStatusActionLabel(status: InvoiceStatus): string {
  switch (status) {
    case 'pending':
      return 'Submit for approval'
    case 'sent':
      return 'Mark as sent'
    case 'paid':
      return 'Mark as paid'
    case 'void':
      return 'Void invoice'
    default:
      return INVOICE_STATUS_LABELS[status]
  }
}
