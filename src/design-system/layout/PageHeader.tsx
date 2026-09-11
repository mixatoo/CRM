import type { ReactNode } from 'react'
import { layout } from '@/design-system/tokens/layout'
import { cn } from '@/shared/utils/cn'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-3 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between', className)}>
      <div className="min-w-0">
        <h1 className={layout.pageTitle}>{title}</h1>
        {description && <p className={cn('mt-1', layout.caption)}>{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
