import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Transfer } from '@/domain/entities/transfer'
import {
  TRANSFER_KIND_LABELS,
  transferMargin,
  transferPrimaryLabel,
} from '@/domain/entities/transfer'
import { TravelCard } from '@/design-system/layout/TravelCard'
import { AccountingAmount } from '@/design-system/components/AccountingAmount'
import { TripStageBadge } from '@/features/trips/components/list/TripStageBadge'
import { layout } from '@/design-system/tokens/layout'
import { cn } from '@/shared/utils/cn'

interface TransferInfoBarProps {
  transfer: Transfer
}

export function TransferInfoBar({ transfer }: TransferInfoBarProps) {
  const margin = transferMargin(transfer)

  return (
    <TravelCard className="animate-fade-in" contentClassName="p-0 sm:p-0">
      <div className="px-3 py-2 sm:px-4">
        <div className="grid items-start gap-3 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-y-2">
          <div className="min-w-0">
            <h2 className={cn('mb-0.5 truncate leading-tight', layout.entityTitle)}>
              {transferPrimaryLabel(transfer)}
            </h2>
            <p className={cn('flex flex-wrap items-center gap-1.5 leading-snug', layout.caption)}>
              <span>ID: {transfer.reference}</span>
              <span className="text-[var(--color-border-strong)]">·</span>
              <span>{TRANSFER_KIND_LABELS[transfer.kind]}</span>
              <span className="text-[var(--color-border-strong)]">·</span>
              <TripStageBadge stage={transfer.stage} />
              {transfer.tripId ? (
                <>
                  <span className="text-[var(--color-border-strong)]">·</span>
                  <Link
                    to={`/trips/${transfer.tripId}/dashboard`}
                    className="font-medium text-[var(--color-accent)] hover:underline"
                  >
                    {transfer.tripReference ?? 'Linked trip'}
                  </Link>
                </>
              ) : null}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-[var(--color-border)] pt-3 sm:flex sm:items-stretch sm:gap-8 sm:border-0 sm:pt-0 lg:gap-16">
            <MetricBlock label="Selling">
              <AccountingAmount
                amount={transfer.sellingPrice}
                currency={transfer.currency}
                className="w-full min-w-0 justify-start gap-2"
                amountClassName="min-w-0 text-base font-bold text-[var(--color-accent)]"
              />
            </MetricBlock>
            <div aria-hidden className="hidden w-px shrink-0 bg-[var(--color-border)] sm:block" />
            <MetricBlock label="Margin">
              <AccountingAmount
                amount={margin}
                currency={transfer.currency}
                className="w-full min-w-0 justify-start gap-2"
                amountClassName="min-w-0 text-base font-bold text-[var(--color-accent)]"
              />
            </MetricBlock>
          </div>
        </div>
      </div>
    </TravelCard>
  )
}

function MetricBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 flex-1 px-1">
      <div className={cn('mb-1 leading-tight', layout.statLabel)}>{label}</div>
      {children}
    </div>
  )
}
