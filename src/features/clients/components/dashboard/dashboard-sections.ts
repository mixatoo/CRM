import { BarChart3, LineChart, type LucideIcon } from 'lucide-react'

export type DashboardSectionId = 'performance' | 'activity'

export interface DashboardSectionMeta {
  id: DashboardSectionId
  label: string
  description: string
  icon: LucideIcon
}

export const DASHBOARD_SECTIONS: DashboardSectionMeta[] = [
  {
    id: 'performance',
    label: 'Performance',
    description: 'Financial health, invoices, and trip pipeline',
    icon: BarChart3,
  },
  {
    id: 'activity',
    label: 'Activity',
    description: 'Revenue and trip volume over time',
    icon: LineChart,
  },
]

export function getDashboardSection(id: DashboardSectionId) {
  return DASHBOARD_SECTIONS.find((section) => section.id === id) ?? DASHBOARD_SECTIONS[0]
}
