import { useState, type ReactNode } from 'react'
import { ChevronDown, Plane } from 'lucide-react'
import {
  AGENCY_GDS_SUPPLIER_ID,
  AGENCY_GDS_SUPPLIER_NAME,
  TICKET_FULFILLMENT_LABELS,
  TICKET_STATUS_LABELS,
  type FlightTicket,
  type TicketFulfillmentSource,
} from '@/domain/flight/types'
import { roundCurrency } from '@/domain/currency'
import { AmountInput } from '@/design-system/components/AmountInput'
import { FieldHeader } from '@/design-system/components/FieldLabel'
import { Input, INPUT_FIELD_TEXT_CLASS } from '@/design-system/components/Input'
import {
  crmPanelClassName,
  crmPanelHeaderClassName,
  crmPanelTitleClassName,
} from '@/design-system/layout/CrmPanel'
import { layout } from '@/design-system/tokens/layout'
import { formatAccountingAmount } from '@/features/trips/utils/format'
import { cn } from '@/shared/utils/cn'

export type PricingValueMode = 'amount' | 'percent'

export type SnapshotTone = 'default' | 'cost' | 'income' | 'credit' | 'debit' | 'discount'

export type WaterfallLine = {
  id: string
  label: string
  amount: number
  tone: SnapshotTone
  signed?: boolean
  showLoss?: boolean
  kind: 'step' | 'total'
}

export const clientChargeControlHeightClassName = 'h-8'

export const formFieldPrefixClassName =
  'flex h-full shrink-0 items-center border-r border-[var(--color-border)] bg-[var(--color-surface-muted)]/40 px-2 font-[family-name:var(--font-sans)] text-[11px] font-medium tracking-wide text-[var(--color-muted)]'

export const formInputClassName =
  `h-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-2.5 shadow-none focus:ring-0 ${INPUT_FIELD_TEXT_CLASS}`

export const formInputMonoClassName = 'font-mono tracking-wide uppercase'

export const formInputAmountClassName = 'font-mono tabular-nums leading-tight text-right'

export const compositeFieldClassName = `relative flex ${clientChargeControlHeightClassName} items-center overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors focus-within:border-[var(--color-accent)] focus-within:ring-2 focus-within:ring-[var(--color-accent)]/20`

export const snapshotAmountRailClassName = 'w-[8.75rem] max-w-[8.75rem] shrink-0 text-right'
export const snapshotRowGridClassName = 'grid grid-cols-[minmax(0,1fr)_8.75rem] items-center gap-x-2'
export const snapshotPanelAsideClassName =
  'relative z-10 flex w-full shrink-0 flex-col border-t border-[var(--color-border)] bg-[var(--color-bg)] lg:sticky lg:top-0 lg:h-full lg:max-h-full lg:w-[21rem] lg:self-start lg:border-l lg:border-t-0 xl:w-[22rem]'

const snapshotCurrencyClassName =
  'block font-mono text-[10px] font-medium uppercase leading-none tracking-wide text-[var(--color-muted)]'

const snapshotToneClassName: Record<SnapshotTone, string> = {
  default: 'text-[var(--color-foreground)]',
  cost: 'text-[var(--color-warning)]',
  income: 'text-[var(--color-accent)]',
  credit: 'text-[var(--color-success)]',
  debit: 'text-[var(--color-danger)]',
  discount: 'text-[var(--color-warning)]',
}

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-[var(--color-surface-muted)] text-[var(--color-muted)] ring-[var(--color-border)]',
  requested: 'bg-[var(--color-warning-muted)] text-[var(--color-warning)] ring-[var(--color-warning)]/20',
  issued: 'bg-[var(--color-success-muted)] text-[var(--color-success)] ring-[var(--color-success)]/20',
  reissued: 'bg-violet-500/10 text-violet-700 ring-violet-500/20',
}

const STATUS_DOT: Record<string, string> = {
  draft: 'bg-[var(--color-muted)]',
  requested: 'bg-[var(--color-warning)]',
  issued: 'bg-[var(--color-success)]',
  reissued: 'bg-violet-600',
}

