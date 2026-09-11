import type { ReactNode } from 'react'
import type { Trip } from '@/domain/entities'
import {
  tripClientBalanceDue,
  tripClientPaidPercent,
  tripMarkUp,
  tripNetProfit,
  tripSupplierAmountPaid,
  tripSupplierPaidPercent,
  tripSupplierTotalCost,
  tripTotalSelling,
} from '@/domain/entities'
import { AccountingAmount } from '@/design-system/components/AccountingAmount'
import { TripStageBadge } from '@/features/trips/components/list/TripStageBadge'
import { TravelCard } from '@/design-system/layout/TravelCard'
import { layout, responsiveGrid } from '@/design-system/tokens/layout'
import { formatCount } from '@/features/trips/utils/format'
import { formatDate, formatDateParts } from '@/shared/utils/date-format'
import { cn } from '@/shared/utils/cn'

interface TripDashboardPanelProps {
  trip: Trip
}

type ColumnCount = 2 | 3 | 4 | 5
type FieldTone = 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'muted'

interface CrmFieldConfig {
  label: string
  value: ReactNode
  tone?: FieldTone
  metric?: boolean
}

interface CrmSectionConfig {
  title?: string
  columns: ColumnCount
  fields: CrmFieldConfig[]
  actions?: ReactNode
  inline?: boolean
}

const gridColsClass: Record<ColumnCount, string> = {
  2: responsiveGrid.cols2,
  3: responsiveGrid.cols3,
  4: responsiveGrid.cols4,
  5: responsiveGrid.cols5,
}

const twinCardGridClassName =
  'grid grid-cols-1 items-stretch gap-3 lg:grid-cols-[minmax(0,40fr)_minmax(0,60fr)]'
const twinCardClassName = 'flex h-full min-h-0 min-w-0 flex-col'
const contactCardContentClassName = 'flex flex-col gap-3 px-4 py-2.5'
const twinCardContentClassName =
  `${contactCardContentClassName} lg:grid lg:min-h-0 lg:flex-1 lg:grid-rows-3`

const crmPanelClassName =
  'flex min-h-0 flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]'
const crmPanelHeaderClassName =
  'flex shrink-0 items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]/90 px-3 py-2'
const crmPanelTitleClassName =
  'text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-foreground)]'
const crmFieldGridClassName = cn('grid min-w-0 flex-1', responsiveGrid.fieldGrid)
const crmFieldCellClassName = 'min-w-0 px-4 py-3.5 text-left'
const crmFieldLabelClassName =
  'text-[11px] font-medium uppercase tracking-wide text-[var(--color-subtle)]'

const VALUE_TONE: Record<FieldTone, string> = {
  default: 'text-[var(--color-foreground)]',
  accent: 'text-[var(--color-accent)]',
  success: 'text-[var(--color-success)]',
  warning: 'text-[var(--color-warning)]',
  danger: 'text-[var(--color-danger)]',
  muted: 'text-[var(--color-muted)]',
}

