import type { ReactNode } from 'react'
import { crmPanelClassName } from '@/design-system/layout/CrmPanel'
import { cn } from '@/shared/utils/cn'
import { dashboardSectionHeaderClassName } from '@/features/clients/components/dashboard/client-dashboard-chrome'
import { DashboardSectionTitle } from '@/features/clients/components/dashboard/DashboardSectionTitle'
import { resolveSectionIcon } from '@/features/clients/components/dashboard/client-dashboard-icons'
import { resolveSectionTheme } from '@/features/clients/components/dashboard/client-dashboard-themes'

interface DashboardSectionPanelProps {
  title: string
  children: ReactNode
  headerActions?: ReactNode
  className?: string
  as?: 'section' | 'article'
}

export function DashboardSectionPanel({
  title,
  children,
  headerActions,
  className,
  as: Tag = 'section',
}: DashboardSectionPanelProps) {
  const theme = resolveSectionTheme(title)

  return (
    <Tag className={cn(crmPanelClassName, className)}>
      <header className={dashboardSectionHeaderClassName(title, theme)}>
        {headerActions ? (
          <div className="flex min-w-0 items-center justify-between gap-3">
            <DashboardSectionTitle
              as="h4"
              title={title}
              icon={resolveSectionIcon(title)}
              theme={theme}
            />
            {headerActions}
          </div>
        ) : (
          <DashboardSectionTitle
            as="h4"
            title={title}
            icon={resolveSectionIcon(title)}
            theme={theme}
          />
        )}
      </header>
      {children}
    </Tag>
  )
}
