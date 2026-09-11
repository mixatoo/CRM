import { useMemo } from 'react'
import type { Client } from '@/domain/entities/client'
import {
  CLIENT_JOINED_COMPANY_LABEL,
  clientPrimaryLabel,
  resolveClientJoinedAt,
} from '@/domain/entities/client'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { formatDate } from '@/shared/utils/date-format'
import {
  clientWorkspaceToolbarBadgesCellClassName,
  clientWorkspaceToolbarCellClassName,
  clientWorkspaceToolbarIdentityCellClassName,
  clientWorkspaceToolbarLabelsCellClassName,
  clientWorkspaceToolbarMetaGridClassName,
  clientsToolbarWorkspaceMetaSlotClassName,
} from '@/features/clients/components/list/clients-toolbar-chrome'
import { ClientMembershipBadge } from '@/features/clients/components/membership/ClientMembershipBadge'
import { ClientStatusBadge } from '@/features/clients/components/ClientStatusBadge'
import { ClientTypeBadge } from '@/features/clients/components/ClientTypeBadge'
import { EntityLabelsField } from '@/features/labels/components/EntityLabelsField'
import { canManageEntityLabels } from '@/features/labels/components/WorkspaceEntityLabels'
import { cn } from '@/shared/utils/cn'

const TOOLBAR_BADGE_CLASS = 'h-6 w-full min-w-0 px-1 text-[10px]'

function buildClientSinceCaption(client: Client): string {
  return `${CLIENT_JOINED_COMPANY_LABEL} ${formatDate(resolveClientJoinedAt(client))}`
}

interface ClientWorkspaceToolbarMetaProps {
  client?: Client
  isLoading?: boolean
  className?: string
}

export function ClientWorkspaceToolbarMeta({
  client,
  isLoading,
  className,
}: ClientWorkspaceToolbarMetaProps) {
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const canEditLabels = canManageEntityLabels(role, 'client')
  const name = client ? clientPrimaryLabel(client) : ''
  const caption = useMemo(
    () => (client ? buildClientSinceCaption(client) : undefined),
    [client],
  )

  if (isLoading || !client) {
    return (
      <div className={cn(clientsToolbarWorkspaceMetaSlotClassName, className)} aria-hidden>
        <div className={clientWorkspaceToolbarMetaGridClassName}>
          <div className={cn(clientWorkspaceToolbarCellClassName, clientWorkspaceToolbarIdentityCellClassName)}>
            <span className="h-3 w-full animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)]" />
            <span className="h-2.5 w-2/3 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)]/80" />
          </div>
          <div className={clientWorkspaceToolbarCellClassName}>
            <span className="h-[1.375rem] w-14 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)]" />
            <span className="h-[1.375rem] w-12 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)]" />
          </div>
          <div className={cn(clientWorkspaceToolbarCellClassName, clientWorkspaceToolbarBadgesCellClassName)}>
            <span className="h-6 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)]" />
            <span className="h-6 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)]" />
            <span className="h-6 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)]" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(clientsToolbarWorkspaceMetaSlotClassName, className)}>
      <div className={clientWorkspaceToolbarMetaGridClassName}>
        <div className={cn(clientWorkspaceToolbarCellClassName, clientWorkspaceToolbarIdentityCellClassName)}>
          <p
            className="w-full min-w-0 truncate text-[12px] font-semibold leading-tight tracking-[-0.01em] text-[var(--color-foreground)]"
            title={name}
          >
            {name}
          </p>
          {caption ? (
            <p className="w-full min-w-0 truncate text-[10px] leading-tight text-[var(--color-muted)]" title={caption}>
              {caption}
            </p>
          ) : null}
        </div>

        <div className={clientWorkspaceToolbarLabelsCellClassName}>
          <EntityLabelsField
            targetType="client"
            targetId={client.id}
            disabled={!canEditLabels}
            layout="inline"
            maxVisible={4}
            nowrap
            className="min-w-0 w-full gap-1"
          />
        </div>

        <div className={cn(clientWorkspaceToolbarCellClassName, clientWorkspaceToolbarBadgesCellClassName)}>
          <ClientTypeBadge type={client.type} className={TOOLBAR_BADGE_CLASS} />
          <ClientMembershipBadge
            membership={client.membership}
            showIcon={false}
            className={TOOLBAR_BADGE_CLASS}
          />
          <ClientStatusBadge status={client.status} className={TOOLBAR_BADGE_CLASS} />
        </div>
      </div>
    </div>
  )
}
