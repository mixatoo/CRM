import { useEffect, useMemo, useState } from 'react'
import { AmountInput } from '@/design-system/components/AmountInput'
import { FormPicklist } from '@/design-system/components/FormPicklist'
import { TICKET_STATUS_LABELS, type FlightTicket, type TicketStatus } from '@/domain/flight/types'
import {
  buildCurrencyOptions,
  getCurrencyLabel,
  getCurrencyName,
  type CurrencyFieldOption,
} from '@/domain/currency'
import { cn } from '@/shared/utils/cn'
import { FieldHeader } from '@/design-system/components/FieldLabel'
import { layout } from '@/design-system/tokens/layout'
import { formatAccountingAmount } from '@/features/trips/utils/format'

const ALL_CURRENCY_OPTIONS: CurrencyFieldOption[] = buildCurrencyOptions()

export function CurrencySelect({
  label,
  value,
  onChange,
  bare,
  bareDisplayClassName,
}: {
  label?: string
  value: string
  onChange: (currency: string) => void
  bare?: boolean
  bareDisplayClassName?: string
}) {
  const normalized = value.trim().toUpperCase()

  const options = useMemo(
    () =>
      ALL_CURRENCY_OPTIONS.map((option) => ({
        value: option.value,
        label: bare ? getCurrencyName(option.value) : getCurrencyLabel(option.value),
        description: bare ? undefined : getCurrencyName(option.value),
      })),
    [bare],
  )

  const control = (
    <FormPicklist
      value={normalized}
      onChange={onChange}
      options={options}
      variant={bare ? 'ghost' : 'default'}
      size="sm"
      searchable
      searchPlaceholder="Search code or name…"
      panelTitle="Currency"
      ariaLabel={label ?? 'Currency'}
      className={bare ? cn('min-w-0 flex-1', bareDisplayClassName) : undefined}
    />
  )

  if (!label) return control

  return <FormField label={label}>{control}</FormField>
}

export function CrmMoneyInput({
  value,
  onChange,
  highlight,
}: {
  value: number
  onChange: (v: number) => void
  highlight?: boolean
}) {
  return (
    <AmountInput
      value={value}
      onChange={onChange}
      size="sm"
      className={cn(
        highlight && 'border-[var(--color-accent)]/60 font-medium ring-1 ring-[var(--color-accent)]/15',
      )}
    />
  )
}

export function CompactMoneyField({
  label,
  value,
  onChange,
  highlight,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  highlight?: boolean
}) {
  return (
    <FormField label={label}>
      <AmountInput
        value={value}
        onChange={onChange}
        size="sm"
        className={cn(highlight && 'border-[var(--color-accent)]/50 font-medium')}
      />
    </FormField>
  )
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-xs font-semibold text-[var(--color-foreground)]">{title}</h3>
        {description ? <p className={cn(layout.caption, 'mt-0.5')}>{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

export function IssueFormCard({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
      <header className="flex items-start gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]/25 px-3 py-2.5">
        <span className="mt-1 h-3.5 w-0.5 shrink-0 rounded-full bg-[var(--color-accent)]" aria-hidden />
        <div className="min-w-0">
          <h3 className="text-xs font-semibold text-[var(--color-foreground)]">{title}</h3>
          {description ? <p className={cn(layout.caption, 'mt-0.5')}>{description}</p> : null}
        </div>
      </header>
      <div className="p-3">{children}</div>
      {footer ? (
        <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface-muted)]/15 px-3 py-2">
          {footer}
        </footer>
      ) : null}
    </section>
  )
}

const STATUS_BADGE_CLASS: Partial<Record<TicketStatus, string>> = {
  draft: 'bg-[var(--color-surface-muted)] text-[var(--color-muted)]',
  requested: 'bg-amber-500/10 text-amber-700',
  issued: 'bg-emerald-500/10 text-emerald-700',
  void: 'bg-red-500/10 text-red-700',
  refunded: 'bg-sky-500/10 text-sky-700',
  partially_refunded: 'bg-sky-500/10 text-sky-700',
  reissued: 'bg-violet-500/10 text-violet-700',
  exchanged: 'bg-violet-500/10 text-violet-700',
  cancelled: 'bg-red-500/10 text-red-700',
}

export function OperationTicketSummary({ ticket }: { ticket: FlightTicket }) {
  const route = ticket.route.trim() || '—'
  const meta = [ticket.pnr && `PNR ${ticket.pnr}`, ticket.airline, ticket.cabinClass].filter(Boolean).join(' · ')

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]/30 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--color-foreground)]">{route}</p>
          {meta ? <p className={cn(layout.caption, 'mt-0.5 truncate')}>{meta}</p> : null}
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
            STATUS_BADGE_CLASS[ticket.status] ?? STATUS_BADGE_CLASS.draft,
          )}
        >
          {TICKET_STATUS_LABELS[ticket.status]}
        </span>
      </div>
    </div>
  )
}