export function TripDashboardPanel({ trip }: TripDashboardPanelProps) {
  const totals = trip.serviceBreakdown.reduce(
    (acc, row) => ({
      services: acc.services + row.proposal + row.confirmed + row.canceled,
      confirmed: acc.confirmed + row.confirmed,
      canceled: acc.canceled + row.canceled,
    }),
    { services: 0, confirmed: 0, canceled: 0 },
  )

  const margin =
    trip.totalCost > 0 ? `${((trip.totalCommission / trip.totalCost) * 100).toFixed(1)}%` : '—'

  const paidAmount = trip.clientPaidAmount ?? 0
  const clientPaidPct = tripClientPaidPercent(trip)
  const supplierTotalCost = tripSupplierTotalCost(trip)
  const supplierPaidAmount = tripSupplierAmountPaid(trip)
  const supplierPaidPct = tripSupplierPaidPercent(trip)

  const tripSections: CrmSectionConfig[] = [
    {
      title: 'Dates',
      columns: 2,
      fields: [
        { label: 'Start date', value: <DateValue value={trip.startDate} /> },
        { label: 'End date', value: <DateValue value={trip.endDate} /> },
      ],
    },
    {
      title: 'Trip info',
      columns: 3,
      fields: [
        { label: 'Booking started', value: formatDate(trip.bookingStartedAt) },
        {
          label: 'Stage',
          value: <TripStageBadge stage={trip.stage} className="min-w-0 font-normal" />,
        },
        { label: 'Trip type', value: trip.tripType ?? 'Not Defined' },
      ],
    },
    {
      title: 'Key metrics',
      columns: 5,
      fields: [
        { label: 'Adult', value: formatCount(trip.adults), metric: true },
        { label: 'Minors', value: formatCount(trip.minors), metric: true },
        { label: 'Services', value: formatCount(totals.services), metric: true, tone: 'accent' },
        { label: 'Confirmed', value: formatCount(totals.confirmed), metric: true, tone: 'success' },
        { label: 'Canceled', value: formatCount(totals.canceled), metric: true, tone: 'muted' },
      ],
    },
  ]

  const financialSections: CrmSectionConfig[] = [
    {
      title: 'Receivable',
      columns: 4,
      fields: [
        {
          label: 'Total Selling',
          value: <MoneyValue amount={tripTotalSelling(trip)} currency={trip.currency} tone="accent" />,
          tone: 'accent',
        },
        {
          label: 'Balance due',
          value: <MoneyValue amount={tripClientBalanceDue(trip)} currency={trip.currency} tone="warning" />,
          tone: 'warning',
        },
        {
          label: 'Amount collected',
          value: <MoneyValue amount={paidAmount} currency={trip.currency} tone="success" />,
          tone: 'success',
        },
        {
          label: 'Collected',
          value: <PaymentProgress percent={clientPaidPct} caption="collected" />,
        },
      ],
    },
    {
      title: 'Payables',
      columns: 4,
      fields: [
        {
          label: 'Total cost',
          value: <MoneyValue amount={supplierTotalCost} currency={trip.currency} />,
        },
        {
          label: 'Balance due',
          value: <MoneyValue amount={trip.supplierBalanceDue ?? 0} currency={trip.currency} tone="warning" />,
          tone: 'warning',
        },
        {
          label: 'Amount paid',
          value: <MoneyValue amount={supplierPaidAmount} currency={trip.currency} tone="success" />,
          tone: 'success',
        },
        {
          label: 'Paid',
          value: <PaymentProgress percent={supplierPaidPct} caption="paid" />,
        },
      ],
    },
    {
      title: 'Profit',
      columns: 4,
      fields: [
        {
          label: 'Commission',
          value: <MoneyValue amount={trip.totalCommission} currency={trip.currency} tone="accent" />,
          tone: 'accent',
        },
        {
          label: 'Mark-up',
          value: <MoneyValue amount={tripMarkUp(trip)} currency={trip.currency} tone="accent" />,
          tone: 'accent',
        },
        {
          label: 'Net profit',
          value: <MoneyValue amount={tripNetProfit(trip)} currency={trip.currency} tone="success" />,
          tone: 'success',
        },
        { label: 'Margin', value: margin },
      ],
    },
  ]

  return (
    <div className={cn('flex flex-col', layout.workspaceCards)}>
      <AlignedTwinCards tripSections={tripSections} financialSections={financialSections} />
    </div>
  )
}

function AlignedTwinCards({
  tripSections,
  financialSections,
}: {
  tripSections: CrmSectionConfig[]
  financialSections: CrmSectionConfig[]
}) {
  return (
    <div className={twinCardGridClassName}>
      <TravelCard
        title="Trip"
        titleClassName="font-bold"
        className={twinCardClassName}
        contentClassName={twinCardContentClassName}
      >
        {tripSections.map((section) => (
          <CrmSection key={section.title} {...section} aligned />
        ))}
      </TravelCard>
      <TravelCard
        title="Financials"
        titleClassName="font-bold"
        className={twinCardClassName}
        contentClassName={twinCardContentClassName}
      >
        {financialSections.map((section) => (
          <CrmSection key={section.title} {...section} aligned />
        ))}
      </TravelCard>
    </div>
  )
}

