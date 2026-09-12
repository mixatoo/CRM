import { useMemo } from 'react'
import type { Traveler } from '@/domain/entities/traveler'
import type { Client } from '@/domain/entities/client'
import { canMutate } from '@/domain/policies/permissions'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { useTravelerMutations } from '@/features/travelers/hooks/use-traveler-mutations'
import { TravelerProfileView } from '@/features/travelers/components/profile/TravelerProfileView'
import type { TravelerWorkspaceTab } from '@/features/travelers/config/workspace-tabs'
import { TravelerOverviewTab } from '@/features/travelers/components/tabs/TravelerOverviewTab'
import { TravelerDocumentsTab } from '@/features/travelers/components/tabs/TravelerDocumentsTab'
import { TravelerTripsTab } from '@/features/travelers/components/tabs/TravelerTripsTab'
import { TravelerNotesTab } from '@/features/travelers/components/tabs/TravelerNotesTab'
import { useClients } from '@/features/clients/hooks/use-clients'
import { useAccountManagers } from '@/features/clients/hooks/use-account-managers'
import { accountManagersToPicklistOptions } from '@/features/clients/hooks/use-account-managers'
import { clientPrimaryLabel } from '@/domain/entities/client'

interface TravelerTabContentProps {
  tab: TravelerWorkspaceTab
  traveler: Traveler
  linkedAccount?: Client
}

export function TravelerTabContent({ tab, traveler, linkedAccount }: TravelerTabContentProps) {
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const canEdit = canMutate(role, 'passenger', 'update')
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

  const accountOwnerName = useMemo(() => {
    const ownerId = traveler.accountOwnerId ?? linkedAccount?.accountManagerId
    return managers.find((manager) => manager.id === ownerId)?.name
  }, [linkedAccount?.accountManagerId, managers, traveler.accountOwnerId])

  if (tab === 'overview') return <TravelerOverviewTab traveler={traveler} linkedAccount={linkedAccount} />
  if (tab === 'documents') return <TravelerDocumentsTab traveler={traveler} />
  if (tab === 'trips') return <TravelerTripsTab traveler={traveler} />
  if (tab === 'notes') return <TravelerNotesTab traveler={traveler} />

  return (
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
  )
}
