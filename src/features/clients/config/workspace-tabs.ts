import type { ClientType } from '@/domain/entities/client'
import {
  LayoutDashboard,
  UserCircle,
  Users,
  Wallet,
  FileText,
  Plane,
  Package,
  type LucideIcon,
} from 'lucide-react'
import { CRM_LABELS } from '@/features/clients/config/crm-labels'

export type ClientWorkspaceTab =
  | 'overview'
  | 'profile'
  | 'travelers'
  | 'payments'
  | 'invoices'
  | 'trips'
  | 'services'

const LEGACY_CLIENT_WORKSPACE_TABS = new Set([
  'contact',
  'financial',
  'membership',
  'sla',
  'notes',
  'commercial',
])

export interface ClientWorkspaceTabConfig {
  id: ClientWorkspaceTab
  label: string
  description: string
  icon: LucideIcon
  /** Hidden for individual clients when false */
  corporateOnly?: boolean
  group: 'overview' | 'profile' | 'operations'
}

const CLIENT_WORKSPACE_TAB_CONFIGS: ClientWorkspaceTabConfig[] = [
  {
    id: 'overview',
    label: 'Dashboard',
    description: 'Account snapshot, KPIs, and quick access to all record areas.',
    icon: LayoutDashboard,
    group: 'overview',
  },
  {
    id: 'profile',
    label: 'Home',
    description: 'Account home — identity, classification, acquisition source, and account ownership.',
    icon: UserCircle,
    group: 'profile',
  },
  {
    id: 'travelers',
    label: CRM_LABELS.travelers,
    description: 'People linked to this account — passengers, bookers, and other contacts.',
    icon: Users,
    group: 'profile',
  },
  {
    id: 'payments',
    label: 'Collections',
    description: 'Inbound client receipts linked to invoices on this account.',
    icon: Wallet,
    group: 'operations',
  },
  {
    id: 'invoices',
    label: 'Invoices',
    description: 'Invoices issued across linked trips for this account.',
    icon: FileText,
    group: 'operations',
  },
  {
    id: 'trips',
    label: 'Trips',
    description: 'Bookings and pipeline trips linked to this account.',
    icon: Plane,
    group: 'operations',
  },
  {
    id: 'services',
    label: 'Services',
    description: 'Trip services across all linked bookings.',
    icon: Package,
    group: 'operations',
  },
]

export const CLIENT_WORKSPACE_TABS = CLIENT_WORKSPACE_TAB_CONFIGS

export function getClientWorkspaceTabs(type: ClientType): ClientWorkspaceTabConfig[] {
  if (type === 'corporate') return CLIENT_WORKSPACE_TAB_CONFIGS
  return CLIENT_WORKSPACE_TAB_CONFIGS.filter((tab) => !tab.corporateOnly)
}

export function getClientWorkspaceTabGroups(
  type: ClientType,
): Array<{ group: ClientWorkspaceTabConfig['group']; tabs: ClientWorkspaceTabConfig[] }> {
  const tabs = getClientWorkspaceTabs(type)
  const groups: ClientWorkspaceTabConfig['group'][] = ['overview', 'profile', 'operations']

  return groups
    .map((group) => ({ group, tabs: tabs.filter((tab) => tab.group === group) }))
    .filter((entry) => entry.tabs.length > 0)
}

export function isClientWorkspaceTab(value: string | undefined): value is ClientWorkspaceTab {
  return CLIENT_WORKSPACE_TAB_CONFIGS.some((tab) => tab.id === value)
}

export function resolveClientWorkspaceTab(
  value: string | undefined,
  type?: ClientType,
): ClientWorkspaceTab {
  if (value && LEGACY_CLIENT_WORKSPACE_TABS.has(value)) return 'profile'
  if (!isClientWorkspaceTab(value)) return 'profile'
  return value
}