export function inferFulfillmentSource(ticket: FlightTicket): TicketFulfillmentSource {
  if (ticket.supplierId === AGENCY_GDS_SUPPLIER_ID) return 'gds'
  if (ticket.supplierName?.trim() === AGENCY_GDS_SUPPLIER_NAME) return 'gds'
  if (ticket.supplierId || ticket.supplierName?.trim()) return 'external_supplier'
  return 'gds'
}

export function inferRatePercent(base: number, amount: number): number {
  if (base <= 0 || amount <= 0) return 0
  return roundCurrency((amount / base) * 100)
}

export function computeAmountFromRate(base: number, ratePercent: number): number {
  if (base <= 0 || ratePercent <= 0) return 0
  return roundCurrency((base * ratePercent) / 100)
}

export function formatSnapshotAmount(amount: number, signed?: boolean): string {
  if (amount === 0) return '—'

  const core = formatAccountingAmount(amount, { negativeStyle: 'minus' })
  if (signed && amount > 0 && !core.startsWith('−')) {
    return `+${core}`
  }

  return core
}

export function OperationWorksheetSection({
  idPrefix,
  step,
  title,
  children,
  defaultExpanded = true,
}: {
  idPrefix: string
  step: string
  title: string
  children: ReactNode
  defaultExpanded?: boolean
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const panelId = `${idPrefix}-worksheet-section-${step}`

  return (
    <section className="border-b border-[var(--color-border)] last:border-b-0">
      <button
        type="button"
        id={`${panelId}-header`}
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((open) => !open)}
        className="flex w-full items-center gap-2.5 border-b border-[var(--color-border)] border-l-[3px] border-l-[var(--color-accent)] bg-[var(--color-surface-muted)]/40 px-4 py-2.5 text-left transition-colors hover:bg-[var(--color-surface-muted)]/60"
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-[10px] font-bold tabular-nums text-white">
          {step}
        </span>
        <h3 className="min-w-0 flex-1 text-xs font-semibold tracking-wide text-[var(--color-foreground)]">{title}</h3>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-[var(--color-muted)] transition-transform duration-200',
            expanded && 'rotate-180',
          )}
          aria-hidden
        />
      </button>
      {expanded ? (
        <div id={panelId} className="px-4 py-3.5" role="region" aria-labelledby={`${panelId}-header`}>
          {children}
        </div>
      ) : null}
    </section>
  )
}

export function OperationFieldCompact({
  label,
  hint,
  children,
  className,
  labelClassName,
}: {
  label: string
  hint?: string
  children: ReactNode
  className?: string
  labelClassName?: string
}) {
  return (
    <label className={cn('block min-w-0', className)}>
      <FieldHeader
        label={label}
        hint={hint}
        title={label}
        labelClassName={cn(layout.caption, 'mb-0.5 font-medium text-[var(--color-foreground)]', labelClassName)}
      />
      {children}
    </label>
  )
}

export function OperationPricingGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-muted)]/35 p-2.5 ring-1 ring-[var(--color-border)]/80">
      <p className={cn(layout.caption, 'mb-3 font-medium text-[var(--color-foreground)]')}>{label}</p>
      {children}
    </div>
  )
}

export type OperationCostEntryMode = 'inclusive' | 'exclusive'

export function OperationCostEntryModeField({
  question,
  value,
  onChange,
  hints,
}: {
  question: string
  value: OperationCostEntryMode
  onChange: (mode: OperationCostEntryMode) => void
  hints: Record<OperationCostEntryMode, string>
}) {
  return (
    <div className="mb-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <p className="text-[13px] font-medium text-[var(--color-foreground)]">{question}</p>
        <OperationYesNoToggle
          value={value === 'inclusive'}
          onChange={(yes) => onChange(yes ? 'inclusive' : 'exclusive')}
          ariaLabel={question}
        />
      </div>
      <p className={cn(layout.caption, 'mt-1.5 leading-snug')}>{hints[value]}</p>
    </div>
  )
}

export function OperationClientChargeSection({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="border-b border-[var(--color-border)]/80 bg-[var(--color-surface-muted)]/30 px-3 py-2">
        <p className="text-[12px] font-semibold tracking-wide text-[var(--color-foreground)]">
          Amount charged to the client
        </p>
      </div>
      <div className="p-3">{children}</div>
    </div>
  )
}

