import type { LucideIcon } from 'lucide-react'
import type { DashboardSectionTheme } from '@/features/clients/components/dashboard/client-dashboard-themes'
import {
  dashboardSectionIconClassName,
  dashboardSectionIconWrapClassName,
  dashboardTitleClassName,
  dashboardTitleRowClassName,
} from '@/features/clients/components/dashboard/client-dashboard-chrome'

interface DashboardSectionTitleProps {
  title: string
  icon?: LucideIcon
  theme?: DashboardSectionTheme
  as?: 'h3' | 'h4'
}

export function DashboardSectionTitle({
  title,
  icon: Icon,
  theme,
  as: Tag = 'h3',
}: DashboardSectionTitleProps) {
  return (
    <div className={dashboardTitleRowClassName(theme)}>
      {Icon ? (
        <span className={dashboardSectionIconWrapClassName(theme)} aria-hidden>
          <Icon className={dashboardSectionIconClassName} />
        </span>
      ) : null}
      <Tag className={dashboardTitleClassName}>{title}</Tag>
    </div>
  )
}
