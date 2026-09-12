import { Link } from 'react-router-dom'
import type { Traveler } from '@/domain/entities/traveler'
import { travelerDisplayName } from '@/domain/entities/traveler'
import { clientPrimaryLabel, type Client } from '@/domain/entities/client'
import { TravelCard } from '@/design-system/layout/TravelCard'
import {
  TravelerNationalityBadge,
  TravelerStatusBadge,
  TravelerVipBadge,
} from '@/features/travelers/components/profile/TravelerProfileBadges'
import { ClientReferenceCopy } from '@/features/clients/components/ClientReferenceCopy'
import { CRM_LABELS } from '@/features/clients/config/crm-labels'
import { layout } from '@/design-system/tokens/layout'
import { cn } from '@/shared/utils/cn'

interface TravelerInfoBarProps {
  traveler: Traveler
  linkedAccount?: Client
  accountOwnerName?: string
}

export function TravelerInfoBar({ traveler, linkedAccount, accountOwnerName }: TravelerInfoBarProps) {
  return (
    <TravelCard className="animate-fade-in" contentClassName="p-0 sm:p-0">
      <div className="px-3 py-2 sm:px-4">
        <div className="min-w-0">
          <h2 className={cn('mb-0.5 flex flex-wrap items-center gap-2 leading-tight', layout.entityTitle)}>
            <span className="truncate">{travelerDisplayName(traveler)}</span>
            <ClientReferenceCopy reference={traveler.reference} variant="inline" className="text-xs" />
            <TravelerStatusBadge status={traveler.status ?? 'active'} />
            {traveler.vipLevel ? <TravelerVipBadge level={traveler.vipLevel} /> : null}
            {traveler.primaryNationality || traveler.nationality ? (
              <TravelerNationalityBadge
                nationality={(traveler.primaryNationality || traveler.nationality)!}
              />
            ) : null}
          </h2>
          {linkedAccount ? (
            <p className={cn('truncate leading-snug', layout.caption)}>
              {CRM_LABELS.account}:{' '}
              <Link
                to={`/clients/${linkedAccount.id}/travelers`}
                className="font-medium text-[var(--color-foreground)] hover:text-[var(--color-accent)]"
              >
                {clientPrimaryLabel(linkedAccount)}
              </Link>
              {accountOwnerName ? ` · Owner: ${accountOwnerName}` : ''}
            </p>
          ) : (
            <p className={cn('leading-snug', layout.caption)}>No linked account</p>
          )}
        </div>
      </div>
    </TravelCard>
  )
}
