import { Navigate, useParams } from 'react-router-dom'
import { Page } from '@/design-system/layout/Page'
import { WorkspaceContent } from '@/design-system/layout/WorkspaceContent'
import { WorkspaceZone } from '@/design-system/layout/WorkspaceZone'
import { CardSkeleton } from '@/design-system/components/Skeleton'
import { layout } from '@/design-system/tokens/layout'
import {
  clientWorkspaceSectionClassName,
  clientWorkspaceShellClassName,
} from '@/features/clients/components/workspace/client-workspace-chrome'
import { cn } from '@/shared/utils/cn'
import { useClient } from '@/features/clients/hooks/use-clients'
import { resolveClientWorkspaceTab } from '@/features/clients/config/workspace-tabs'
import { ClientWorkspaceNav } from '@/features/clients/components/workspace/ClientWorkspaceNav'
import { ClientTabContent } from '@/features/clients/components/workspace/ClientTabContent'
import { CRM_LABELS } from '@/features/clients/config/crm-labels'

export function ClientWorkspacePage() {
  const { clientId, tab } = useParams()
  const { data: client, isLoading } = useClient(clientId)
  const activeTab = resolveClientWorkspaceTab(tab, client?.type)

  if (!clientId) return <Navigate to="/clients" replace />

  if (client && tab && tab !== activeTab) {
    return <Navigate to={`/clients/${clientId}/${activeTab}`} replace />
  }

  if (!isLoading && !client) {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center p-4 text-center">
        <h2 className={layout.entityTitle}>{CRM_LABELS.accountNotFound}</h2>
      </div>
    )
  }

  return (
    <Page layout="viewportFlush" className="h-full min-h-0 flex-1">
      <div className={clientWorkspaceShellClassName}>
        <section className={cn(clientWorkspaceSectionClassName, 'shrink-0')}>
          <WorkspaceZone label="Client navigation" className="gap-0">
            <ClientWorkspaceNav />
          </WorkspaceZone>
        </section>

        {client ? (
          <section className={cn(clientWorkspaceSectionClassName, 'flex min-h-0 flex-1 flex-col')}>
            <WorkspaceContent
              scroll={
                activeTab !== 'overview' &&
                activeTab !== 'profile' &&
                activeTab !== 'trips' &&
                activeTab !== 'travelers' &&
                activeTab !== 'services' &&
                activeTab !== 'payments' &&
                activeTab !== 'invoices'
              }
              className="h-full min-h-0 flex-1"
            >
              <ClientTabContent tab={activeTab} client={client} />
            </WorkspaceContent>
          </section>
        ) : (
          <section className={cn(clientWorkspaceSectionClassName, 'flex min-h-0 flex-1 flex-col')}>
            <WorkspaceContent className="h-full min-h-0 flex-1">
            <div className="space-y-3 p-4">
              <CardSkeleton />
              <CardSkeleton />
              <div className="grid gap-3 lg:grid-cols-2">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            </div>
            </WorkspaceContent>
          </section>
        )}
      </div>
    </Page>
  )
}
