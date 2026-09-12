import {
  MapPinned,
  ConciergeBell,
  Users,
  Car,
  Wallet,
  StickyNote,
  Activity,
  type LucideIcon,
} from 'lucide-react'
import type { TransferWorkspaceTab } from '@/domain/entities/transfer'

export type { TransferWorkspaceTab }

export interface TransferWorkspaceTabConfig {
  id: TransferWorkspaceTab
  label: string
  icon: LucideIcon
}

export const TRANSFER_WORKSPACE_TABS: TransferWorkspaceTabConfig[] = [
  { id: 'route', label: 'Route', icon: MapPinned },
  { id: 'service', label: 'Service', icon: ConciergeBell },
  { id: 'passengers', label: 'Passengers', icon: Users },
  { id: 'fleet', label: 'Fleet', icon: Car },
  { id: 'cost', label: 'Cost', icon: Wallet },
  { id: 'notes', label: 'Notes', icon: StickyNote },
  { id: 'activity', label: 'Activity', icon: Activity },
]

export const TRANSFER_WORKSPACE_TAB_LABELS = Object.fromEntries(
  TRANSFER_WORKSPACE_TABS.map((tab) => [tab.id, tab.label]),
) as Record<TransferWorkspaceTab, string>

export function isTransferWorkspaceTab(value: string | undefined): value is TransferWorkspaceTab {
  return TRANSFER_WORKSPACE_TABS.some((tab) => tab.id === value)
}
