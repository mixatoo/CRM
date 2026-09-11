import { NavLink, useParams } from 'react-router-dom'
import { cn } from '@/shared/utils/cn'
import { layout } from '@/design-system/tokens/layout'
import { clientWorkspaceFlushSurfaceClassName } from '@/features/clients/components/workspace/client-workspace-chrome'
import { getClientWorkspaceTabGroups } from '@/features/clients/config/workspace-tabs'
import { useClient } from '@/features/clients/hooks/use-clients'
import { ClientsPageTitle } from '@/features/clients/components/list/ClientsPageTitle'
import {
  clientsToolbarRowClassName,
  clientsToolbarTitleSlotClassName,
} from '@/features/clients/components/list/clients-toolbar-chrome'
import { ClientWorkspaceToolbarMeta } from '@/features/clients/components/workspace/ClientWorkspaceToolbarMeta'
import { ClientWorkspaceTabLink } from '@/features/clients/components/workspace/ClientWorkspaceTabLink'
import {
  CLIENT_WORKSPACE_GROUP_LABELS,
  clientWorkspaceTabGroupClassName,
  clientWorkspaceTabGroupDividerClassName,
  clientWorkspaceTabsBandClassName,
  clientWorkspaceTabsRailClassName,
  clientWorkspaceTabsScrollClassName,
} from '@/features/clients/components/workspace/client-workspace-nav-ui'

export function ClientWorkspaceNav() {
  const { clientId } = useParams()
  const { data: client, isLoading } = useClient(clientId)
  const groups = getClientWorkspaceTabGroups(client?.type ?? 'individual')

  return (
    <nav
      aria-label="Client workspace"
      className={cn(
        'overflow-hidden bg-[var(--color-surface)]',
        clientWorkspaceFlushSurfaceClassName,
      )}
    >
      <div className={cn(clientsToolbarRowClassName, 'border-b-0')}>
        <div className={clientsToolbarTitleSlotClassName}>
          <NavLink
            to="/clients"
            className="shrink-0 rounded-[var(--radius-md)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/25"
            end
          >
            <ClientsPageTitle
              secondaryValue={client?.reference}
              secondaryLabel="ID"
              isFetching={isLoading && !client?.reference}
            />
          </NavLink>
        </div>

        <ClientWorkspaceToolbarMeta client={client} isLoading={isLoading} />
      </div>

      <div className={clientWorkspaceTabsBandClassName}>
        <div
          className={cn(
            clientWorkspaceTabsScrollClassName,
            layout.scrollX,
            layout.hideScrollbar,
          )}
        >
          <div className={clientWorkspaceTabsRailClassName}>
            {groups.map((entry, groupIndex) => (
              <div
                key={entry.group}
                className={clientWorkspaceTabGroupClassName}
                role="group"
                aria-label={CLIENT_WORKSPACE_GROUP_LABELS[entry.group]}
              >
                {groupIndex > 0 ? (
                  <span
                    className={clientWorkspaceTabGroupDividerClassName}
                    aria-hidden
                  />
                ) : null}
                {entry.tabs.map((tab) => (
                  <ClientWorkspaceTabLink key={tab.id} tab={tab} clientId={clientId!} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
