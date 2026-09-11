import { Pencil } from 'lucide-react'
import { tripTotalSelling, type Trip } from '@/domain/entities'
import { AccountingAmount } from '@/design-system/components/AccountingAmount'
import { TravelCard } from '@/design-system/layout/TravelCard'
import { WorkspaceEntityLabels } from '@/features/labels/components/WorkspaceEntityLabels'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { layout } from '@/design-system/tokens/layout'
import { cn } from '@/shared/utils/cn'

interface TripInfoBarProps {
  trip: Trip
}

export function TripInfoBar({ trip }: TripInfoBarProps) {
  const role = useAuthStore((state) => state.user?.role ?? 'guest')

  return (
    <TravelCard className="animate-fade-in" contentClassName="p-0 sm:p-0">
      <div className="px-3 py-2 sm:px-4">
        <div className="grid items-start gap-3 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-y-2">
        <div className="min-w-0">
          <h2 className={cn('mb-0.5 flex items-center gap-1.5 leading-tight', layout.entityTitle)}>
            <span className="truncate">{trip.name}</span>
            <button
              type="button"
              aria-label="Edit trip name"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-accent)] hover:bg-[var(--color-surface-muted)] sm:h-auto sm:w-auto sm:p-0"
            >
              <Pencil className="h-3 w-3" />
            </button>
          </h2>
          <p className={cn('truncate leading-snug', layout.caption)}>
            Owner: {trip.ownerName}
            <span className="mx-1.5 text-[var(--color-border-strong)]">·</span>
            Trip ID: {trip.reference}
            <span className="mx-1.5 text-[var(--color-border-strong)]">·</span>
            Destination: {trip.destination ?? trip.branch}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-[var(--color-border)] pt-3 sm:flex sm:items-stretch sm:gap-8 sm:border-0 sm:pt-0 lg:gap-16">
          <PriceBlock label="Trip Cost" amount={trip.totalCost} currency={trip.currency} />
          <div aria-hidden className="hidden w-px shrink-0 bg-[var(--color-border)] sm:block" />
          <PriceBlock label="Trip Sell" amount={tripTotalSelling(trip)} currency={trip.currency} />
        </div>
        </div>
      </div>
      <WorkspaceEntityLabels targetType="trip" targetId={trip.id} role={role} />
    </TravelCard>
  )
}

function PriceBlock({ label, amount, currency }: { label: string; amount: number; currency: string }) {
  return (
    <div className="min-w-0 flex-1 px-1">
      <div className={cn('mb-1 leading-tight', layout.statLabel)}>{label}</div>
      <AccountingAmount
        amount={amount}
        currency={currency}
        className="w-full min-w-0 justify-start gap-2 sm:justify-end sm:gap-2.5"
        amountClassName="min-w-0 text-base font-bold text-[var(--color-accent)] sm:text-lg"
      />
    </div>
  )
}
