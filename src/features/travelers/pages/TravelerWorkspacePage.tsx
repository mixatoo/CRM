import { useMemo } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { WorkspaceShell } from '@/design-system/layout/WorkspaceShell'
import { WorkspaceContent } from '@/design-system/layout/WorkspaceContent'
import { WorkspaceZone } from '@/design-system/layout/WorkspaceZone'
import { CardSkeleton } from '@/design-system/components/Skeleton'
import { Button } from '@/design-system/components/Button'
import { layout } from '@/design-system/tokens/layout'
import { cn } from '@/shared/utils/cn'
import { useTraveler } from '@/features/travelers/hooks/use-travelers'
import { useClients } from '@/features/clients/hooks/use-clients'
import { useAccountManagers } from '@/features/clients/hooks/use-account-managers'
import { isTravelerWorkspaceTab } from '@/features/travelers/config/workspace-tabs'
import { TravelerWorkspaceNav } from '@/features/travelers/components/workspace/TravelerWorkspaceNav'
import { TravelerInfoBar } from '@/features/travelers/components/workspace/TravelerInfoBar'
import { TravelerTabContent } from '@/features/travelers/components/workspace/TravelerTabContent'

export function TravelerWorkspacePage() {
  const { travelerId, tab } = useParams()
  const navigate = useNavigate()
  const activeTab = isTravelerWorkspaceTab(tab) ? tab : 'overview'
  const { data: traveler, isLoading, isError } = useTraveler(travelerId)
  const { data: clients = [] } = useClients()
  const { data: managers = [] } = useAccountManagers()

  const linkedAccount = useMemo(
    () => clients.find((client) => client.id === traveler?.accountId),
    [clients, traveler?.accountId],
  )

  const accountOwnerName = useMemo(() => {
    const ownerId = traveler?.accountOwnerId ?? linkedAccount?.accountManagerId
    return managers.find((manager) => manager.id === ownerId)?.name
  }, [linkedAccount?.accountManagerId, managers, traveler?.accountOwnerId])

  if (!travelerId) return <Navigate to="/travelers" replace />

  if (!isLoading && (isError || !traveler)) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <h2 className={layout.entityTitle}>Passenger profile not found</h2>
        <p className="text-xs text-[var(--color-muted)]">
          The traveler may have been deleted or the link is invalid.
        </p>
        <Button type="button" variant="secondary" size="sm" onClick={() => navigate('/travelers')}>
          Back to travelers
        </Button>
      </div>
    )
  }

  return (
    <WorkspaceShell layout="viewport">
      <WorkspaceZone label="Traveler navigation" className="shrink-0">
        <TravelerWorkspaceNav />
      </WorkspaceZone>

      {traveler ? (
        <div className={cn('flex min-h-0 flex-1 flex-col', layout.workspaceCards)}>
          <TravelerInfoBar
            traveler={traveler}
            linkedAccount={linkedAccount}
            accountOwnerName={accountOwnerName}
          />
          <WorkspaceContent className="min-h-0 flex-1">
            <TravelerTabContent tab={activeTab} traveler={traveler} linkedAccount={linkedAccount} />
          </WorkspaceContent>
        </div>
      ) : (
        <WorkspaceContent>
          <div className="space-y-3">
            <CardSkeleton />
            <CardSkeleton />
            <div className="grid gap-3 lg:grid-cols-2">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>
        </WorkspaceContent>
      )}
    </WorkspaceShell>
  )
}