export function FormField({
  label,
  children,
  hint,
  className,
}: {
  label: string
  children: React.ReactNode
  hint?: string
  className?: string
}) {
  return (
    <label className={cn('block', className)}>
      <FieldHeader
        label={label}
        hint={hint}
        labelClassName={cn(layout.caption, 'mb-0.5 font-medium text-[var(--color-foreground)]')}
      />
      {children}
    </label>
  )
}

export function MoneyInput({
  label,
  value,
  onChange,
  currency,
  highlight,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  currency: string
  highlight?: boolean
}) {
  return (
    <FormField label={label}>
      <div
        className={cn(
          'flex h-8 items-center overflow-hidden rounded-[var(--radius-md)] border bg-[var(--color-surface)] transition-colors focus-within:border-[var(--color-accent)] focus-within:ring-2 focus-within:ring-[var(--color-accent)]/20',
          highlight ? 'border-[var(--color-accent)]/40' : 'border-[var(--color-border)]',
        )}
      >
        <span className="shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface-muted)]/40 px-2.5 text-[11px] font-medium text-[var(--color-muted)]">
          {currency}
        </span>
        <AmountInput
          value={value}
          onChange={onChange}
          size="sm"
          className="h-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-2.5 shadow-none focus:ring-0"
        />
      </div>
    </FormField>
  )
}

export function ImpactPreview({
  title = 'Financial impact',
  rows,
  footer,
}: {
  title?: string
  rows: { label: string; value: number; currency: string; tone?: 'positive' | 'negative' | 'neutral' }[]
  footer?: { label: string; value: number; currency: string; tone?: 'positive' | 'negative' | 'neutral' }
}) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]">
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]/40 px-3 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">{title}</p>
      </div>
      <dl className="divide-y divide-[var(--color-border)]">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3 px-3 py-2 text-xs">
            <dt className="text-[var(--color-muted)]">{row.label}</dt>
            <dd
              className={cn(
                'font-medium tabular-nums',
                row.tone === 'positive' && 'text-emerald-600',
                row.tone === 'negative' && 'text-red-600',
              )}
            >
              <span className="text-[10px] font-normal text-[var(--color-subtle)]">{row.currency}</span>{' '}
              {formatAccountingAmount(row.value)}
            </dd>
          </div>
        ))}
      </dl>
      {footer ? (
        <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border)] bg-[var(--color-surface-muted)]/20 px-3 py-2.5 text-xs">
          <dt className="font-semibold text-[var(--color-foreground)]">{footer.label}</dt>
          <dd
            className={cn(
              'text-sm font-semibold tabular-nums',
              footer.tone === 'positive' && 'text-emerald-600',
              footer.tone === 'negative' && 'text-red-600',
            )}
          >
            <span className="text-[10px] font-normal text-[var(--color-subtle)]">{footer.currency}</span>{' '}
            {formatAccountingAmount(footer.value)}
          </dd>
        </div>
      ) : null}
    </div>
  )
}

export function useOperationForm<T extends object>(initial: T, resetKey?: string) {
  const [values, setValues] = useState(initial)
  useEffect(() => {
    setValues(initial)
  }, [resetKey])
  const set = <K extends keyof T>(key: K, value: T[K]) => setValues((v) => ({ ...v, [key]: value }))
  return { values, set, setValues }
}
