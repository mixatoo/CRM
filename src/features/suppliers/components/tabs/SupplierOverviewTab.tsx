import { Link } from 'react-router-dom'
import { Globe2, Mail, Package, Phone, Tags } from 'lucide-react'
import type { Supplier } from '@/domain/entities/supplier'
import { SUPPLIER_CATEGORY_LABELS, supplierPrimaryLabel } from '@/domain/entities/supplier'
import { TravelCard } from '@/design-system/layout/TravelCard'
import { CrmFieldGrid, CrmPanel, CrmMetricCell } from '@/design-system/layout/CrmPanel'
import { SupplierStatusBadge } from '@/features/suppliers/components/SupplierStatusBadge'
import { maskSupplierField } from '@/features/suppliers/utils/supplier-format'
import { useSupplierLinkedServices } from '@/features/suppliers/hooks/use-suppliers'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { formatDate } from '@/shared/utils/date-format'
import { layout } from '@/design-system/tokens/layout'
import { cn } from '@/shared/utils/cn'
import { formatServiceCategory } from '@/domain/entities/trip-service'
import { useQuery } from '@tanstack/react-query'
import { appContainer } from '@/app/container'

interface SupplierOverviewTabProps {
  supplier: Supplier
}

export function SupplierOverviewTab({ supplier }: SupplierOverviewTabProps) {
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const { data: linkedServices = [] } = useSupplierLinkedServices(supplier.id)
  const confirmedServices = linkedServices.filter((service) => service.status === 'confirmed').length

  const tripIds = [...new Set(linkedServices.map((service) => service.tripId))]
  const { data: trips = [] } = useQuery({
    queryKey: ['suppliers', supplier.id, 'linked-trip-refs', tripIds],
    queryFn: async () => {
      const results = await Promise.all(tripIds.map((id) => appContainer.uow.trips.findById(id)))
      return results.filter((trip) => trip != null)
    },
    enabled: tripIds.length > 0,
  })

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Package} label="Linked services" value={String(linkedServices.length)} />
        <StatCard icon={Tags} label="Confirmed" value={String(confirmedServices)} />
        <StatCard icon={Globe2} label="Country" value={supplier.country ?? '—'} />
        <StatCard icon={Mail} label="Email" value={maskSupplierField(role, supplier.email)} />
      </div>

      <CrmPanel title="Supplier summary">
        <CrmFieldGrid columns={2}>
          <CrmMetricCell label="Display name">{supplier.displayName}</CrmMetricCell>
          <CrmMetricCell label="Primary label">{supplierPrimaryLabel(supplier)}</CrmMetricCell>
          <CrmMetricCell label="Category">{SUPPLIER_CATEGORY_LABELS[supplier.category]}</CrmMetricCell>
          <CrmMetricCell label="Status">
            <SupplierStatusBadge status={supplier.status} />
          </CrmMetricCell>
          <CrmMetricCell label="Contact">{supplier.contactName ?? '—'}</CrmMetricCell>
          <CrmMetricCell label="Phone">{maskSupplierField(role, supplier.phone)}</CrmMetricCell>
          <CrmMetricCell label="Location">
            {[supplier.city, supplier.country].filter(Boolean).join(', ') || '—'}
          </CrmMetricCell>
          <CrmMetricCell label="Currency">{supplier.preferredCurrency ?? 'EGP'}</CrmMetricCell>
        </CrmFieldGrid>
      </CrmPanel>

      <CrmPanel title="Recent services">
        {linkedServices.length === 0 ? (
          <p className="px-4 py-3 text-xs text-[var(--color-muted)]">No trip services linked yet.</p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {linkedServices.slice(0, 5).map((service) => {
              const trip = trips.find((t) => t.id === service.tripId)
              return (
                <li key={service.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{service.name}</p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {formatServiceCategory(service.category)}
                      {trip ? ` · ${trip.reference}` : ''}
                    </p>
                  </div>
                  {trip ? (
                    <Link
                      to={`/trips/${trip.id}/services`}
                      className="shrink-0 text-xs font-medium text-[var(--color-accent)] hover:underline"
                    >
                      Open trip
                    </Link>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}
      </CrmPanel>

      <p className="text-[10px] text-[var(--color-subtle)]">
        Created {formatDate(supplier.createdAt)} · Updated {formatDate(supplier.updatedAt)}
      </p>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Phone
  label: string
  value: string
}) {
  return (
    <TravelCard contentClassName="px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent-muted)]/50 text-[var(--color-accent)]">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className={cn(layout.statLabel, 'mb-1')}>{label}</p>
          <p className="truncate text-base font-semibold text-[var(--color-foreground)]">{value}</p>
        </div>
      </div>
    </TravelCard>
  )
}
