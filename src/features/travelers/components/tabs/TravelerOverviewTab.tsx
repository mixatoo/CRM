import { BadgeCheck, Building2, Flag, Star } from 'lucide-react'
import type { Traveler } from '@/domain/entities/traveler'
import {
  TRAVELER_STATUS_LABELS,
  TRAVELER_VIP_LEVEL_LABELS,
} from '@/domain/entities/traveler'
import { clientPrimaryLabel, type Client } from '@/domain/entities/client'
import { TravelCard } from '@/design-system/layout/TravelCard'
import { CrmFieldGrid, CrmMetricCell, CrmPanel } from '@/design-system/layout/CrmPanel'
import {
  TravelerNationalityBadge,
  TravelerStatusBadge,
  TravelerVipBadge,
} from '@/features/travelers/components/profile/TravelerProfileBadges'
import { formatDate } from '@/shared/utils/date-format'
import { layout } from '@/design-system/tokens/layout'
import { cn } from '@/shared/utils/cn'

interface TravelerOverviewTabProps {
  traveler: Traveler
  linkedAccount?: Client
}

export function TravelerOverviewTab({ traveler, linkedAccount }: TravelerOverviewTabProps) {
  const nationality = traveler.primaryNationality || traveler.nationality

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={BadgeCheck}
          label="Status"
          value={TRAVELER_STATUS_LABELS[traveler.status ?? 'active']}
        />
        <StatCard
          icon={Star}
          label="VIP"
          value={TRAVELER_VIP_LEVEL_LABELS[traveler.vipLevel ?? 'standard']}
        />
        <StatCard
          icon={Building2}
          label="Account"
          value={linkedAccount ? clientPrimaryLabel(linkedAccount) : '—'}
        />
        <StatCard icon={Flag} label="Nationality" value={nationality ?? '—'} />
      </div>

      <CrmPanel title="Traveler summary">
        <CrmFieldGrid columns={2}>
          <CrmMetricCell label="Status">
            <TravelerStatusBadge status={traveler.status ?? 'active'} />
          </CrmMetricCell>
          <CrmMetricCell label="VIP">
            {traveler.vipLevel ? <TravelerVipBadge level={traveler.vipLevel} /> : '—'}
          </CrmMetricCell>
          <CrmMetricCell label="Account">{linkedAccount ? clientPrimaryLabel(linkedAccount) : '—'}</CrmMetricCell>
          <CrmMetricCell label="Nationality">
            {nationality ? <TravelerNationalityBadge nationality={nationality} /> : '—'}
          </CrmMetricCell>
          <CrmMetricCell label="Email">{traveler.email ?? '—'}</CrmMetricCell>
          <CrmMetricCell label="Phone">{traveler.phone ?? '—'}</CrmMetricCell>
        </CrmFieldGrid>
      </CrmPanel>

      <p className="text-[10px] text-[var(--color-subtle)]">
        Created {formatDate(traveler.createdAt)} · Updated {formatDate(traveler.updatedAt)}
      </p>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Flag
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
