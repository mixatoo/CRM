import type { Transfer } from '@/domain/entities/transfer'
import type { TransferWorkspaceTab } from '@/features/transfers/config/workspace-tabs'
import { RouteTab } from '@/features/transfers/components/tabs/RouteTab'
import { ServiceTab } from '@/features/transfers/components/tabs/ServiceTab'
import { PassengersTab } from '@/features/transfers/components/tabs/PassengersTab'
import { FleetTab } from '@/features/transfers/components/tabs/FleetTab'
import { CostTab } from '@/features/transfers/components/tabs/CostTab'
import { NotesTab } from '@/features/transfers/components/tabs/NotesTab'
import { ActivityTab } from '@/features/transfers/components/tabs/ActivityTab'

interface TransferTabContentProps {
  tab: TransferWorkspaceTab
  transfer: Transfer
}

export function TransferTabContent({ tab, transfer }: TransferTabContentProps) {
  if (tab === 'route') return <RouteTab transfer={transfer} />
  if (tab === 'service') return <ServiceTab transfer={transfer} />
  if (tab === 'passengers') return <PassengersTab transfer={transfer} />
  if (tab === 'fleet') return <FleetTab transfer={transfer} />
  if (tab === 'cost') return <CostTab transfer={transfer} />
  if (tab === 'notes') return <NotesTab transfer={transfer} />
  if (tab === 'activity') return <ActivityTab transfer={transfer} />
  return null
}
