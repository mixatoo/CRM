import type { ReactNode } from 'react'
import { layout } from '@/design-system/tokens/layout'
import { cn } from '@/shared/utils/cn'

type WorkspaceLayout = 'content' | 'viewport' | 'viewportFlush'

interface WorkspaceShellProps {
  children: ReactNode
  className?: string
  layout?: WorkspaceLayout
}

export function WorkspaceShell({ children, className, layout: shellLayout = 'content' }: WorkspaceShellProps) {
  const isViewport = shellLayout === 'viewport' || shellLayout === 'viewportFlush'
  const isFlush = shellLayout === 'viewportFlush'

  return (
    <div
      className={cn(
        layout.pageFluid,
        'bg-[var(--color-bg)]',
        isViewport
          ? cn(
              'flex h-full min-h-0 flex-1 flex-col overflow-hidden',
              !isFlush && layout.pageViewport,
            )
          : cn('min-h-full', layout.pageContent),
        className,
      )}
    >
      <div className={cn('flex flex-col', isViewport ? cn('h-full min-h-0 flex-1', layout.stackTight) : layout.stack)}>
        {children}
      </div>
    </div>
  )
}
