import type { ReactNode } from 'react'
import {
  modernDashboardSectionDescriptionClassName,
  modernDashboardSectionTitleClassName,
} from '@/features/clients/components/dashboard/client-dashboard-modern-ui'
import { cn } from '@/shared/utils/cn'

interface ClientDashboardSectionHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function ClientDashboardSectionHeader({
  title,
  description,
  actions,
  className,
}: ClientDashboardSectionHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-3', className)}>
      <div className="min-w-0">
        <h2 className={modernDashboardSectionTitleClassName}>{title}</h2>
        {description ? (
          <p className={modernDashboardSectionDescriptionClassName}>{description}</p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  )
}
