import { NavLink } from 'react-router-dom'
import type { ClientWorkspaceTabConfig } from '@/features/clients/config/workspace-tabs'
import {
  clientWorkspaceTabClassName,
  clientWorkspaceTabIconClassName,
  clientWorkspaceTabIconWrapClassName,
} from '@/features/clients/components/workspace/client-workspace-nav-ui'

interface ClientWorkspaceTabLinkProps {
  tab: ClientWorkspaceTabConfig
  clientId: string
}

export function ClientWorkspaceTabLink({ tab, clientId }: ClientWorkspaceTabLinkProps) {
  const { id, label, description, icon: Icon } = tab

  return (
    <NavLink
      to={`/clients/${clientId}/${id}`}
      end={id === 'profile'}
      title={description}
      aria-label={description}
      className={({ isActive }) => clientWorkspaceTabClassName(isActive)}
    >
      {({ isActive }) => (
        <>
          <span className={clientWorkspaceTabIconWrapClassName(isActive)} aria-hidden>
            <Icon className={clientWorkspaceTabIconClassName(isActive)} />
          </span>
          <span className="min-w-0 truncate">{label}</span>
          {isActive ? <span className="sr-only">, current section</span> : null}
        </>
      )}
    </NavLink>
  )
}
