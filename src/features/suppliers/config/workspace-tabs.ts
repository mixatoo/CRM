import {
  LayoutDashboard,
  UserCircle,
  Package,
  StickyNote,
  type LucideIcon,
} from 'lucide-react'

export type SupplierWorkspaceTab = 'overview' | 'profile' | 'services' | 'notes'

export interface SupplierWorkspaceTabConfig {
  id: SupplierWorkspaceTab
  label: string
  icon: LucideIcon
}

export const SUPPLIER_WORKSPACE_TABS: SupplierWorkspaceTabConfig[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'profile', label: 'Profile', icon: UserCircle },
  { id: 'services', label: 'Services', icon: Package },
  { id: 'notes', label: 'Notes', icon: StickyNote },
]

export const SUPPLIER_WORKSPACE_TAB_LABELS = Object.fromEntries(
  SUPPLIER_WORKSPACE_TABS.map((tab) => [tab.id, tab.label]),
) as Record<SupplierWorkspaceTab, string>

export function isSupplierWorkspaceTab(value: string | undefined): value is SupplierWorkspaceTab {
  return SUPPLIER_WORKSPACE_TABS.some((tab) => tab.id === value)
}
