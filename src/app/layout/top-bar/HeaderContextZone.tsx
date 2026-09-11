import { CloseButton } from '@/design-system/components/CloseButton'
import { Link, useParams } from 'react-router-dom'
import {
  topBarContextActionsClass,
  topBarContextSlotClass,
} from '@/app/layout/top-bar/top-bar-styles'
import { layout } from '@/design-system/tokens/layout'
import { clientPrimaryLabel } from '@/domain/entities/client'
import { useClient } from '@/features/clients/hooks/use-clients'
import { useClientTabNavigation } from '@/features/clients/hooks/use-client-tab-navigation'
import { useClientTabsStore } from '@/features/clients/store/client-tabs-store'
import type { ClientTabEntry } from '@/features/clients/store/client-tabs-store'
import { supplierPrimaryLabel } from '@/domain/entities/supplier'
import { useSupplier } from '@/features/suppliers/hooks/use-suppliers'
import { useSupplierTabNavigation } from '@/features/suppliers/hooks/use-supplier-tab-navigation'
import { useSupplierTabsStore } from '@/features/suppliers/store/supplier-tabs-store'
import type { SupplierTabEntry } from '@/features/suppliers/store/supplier-tabs-store'
import { useTrip } from '@/features/trips/hooks/use-trips'
import { useTripTabNavigation } from '@/features/trips/hooks/use-trip-tab-navigation'
import { useTripTabsStore } from '@/features/trips/store/trip-tabs-store'
import type { TripTabEntry } from '@/features/trips/store/trip-tabs-store'
import { truncateText } from '@/features/trips/utils/format'
import { cn } from '@/shared/utils/cn'

function TripTabPill({
  entry,
  isActive,
  onClose,
}: {
  entry: TripTabEntry
  isActive: boolean
  onClose: () => void
}) {
  const { data: trip } = useTrip(entry.tripId)
  const reference = trip?.reference ?? entry.tripId.slice(0, 8)
  const label = trip ? truncateText(trip.name, 14) : '…'

  return (
    <div
      className={cn(
        'group/pill flex h-7 min-w-0 max-w-[11rem] shrink-0 items-center rounded-full border pl-2.5 text-[11px] leading-none sm:max-w-[13rem] lg:max-w-[15rem]',
        isActive
          ? 'border-[var(--color-accent)]/40 bg-[var(--color-accent-muted)]/50 text-[var(--color-foreground)]'
          : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-foreground)]',
      )}
    >
      <Link
        to={`/trips/${entry.tripId}/${entry.tab}`}
        className="flex min-w-0 flex-1 items-center gap-1 py-1"
        title={trip ? `${trip.reference} · ${trip.name}` : undefined}
      >
        <span className="shrink-0 font-semibold tabular-nums">{reference}</span>
        <span className="truncate">{label}</span>
      </Link>
      <CloseButton
        size="xs"
        className={cn(
          'mr-0.5',
          !isActive && 'opacity-0 group-hover/pill:opacity-100 focus-visible:opacity-100',
        )}
        aria-label={`Close ${reference}`}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onClose()
        }}
      />
    </div>
  )
}

function ClientTabPill({
  entry,
  isActive,
  onClose,
}: {
  entry: ClientTabEntry
  isActive: boolean
  onClose: () => void
}) {
  const { data: client } = useClient(entry.clientId)
  const reference = client?.reference ?? entry.clientId.slice(0, 8)
  const label = client ? truncateText(clientPrimaryLabel(client), 14) : '…'

  return (
    <div
      className={cn(
        'group/pill flex h-7 min-w-0 max-w-[11rem] shrink-0 items-center rounded-full border pl-2.5 text-[11px] leading-none sm:max-w-[13rem] lg:max-w-[15rem]',
        isActive
          ? 'border-[var(--color-accent)]/40 bg-[var(--color-accent-muted)]/50 text-[var(--color-foreground)]'
          : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-foreground)]',
      )}
    >
      <Link
        to={`/clients/${entry.clientId}/${entry.tab}`}
        className="flex min-w-0 flex-1 items-center gap-1 py-1"
        title={client ? `${client.reference} · ${clientPrimaryLabel(client)}` : undefined}
      >
        <span className="shrink-0 font-semibold tabular-nums">{reference}</span>
        <span className="truncate">{label}</span>
      </Link>
      <CloseButton
        size="xs"
        className={cn(
          'mr-0.5',
          !isActive && 'opacity-0 group-hover/pill:opacity-100 focus-visible:opacity-100',
        )}
        aria-label={`Close ${reference}`}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onClose()
        }}
      />
    </div>
  )
}

