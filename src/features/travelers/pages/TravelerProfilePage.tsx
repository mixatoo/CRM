import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { canMutate } from '@/domain/policies/permissions'
import { travelerDisplayName } from '@/domain/entities/traveler'
import { clientPrimaryLabel } from '@/domain/entities/client'
import { Page } from '@/design-system/layout/Page'
import { Button } from '@/design-system/components/Button'
import { Skeleton } from '@/design-system/components/Skeleton'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { useTraveler } from '@/features/travelers/hooks/use-travelers'
import { useTravelerMutations } from '@/features/travelers/hooks/use-traveler-mutations'
import { TravelerProfileView } from '@/features/travelers/components/profile/TravelerProfileView'
import {
  TravelerNationalityBadge,
  TravelerStatusBadge,
  TravelerVipBadge,
} from '@/features/travelers/components/profile/TravelerProfileBadges'
import { ClientReferenceCopy } from '@/features/clients/components/ClientReferenceCopy'
import { useClients } from '@/features/clients/hooks/use-clients'
import { useAccountManagers } from '@/features/clients/hooks/use-account-managers'
import { accountManagersToPicklistOptions } from '@/features/clients/hooks/use-account-managers'
import { CRM_LABELS } from '@/features/clients/config/crm-labels'

export function TravelerProfilePage() {
  const { travelerId } = useParams<{ travelerId: string }>()
  const navigate = useNavigate()
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const canEdit = canMutate(role, 'passenger', 'update')
  const { data: traveler, isLoading, isError } = useTraveler(travelerId)
  const { data: clients = [] } = useClients()
  const { data: managers = [] } = useAccountManagers()
  const { updateTravelerProfile, isProfileSaving } = useTravelerMutations()

  const accountOptions = useMemo(
    () =>
      clients.map((client) => ({
        value: client.id,
        label: `${client.reference} · ${clientPrimaryLabel(client)}`,
      })),
    [clients],
  )

  const accountOwnerOptions = useMemo(() => accountManagersToPicklistOptions(managers), [managers])

  const linkedAccount = useMemo(
    () => clients.find((client) => client.id === traveler?.accountId),
    [clients, traveler?.accountId],
  )

  const accountOwnerName = useMemo(() => {
    const ownerId = traveler?.accountOwnerId ?? linkedAccount?.accountManagerId
    return managers.find((manager) => manager.id === ownerId)?.name
  }, [linkedAccount?.accountManagerId, managers, traveler?.accountOwnerId])

  if (isLoading) {
    return (
      <Page>
        <div className="space-y-3 p-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-[32rem] w-full rounded-[var(--radius-lg)]" />
        </div>
      </Page>
    )
  }

  if (isError || !traveler) {
    return (
      <Page>
        <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="text-sm font-semibold text-[var(--color-foreground)]">
            Passenger profile not found
          </p>
          <p className="text-xs text-[var(--color-muted)]">
            The traveler may have been deleted or the link is invalid.
          </p>
          <Button type="button" variant="secondary" size="sm" onClick={() => navigate('/travelers')}>
            Back to travelers
          </Button>
        </div>
      </Page>
    )
  }

  return (
    <Page>
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <header className="flex shrink-0 flex-wrap items-center gap-3 border-b border-[var(--color-border)] px-3 py-2.5 sm:px-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-2"
            onClick={() => navigate('/travelers')}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Travelers
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h1 className="truncate text-sm font-semibold tracking-[-0.01em] text-[var(--color-foreground)] sm:text-base">
                {travelerDisplayName(traveler)}
              </h1>
              <ClientReferenceCopy reference={traveler.reference} variant="inline" className="text-xs" />
              <TravelerStatusBadge status={traveler.status ?? 'active'} />
              {traveler.vipLevel ? <TravelerVipBadge level={traveler.vipLevel} /> : null}
              {traveler.primaryNationality || traveler.nationality ? (
                <TravelerNationalityBadge
                  nationality={(traveler.primaryNationality || traveler.nationality)!}
                />
              ) : null}
            </div>
            {linkedAccount ? (
              <p className="mt-0.5 truncate text-[11px] text-[var(--color-muted)]">
                {CRM_LABELS.account}:{' '}
                <Link
                  to={`/clients/${linkedAccount.id}/travelers`}
                  className="font-medium text-[var(--color-foreground)] hover:text-[var(--color-accent)]"
                >
                  {clientPrimaryLabel(linkedAccount)}
                </Link>
                {accountOwnerName ? ` · Owner: ${accountOwnerName}` : ''}
              </p>
            ) : null}
          </div>
        </header>

        <div className="min-h-0 flex-1 p-2 sm:p-3">
          <TravelerProfileView
            traveler={traveler}
            accountOptions={accountOptions}
            accountOwnerOptions={accountOwnerOptions}
            accountOwnerName={accountOwnerName}
            canEdit={canEdit}
            isSaving={isProfileSaving}
            onSave={(patch) => {
              updateTravelerProfile.mutate({ id: traveler.id, patch })
            }}
            className="h-full"
          />
        </div>
      </div>
    </Page>
  )
}
