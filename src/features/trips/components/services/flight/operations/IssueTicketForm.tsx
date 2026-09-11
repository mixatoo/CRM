import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ChevronDown, Plane } from 'lucide-react'
import type { FlightTicket, IssueTransactionData, TicketFulfillmentSource } from '@/domain/flight/types'
import {
  AGENCY_GDS_SUPPLIER_ID,
  AGENCY_GDS_SUPPLIER_NAME,
  FLIGHT_EXTERNAL_SUPPLIER_OPTIONS,
  TICKET_FULFILLMENT_LABELS,
  TICKET_STATUS_LABELS,
} from '@/domain/flight/types'
import { computeIssuePreview } from '@/domain/flight/ticket'
import { buildIssueResultSummary, type IssueResultSummary } from '@/domain/flight/financial'
import {
  BASE_CURRENCY,
  convertToBaseCurrency,
  isBaseCurrency,
  normalizeExchangeRate,
  roundCurrency,
} from '@/domain/currency'
import { Input, INPUT_FIELD_TEXT_CLASS } from '@/design-system/components/Input'
import { FormPicklist } from '@/design-system/components/FormPicklist'
import { FieldHeader } from '@/design-system/components/FieldLabel'
import { NotesTextarea } from '@/design-system/components/NotesField'
import { AmountInput } from '@/design-system/components/AmountInput'
import { cn } from '@/shared/utils/cn'
import { layout } from '@/design-system/tokens/layout'
import {
  CurrencySelect,
  useOperationForm,
} from '@/features/trips/components/services/flight/operations/OperationFormFields'
import { EmbeddedFormDatePicker } from '@/design-system/components/DatePickerField'
import {
  crmPanelClassName,
  crmPanelHeaderClassName,
  crmPanelTitleClassName,
} from '@/design-system/layout/CrmPanel'

interface IssueTicketFormProps {
  ticket: FlightTicket
  seed?: IssueTransactionData
  onSubmit: (data: IssueTransactionData) => void
  onValidityChange?: (valid: boolean) => void
}

function inferFulfillmentSource(ticket: FlightTicket): TicketFulfillmentSource {
  if (ticket.supplierId === AGENCY_GDS_SUPPLIER_ID) return 'gds'
  if (ticket.supplierName?.trim() === AGENCY_GDS_SUPPLIER_NAME) return 'gds'
  if (ticket.supplierId || ticket.supplierName?.trim()) return 'external_supplier'
  return 'gds'
}

function buildIssueFormValues(ticket: FlightTicket): IssueTransactionData {
  const today = new Date().toISOString().slice(0, 10)
  const pricing = ticket.pricing
  const fulfillmentSource = inferFulfillmentSource(ticket)

  return {
    issueDate: ticket.issueDate ?? today,
    ticketNumber: ticket.ticketNumber || '',
    notes: '',
    currency: pricing.currency || BASE_CURRENCY,
    exchangeRate: normalizeExchangeRate(pricing.currency, pricing.exchangeRate),
    fulfillmentSource,
    supplierId:
      ticket.supplierId ?? (fulfillmentSource === 'gds' ? AGENCY_GDS_SUPPLIER_ID : ''),
    supplierName:
      ticket.supplierName ?? (fulfillmentSource === 'gds' ? AGENCY_GDS_SUPPLIER_NAME : ''),
    fare: pricing.fare,
    taxes: pricing.taxes,
    airlineFees: 0,
    supplierFees: fulfillmentSource === 'gds' ? 0 : pricing.supplierFees,
    agencyServiceFees: pricing.agencyServiceFees,
    commission: pricing.commission ?? 0,
    clientDiscount: pricing.clientDiscount ?? 0,
    sellingPrice: pricing.sellingPrice,
  }
}

export function parseIssueRoute(ticket: FlightTicket): [string, string] {
  const route = ticket.route.trim()
  if (route.includes('→')) {
    const parts = route.split('→').map((p) => p.trim()).filter(Boolean)
    if (parts.length >= 2) return [parts[0].toUpperCase(), parts[parts.length - 1].toUpperCase()]
  }
  const spaced = route.match(/^([A-Za-z]{3})\s+([A-Za-z]{3})$/)
  if (spaced) return [spaced[1].toUpperCase(), spaced[2].toUpperCase()]
  if (/^[A-Za-z]{3}\s*[-/]\s*[A-Za-z]{3}$/.test(route)) {
    const parts = route.split(/[-/]/).map((p) => p.trim()).filter(Boolean)
    if (parts.length >= 2) return [parts[0].toUpperCase(), parts[parts.length - 1].toUpperCase()]
  }
  const compact = route.replace(/\s/g, '')
  if (/^[A-Za-z]{6}$/i.test(compact)) {
    return [compact.slice(0, 3).toUpperCase(), compact.slice(3, 6).toUpperCase()]
  }
  const first = ticket.segments[0]
  const last = ticket.segments[ticket.segments.length - 1]
  const origin = first?.departureAirport.trim()
  const destination = last?.arrivalAirport.trim()
  if (origin && destination) return [origin.toUpperCase(), destination.toUpperCase()]
  return [route || '—', '—']
}

type SupplierCostTaxMode = 'inclusive' | 'exclusive'

function inferSupplierCostTaxMode(pricing: FlightTicket['pricing']): SupplierCostTaxMode {
  if (pricing.taxes > 0) return 'exclusive'
  return 'inclusive'
}

const SUPPLIER_COST_TAX_MODE_HINT: Record<SupplierCostTaxMode, string> = {
  inclusive: 'Enter the full airline amount in one field (taxes included).',
  exclusive: 'Split the amount into base fare and taxes.',
}

const TICKET_FULFILLMENT_HINT: Record<TicketFulfillmentSource, string> = {
  gds: 'Issued directly on your agency GDS.',
  external_supplier: 'Select the external trade desk or consolidator below.',
}

function SupplierCostTaxModeField({
  value,
  onChange,
}: {
  value: SupplierCostTaxMode
  onChange: (mode: SupplierCostTaxMode) => void
}) {
  return (
    <div className="mb-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <p className="text-[13px] font-medium text-[var(--color-foreground)]">Supplier cost includes taxes</p>
        <YesNoToggle
          value={value === 'inclusive'}
          onChange={(yes) => onChange(yes ? 'inclusive' : 'exclusive')}
          ariaLabel="Supplier cost includes taxes"
        />
      </div>
      <p className={cn(layout.caption, 'mt-1.5 leading-snug')}>{SUPPLIER_COST_TAX_MODE_HINT[value]}</p>
    </div>
  )
}

