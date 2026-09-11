import { useMemo } from 'react'
import { tripTotalSelling, type Trip } from '@/domain/entities'
import { AccountingAmount } from '@/design-system/components/AccountingAmount'
import { TripStageBadge } from '@/features/trips/components/list/TripStageBadge'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { EntityLabelsField } from '@/features/labels/components/EntityLabelsField'
import { canManageEntityLabels } from '@/features/labels/components/WorkspaceEntityLabels'
import { clientsToolbarWorkspaceMetaSlotClassName } from '@/features/clients/components/list/clients-toolbar-chrome'
import {
  tripWorkspaceToolbarBadgesCellClassName,
  tripWorkspaceToolbarCellClassName,
  tripWorkspaceToolbarFinancialsCellClassName,
  tripWorkspaceToolbarIdentityCellClassName,
  tripWorkspaceToolbarLabelsCellClassName,
  tripWorkspaceToolbarMetaGridClassName,
} from '@/features/trips/components/workspace/trip-workspace-nav-ui'
import { cn } from '@/shared/utils/cn'

const TOOLBAR_BADGE_CLASS = 'h-6 w-full min-w-0 px-1 text-[10px]'

function buildTripCaption(trip: Trip): string {
  const destination = trip.destination ?? trip.branch
  return `Owner: ${trip.ownerName} · Destination: ${destination}`
}

interface TripWorkspaceToolbarMetaProps {
  trip?: Trip
  isLoading?: boolean
  className?: string
}

export function TripWorkspaceToolbarMeta({ trip, isLoading, className }: TripWorkspaceToolbarMetaProps) {
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const canEditLabels = canManageEntityLabels(role, 'trip')
  const caption = useMemo(() => (trip ? buildTripCaption(trip) : undefined), [trip])

  if (isLoading || !trip) {
    return (
      <div className={cn(clientsToolbarWorkspaceMetaSlotClassName, className)} aria-hidden>
        <div className={tripWorkspaceToolbarMetaGridClassName}>
          <div className={cn(tripWorkspaceToolbarCellClassName, tripWorkspaceToolbarIdentityCellClassName)}>
            <span className="h-3 w-full animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)]" />
            <span className="h-2.5 w-2/3 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)]/80" />
          </div>
          <div className={tripWorkspaceToolbarCellClassName}>
            <span className="h-[1.375rem] w-14 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)]" />
          </div>
          <div className={tripWorkspaceToolbarFinancialsCellClassName}>
            <span className="h-3 w-16 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)]" />
            <span className="h-3 w-16 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)]" />
          </div>
          <div className={cn(tripWorkspaceToolbarCellClassName, tripWorkspaceToolbarBadgesCellClassName)}>
            <span className="h-6 w-16 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)]" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(clientsToolbarWorkspaceMetaSlotClassName, className)}>
      <div className={tripWorkspaceToolbarMetaGridClassName}>
        <div className={cn(tripWorkspaceToolbarCellClassName, tripWorkspaceToolbarIdentityCellClassName)}>
          <p
            className="w-full min-w-0 truncate text-[12px] font-semibold leading-tight tracking-[-0.01em] text-[var(--color-foreground)]"
            title={trip.name}
          >
            {trip.name}
          </p>
          {caption ? (
            <p className="w-full min-w-0 truncate text-[10px] leading-tight text-[var(--color-muted)]" title={caption}>
              {caption}
            </p>
          ) : null}
        </div>

        <div className={tripWorkspaceToolbarLabelsCellClassName}>
          <EntityLabelsField
            targetType="trip"
            targetId={trip.id}
            disabled={!canEditLabels}
            layout="inline"
            maxVisible={3}
            nowrap
            className="min-w-0 w-full gap-1"
          />
        </div>

        <div className={tripWorkspaceToolbarFinancialsCellClassName}>
          <CompactAmount label="Cost" amount={trip.totalCost} currency={trip.currency} />
          <CompactAmount label="Sell" amount={tripTotalSelling(trip)} currency={trip.currency} />
        </div>

        <div className={cn(tripWorkspaceToolbarCellClassName, tripWorkspaceToolbarBadgesCellClassName)}>
          <TripStageBadge stage={trip.stage} className={TOOLBAR_BADGE_CLASS} />
        </div>
      </div>
    </div>
  )
}

function CompactAmount({
  label,
  amount,
  currency,
}: {
  label: string
  amount: number
  currency: string
}) {
  return (
    <div className="flex min-w-0 items-baseline gap-1 leading-none">
      <span className="shrink-0 text-[10px] text-[var(--color-muted)]">{label}</span>
      <AccountingAmount
        amount={amount}
        currency={currency}
        className="min-w-0 gap-1"
        amountClassName="text-[11px] font-semibold text-[var(--color-foreground)]"
        currencyClassName="text-[10px] text-[var(--color-muted)]"
      />
    </div>
  )
}