function CrmSection({
  title,
  columns,
  fields,
  actions,
  aligned,
  inline,
}: CrmSectionConfig & { aligned?: boolean }) {
  return (
    <section className={cn('flex min-h-0 flex-col', aligned && 'lg:h-full')}>
      <div className={cn(crmPanelClassName, aligned && 'lg:flex-1')}>
        {title ? (
          <div className={crmPanelHeaderClassName}>
            <div className="flex min-w-0 items-center gap-2">
              <span className="h-4 w-0.5 shrink-0 rounded-full bg-[var(--color-accent)]" aria-hidden />
              <h4 className={crmPanelTitleClassName}>{title}</h4>
            </div>
            {actions}
          </div>
        ) : null}
        <div
          className={cn(
            crmFieldGridClassName,
            gridColsClass[columns],
            aligned && 'lg:min-h-0 lg:items-stretch',
          )}
        >
          {fields.map((field) => (
            <CrmField key={field.label} {...field} aligned={aligned} inline={inline} />
          ))}
        </div>
      </div>
    </section>
  )
}

function CrmField({
  label,
  value,
  tone = 'default',
  metric,
  aligned,
  inline,
}: CrmFieldConfig & { aligned?: boolean; inline?: boolean }) {
  const valueClassName = cn(
    'min-w-0 font-normal leading-snug tracking-tight',
    metric ? 'text-lg tabular-nums' : layout.body,
    VALUE_TONE[tone],
    typeof value === 'string' && 'truncate',
  )

  return (
    <div
      className={cn(
        crmFieldCellClassName,
        inline ? 'flex items-baseline gap-2.5' : 'flex flex-col justify-center gap-1.5',
        aligned && 'lg:flex lg:h-full lg:flex-col lg:justify-center',
      )}
    >
      <div
        className={cn(
          inline
            ? cn(layout.statLabel, 'shrink-0 font-medium leading-none')
            : cn(crmFieldLabelClassName, 'shrink-0 leading-none'),
        )}
      >
        {label}
      </div>
      <div className={cn('min-w-0', valueClassName)}>
        {typeof value === 'string' ? value : <div className="flex w-full items-start justify-start">{value}</div>}
      </div>
    </div>
  )
}

function MoneyValue({
  amount,
  currency,
  tone = 'default',
}: {
  amount: number
  currency: string
  tone?: FieldTone
}) {
  return (
    <AccountingAmount
      amount={amount}
      currency={currency}
      className="w-auto min-w-0 max-w-full justify-start gap-2 [&>span:first-child]:text-[11px] [&>span:first-child]:font-medium [&>span:first-child]:uppercase [&>span:first-child]:tracking-wide [&>span:first-child]:text-[var(--color-subtle)]"
      amountClassName={cn('min-w-0 text-left text-sm font-normal tabular-nums tracking-tight', VALUE_TONE[tone])}
    />
  )
}

function PaymentProgress({ percent, caption }: { percent: number; caption: string }) {
  const clamped = Math.min(100, Math.max(0, percent))

  return (
    <div className="w-full min-w-0 max-w-[9rem]">
      <div className="mb-2 flex items-end justify-between gap-2">
        <span className={cn('text-sm font-normal tabular-nums tracking-tight', VALUE_TONE.success)}>
          {clamped}%
        </span>
        <span className={cn(layout.caption, 'font-medium capitalize')}>{caption}</span>
      </div>
      <div
        className="h-1 overflow-hidden rounded-full bg-[var(--color-surface-muted)] ring-1 ring-inset ring-[var(--color-border)]/80"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-[var(--color-success)] transition-[width]"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}

function DateValue({ value }: { value?: string }) {
  const { day, month, year, valid } = formatDateParts(value)

  if (!valid) {
    return <span className="font-normal text-[var(--color-muted)]">—</span>
  }

  return (
    <time dateTime={value} className="inline-flex items-baseline gap-1 font-normal tabular-nums tracking-tight">
      <span className={cn(layout.body, 'text-[var(--color-foreground)]')}>{day}</span>
      <span className="text-[var(--color-subtle)]">/</span>
      <span className={cn(layout.body, 'text-[var(--color-accent)]')}>{month}</span>
      <span className="text-[var(--color-subtle)]">/</span>
      <span className={cn(layout.caption, 'text-[var(--color-muted)]')}>{year}</span>
    </time>
  )
}
