import {
  LayoutDashboard,
  UserCircle,
  FileText,
  MapPin,
  StickyNote,
  type LucideIcon,
} from 'lucide-react'

export type TravelerWorkspaceTab = 'overview' | 'profile' | 'documents' | 'trips' | 'notes'

export interface TravelerWorkspaceTabConfig {
  id: TravelerWorkspaceTab
  label: string
  icon: LucideIcon
}

export const TRAVELER_WORKSPACE_TABS: TravelerWorkspaceTabConfig[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'profile', label: 'Profile', icon: UserCircle },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'trips', label: 'Trips', icon: MapPin },
  { id: 'notes', label: 'Notes', icon: StickyNote },
]

export const TRAVELER_WORKSPACE_TAB_LABELS = Object.fromEntries(
  TRAVELER_WORKSPACE_TABS.map((tab) => [tab.id, tab.label]),
) as Record<TravelerWorkspaceTab, string>

export function isTravelerWorkspaceTab(value: string | undefined): value is TravelerWorkspaceTab {
  return TRAVELER_WORKSPACE_TABS.some((tab) => tab.id === value)
}
