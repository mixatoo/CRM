import type { ReactNode } from 'react'
import { layout } from '@/design-system/tokens/layout'
import { cn } from '@/shared/utils/cn'

interface TravelCardProps {
  children: ReactNode
  className?: string
  title?: string
  titleClassName?: string
  headerClassName?: string
  headerActions?: ReactNode
  contentClassName?: string
}

export function TravelCard({
  children,
  className,
  title,
  titleClassName,
  headerClassName,
  headerActions,
  contentClassName,
}: TravelCardProps) {
  return (
    <div
      className={cn(
        'animate-fade-in overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]',
        className,
      )}
    >
      {title && (
        <header className={cn(layout.cardHeader, headerClassName)}>
          <div className="flex items-center justify-between gap-2">
            <h2 className={cn(layout.cardTitle, titleClassName)}>{title}</h2>
            {headerActions}
          </div>
        </header>
      )}
      <div className={cn(layout.cardPad, contentClassName)}>{children}</div>
    </div>
  )
}
