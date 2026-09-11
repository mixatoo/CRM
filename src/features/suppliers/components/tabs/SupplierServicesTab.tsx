import { Link } from 'react-router-dom'
import { ExternalLink, Inbox } from 'lucide-react'
import type { Supplier } from '@/domain/entities/supplier'
import { CrmPanel } from '@/design-system/layout/CrmPanel'
import { AccountingAmount } from '@/design-system/components/AccountingAmount'
import { useSupplierLinkedServices } from '@/features/suppliers/hooks/use-suppliers'
import { tableCellClass, tableHeadClass } from '@/design-system/components/table-styles'
import { formatServiceCategory, TRIP_SERVICE_STATUS_LABELS } from '@/domain/entities/trip-service'
import { useQuery } from '@tanstack/react-query'
import { appContainer } from '@/app/container'

interface SupplierServicesTabProps {
  supplier: Supplier
}

export function SupplierServicesTab({ supplier }: SupplierServicesTabProps) {
  const { data: linkedServices = [], isLoading } = useSupplierLinkedServices(supplier.id)

  const tripIds = [...new Set(linkedServices.map((service) => service.tripId))]
  const { data: trips = [] } = useQuery({
    queryKey: ['suppliers', supplier.id, 'services-trip-refs', tripIds],
    queryFn: async () => {
      const results = await Promise.all(tripIds.map((id) => appContainer.uow.trips.findById(id)))
      return results.filter((trip) => trip != null)
    },
    enabled: tripIds.length > 0,
  })

  return (
    <CrmPanel
      title="Linked trip services"
      actions={
        <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-muted)]">
          {linkedServices.length} service{linkedServices.length === 1 ? '' : 's'}
        </span>
      }
    >
      {isLoading ? (
        <p className="px-4 py-6 text-xs text-[var(--color-muted)]">Loading services…</p>
      ) : linkedServices.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
          <Inbox className="h-8 w-8 text-[var(--color-muted)]" strokeWidth={1.5} />
          <p className="text-sm text-[var(--color-muted)]">No trip services linked to {supplier.displayName} yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] text-sm">
            <thead>
              <tr>
                <th className={tableHeadClass('left')}>Service</th>
                <th className={tableHeadClass('left')}>Category</th>
                <th className={tableHeadClass('left')}>Trip</th>
                <th className={tableHeadClass('left')}>Cost</th>
                <th className={tableHeadClass('center')}>Status</th>
                <th className={tableHeadClass('center')} aria-label="Open" />
              </tr>
            </thead>
            <tbody>
              {linkedServices.map((service) => {
                const trip = trips.find((t) => t.id === service.tripId)
                return (
                  <tr key={service.id} className="border-b border-[var(--color-border)] last:border-0">
                    <td className={tableCellClass('left', { extra: 'max-w-[12rem] truncate font-medium' })} title={service.name}>
                      {service.name}
                    </td>
                    <td className={tableCellClass('left', { muted: true, extra: 'text-xs' })}>
                      {formatServiceCategory(service.category)}
                    </td>
                    <td className={tableCellClass('left', { extra: 'font-mono text-xs text-[var(--color-accent)]' })}>
                      {trip ? (
                        <Link to={`/trips/${trip.id}/services`} className="hover:underline">
                          {trip.reference}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className={tableCellClass('left')}>
                      <AccountingAmount amount={service.cost} currency={service.currency} className="min-w-0" />
                    </td>
                    <td className={tableCellClass('center', { muted: true, extra: 'text-xs' })}>
                      {TRIP_SERVICE_STATUS_LABELS[service.status]}
                    </td>
                    <td className={tableCellClass('center')}>
                      {trip ? (
                        <Link
                          to={`/trips/${trip.id}/services/${service.id}`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-accent)]"
                          aria-label={`Open service on trip ${trip.reference}`}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      ) : null}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </CrmPanel>
  )
}