function normalizeIssuePricing(
  values: IssueTransactionData,
  supplierCostTaxMode: SupplierCostTaxMode,
): Pick<IssueTransactionData, 'fare' | 'taxes' | 'airlineFees'> {
  if (supplierCostTaxMode === 'inclusive') {
    return {
      fare: roundCurrency(values.fare + values.taxes),
      taxes: 0,
      airlineFees: 0,
    }
  }
  return {
    fare: values.fare,
    taxes: values.taxes,
    airlineFees: 0,
  }
}

type TaxEntryMode = 'amount' | 'percent'

type PricingValueMode = 'amount' | 'percent'

type MarkupEntryMode = 'amount' | 'percent'

function inferTaxRatePercent(fare: number, taxes: number): number {
  if (fare <= 0 || taxes <= 0) return 0
  return roundCurrency((taxes / fare) * 100)
}

function computeTaxFromRate(fare: number, ratePercent: number): number {
  if (fare <= 0 || ratePercent <= 0) return 0
  return roundCurrency((fare * ratePercent) / 100)
}

function inferRatePercent(base: number, amount: number): number {
  if (base <= 0 || amount <= 0) return 0
  return roundCurrency((amount / base) * 100)
}

function computeAmountFromRate(base: number, ratePercent: number): number {
  if (base <= 0 || ratePercent <= 0) return 0
  return roundCurrency((base * ratePercent) / 100)
}

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-[var(--color-surface-muted)] text-[var(--color-muted)] ring-[var(--color-border)]',
  requested: 'bg-[var(--color-warning-muted)] text-[var(--color-warning)] ring-[var(--color-warning)]/20',
  issued: 'bg-[var(--color-success-muted)] text-[var(--color-success)] ring-[var(--color-success)]/20',
}

const STATUS_DOT: Record<string, string> = {
  draft: 'bg-[var(--color-muted)]',
  requested: 'bg-[var(--color-warning)]',
  issued: 'bg-[var(--color-success)]',
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
    <div
      className={cn(
        'flex min-w-0 items-center gap-1.5',
        align === 'end' && 'justify-end',
        className,
      )}
    >
      <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted)]">
        {label}
      </span>
      {children}
    </div>
  )
}

function IssueTicketRibbon({
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
          <RibbonInline
            label="Status"
            className="sm:border-r sm:border-[var(--color-border)]/70 sm:pr-3"
          >
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

function WorksheetSection({
  step,
  title,
  children,
  defaultExpanded = true,
}: {
  step: string
  title: string
  children: ReactNode
  defaultExpanded?: boolean
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const panelId = `issue-worksheet-section-${step}`

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
        <h3 className="min-w-0 flex-1 text-xs font-semibold tracking-wide text-[var(--color-foreground)]">
          {title}
        </h3>
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

function FieldCompact({
  label,
  hint,
  children,
  className,
}: {
  label: string
  hint?: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={cn('block min-w-0', className)}>
      <FieldHeader
        label={label}
        hint={hint}
        labelClassName={cn(layout.caption, 'mb-0.5 font-medium text-[var(--color-foreground)]')}
      />
      {children}
    </label>
  )
}

function PricingGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-muted)]/35 p-2.5 ring-1 ring-[var(--color-border)]/80">
      <p className={cn(layout.caption, 'mb-3 font-medium text-[var(--color-foreground)]')}>{label}</p>
      {children}
    </div>
  )
}

const clientChargeControlHeightClassName = 'h-8'

