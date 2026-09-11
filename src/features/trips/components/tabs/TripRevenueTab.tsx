import { useMemo } from 'react'
import type { Trip } from '@/domain/entities'
import {
  tripClientBalanceDue,
  tripMarkUp,
  tripNetProfit,
  tripSupplierTotalCost,
  tripTotalSelling,
} from '@/domain/entities'
import { openInvoiceReceivables } from '@/domain/trip/trip-financial-sync'
import { shouldMaskFinancials } from '@/domain/policies/permissions'
import { AccountingAmount } from '@/design-system/components/AccountingAmount'
import { CrmFieldGrid, CrmMetricCell, CrmPanel } from '@/design-system/layout/CrmPanel'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { useTripInvoices } from '@/features/trips/hooks/use-trip-invoices'
import { useTripServices } from '@/features/trips/hooks/use-trip-services'
import { useTripPayments } from '@/features/trips/hooks/use-trip-workspace'
import { tripServiceMargin } from '@/features/trips/components/services/trip-service-financial'
import { sumActivePayments } from '@/domain/entities/trip-payment'
import type { ServiceCategory } from '@/domain/entities'
import { formatServiceCategory } from '@/domain/entities/trip-service'

interface TripRevenueTabProps {
  trip: Trip
}

export function TripRevenueTab({ trip }: TripRevenueTabProps) {
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const mask = shouldMaskFinancials(role)
  const { data: services = [] } = useTripServices(trip.id)
  const { data: invoices = [] } = useTripInvoices(trip.id)
  const { data: payments = [] } = useTripPayments(trip.id)

  const categoryRows = useMemo(() => {
    const map = new Map<string, { count: number; cost: number; selling: number }>()
    for (const service of services.filter((row) => row.status !== 'canceled')) {
      const key = service.category
      const row = map.get(key) ?? { count: 0, cost: 0, selling: 0 }
      row.count += 1
      row.cost += service.cost
      row.selling += service.selling ?? service.cost
      map.set(key, row)
    }
    return [...map.entries()].map(([category, row]) => ({
      category,
      label: formatServiceCategory(category as ServiceCategory),
      ...row,
      margin: row.selling - row.cost,
    }))
  }, [services])

  const confirmedMargin = useMemo(
    () =>
      services
        .filter((service) => service.status === 'confirmed')
        .reduce((sum, service) => sum + tripServiceMargin(service), 0),
    [services],
  )

  const inbound = sumActivePayments(payments, 'inbound')
  const outbound = sumActivePayments(payments, 'outbound')

  return (
    <div className="space-y-3 p-3">
      <CrmPanel title="Revenue snapshot">
        <CrmFieldGrid columns={4}>
          <CrmMetricCell label="Total selling" tone="accent">
            {mask ? '••••' : tripTotalSelling(trip).toFixed(2)}
          </CrmMetricCell>
          <CrmMetricCell label="Collected" tone="success">
            {mask ? '••••' : inbound.toFixed(2)}
          </CrmMetricCell>
          <CrmMetricCell label="Client balance" tone="warning">
            {mask ? '••••' : tripClientBalanceDue(trip).toFixed(2)}
          </CrmMetricCell>
          <CrmMetricCell label="Open invoices">
            {mask ? '••••' : openInvoiceReceivables(invoices).toFixed(2)}
          </CrmMetricCell>
        </CrmFieldGrid>
      </CrmPanel>

      <CrmPanel title="Profitability">
        <CrmFieldGrid columns={4}>
          <CrmMetricCell label="Supplier cost">{mask ? '••••' : tripSupplierTotalCost(trip).toFixed(2)}</CrmMetricCell>
          <CrmMetricCell label="Mark-up" tone="accent">{mask ? '••••' : tripMarkUp(trip).toFixed(2)}</CrmMetricCell>
          <CrmMetricCell label="Net profit" tone="success">{mask ? '••••' : tripNetProfit(trip).toFixed(2)}</CrmMetricCell>
          <CrmMetricCell label="Confirmed margin">{mask ? '••••' : confirmedMargin.toFixed(2)}</CrmMetricCell>
        </CrmFieldGrid>
        {!mask ? (
          <p className="border-t border-[var(--color-border)] px-4 py-2 text-[11px] text-[var(--color-muted)]">
            Supplier paid out: <AccountingAmount amount={outbound} currency={trip.currency} className="inline-flex" />
          </p>
        ) : null}
      </CrmPanel>

      <CrmPanel title="By service category">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]/60 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--color-subtle)]">
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2 text-right">Services</th>
                <th className="px-3 py-2 text-right">Cost</th>
                <th className="px-3 py-2 text-right">Selling</th>
                <th className="px-3 py-2 text-right">Margin</th>
              </tr>
            </thead>
            <tbody>
              {categoryRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-sm text-[var(--color-muted)]">
                    Add services to see revenue breakdown.
                  </td>
                </tr>
              ) : (
                categoryRows.map((row) => (
                  <tr key={row.category} className="border-b border-[var(--color-border)]/70">
                    <td className="px-3 py-2.5 font-medium">{row.label}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{row.count}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {mask ? '••••' : row.cost.toFixed(2)}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {mask ? '••••' : row.selling.toFixed(2)}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-[var(--color-success)]">
                      {mask ? '••••' : row.margin.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CrmPanel>
    </div>
  )
}
