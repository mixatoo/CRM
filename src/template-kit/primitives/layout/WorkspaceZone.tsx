import type { ReactNode } from 'react'
import { cn } from '../utils/cn'

interface WorkspaceZoneProps {
  label: string
  children: ReactNode
  className?: string
}

export function WorkspaceZone({ label, children, className }: WorkspaceZoneProps) {
  return (
    <section aria-label={label} className={cn('flex flex-col gap-2', className)}>
      <h2 className="sr-only">{label}</h2>
      {children}
    </section>
  )
}