function YesNoToggle({
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
            onClick={() => {
              if (disabled) return
              onChange(enabled)
            }}
            className={cn(
              'flex h-full min-w-[2.5rem] items-center justify-center px-2.5 text-[11px] font-semibold leading-none transition-colors',
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

function ClientChargeSection({ children }: { children: ReactNode }) {
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

function ClientChargeRow({
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

const formFieldPrefixClassName =
  'flex h-full shrink-0 items-center border-r border-[var(--color-border)] bg-[var(--color-surface-muted)]/40 px-2 font-[family-name:var(--font-sans)] text-[11px] font-medium tracking-wide text-[var(--color-muted)]'

const formInputClassName =
  `h-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-2.5 shadow-none focus:ring-0 ${INPUT_FIELD_TEXT_CLASS}`

const formInputMonoClassName = 'font-mono tracking-wide'

const formInputAmountClassName = 'font-mono tabular-nums leading-tight text-right'

const compositeFieldClassName =
  `relative flex ${clientChargeControlHeightClassName} items-center overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors focus-within:border-[var(--color-accent)] focus-within:ring-2 focus-within:ring-[var(--color-accent)]/20`

function ModeAmountInput({
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

function ExternalSupplierSelect({
  supplierId,
  supplierName,
  onChange,
  invalid,
}: {
  supplierId?: string
  supplierName?: string
  onChange: (id: string, name: string) => void
  invalid?: boolean
}) {
  const options = FLIGHT_EXTERNAL_SUPPLIER_OPTIONS
  const matched = options.find((o) => o.value && o.value === supplierId)
  const value = matched?.value ?? (supplierName?.trim() ? '__custom__' : '')

  const picklistOptions = useMemo(() => {
    const list = options.map((opt) => ({ value: opt.value || '', label: opt.label }))
    if (value === '__custom__' && supplierName) {
      return [...list, { value: '__custom__', label: supplierName }]
    }
    return list
  }, [options, value, supplierName])

  return (
    <div className={cn(compositeFieldClassName, invalid && 'border-amber-500/50 focus-within:ring-amber-500/20')}>
      <span className={formFieldPrefixClassName}>Supplier</span>
      <FormPicklist
        variant="ghost"
        value={value}
        onChange={(nextId) => {
          if (!nextId) {
            onChange('', '')
            return
          }
          if (nextId === '__custom__') return
          const opt = options.find((o) => o.value === nextId)
          onChange(nextId, opt?.label ?? '')
        }}
        options={picklistOptions}
        placeholder="Select supplier"
        panelTitle="External supplier"
        ariaLabel="External supplier"
        error={invalid}
        searchable
        searchPlaceholder="Search suppliers…"
        className="min-w-0 flex-1"
      />
    </div>
  )
}

function TicketFulfillmentField({
  value,
  onChange,
  supplierId,
  supplierName,
  onSupplierChange,
  supplierInvalid,
}: {
  value: TicketFulfillmentSource
  onChange: (source: TicketFulfillmentSource) => void
  supplierId?: string
  supplierName?: string
  onSupplierChange: (id: string, name: string) => void
  supplierInvalid?: boolean
}) {
  const isExternal = value === 'external_supplier'

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <p className="text-[13px] font-medium text-[var(--color-foreground)]">Ticket issued via</p>
        <div
          role="radiogroup"
          aria-label="Ticket issued via"
          className="inline-flex shrink-0 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]/30 p-0.5"
        >
          {(
            [
              { source: 'gds' as const, label: 'GDS' },
              { source: 'external_supplier' as const, label: 'External' },
            ] as const
          ).map(({ source, label }) => {
            const active = value === source
            return (
              <button
                key={source}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange(source)}
                className={cn(
                  'min-w-[4rem] rounded-[var(--radius-sm)] px-3 py-1 text-[11px] font-semibold transition-colors',
                  active
                    ? 'bg-[var(--color-surface)] text-[var(--color-foreground)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-[var(--color-border)]/80'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]',
                )}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>
      <p className={cn(layout.caption, 'mt-1.5 leading-snug')}>{TICKET_FULFILLMENT_HINT[value]}</p>
      {isExternal ? (
        <div className="mt-2.5 border-t border-[var(--color-border)]/80 pt-2.5">
          <ExternalSupplierSelect
            supplierId={supplierId}
            supplierName={supplierName}
            onChange={onSupplierChange}
            invalid={supplierInvalid}
          />
          {supplierInvalid ? (
            <p className={cn(layout.caption, 'mt-1 text-[var(--color-warning)]')}>Select the external supplier.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function TaxField({
  mode,
  onModeChange,
  fare,
  taxes,
  taxRatePercent,
  onTaxAmountChange,
  onTaxRateChange,
  currency,
}: {
  mode: TaxEntryMode
  onModeChange: (mode: TaxEntryMode) => void
  fare: number
  taxes: number
  taxRatePercent: number
  onTaxAmountChange: (value: number) => void
  onTaxRateChange: (value: number) => void
  currency: string
}) {
  const computedTax =
    mode === 'percent' && fare > 0 && taxRatePercent > 0
      ? computeTaxFromRate(fare, taxRatePercent)
      : null

  return (
    <FieldCompact label="Taxes">
      <div className={compositeFieldClassName}>
        <button
          type="button"
          onClick={() => onModeChange(mode === 'amount' ? 'percent' : 'amount')}
          title={mode === 'amount' ? 'Enter as percentage' : 'Enter as amount'}
          aria-label={mode === 'amount' ? 'Switch tax entry to percentage' : 'Switch tax entry to amount'}
          className={cn(
            formFieldPrefixClassName,
            'min-w-[2.75rem] cursor-pointer justify-center font-mono text-[11px] font-semibold text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-surface-muted)]/70',
          )}
        >
          {mode === 'amount' ? currency : '%'}
        </button>
        {mode === 'amount' ? (
          <AmountInput
            value={taxes}
            onChange={onTaxAmountChange}
            size="sm"
            className={cn(formInputClassName, formInputAmountClassName)}
          />
        ) : (
          <AmountInput
            value={taxRatePercent}
            onChange={onTaxRateChange}
            decimals={4}
            size="sm"
            className={cn(formInputClassName, formInputAmountClassName)}
          />
        )}
        {computedTax != null ? (
          <span
            className="shrink-0 border-l border-[var(--color-border)] bg-[var(--color-surface-muted)]/40 px-2 font-mono text-[10px] font-medium tabular-nums text-[var(--color-muted)]"
            title={`Tax amount: ${currency} ${formatAccountingAmount(computedTax)}`}
          >
            = {formatAccountingAmount(computedTax)}
          </span>
        ) : null}
      </div>
    </FieldCompact>
  )
}

function ClientAmountQuestionRow({
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
}) {
  return (
    <ClientChargeRow label={question} prominent={prominent}>
      <div className={cn('flex min-w-0 items-stretch gap-2', clientChargeControlHeightClassName)}>
        <YesNoToggle
          value={enabled}
          onChange={onEnabledChange}
          ariaLabel={ariaLabel}
          yesDisabled={yesDisabled}
        />
        {enabled ? (
          <ModeAmountInput
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
            amountToggleTitle={`Enter ${amountName.toLowerCase()} as percentage`}
            percentToggleTitle={`Enter ${amountName.toLowerCase()} as amount`}
            amountToggleAriaLabel={`Switch ${amountName.toLowerCase()} entry to percentage`}
            percentToggleAriaLabel={`Switch ${amountName.toLowerCase()} entry to amount`}
          />
        ) : null}
      </div>
    </ClientChargeRow>
  )
}

function IssueDateField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className={compositeFieldClassName}>
      <span className={formFieldPrefixClassName}>Date</span>
      <div className="min-w-0 flex-1">
        <EmbeddedFormDatePicker
          value={value}
          onChange={onChange}
          aria-label="Issue date"
          inputClassName={cn(formInputClassName, 'pr-7 pl-2 tabular-nums')}
        />
      </div>
    </div>
  )
}

function TicketNumberField({
  value,
  onChange,
  invalid,
}: {
  value: string
  onChange: (value: string) => void
  invalid?: boolean
}) {
  return (
    <div className={cn(compositeFieldClassName, invalid && 'border-amber-500/50 focus-within:ring-amber-500/20')}>
      <span className={formFieldPrefixClassName}>No.</span>
      <Input
        size="sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="176-1234567890"
        required
        aria-invalid={invalid}
        className={cn(formInputClassName, formInputMonoClassName)}
      />
    </div>
  )
}

function ExchangeRateField({
  value,
  onChange,
  currency,
  foreign,
  rateValid,
}: {
  value: number
  onChange: (value: number) => void
  currency: string
  foreign: boolean
  rateValid: boolean
}) {
  return (
    <div
      className={cn(
        compositeFieldClassName,
        !rateValid && foreign && 'border-amber-500/50 focus-within:ring-amber-500/20',
      )}
      title={foreign && !rateValid ? 'Exchange rate is required' : undefined}
    >
      <span className={cn(formFieldPrefixClassName, 'max-w-[5.5rem] truncate font-mono')} title={`1 ${currency} → ${BASE_CURRENCY}`}>
        1 {currency} →
      </span>
      <AmountInput
        value={foreign ? value : 1}
        onChange={onChange}
        decimals={4}
        disabled={!foreign}
        size="sm"
        required={foreign}
        aria-invalid={foreign && !rateValid}
        className={cn(
          formInputClassName,
          formInputAmountClassName,
          'disabled:cursor-default disabled:opacity-70',
        )}
      />
      <span className="shrink-0 border-l border-[var(--color-border)] bg-[var(--color-surface-muted)]/40 px-2 font-mono text-[11px] font-medium tracking-wide text-[var(--color-muted)]">
        {BASE_CURRENCY}
      </span>
    </div>
  )
}

function CurrencyField({
  value,
  onChange,
  code,
}: {
  value: string
  onChange: (currency: string) => void
  code: string
}) {
  return (
    <div className={compositeFieldClassName}>
      <span
        className={cn(
          formFieldPrefixClassName,
          'font-mono text-[11px] font-semibold text-[var(--color-foreground)]',
        )}
      >
        {code}
      </span>
      <div className="min-w-0 flex-1">
        <CurrencySelect
          value={value}
          onChange={onChange}
          bare
          bareDisplayClassName={INPUT_FIELD_TEXT_CLASS}
        />
      </div>
    </div>
  )
}

function MoneyFieldCompact({
  label,
  value,
  onChange,
  currency,
  highlight,
  disabled,
  hint,
}: {
  label: string
  value: number
  onChange?: (v: number) => void
  currency: string
  highlight?: boolean
  disabled?: boolean
  hint?: string
}) {
  return (
    <label className="block min-w-0">
      <FieldHeader
        label={label}
        hint={hint}
        labelClassName={cn(layout.caption, 'mb-0.5 font-medium text-[var(--color-foreground)]')}
      />
      <div
        className={cn(
          compositeFieldClassName,
          highlight ? 'border-[var(--color-accent)]/40' : '',
          disabled && 'bg-[var(--color-surface-muted)]/25',
        )}
      >
        <span className={cn(formFieldPrefixClassName, 'font-mono text-[11px] font-semibold text-[var(--color-foreground)]')}>
          {currency}
        </span>
        <AmountInput
          value={value}
          onChange={(next) => onChange?.(next)}
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
    </label>
  )
}

import { formatAccountingAmount } from '@/features/trips/utils/format'

function inferSellingSpreadRatePercent(supplierCost: number, sellingPrice: number): number {
  if (supplierCost <= 0 || sellingPrice <= supplierCost) return 0
  return inferRatePercent(supplierCost, sellingPrice - supplierCost)
}

function computeSellingPriceFromSpreadRate(supplierCost: number, ratePercent: number): number {
  if (supplierCost <= 0) return roundCurrency(computeAmountFromRate(0, ratePercent))
  return roundCurrency(supplierCost + computeAmountFromRate(supplierCost, ratePercent))
}

type SnapshotTone = 'default' | 'cost' | 'income' | 'credit' | 'debit' | 'discount'

/** Fixed amount rail — keeps currency + figures aligned when the page is zoomed. */
const snapshotAmountRailClassName = 'w-[8.75rem] max-w-[8.75rem] shrink-0 text-right'
const snapshotRowGridClassName = 'grid grid-cols-[minmax(0,1fr)_8.75rem] items-center gap-x-2'
const snapshotPanelAsideClassName =
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

function formatSnapshotAmount(amount: number, signed?: boolean): string {
  if (amount === 0) return '—'

  const core = formatAccountingAmount(amount, { negativeStyle: 'minus' })
  if (signed && amount > 0 && !core.startsWith('−')) {
    return `+${core}`
  }

  return core
}

function SnapshotAmount({
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
        isOut
          ? 'bg-[var(--color-warning-muted)]/25'
          : 'bg-[var(--color-accent-muted)]/20',
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
        <p className="mt-1 truncate text-[13px] font-semibold leading-snug text-[var(--color-foreground)]">
          {title}
        </p>
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

function SnapshotFlowMetrics({
  currency,
  supplierCost,
  clientReceivable,
  hasListDiscount,
}: {
  currency: string
  supplierCost: number
  clientReceivable: number
  hasListDiscount: boolean
}) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]/90 bg-[var(--color-surface)]">
      <div className="grid grid-cols-2 divide-x divide-[var(--color-border)]/70">
        <SnapshotFlowMetric
          direction="out"
          title="Agency cost"
          hint="Paid to airline or supplier"
          amount={supplierCost}
          currency={currency}
          tone="cost"
        />
        <SnapshotFlowMetric
          direction="in"
          title="Client pays"
          hint={hasListDiscount ? 'After client discount' : 'Amount to collect'}
          amount={clientReceivable}
          currency={currency}
          tone="income"
        />
      </div>
    </div>
  )
}

type WaterfallLine = {
  id: string
  label: string
  amount: number
  tone: SnapshotTone
  signed?: boolean
  showLoss?: boolean
  kind: 'step' | 'total'
}

function buildWaterfallLines(summary: IssueResultSummary): WaterfallLine[] {
  const steps: WaterfallLine[] = []

  if (summary.markup > 0) {
    steps.push({
      id: 'markup',
      label: 'Service mark-up',
      amount: summary.markup,
      tone: 'credit',
      signed: true,
      kind: 'step',
    })
  } else if (summary.sellingPrice > 0 || summary.supplierCost > 0) {
    steps.push({
      id: 'spread',
      label: 'Ticket margin',
      amount: summary.ticketSpread,
      tone: summary.ticketSpread >= 0 ? 'credit' : 'debit',
      signed: true,
      showLoss: summary.ticketSpread < 0,
      kind: 'step',
    })
  }

  if (summary.commission > 0) {
    steps.push({
      id: 'commission',
      label: 'Airline commission',
      amount: summary.commission,
      tone: 'credit',
      signed: true,
      kind: 'step',
    })
  }

  if (summary.clientDiscount > 0) {
    steps.push({
      id: 'discount',
      label: 'Client discount',
      amount: -summary.clientDiscount,
      tone: 'discount',
      signed: true,
      kind: 'step',
    })
  }

  steps.push({
    id: 'net',
    label: 'Net result',
    amount: summary.netProfit,
    tone: summary.netProfit >= 0 ? 'credit' : 'debit',
    showLoss: summary.netProfit < 0,
    kind: 'total',
  })

  return steps
}

function SnapshotLossTag() {
  return (
    <span className="ml-1.5 inline-flex rounded-[var(--radius-sm)] bg-[var(--color-danger-muted)] px-1 py-px text-[9px] font-bold uppercase tracking-wide text-[var(--color-danger)]">
      Loss
    </span>
  )
}

function SnapshotWaterfall({
  currency,
  lines,
  open,
  onToggle,
}: {
  currency: string
  lines: WaterfallLine[]
  open: boolean
  onToggle: () => void
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
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-foreground)]">
            Profit build-up
          </p>
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
                {line.showLoss ? <SnapshotLossTag /> : null}
              </span>
              <SnapshotAmount
                currency={currency}
                amount={line.amount}
                tone={line.tone}
                signed={line.signed}
                size={line.kind === 'total' ? 'md' : 'md'}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function IssueTicketResultPanel({
  currency,
  foreign,
  exchangeRate,
  summary,
}: {
  currency: string
  foreign: boolean
  exchangeRate: number
  summary: IssueResultSummary
}) {
  const profitPositive = summary.netProfit >= 0
  const profitBase = convertToBaseCurrency(summary.netProfit, currency, exchangeRate)
  const marginLabel =
    summary.marginOnCollectionPercent != null
      ? `${summary.marginOnCollectionPercent.toFixed(1)}% on collection`
      : null
  const waterfallLines = buildWaterfallLines(summary)
  const hasStepLines = waterfallLines.some((line) => line.kind === 'step')
  const [breakdownOpen, setBreakdownOpen] = useState(hasStepLines)
  const hasListDiscount = summary.clientDiscount > 0
  const previewReady = summary.supplierCost > 0 || summary.sellingPrice > 0

  useEffect(() => {
    if (hasStepLines) {
      setBreakdownOpen(true)
    }
  }, [hasStepLines])

  return (
    <aside className={snapshotPanelAsideClassName}>
      <div className="flex min-h-0 flex-1 flex-col p-2.5">
        <section className={cn(crmPanelClassName, 'flex min-h-0 flex-1 flex-col contain-layout min-w-[19rem] shadow-[var(--shadow-card)]')}>
          <header className={cn(crmPanelHeaderClassName, 'shrink-0 justify-between')}>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="h-4 w-0.5 shrink-0 rounded-full bg-[var(--color-accent)]" aria-hidden />
                <h2 className={crmPanelTitleClassName}>Issue snapshot</h2>
              </div>
              <p className={cn(layout.caption, 'mt-0.5 pl-3.5')}>Live economics for this ticket</p>
            </div>
            <span className="shrink-0 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              {currency}
            </span>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {!previewReady ? (
              <div className="px-4 py-8 text-center">
                <p className="text-[13px] font-medium text-[var(--color-foreground)]">No pricing yet</p>
                <p className={cn(layout.caption, 'mt-1 leading-relaxed')}>
                  Enter supplier cost and selling price to preview the ticket economics.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 p-2.5">
              <div
                className={cn(
                  'rounded-[var(--radius-md)] border px-3 py-3',
                  profitPositive
                    ? 'border-[var(--color-success)]/20 bg-[var(--color-success-muted)]/35'
                    : 'border-[var(--color-danger)]/20 bg-[var(--color-danger-muted)]/35',
                )}
              >
                <div className={snapshotRowGridClassName}>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
                      Net result
                    </p>
                    {!profitPositive ? <SnapshotLossTag /> : null}
                    {marginLabel ? (
                      <p className={cn(layout.caption, 'mt-1 font-medium tabular-nums')}>{marginLabel}</p>
                    ) : null}
                  </div>
                  <SnapshotAmount
                    currency={currency}
                    amount={summary.netProfit}
                    tone={profitPositive ? 'credit' : 'debit'}
                    size="lg"
                  />
                </div>
              </div>

              <SnapshotFlowMetrics
                currency={currency}
                supplierCost={summary.supplierCost}
                clientReceivable={summary.clientReceivable}
                hasListDiscount={hasListDiscount}
              />

              {summary.sellingPrice > 0 ? (
                <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)]/25 px-3 py-2">
                  <div className={snapshotRowGridClassName}>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-subtle)]">
                        List price
                      </p>
                      {hasListDiscount ? (
                        <p className={cn(layout.caption, 'mt-0.5 truncate')}>
                          Discount {formatSnapshotAmount(-summary.clientDiscount, true)}
                        </p>
                      ) : null}
                    </div>
                    <SnapshotAmount currency={currency} amount={summary.sellingPrice} tone="income" />
                  </div>
                </div>
              ) : null}

              <SnapshotWaterfall
                currency={currency}
                lines={waterfallLines}
                open={breakdownOpen}
                onToggle={() => setBreakdownOpen((value) => !value)}
              />
            </div>
            )}

            {foreign && exchangeRate > 0 && previewReady ? (
              <div className="border-t border-dashed border-[var(--color-border)] px-2.5 py-2">
                <div className={snapshotRowGridClassName}>
                  <p className={cn(layout.caption, 'min-w-0 text-[var(--color-muted)]')}>
                    Net result ≈ at 1 {currency} = {exchangeRate} {BASE_CURRENCY}
                  </p>
                  <SnapshotAmount
                    currency={BASE_CURRENCY}
                    amount={profitBase}
                    tone={profitPositive ? 'credit' : 'debit'}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </aside>
  )
}

export function IssueTicketForm({ ticket, seed, onSubmit, onValidityChange }: IssueTicketFormProps) {
  const initial = useMemo(() => seed ?? buildIssueFormValues(ticket), [seed, ticket])
  const { values, set } = useOperationForm(initial, seed ? `seed-${ticket.id}` : ticket.id)
  const [supplierCostTaxMode, setSupplierCostTaxMode] = useState<SupplierCostTaxMode>(() =>
    inferSupplierCostTaxMode(ticket.pricing),
  )
  const [taxEntryMode, setTaxEntryMode] = useState<TaxEntryMode>('amount')
  const [taxRatePercent, setTaxRatePercent] = useState(() =>
    inferTaxRatePercent(ticket.pricing.fare, ticket.pricing.taxes),
  )
  const [hasSellingPrice, setHasSellingPrice] = useState(() => ticket.pricing.sellingPrice > 0)
  const [sellingValueMode, setSellingValueMode] = useState<PricingValueMode>('amount')
  const [sellingRatePercent, setSellingRatePercent] = useState(() =>
    inferSellingSpreadRatePercent(ticket.pricing.supplierCost, ticket.pricing.sellingPrice),
  )
  const [hasCommission, setHasCommission] = useState(() => (ticket.pricing.commission ?? 0) > 0)
  const [commissionValueMode, setCommissionValueMode] = useState<PricingValueMode>('amount')
  const [commissionRatePercent, setCommissionRatePercent] = useState(() =>
    inferRatePercent(ticket.pricing.fare, ticket.pricing.commission ?? 0),
  )
  const [hasClientDiscount, setHasClientDiscount] = useState(() => (ticket.pricing.clientDiscount ?? 0) > 0)
  const [discountValueMode, setDiscountValueMode] = useState<PricingValueMode>('amount')
  const [discountRatePercent, setDiscountRatePercent] = useState(() =>
    inferRatePercent(ticket.pricing.sellingPrice, ticket.pricing.clientDiscount ?? 0),
  )
  const [markupEntryMode, setMarkupEntryMode] = useState<MarkupEntryMode>('amount')
  const [hasMarkup, setHasMarkup] = useState(
    () => ticket.pricing.sellingPrice <= 0 && ticket.pricing.agencyServiceFees > 0,
  )
  const [markupRatePercent, setMarkupRatePercent] = useState(() =>
    inferRatePercent(ticket.pricing.supplierCost, ticket.pricing.agencyServiceFees),
  )

  useEffect(() => {
    setSupplierCostTaxMode(inferSupplierCostTaxMode(ticket.pricing))
    setTaxEntryMode('amount')
    setTaxRatePercent(inferTaxRatePercent(ticket.pricing.fare, ticket.pricing.taxes))
    setHasCommission((ticket.pricing.commission ?? 0) > 0)
    setCommissionValueMode('amount')
    setCommissionRatePercent(inferRatePercent(ticket.pricing.fare, ticket.pricing.commission ?? 0))
    setHasSellingPrice(ticket.pricing.sellingPrice > 0)
    setSellingValueMode('amount')
    setSellingRatePercent(
      inferSellingSpreadRatePercent(ticket.pricing.supplierCost, ticket.pricing.sellingPrice),
    )
    setHasClientDiscount((ticket.pricing.clientDiscount ?? 0) > 0)
    setDiscountValueMode('amount')
    setDiscountRatePercent(inferRatePercent(ticket.pricing.sellingPrice, ticket.pricing.clientDiscount ?? 0))
    setHasMarkup(ticket.pricing.sellingPrice <= 0 && ticket.pricing.agencyServiceFees > 0)
    setMarkupEntryMode('amount')
    setMarkupRatePercent(inferRatePercent(ticket.pricing.supplierCost, ticket.pricing.agencyServiceFees))
  }, [ticket.id, ticket.pricing.taxes, ticket.pricing.fare, ticket.pricing.commission, ticket.pricing.clientDiscount, ticket.pricing.sellingPrice, ticket.pricing.agencyServiceFees, ticket.pricing.supplierCost])
  const currency = values.currency.trim().toUpperCase()
  const foreign = !isBaseCurrency(currency)

  const handleSupplierCostTaxModeChange = (mode: SupplierCostTaxMode) => {
    if (mode === supplierCostTaxMode) return
    if (mode === 'inclusive') {
      set('fare', roundCurrency(values.fare + values.taxes))
      set('taxes', 0)
    }
    setSupplierCostTaxMode(mode)
  }

  const handleFulfillmentChange = (source: TicketFulfillmentSource) => {
    if (source === values.fulfillmentSource) return
    if (source === 'gds') {
      set('fulfillmentSource', 'gds')
      set('supplierId', AGENCY_GDS_SUPPLIER_ID)
      set('supplierName', AGENCY_GDS_SUPPLIER_NAME)
      set('supplierFees', 0)
      return
    }
    set('fulfillmentSource', 'external_supplier')
    set('supplierId', '')
    set('supplierName', '')
  }

  const isExternalSupplier = values.fulfillmentSource === 'external_supplier'

  const handleTaxEntryModeChange = (mode: TaxEntryMode) => {
    if (mode === taxEntryMode) return
    if (mode === 'percent') {
      const rate = inferTaxRatePercent(values.fare, values.taxes)
      setTaxRatePercent(rate)
      set('taxes', computeTaxFromRate(values.fare, rate))
    }
    setTaxEntryMode(mode)
  }

  const setBaseFare = (fare: number) => {
    const nextFare = roundCurrency(fare)
    set('fare', nextFare)
    if (supplierCostTaxMode === 'exclusive' && taxEntryMode === 'percent') {
      set('taxes', computeTaxFromRate(nextFare, taxRatePercent))
    }
    if (hasCommission && commissionValueMode === 'percent') {
      set('commission', computeAmountFromRate(nextFare, commissionRatePercent))
    }
  }

  const setTaxRate = (rate: number) => {
    setTaxRatePercent(rate)
    set('taxes', computeTaxFromRate(values.fare, rate))
  }

  const normalizedPricing = useMemo(
    () => normalizeIssuePricing(values, supplierCostTaxMode),
    [values, supplierCostTaxMode],
  )

  const issueSupplierCost = useMemo(
    () =>
      roundCurrency(
        normalizedPricing.fare +
          normalizedPricing.taxes +
          normalizedPricing.airlineFees +
          (isExternalSupplier ? values.supplierFees : 0),
      ),
    [normalizedPricing, isExternalSupplier, values.supplierFees],
  )

  const handleSellingPriceEnabledChange = (enabled: boolean) => {
    setHasSellingPrice(enabled)
    if (enabled) {
      setHasMarkup(false)
      set('agencyServiceFees', 0)
      return
    }
    set('sellingPrice', 0)
  }

  const handleSellingValueModeChange = (mode: PricingValueMode) => {
    if (mode === sellingValueMode) return
    if (mode === 'percent') {
      const rate = inferSellingSpreadRatePercent(issueSupplierCost, values.sellingPrice)
      setSellingRatePercent(rate)
      set('sellingPrice', computeSellingPriceFromSpreadRate(issueSupplierCost, rate))
    }
    setSellingValueMode(mode)
  }

  const setSellingRate = (rate: number) => {
    setSellingRatePercent(rate)
    set('sellingPrice', computeSellingPriceFromSpreadRate(issueSupplierCost, rate))
  }

  const handleCommissionEnabledChange = (enabled: boolean) => {
    setHasCommission(enabled)
    if (!enabled) {
      set('commission', 0)
    }
  }

  const handleCommissionValueModeChange = (mode: PricingValueMode) => {
    if (mode === commissionValueMode) return
    if (mode === 'percent') {
      const rate = inferRatePercent(values.fare, values.commission)
      setCommissionRatePercent(rate)
      set('commission', computeAmountFromRate(values.fare, rate))
    }
    setCommissionValueMode(mode)
  }

  const setCommissionRate = (rate: number) => {
    setCommissionRatePercent(rate)
    set('commission', computeAmountFromRate(values.fare, rate))
  }

  const handleClientDiscountEnabledChange = (enabled: boolean) => {
    setHasClientDiscount(enabled)
    if (!enabled) {
      set('clientDiscount', 0)
    }
  }

  const handleDiscountValueModeChange = (mode: PricingValueMode) => {
    if (mode === discountValueMode) return
    if (mode === 'percent') {
      const rate = inferRatePercent(values.sellingPrice, values.clientDiscount)
      setDiscountRatePercent(rate)
      set('clientDiscount', computeAmountFromRate(values.sellingPrice, rate))
    }
    setDiscountValueMode(mode)
  }

  const setDiscountRate = (rate: number) => {
    setDiscountRatePercent(rate)
    set('clientDiscount', computeAmountFromRate(values.sellingPrice, rate))
  }

  const handleMarkupEnabledChange = (enabled: boolean) => {
    setHasMarkup(enabled)
    if (enabled) {
      setHasSellingPrice(false)
      set('sellingPrice', 0)
      return
    }
    set('agencyServiceFees', 0)
    set('sellingPrice', 0)
  }

  const handleMarkupModeChange = (mode: MarkupEntryMode) => {
    if (mode === markupEntryMode) return
    if (mode === 'percent') {
      const rate = inferRatePercent(issueSupplierCost, values.agencyServiceFees)
      setMarkupRatePercent(rate)
      set('agencyServiceFees', computeAmountFromRate(issueSupplierCost, rate))
    }
    setMarkupEntryMode(mode)
  }

  const setMarkupRate = (rate: number) => {
    setMarkupRatePercent(rate)
    set('agencyServiceFees', computeAmountFromRate(issueSupplierCost, rate))
  }

  useEffect(() => {
    if (!hasSellingPrice || sellingValueMode !== 'percent') return
    const nextSellingPrice = computeSellingPriceFromSpreadRate(issueSupplierCost, sellingRatePercent)
    if (values.sellingPrice !== nextSellingPrice) {
      set('sellingPrice', nextSellingPrice)
    }
  }, [issueSupplierCost, hasSellingPrice, sellingValueMode, sellingRatePercent, set, values.sellingPrice])

  useEffect(() => {
    if (markupEntryMode !== 'percent' || !hasMarkup) return
    const nextMarkup = computeAmountFromRate(issueSupplierCost, markupRatePercent)
    if (values.agencyServiceFees !== nextMarkup) {
      set('agencyServiceFees', nextMarkup)
    }
  }, [issueSupplierCost, markupEntryMode, markupRatePercent, set, values.agencyServiceFees, hasMarkup])

  useEffect(() => {
    if (!hasMarkup || hasSellingPrice) return
    const markup =
      markupEntryMode === 'percent'
        ? computeAmountFromRate(issueSupplierCost, markupRatePercent)
        : values.agencyServiceFees
    const nextSellingPrice = roundCurrency(issueSupplierCost + markup)
    if (values.sellingPrice !== nextSellingPrice) {
      set('sellingPrice', nextSellingPrice)
    }
  }, [
    hasMarkup,
    hasSellingPrice,
    issueSupplierCost,
    markupEntryMode,
    markupRatePercent,
    set,
    values.agencyServiceFees,
    values.sellingPrice,
  ])

  useEffect(() => {
    if (!hasClientDiscount || discountValueMode !== 'percent') return
    if (!hasSellingPrice && !hasMarkup) return
    const listPrice = hasSellingPrice
      ? values.sellingPrice
      : roundCurrency(
          issueSupplierCost +
            (markupEntryMode === 'percent'
              ? computeAmountFromRate(issueSupplierCost, markupRatePercent)
              : values.agencyServiceFees),
        )
    const nextDiscount = computeAmountFromRate(listPrice, discountRatePercent)
    if (values.clientDiscount !== nextDiscount) {
      set('clientDiscount', nextDiscount)
    }
  }, [
    values.sellingPrice,
    hasClientDiscount,
    hasSellingPrice,
    hasMarkup,
    discountValueMode,
    discountRatePercent,
    issueSupplierCost,
    markupEntryMode,
    markupRatePercent,
    values.agencyServiceFees,
    values.clientDiscount,
    set,
  ])

  const resolvedCommission =
    hasCommission && commissionValueMode === 'percent'
      ? computeAmountFromRate(normalizedPricing.fare, commissionRatePercent)
      : hasCommission
        ? values.commission
        : 0

  const resolvedMarkup =
    hasMarkup && !hasSellingPrice
      ? markupEntryMode === 'percent'
        ? computeAmountFromRate(issueSupplierCost, markupRatePercent)
        : values.agencyServiceFees
      : 0

  const resolvedSellingPrice =
    hasSellingPrice
      ? values.sellingPrice
      : hasMarkup
        ? roundCurrency(issueSupplierCost + resolvedMarkup)
        : 0

  const resolvedClientDiscount =
    hasClientDiscount && discountValueMode === 'percent'
      ? computeAmountFromRate(resolvedSellingPrice, discountRatePercent)
      : hasClientDiscount
        ? values.clientDiscount
        : 0

  const preview = useMemo(
    () =>
      computeIssuePreview(ticket, {
        currency: values.currency,
        exchangeRate: values.exchangeRate,
        fare: normalizedPricing.fare,
        taxes: normalizedPricing.taxes,
        airlineFees: normalizedPricing.airlineFees,
        supplierFees: isExternalSupplier ? values.supplierFees : 0,
        agencyServiceFees: resolvedMarkup,
        commission: resolvedCommission,
        clientDiscount: resolvedClientDiscount,
        sellingPrice: resolvedSellingPrice,
      }),
    [ticket, values.currency, values.exchangeRate, resolvedSellingPrice, normalizedPricing, isExternalSupplier, values.supplierFees, resolvedMarkup, resolvedCommission, resolvedClientDiscount],
  )

  const resultSummary = useMemo(
    () => buildIssueResultSummary(preview.pricing, preview.financials),
    [preview],
  )

  const rateValid = !foreign || values.exchangeRate > 0
  const ticketNumberMissing = !values.ticketNumber.trim()
  const hasClientPricing = hasSellingPrice || hasMarkup
  const sellingPriceMissing = !hasClientPricing || resolvedSellingPrice <= 0
  const markupMissing = hasMarkup && resolvedMarkup <= 0
  const discountExceedsSellingPrice = resolvedClientDiscount > resolvedSellingPrice
  const externalSupplierMissing = isExternalSupplier && !values.supplierName?.trim()
  const canSubmit =
    !ticketNumberMissing &&
    !sellingPriceMissing &&
    !markupMissing &&
    !discountExceedsSellingPrice &&
    rateValid &&
    !externalSupplierMissing

  useEffect(() => {
    onValidityChange?.(canSubmit)
  }, [canSubmit, onValidityChange])

  const [origin, destination] = parseIssueRoute(ticket)

  return (
    <form
      id="flight-op-form"
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      onSubmit={(e) => {
        e.preventDefault()
        if (!canSubmit) return
        const pricing = normalizeIssuePricing(values, supplierCostTaxMode)
        onSubmit({
          ...values,
          ...pricing,
          supplierFees: isExternalSupplier ? values.supplierFees : 0,
          agencyServiceFees: resolvedMarkup,
          commission: resolvedCommission,
          clientDiscount: resolvedClientDiscount,
          sellingPrice: resolvedSellingPrice,
          ...(isExternalSupplier
            ? {
                supplierId: values.supplierId?.trim() || undefined,
                supplierName: values.supplierName?.trim(),
              }
            : {
                supplierId: AGENCY_GDS_SUPPLIER_ID,
                supplierName: AGENCY_GDS_SUPPLIER_NAME,
              }),
        })
      }}
    >
      <IssueTicketRibbon
        ticket={ticket}
        origin={origin}
        destination={destination}
        fulfillmentSource={values.fulfillmentSource}
        supplierName={values.supplierName}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <div className="relative z-0 min-h-0 min-w-0 overflow-x-hidden overflow-y-auto overscroll-y-contain bg-[var(--color-bg)]/40 p-2.5 [-webkit-overflow-scrolling:touch] lg:w-[32rem] lg:shrink-0 lg:border-r lg:border-[var(--color-border)]">
          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
            <WorksheetSection step="1" title="Ticket">
              <div className="space-y-4">
                <PricingGroup label="Ticket details">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <FieldCompact label="Issue date">
                        <IssueDateField value={values.issueDate} onChange={(v) => set('issueDate', v)} />
                      </FieldCompact>
                      <FieldCompact label="Ticket number">
                        <TicketNumberField
                          value={values.ticketNumber}
                          onChange={(v) => set('ticketNumber', v)}
                          invalid={ticketNumberMissing}
                        />
                      </FieldCompact>
                    </div>
                    <TicketFulfillmentField
                      value={values.fulfillmentSource}
                      onChange={handleFulfillmentChange}
                      supplierId={values.supplierId}
                      supplierName={values.supplierName}
                      supplierInvalid={externalSupplierMissing}
                      onSupplierChange={(id, name) => {
                        set('supplierId', id)
                        set('supplierName', name)
                      }}
                    />
                  </div>
                </PricingGroup>

                <PricingGroup label="Currency & exchange">
                  <div className="grid grid-cols-2 gap-3">
                    <FieldCompact label="Currency">
                      <CurrencyField
                        value={values.currency}
                        code={currency}
                        onChange={(next) => {
                          set('currency', next)
                          if (isBaseCurrency(next)) set('exchangeRate', 1)
                          else if (isBaseCurrency(values.currency)) set('exchangeRate', 0)
                        }}
                      />
                    </FieldCompact>
                    <FieldCompact label="Exchange rate">
                      <ExchangeRateField
                        value={values.exchangeRate}
                        onChange={(v) => set('exchangeRate', v)}
                        currency={currency}
                        foreign={foreign}
                        rateValid={rateValid}
                      />
                    </FieldCompact>
                  </div>
                </PricingGroup>
              </div>
            </WorksheetSection>

            <WorksheetSection step="2" title={`Pricing · ${currency}`}>
              <div className="space-y-4">
                <PricingGroup label="Costs paid to airline and supplier">
                  <SupplierCostTaxModeField
                    value={supplierCostTaxMode}
                    onChange={handleSupplierCostTaxModeChange}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    {supplierCostTaxMode === 'inclusive' ? (
                      <>
                        <MoneyFieldCompact
                          label="Total airline cost (incl. taxes)"
                          value={values.fare}
                          onChange={(v) => {
                            set('fare', roundCurrency(v))
                            set('taxes', 0)
                          }}
                          currency={currency}
                        />
                        {isExternalSupplier ? (
                          <MoneyFieldCompact
                            label="Supplier fees"
                            value={values.supplierFees}
                            onChange={(v) => set('supplierFees', v)}
                            currency={currency}
                          />
                        ) : null}
                      </>
                    ) : (
                      <>
                        <MoneyFieldCompact
                          label="Base fare"
                          value={values.fare}
                          onChange={setBaseFare}
                          currency={currency}
                        />
                        {isExternalSupplier ? (
                          <MoneyFieldCompact
                            label="Supplier fees"
                            value={values.supplierFees}
                            onChange={(v) => set('supplierFees', v)}
                            currency={currency}
                          />
                        ) : null}
                        <TaxField
                          mode={taxEntryMode}
                          onModeChange={handleTaxEntryModeChange}
                          fare={values.fare}
                          taxes={values.taxes}
                          taxRatePercent={taxRatePercent}
                          onTaxAmountChange={(v) => set('taxes', roundCurrency(v))}
                          onTaxRateChange={setTaxRate}
                          currency={currency}
                        />
                      </>
                    )}
                  </div>
                </PricingGroup>

                <ClientChargeSection>
                  <div className="space-y-2.5">
                    <ClientAmountQuestionRow
                      question="Selling price?"
                      ariaLabel="Set selling price"
                      amountName="Selling price"
                      enabled={hasSellingPrice}
                      onEnabledChange={handleSellingPriceEnabledChange}
                      yesDisabled={hasMarkup}
                      mode={sellingValueMode}
                      onModeChange={handleSellingValueModeChange}
                      value={values.sellingPrice}
                      ratePercent={sellingRatePercent}
                      onValueChange={(v) => set('sellingPrice', roundCurrency(v))}
                      onRateChange={setSellingRate}
                      currency={currency}
                      prominent
                      invalid={hasSellingPrice && sellingPriceMissing}
                    />
                    <ClientAmountQuestionRow
                      question="Give client discount?"
                      ariaLabel="Give client discount"
                      amountName="Discount"
                      enabled={hasClientDiscount}
                      onEnabledChange={handleClientDiscountEnabledChange}
                      mode={discountValueMode}
                      onModeChange={handleDiscountValueModeChange}
                      value={values.clientDiscount}
                      ratePercent={discountRatePercent}
                      onValueChange={(v) => set('clientDiscount', roundCurrency(v))}
                      onRateChange={setDiscountRate}
                      currency={currency}
                      yesDisabled={!hasClientPricing}
                    />
                    <ClientAmountQuestionRow
                      question="Receive commission?"
                      ariaLabel="Receive commission"
                      amountName="Commission"
                      enabled={hasCommission}
                      onEnabledChange={handleCommissionEnabledChange}
                      mode={commissionValueMode}
                      onModeChange={handleCommissionValueModeChange}
                      value={values.commission}
                      ratePercent={commissionRatePercent}
                      onValueChange={(v) => set('commission', roundCurrency(v))}
                      onRateChange={setCommissionRate}
                      currency={currency}
                    />
                    <ClientAmountQuestionRow
                      question="Add mark-up?"
                      ariaLabel="Add mark-up"
                      amountName="Mark-up"
                      enabled={hasMarkup}
                      onEnabledChange={handleMarkupEnabledChange}
                      yesDisabled={hasSellingPrice}
                      mode={markupEntryMode}
                      onModeChange={handleMarkupModeChange}
                      value={values.agencyServiceFees}
                      ratePercent={markupRatePercent}
                      onValueChange={(v) => set('agencyServiceFees', roundCurrency(v))}
                      onRateChange={setMarkupRate}
                      currency={currency}
                      invalid={hasMarkup && markupMissing}
                    />
                  </div>
                </ClientChargeSection>
              </div>
            </WorksheetSection>

            <WorksheetSection step="3" title="Notes" defaultExpanded={false}>
              <NotesTextarea
                value={values.notes ?? ''}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="OPTIONAL INTERNAL NOTE…"
                className="min-h-[72px] resize-y border-[var(--color-border)] uppercase leading-relaxed placeholder:uppercase"
              />
            </WorksheetSection>
          </div>
        </div>

        <IssueTicketResultPanel
          currency={currency}
          foreign={foreign}
          exchangeRate={values.exchangeRate}
          summary={resultSummary}
        />
      </div>
    </form>
  )
}
