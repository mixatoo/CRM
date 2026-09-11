import type { ReactNode } from 'react'
import type { TripService } from '@/domain/entities/trip-service'
import { AccountingAmount } from '@/design-system/components/AccountingAmount'
import { layout, responsiveGrid } from '@/design-system/tokens/layout'
import { TripServiceScheduleCell } from '@/features/trips/components/services/TripServiceScheduleCell'
import { TRIP_SERVICE_FINANCIAL_AMOUNT } from '@/features/trips/components/services/service-styles'
import {
  tripServiceMargin,
  tripServiceMarginPercent,
  tripServiceSelling,
} from '@/features/trips/components/services/trip-service-financial'
import { formatDate, formatDateTime } from '@/shared/utils/date-format'
import { cn } from '@/shared/utils/cn'

interface TripServiceDetailPanelProps {
  service: TripService
}

interface DetailFieldProps {
  label: string
  children: ReactNode
  className?: string
}

function DetailField({ label, children, className }: DetailFieldProps) {
  return (
    <div className={cn('min-w-0 px-4 py-3.5', className)}>
      <div className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-subtle)]">{label}</div>
      <div className="mt-1.5 min-w-0 text-sm font-normal text-[var(--color-foreground)]">{children}</div>
    </div>
  )
}

function DetailSection({ title, children, columns = 2 }: { title: string; children: ReactNode; columns?: 2 | 3 }) {
  const gridClass = columns === 3 ? responsiveGrid.cols3 : responsiveGrid.cols2

  return (
    <section className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]/90 px-3 py-2">
        <span className="h-4 w-0.5 shrink-0 rounded-full bg-[var(--color-accent)]" aria-hidden />
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-foreground)]">
          {title}
        </h2>
      </div>
      <div className={cn('grid min-w-0', gridClass)}>{children}</div>
    </section>
  )
}

export function TripServiceDetailPanel({ service }: TripServiceDetailPanelProps) {
  const canceled = service.status === 'canceled'
  const selling = tripServiceSelling(service)
  const margin = tripServiceMargin(service)
  const marginPercent = tripServiceMarginPercent(service)
  const currency = service.currency

  return (
    <div className={cn('space-y-3', layout.stackTight)}>
      <DetailSection title="Schedule">
        <DetailField label="Start date">{formatDate(service.startDate)}</DetailField>
        <DetailField label="End date">{formatDate(service.endDate)}</DetailField>
        <DetailField label="Itinerary dates" className="sm:col-span-2">
          <TripServiceScheduleCell service={service} className="border-l-0 pl-0" />
        </DetailField>
      </DetailSection>

      <DetailSection title="Financial" columns={3}>
        <DetailField label="Cost">
          <AccountingAmount
            amount={service.cost}
            currency={currency}
            className={cn('min-w-0', TRIP_SERVICE_FINANCIAL_AMOUNT.grid)}
            currencyClassName={TRIP_SERVICE_FINANCIAL_AMOUNT.currency}
            amountClassName={TRIP_SERVICE_FINANCIAL_AMOUNT.amount}
          />
        </DetailField>
        <DetailField label="Selling">
          <AccountingAmount
            amount={selling}
            currency={currency}
            className={cn('min-w-0', TRIP_SERVICE_FINANCIAL_AMOUNT.grid)}
            currencyClassName={TRIP_SERVICE_FINANCIAL_AMOUNT.currency}
            amountClassName={cn(TRIP_SERVICE_FINANCIAL_AMOUNT.amount, 'font-medium')}
          />
        </DetailField>
        <DetailField label="Currency">{currency}</DetailField>
        <DetailField label="Margin amount">
          {canceled ? (
            '—'
          ) : (
            <AccountingAmount
              amount={margin}
              currency={currency}
              className={cn('min-w-0', TRIP_SERVICE_FINANCIAL_AMOUNT.grid)}
              currencyClassName={TRIP_SERVICE_FINANCIAL_AMOUNT.currency}
              amountClassName={TRIP_SERVICE_FINANCIAL_AMOUNT.amount}
            />
          )}
        </DetailField>
        <DetailField label="Margin %">
          {canceled ? (
            '—'
          ) : (
            <span
              className={cn(
                'tabular-nums',
                marginPercent >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]',
              )}
            >
              {marginPercent >= 0 ? '+' : ''}
              {marginPercent.toFixed(1)}%
            </span>
          )}
        </DetailField>
      </DetailSection>

      <DetailSection title="Notes">
        <DetailField label="Internal notes" className="sm:col-span-2">
          {service.notes?.trim() ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-foreground)]">
              {service.notes}
            </p>
          ) : (
            <span className="text-[var(--color-muted)]">No notes</span>
          )}
        </DetailField>
      </DetailSection>

      <DetailSection title="Reference">
        <DetailField label="Service ID">
          <span className="font-mono text-xs">{service.id}</span>
        </DetailField>
        <DetailField label="Trip ID">
          <span className="font-mono text-xs">{service.tripId}</span>
        </DetailField>
        <DetailField label="Created">{formatDateTime(service.createdAt)}</DetailField>
        <DetailField label="Last updated">{formatDateTime(service.updatedAt)}</DetailField>
      </DetailSection>
    </div>
  )
}
