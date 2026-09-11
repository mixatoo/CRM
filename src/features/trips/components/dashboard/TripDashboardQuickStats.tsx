import type { Trip } from '@/domain/entities'
import { tripClientBalanceDue } from '@/domain/entities'
import { openInvoiceReceivables } from '@/domain/trip/trip-financial-sync'
import { shouldMaskFinancials } from '@/domain/policies/permissions'
import { CrmFieldGrid, CrmMetricCell, CrmPanel } from '@/design-system/layout/CrmPanel'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { useTripInvoices } from '@/features/trips/hooks/use-trip-invoices'
import { useTripServices } from '@/features/trips/hooks/use-trip-services'
import { useTripPayments } from '@/features/trips/hooks/use-trip-workspace'
import { sumActivePayments } from '@/domain/entities/trip-payment'
import { Link } from 'react-router-dom'

interface TripDashboardQuickStatsProps {
  trip: Trip
}

export function TripDashboardQuickStats({ trip }: TripDashboardQuickStatsProps) {
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const mask = shouldMaskFinancials(role)
  const { data: services = [] } = useTripServices(trip.id)
  const { data: invoices = [] } = useTripInvoices(trip.id)
  const { data: payments = [] } = useTripPayments(trip.id)

  const confirmed = services.filter((service) => service.status === 'confirmed').length
  const openInvoices = invoices.filter((invoice) => invoice.status !== 'void' && invoice.status !== 'paid').length
  const collected = sumActivePayments(payments, 'inbound')

  return (
    <CrmPanel
      title="Workspace pulse"
      actions={
        <div className="flex flex-wrap gap-2 text-[11px]">
          <Link to={`/trips/${trip.id}/services`} className="text-[var(--color-accent)] hover:underline">
            Services
          </Link>
          <Link to={`/trips/${trip.id}/documents`} className="text-[var(--color-accent)] hover:underline">
            Invoices
          </Link>
          <Link to={`/trips/${trip.id}/payments`} className="text-[var(--color-accent)] hover:underline">
            Payments
          </Link>
          <Link to={`/trips/${trip.id}/revenue`} className="text-[var(--color-accent)] hover:underline">
            Revenue
          </Link>
        </div>
      }
    >
      <CrmFieldGrid columns={5}>
        <CrmMetricCell label="Confirmed services" tone="success">
          {confirmed}
        </CrmMetricCell>
        <CrmMetricCell label="Open invoices" tone="accent">
          {openInvoices}
        </CrmMetricCell>
        <CrmMetricCell label="Payments logged">{payments.filter((p) => p.status !== 'void').length}</CrmMetricCell>
        <CrmMetricCell label="Collected" tone="success">
          {mask ? '••••' : collected.toFixed(2)}
        </CrmMetricCell>
        <CrmMetricCell label="Client balance" tone="warning">
          {mask ? '••••' : tripClientBalanceDue(trip).toFixed(2)}
        </CrmMetricCell>
      </CrmFieldGrid>
      {!mask ? (
        <p className="border-t border-[var(--color-border)] px-4 py-2 text-[11px] text-[var(--color-muted)]">
          Open invoice receivables: {openInvoiceReceivables(invoices).toFixed(2)} {trip.currency}
        </p>
      ) : null}
    </CrmPanel>
  )
}
