import type { ReactNode } from 'react'
import { cn } from '../utils/cn'

interface WorkspaceContentProps {
  children: ReactNode
  className?: string
  /** When true, only this zone scrolls inside a viewport workspace shell. */
  scroll?: boolean
}

export function WorkspaceContent({ children, className, scroll = true }: WorkspaceContentProps) {
  return (
    <div
      className={cn(
        scroll
          ? 'min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain'
          : 'flex min-h-0 flex-1 flex-col overflow-hidden',
        className,
      )}
    >
      {children}
    </div>
  )
}