const clientChargeRowClassName =
  'grid grid-cols-[minmax(8.5rem,38%)_minmax(0,1fr)] items-center gap-x-3'

export function OperationClientChargeRow({
  label,
  children,
  prominent,
}: {
  label: string
  children: ReactNode
  prominent?: boolean
}) {
  return (
    <div className={clientChargeRowClassName}>
      <span
        className={cn(
          'text-[13px] font-medium leading-snug text-[var(--color-foreground)]',
          prominent && 'font-semibold',
        )}
      >
        {label}
      </span>
      <div className={cn('min-w-0', clientChargeControlHeightClassName)}>{children}</div>
    </div>
  )
}

export function OperationYesNoToggle({
  value,
  onChange,
  ariaLabel,
  yesDisabled,
}: {
  value: boolean
  onChange: (value: boolean) => void
  ariaLabel: string
  yesDisabled?: boolean
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex shrink-0 overflow-hidden rounded-[var(--radius-md)] ring-1 ring-[var(--color-border)]',
        clientChargeControlHeightClassName,
      )}
    >
      {(
        [
          { enabled: true, label: 'Yes' },
          { enabled: false, label: 'No' },
        ] as const
      ).map(({ enabled, label }) => {
        const active = value === enabled
        const disabled = enabled && yesDisabled
        return (
          <button
            key={label}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(enabled)}
            className={cn(
              'min-w-[2.25rem] px-2.5 text-[11px] font-semibold transition-colors',
              active
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-[var(--color-surface)] text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)]/60 hover:text-[var(--color-foreground)]',
              disabled && 'cursor-not-allowed opacity-40 hover:bg-[var(--color-surface)] hover:text-[var(--color-muted)]',
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

export function OperationModeAmountInput({
  mode,
  onModeChange,
  currency,
  amount,
  ratePercent,
  onAmountChange,
  onRateChange,
  className,
  invalid,
  highlight,
  allowNegative,
  amountToggleTitle = 'Enter as percentage',
  percentToggleTitle = 'Enter as amount',
  amountToggleAriaLabel = 'Switch entry to percentage',
  percentToggleAriaLabel = 'Switch entry to amount',
}: {
  mode: PricingValueMode
  onModeChange: (mode: PricingValueMode) => void
  currency: string
  amount: number
  ratePercent: number
  onAmountChange: (value: number) => void
  onRateChange: (value: number) => void
  className?: string
  invalid?: boolean
  highlight?: boolean
  allowNegative?: boolean
  amountToggleTitle?: string
  percentToggleTitle?: string
  amountToggleAriaLabel?: string
  percentToggleAriaLabel?: string
}) {
  return (
    <div
      title={invalid ? 'Value is required and must be greater than zero.' : undefined}
      className={cn(
        compositeFieldClassName,
        highlight && 'border-[var(--color-accent)]/35 bg-[var(--color-accent-muted)]/10',
        invalid && 'border-amber-500/50 focus-within:ring-amber-500/20',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onModeChange(mode === 'amount' ? 'percent' : 'amount')}
        title={mode === 'amount' ? amountToggleTitle : percentToggleTitle}
        aria-label={mode === 'amount' ? amountToggleAriaLabel : percentToggleAriaLabel}
        className={cn(
          formFieldPrefixClassName,
          'min-w-[2.75rem] cursor-pointer justify-center font-mono text-[11px] font-semibold text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-surface-muted)]/70',
        )}
      >
        {mode === 'amount' ? currency : '%'}
      </button>
      {mode === 'amount' ? (
        <AmountInput
          value={amount}
          onChange={onAmountChange}
          allowNegative={allowNegative}
          size="sm"
          aria-invalid={invalid}
          className={cn(
            formInputClassName,
            formInputAmountClassName,
            highlight && 'text-[14px] font-semibold',
          )}
        />
      ) : (
        <AmountInput
          value={ratePercent}
          onChange={onRateChange}
          decimals={4}
          size="sm"
          aria-invalid={invalid}
          className={cn(formInputClassName, formInputAmountClassName)}
        />
      )}
    </div>
  )
}

export function OperationClientAmountQuestionRow({
  question,
  ariaLabel,
  amountName,
  enabled,
  onEnabledChange,
  mode,
  onModeChange,
  value,
  ratePercent,
  onValueChange,
  onRateChange,
  currency,
  prominent,
  invalid,
  yesDisabled,
  allowNegative,
}: {
  question: string
  ariaLabel: string
  amountName: string
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  mode: PricingValueMode
  onModeChange: (mode: PricingValueMode) => void
  value: number
  ratePercent: number
  onValueChange: (value: number) => void
  onRateChange: (value: number) => void
  currency: string
  prominent?: boolean
  invalid?: boolean
  yesDisabled?: boolean
  allowNegative?: boolean
}) {
  return (
    <OperationClientChargeRow label={question} prominent={prominent}>
      <div className={cn('flex min-w-0 items-stretch gap-2', clientChargeControlHeightClassName)}>
        <OperationYesNoToggle
          value={enabled}
          onChange={onEnabledChange}
          ariaLabel={ariaLabel}
          yesDisabled={yesDisabled}
        />
        {enabled ? (
          <OperationModeAmountInput
            className="min-h-0 min-w-0 flex-1 self-stretch"
            mode={mode}
            onModeChange={onModeChange}
            currency={currency}
            amount={value}
            ratePercent={ratePercent}
            onAmountChange={onValueChange}
            onRateChange={onRateChange}
            highlight={prominent}
            invalid={invalid}
            allowNegative={allowNegative}
            amountToggleTitle={`Enter ${amountName.toLowerCase()} as percentage`}
            percentToggleTitle={`Enter ${amountName.toLowerCase()} as amount`}
            amountToggleAriaLabel={`Switch ${amountName.toLowerCase()} entry to percentage`}
            percentToggleAriaLabel={`Switch ${amountName.toLowerCase()} entry to amount`}
          />
        ) : null}
      </div>
    </OperationClientChargeRow>
  )
}

/** Yes/No amount row for cost worksheet groups. */
export const OperationCostAmountQuestionRow = OperationClientAmountQuestionRow

export function OperationCostGridQuestionField({
  question,
  ariaLabel,
  amountName,
  enabled,
  onEnabledChange,
  mode,
  onModeChange,
  value,
  ratePercent,
  onValueChange,
  onRateChange,
  currency,
}: {
  question: string
  ariaLabel: string
  amountName: string
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  mode: PricingValueMode
  onModeChange: (mode: PricingValueMode) => void
  value: number
  ratePercent: number
  onValueChange: (value: number) => void
  onRateChange: (value: number) => void
  currency: string
}) {
  return (
    <div className="min-w-0">
      <span className={cn(layout.caption, 'mb-1 block font-medium text-[var(--color-foreground)]')}>{question}</span>
      <div className={cn('flex min-w-0 items-stretch gap-2', clientChargeControlHeightClassName)}>
        <OperationYesNoToggle value={enabled} onChange={onEnabledChange} ariaLabel={ariaLabel} />
        {enabled ? (
          <OperationModeAmountInput
            className="min-h-0 min-w-0 flex-1 self-stretch"
            mode={mode}
            onModeChange={onModeChange}
            currency={currency}
            amount={value}
            ratePercent={ratePercent}
            onAmountChange={onValueChange}
            onRateChange={onRateChange}
            amountToggleTitle={`Enter ${amountName.toLowerCase()} as percentage`}
            percentToggleTitle={`Enter ${amountName.toLowerCase()} as amount`}
            amountToggleAriaLabel={`Switch ${amountName.toLowerCase()} entry to percentage`}
            percentToggleAriaLabel={`Switch ${amountName.toLowerCase()} entry to amount`}
          />
        ) : null}
      </div>
    </div>
  )
}

export function OperationMoneyFieldCompact({
  label,
  value,
  onChange,
  currency,
  highlight,
  allowNegative,
  disabled,
  labelClassName,
  className,
}: {
  label: string
  value: number
  onChange?: (value: number) => void
  currency: string
  highlight?: boolean
  allowNegative?: boolean
  disabled?: boolean
  labelClassName?: string
  className?: string
}) {
  return (
    <OperationFieldCompact label={label} labelClassName={labelClassName} className={className}>
      <div
        className={cn(
          compositeFieldClassName,
          highlight && 'border-[var(--color-accent)]/40',
          disabled && 'bg-[var(--color-surface-muted)]/25',
        )}
      >
        <span
          className={cn(
            formFieldPrefixClassName,
            'font-mono text-[11px] font-semibold text-[var(--color-foreground)]',
          )}
        >
          {currency}
        </span>
        <AmountInput
          value={value}
          onChange={(next) => onChange?.(next)}
          allowNegative={allowNegative}
          disabled={disabled}
          size="sm"
          className={cn(
            formInputClassName,
            formInputAmountClassName,
            highlight && 'font-semibold',
            disabled && 'cursor-default opacity-80',
          )}
        />
      </div>
    </OperationFieldCompact>
  )
}

export function OperationTicketNumberField({
  value,
  onChange,
  readOnly,
  invalid,
  placeholder,
}: {
  value: string
  onChange?: (value: string) => void
  readOnly?: boolean
  invalid?: boolean
  placeholder?: string
}) {
  return (
    <div className={cn(compositeFieldClassName, invalid && 'border-amber-500/50 focus-within:ring-amber-500/20')}>
      <span className={formFieldPrefixClassName}>No.</span>
      <Input
        size="sm"
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        aria-invalid={invalid}
        className={cn(
          formInputClassName,
          formInputMonoClassName,
          readOnly && 'cursor-default opacity-80',
        )}
      />
    </div>
  )
}

function RibbonInline({
  label,
  children,
  align = 'start',
  className,
}: {
  label: string
  children: ReactNode
  align?: 'start' | 'end'
  className?: string
}) {
  return (
    <div className={cn('flex min-w-0 items-center gap-1.5', align === 'end' && 'justify-end', className)}>
      <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted)]">
        {label}
      </span>
      {children}
    </div>
  )
}

export function OperationTicketRibbon({
  ticket,
  origin,
  destination,
  fulfillmentSource,
  supplierName,
}: {
  ticket: FlightTicket
  origin: string
  destination: string
  fulfillmentSource?: TicketFulfillmentSource
  supplierName?: string
}) {
  const source = fulfillmentSource ?? inferFulfillmentSource(ticket)
  const viaLabel =
    source === 'gds'
      ? TICKET_FULFILLMENT_LABELS.gds
      : (supplierName?.trim() || ticket.supplierName?.trim() || '')
  const metaTags = [ticket.airline, ticket.cabinClass].filter(Boolean)
  const serviceLine = [...metaTags, viaLabel ? `via ${viaLabel}` : ''].filter(Boolean).join(' · ')

  return (
    <header className="shrink-0 border-b border-[var(--color-border)] bg-[var(--color-bg)]/40 px-2 py-1.5">
      <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-2">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-2.5 gap-y-1">
          <RibbonInline label="Status" className="sm:border-r sm:border-[var(--color-border)]/70 sm:pr-3">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset',
                STATUS_BADGE[ticket.status] ?? STATUS_BADGE.draft,
              )}
            >
              <span
                className={cn('h-1 w-1 shrink-0 rounded-full', STATUS_DOT[ticket.status] ?? STATUS_DOT.draft)}
                aria-hidden
              />
              {TICKET_STATUS_LABELS[ticket.status]}
            </span>
          </RibbonInline>

          <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 px-0.5 sm:px-3">
            <span className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] px-2 py-0.5 font-mono text-base font-bold tabular-nums leading-none text-[var(--color-foreground)] ring-1 ring-[var(--color-border)]/80">
              {origin}
            </span>
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[var(--color-accent)]/20 bg-[var(--color-surface)]"
              aria-hidden
            >
              <Plane className="h-2.5 w-2.5 text-[var(--color-accent)]" />
            </span>
            <span className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] px-2 py-0.5 font-mono text-base font-bold tabular-nums leading-none text-[var(--color-foreground)] ring-1 ring-[var(--color-border)]/80">
              {destination}
            </span>
            {serviceLine ? (
              <span className={cn(layout.caption, 'basis-full truncate text-center text-[10px] sm:basis-auto sm:max-w-[12rem]')}>
                {serviceLine}
              </span>
            ) : null}
          </div>

          <div className="flex min-w-0 justify-end sm:border-l sm:border-[var(--color-border)]/70 sm:pl-3">
            <div
              className="flex h-7 max-w-full items-center overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]"
              title={ticket.pnr ? `PNR ${ticket.pnr.toUpperCase()}` : undefined}
            >
              <span className="flex h-full shrink-0 items-center border-r border-[var(--color-border)] bg-[var(--color-surface-muted)]/40 px-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                PNR
              </span>
              <span
                className={cn(
                  'min-w-[4.5rem] truncate px-2.5 font-mono text-xs font-semibold uppercase tracking-[0.12em] tabular-nums',
                  ticket.pnr ? 'text-[var(--color-foreground)]' : 'text-[var(--color-muted)]',
                )}
              >
                {ticket.pnr ? ticket.pnr.toUpperCase() : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export function OperationSnapshotAmount({
  currency,
  amount,
  tone = 'default',
  size = 'md',
  signed,
}: {
  currency: string
  amount: number
  tone?: SnapshotTone
  size?: 'md' | 'metric' | 'lg'
  signed?: boolean
}) {
  const amountClassName =
    size === 'lg'
      ? 'text-[1.125rem] font-bold leading-tight'
      : size === 'metric'
        ? 'text-base font-bold leading-tight'
        : 'text-[13px] font-semibold leading-tight'

  return (
    <div className={snapshotAmountRailClassName}>
      <span className={snapshotCurrencyClassName}>{currency}</span>
      <span
        className={cn(
          'mt-0.5 block overflow-hidden text-ellipsis whitespace-nowrap font-mono tabular-nums',
          amountClassName,
          snapshotToneClassName[tone],
        )}
        title={formatSnapshotAmount(amount, signed)}
      >
        {formatSnapshotAmount(amount, signed)}
      </span>
    </div>
  )
}

function SnapshotFlowMetric({
  title,
  hint,
  amount,
  currency,
  tone,
  direction,
}: {
  title: string
  hint: string
  amount: number
  currency: string
  tone: SnapshotTone
  direction: 'out' | 'in'
}) {
  const directionLabel = direction === 'out' ? 'Out' : 'In'
  const isOut = direction === 'out'

  return (
    <div
      className={cn(
        'flex min-h-[6.5rem] min-w-0 flex-col justify-between p-3',
        isOut ? 'bg-[var(--color-warning-muted)]/25' : 'bg-[var(--color-accent-muted)]/20',
      )}
      title={hint}
    >
      <div className="min-w-0">
        <span
          className={cn(
            'inline-block text-[9px] font-bold uppercase tracking-[0.14em]',
            isOut ? 'text-[var(--color-warning)]' : 'text-[var(--color-accent)]',
          )}
        >
          {directionLabel}
        </span>
        <p className="mt-1 truncate text-[13px] font-semibold leading-snug text-[var(--color-foreground)]">{title}</p>
      </div>
      <div className="mt-3 min-w-0 text-right">
        <span className={snapshotCurrencyClassName}>{currency}</span>
        <p
          className={cn(
            'mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[1.125rem] font-bold leading-none tabular-nums',
            snapshotToneClassName[tone],
          )}
        >
          {formatSnapshotAmount(amount)}
        </p>
      </div>
    </div>
  )
}

export function OperationSnapshotFlowMetrics({
  currency,
  outAmount,
  outTitle,
  outHint,
  inAmount,
  inTitle,
  inHint,
}: {
  currency: string
  outAmount: number
  outTitle: string
  outHint: string
  inAmount: number
  inTitle: string
  inHint: string
}) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]/90 bg-[var(--color-surface)]">
      <div className="grid grid-cols-2 divide-x divide-[var(--color-border)]/70">
        <SnapshotFlowMetric
          direction="out"
          title={outTitle}
          hint={outHint}
          amount={outAmount}
          currency={currency}
          tone="cost"
        />
        <SnapshotFlowMetric
          direction="in"
          title={inTitle}
          hint={inHint}
          amount={inAmount}
          currency={currency}
          tone="income"
        />
      </div>
    </div>
  )
}

