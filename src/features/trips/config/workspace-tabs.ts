import {
  LayoutDashboard,
  Users,
  Briefcase,
  Route,
  FileText,
  CreditCard,
  BarChart3,
  ClipboardList,
  History,
  type LucideIcon,
} from 'lucide-react'
import type { TripWorkspaceTab } from '@/domain/entities'

export type TripWorkspaceTabGroup = 'overview' | 'operations' | 'finance' | 'activity'

export interface TripWorkspaceTabConfig {
  id: TripWorkspaceTab
  label: string
  description: string
  icon: LucideIcon
  group: TripWorkspaceTabGroup
}

export const TRIP_WORKSPACE_TABS: TripWorkspaceTabConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Trip snapshot, KPIs, dates, and financial summary.',
    icon: LayoutDashboard,
    group: 'overview',
  },
  {
    id: 'clients',
    label: 'Clients',
    description: 'Travelers and contacts linked to this trip.',
    icon: Users,
    group: 'operations',
  },
  {
    id: 'services',
    label: 'Services',
    description: 'Booked services, suppliers, and operational lines.',
    icon: Briefcase,
    group: 'operations',
  },
  {
    id: 'itinerary',
    label: 'Itinerary',
    description: 'Day-by-day schedule and itinerary notes.',
    icon: Route,
    group: 'operations',
  },
  {
    id: 'documents',
    label: 'Trip Documents',
    description: 'Files, vouchers, and trip documentation.',
    icon: FileText,
    group: 'finance',
  },
  {
    id: 'payments',
    label: 'Payments',
    description: 'Client receipts and supplier payments.',
    icon: CreditCard,
    group: 'finance',
  },
  {
    id: 'revenue',
    label: 'Revenue',
    description: 'Selling, margin, and revenue breakdown.',
    icon: BarChart3,
    group: 'finance',
  },
  {
    id: 'tasks',
    label: 'Tasks, Notes & Docs',
    description: 'Internal tasks, notes, and working documents.',
    icon: ClipboardList,
    group: 'activity',
  },
  {
    id: 'changelog',
    label: 'Change Log',
    description: 'Audit trail of edits and stage changes.',
    icon: History,
    group: 'activity',
  },
]

export const TRIP_WORKSPACE_TAB_LABELS = Object.fromEntries(
  TRIP_WORKSPACE_TABS.map((tab) => [tab.id, tab.label]),
) as Record<TripWorkspaceTab, string>

const TRIP_WORKSPACE_TAB_GROUPS: TripWorkspaceTabGroup[] = [
  'overview',
  'operations',
  'finance',
  'activity',
]

export function getTripWorkspaceTabGroups(): Array<{
  group: TripWorkspaceTabGroup
  tabs: TripWorkspaceTabConfig[]
}> {
  return TRIP_WORKSPACE_TAB_GROUPS.map((group) => ({
    group,
    tabs: TRIP_WORKSPACE_TABS.filter((tab) => tab.group === group),
  })).filter((entry) => entry.tabs.length > 0)
}

export function isTripWorkspaceTab(value: string | undefined): value is TripWorkspaceTab {
  return TRIP_WORKSPACE_TABS.some((tab) => tab.id === value)
}
