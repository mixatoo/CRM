import type { UserRole } from '@/domain/entities'
import type { Client } from '@/domain/entities/client'
import { shouldMaskFinancials } from '@/domain/policies/permissions'
import { useClientDashboard } from '@/features/clients/hooks/use-client-dashboard'
import { ClientModernDashboard } from '@/features/clients/components/dashboard/ClientModernDashboard'

interface ClientOverviewTabProps {
  client: Client
  role: UserRole
}

export function ClientOverviewTab({ client, role }: ClientOverviewTabProps) {
  const mask = shouldMaskFinancials(role)
  const { data: metrics, isLoading } = useClientDashboard(client.id, client)

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <ClientModernDashboard
        client={client}
        metrics={metrics}
        isLoading={isLoading}
        maskFinancials={mask}
      />
    </div>
  )
}