export function OperationSnapshotLossTag() {
  return (
    <span className="ml-1.5 inline-flex rounded-[var(--radius-sm)] bg-[var(--color-danger-muted)] px-1 py-px text-[9px] font-bold uppercase tracking-wide text-[var(--color-danger)]">
      Loss
    </span>
  )
}

export function OperationSnapshotWaterfall({
  currency,
  lines,
  open,
  onToggle,
  title = 'Profit build-up',
}: {
  currency: string
  lines: WaterfallLine[]
  open: boolean
  onToggle: () => void
  title?: string
}) {
  const stepLines = lines.filter((line) => line.kind === 'step')

  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]/90 bg-[var(--color-surface)]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 border-b border-[var(--color-border)]/80 bg-[var(--color-surface-muted)]/40 px-3 py-2 text-left transition-colors hover:bg-[var(--color-surface-muted)]/70"
      >
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-foreground)]">{title}</p>
          <p className={cn(layout.caption, 'mt-0.5')}>
            {stepLines.length > 0 ? `${stepLines.length} adjustment${stepLines.length === 1 ? '' : 's'}` : 'No adjustments'}
          </p>
        </div>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-[var(--color-muted)] transition-transform duration-200', open && 'rotate-180')}
          aria-hidden
        />
      </button>
      {open ? (
        <div className="divide-y divide-[var(--color-border)]/60">
          {lines.map((line) => (
            <div
              key={line.id}
              className={cn(
                snapshotRowGridClassName,
                'px-3 py-2',
                line.kind === 'total' && 'bg-[var(--color-surface-muted)]/45',
              )}
            >
              <span
                className={cn(
                  'min-w-0 text-[11px] font-medium',
                  line.kind === 'total'
                    ? 'font-semibold uppercase tracking-[0.08em] text-[var(--color-foreground)]'
                    : 'text-[var(--color-foreground)]',
                )}
              >
                {line.label}
                {line.showLoss ? <OperationSnapshotLossTag /> : null}
              </span>
              <OperationSnapshotAmount
                currency={currency}
                amount={line.amount}
                tone={line.tone}
                signed={line.signed}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function OperationSnapshotPanel({
  title,
  subtitle,
  currency,
  previewReady,
  emptyTitle,
  emptyDescription,
  children,
}: {
  title: string
  subtitle: string
  currency: string
  previewReady: boolean
  emptyTitle: string
  emptyDescription: string
  children: ReactNode
}) {
  return (
    <aside className={snapshotPanelAsideClassName}>
      <div className="flex min-h-0 flex-1 flex-col p-2.5">
        <section className={cn(crmPanelClassName, 'flex min-h-0 flex-1 flex-col contain-layout min-w-[19rem] shadow-[var(--shadow-card)]')}>
          <header className={cn(crmPanelHeaderClassName, 'shrink-0 justify-between')}>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="h-4 w-0.5 shrink-0 rounded-full bg-[var(--color-accent)]" aria-hidden />
                <h2 className={crmPanelTitleClassName}>{title}</h2>
              </div>
              <p className={cn(layout.caption, 'mt-0.5 pl-3.5')}>{subtitle}</p>
            </div>
            <span className="shrink-0 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              {currency}
            </span>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {!previewReady ? (
              <div className="px-4 py-8 text-center">
                <p className="text-[13px] font-medium text-[var(--color-foreground)]">{emptyTitle}</p>
                <p className={cn(layout.caption, 'mt-1 leading-relaxed')}>{emptyDescription}</p>
              </div>
            ) : (
              <div className="space-y-2.5 p-2.5">{children}</div>
            )}
          </div>
        </section>
      </div>
    </aside>
  )
}

export const operationFormShellClassName = 'flex min-h-0 flex-1 flex-col overflow-hidden'
export const operationWorksheetPaneClassName =
  'relative z-0 min-h-0 min-w-0 overflow-x-hidden overflow-y-auto overscroll-y-contain bg-[var(--color-bg)]/40 p-2.5 [-webkit-overflow-scrolling:touch] lg:w-[32rem] lg:shrink-0 lg:border-r lg:border-[var(--color-border)]'
export const operationWorksheetCardClassName =
  'overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]'
