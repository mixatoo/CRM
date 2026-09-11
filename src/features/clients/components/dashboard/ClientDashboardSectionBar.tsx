import type { ReactNode } from 'react'
import {
  dashboardSectionBlockClassName,
  dashboardSectionSubtitleClassName,
  dashboardSectionTitleClassName,
} from '@/features/clients/components/dashboard/client-dashboard-modern-ui'
import { cn } from '@/shared/utils/cn'

interface ClientDashboardSectionBarProps {
  title: string
  subtitle?: string
  aside?: ReactNode
  className?: string
  /** @deprecated eyebrow removed — kept for call-site compat */
  eyebrow?: string
}

export function ClientDashboardSectionBar({
  title,
  subtitle,
  aside,
  className,
}: ClientDashboardSectionBarProps) {
  return (
    <header className={cn('flex items-end justify-between gap-3', className)}>
      <div className={dashboardSectionBlockClassName}>
        <h2 className={dashboardSectionTitleClassName}>{title}</h2>
        {subtitle ? <p className={dashboardSectionSubtitleClassName}>{subtitle}</p> : null}
      </div>
      {aside ? <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{aside}</div> : null}
    </header>
  )
}

/** @deprecated */
export function ClientDashboardSectionAside({
  children,
  className,
}: {
  icon?: ReactNode
  label?: string
  children: ReactNode
  className?: string
}) {
  return <div className={className}>{children}</div>
}

/** @deprecated */
export function ClientDashboardSectionDivider() {
  return null
}