function SupplierTabPill({
  entry,
  isActive,
  onClose,
}: {
  entry: SupplierTabEntry
  isActive: boolean
  onClose: () => void
}) {
  const { data: supplier } = useSupplier(entry.supplierId)
  const reference = supplier?.reference ?? entry.supplierId.slice(0, 8)
  const label = supplier ? truncateText(supplierPrimaryLabel(supplier), 14) : '…'

  return (
    <div
      className={cn(
        'group/pill flex h-7 min-w-0 max-w-[11rem] shrink-0 items-center rounded-full border pl-2.5 text-[11px] leading-none sm:max-w-[13rem] lg:max-w-[15rem]',
        isActive
          ? 'border-[var(--color-accent)]/40 bg-[var(--color-accent-muted)]/50 text-[var(--color-foreground)]'
          : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-foreground)]',
      )}
    >
      <Link
        to={`/suppliers/${entry.supplierId}/${entry.tab}`}
        className="flex min-w-0 flex-1 items-center gap-1 py-1"
        title={supplier ? `${supplier.reference} · ${supplierPrimaryLabel(supplier)}` : undefined}
      >
        <span className="shrink-0 font-semibold tabular-nums">{reference}</span>
        <span className="truncate">{label}</span>
      </Link>
      <CloseButton
        size="xs"
        className={cn(
          'mr-0.5',
          !isActive && 'opacity-0 group-hover/pill:opacity-100 focus-visible:opacity-100',
        )}
        aria-label={`Close ${reference}`}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onClose()
        }}
      />
    </div>
  )
}

export function HeaderContextZone() {
  const { tripId: activeTripId, clientId: activeClientId, supplierId: activeSupplierId } = useParams()
  const tripTabs = useTripTabsStore((state) => state.tabs)
  const clientTabs = useClientTabsStore((state) => state.tabs)
  const supplierTabs = useSupplierTabsStore((state) => state.tabs)
  const { closeTripTab, closeAllTripTabs } = useTripTabNavigation()
  const { closeClientTab, closeAllClientTabs } = useClientTabNavigation()
  const { closeSupplierTab, closeAllSupplierTabs } = useSupplierTabNavigation()
  const hasTabs = tripTabs.length > 0 || clientTabs.length > 0 || supplierTabs.length > 0

  const closeAll = () => {
    closeAllTripTabs()
    closeAllClientTabs()
    closeAllSupplierTabs()
  }

  return (
    <div className={topBarContextSlotClass}>
      <div
        className="flex w-full min-w-0 items-center rounded-[var(--radius-md)] bg-[var(--color-surface-muted)]/35"
        role={hasTabs ? 'tablist' : undefined}
        aria-label={hasTabs ? 'Open records' : undefined}
      >
        {hasTabs ? (
          <div className={cn('flex min-w-0 flex-1 items-center gap-1 px-1', layout.scrollX, layout.hideScrollbar)}>
            {tripTabs.map((entry) => (
              <TripTabPill
                key={`trip-${entry.tripId}`}
                entry={entry}
                isActive={activeTripId === entry.tripId}
                onClose={() => closeTripTab(entry.tripId)}
              />
            ))}
            {clientTabs.map((entry) => (
              <ClientTabPill
                key={`client-${entry.clientId}`}
                entry={entry}
                isActive={activeClientId === entry.clientId}
                onClose={() => closeClientTab(entry.clientId)}
              />
            ))}
            {supplierTabs.map((entry) => (
              <SupplierTabPill
                key={`supplier-${entry.supplierId}`}
                entry={entry}
                isActive={activeSupplierId === entry.supplierId}
                onClose={() => closeSupplierTab(entry.supplierId)}
              />
            ))}
          </div>
        ) : (
          <div className="min-w-0 flex-1" aria-hidden />
        )}
        {hasTabs ? (
          <div className={topBarContextActionsClass}>
            <CloseButton
              onClick={closeAll}
              aria-label="Close all open records"
              title="Close all"
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
