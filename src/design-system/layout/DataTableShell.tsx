import type { ReactNode } from 'react'
import { layout } from '@/design-system/tokens/layout'
import { cn } from '@/shared/utils/cn'

interface DataTableShellProps {
  header?: ReactNode
  headerClassName?: string
  footer?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
  isFetching?: boolean
}

export function DataTableShell({
  header,
  headerClassName,
  footer,
  children,
  className,
  contentClassName,
  isFetching,
}: DataTableShellProps) {
  return (
    <div
      className={cn(
        'flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]',
        className,
      )}
    >
      {header ? (
        <div className={cn('shrink-0 border-b border-[var(--color-border)]', headerClassName ?? layout.toolbar)}>
          {header}
        </div>
      ) : null}

      <div
        className={cn(
          'relative flex min-h-0 flex-1 flex-col overflow-hidden',
          isFetching && 'opacity-70 transition-opacity',
          contentClassName,
        )}
      >
        {children}
      </div>

      {footer ? <div className="shrink-0">{footer}</div> : null}
    </div>
  )
}
