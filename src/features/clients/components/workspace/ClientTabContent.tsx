import type { Client } from '@/domain/entities/client'
import type { ClientWorkspaceTab } from '@/features/clients/config/workspace-tabs'
import { ClientOverviewTab } from '@/features/clients/components/tabs/ClientOverviewTab'
import { ClientProfileTab } from '@/features/clients/components/tabs/ClientProfileTab'
import { ClientTripsTab } from '@/features/clients/components/tabs/ClientTripsTab'
import { ClientServicesTab } from '@/features/clients/components/tabs/ClientServicesTab'
import { ClientPaymentsTab } from '@/features/clients/components/tabs/ClientPaymentsTab'
import { ClientInvoicesTab } from '@/features/clients/components/tabs/ClientInvoicesTab'
import { ClientTravelersTab } from '@/features/travelers'
import { useAuthStore } from '@/features/auth/store/auth-store'

interface ClientTabContentProps {
  tab: ClientWorkspaceTab
  client: Client
}

export function ClientTabContent({ tab, client }: ClientTabContentProps) {
  const role = useAuthStore((state) => state.user?.role ?? 'guest')

  if (tab === 'overview') {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <ClientOverviewTab client={client} role={role} />
      </div>
    )
  }
  if (tab === 'profile') {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <ClientProfileTab client={client} />
      </div>
    )
  }
  if (tab === 'travelers') {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <ClientTravelersTab client={client} />
      </div>
    )
  }
  if (tab === 'invoices') {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <ClientInvoicesTab client={client} />
      </div>
    )
  }
  if (tab === 'payments') {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <ClientPaymentsTab client={client} />
      </div>
    )
  }
  if (tab === 'trips') {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <ClientTripsTab client={client} />
      </div>
    )
  }
  if (tab === 'services') {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <ClientServicesTab client={client} />
      </div>
    )
  }
  return null
}
