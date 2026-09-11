import type { ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

export function TemplateSection({
  title,
  description,
  path,
  children,
  className,
}: {
  title: string
  description: string
  path: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('space-y-3', className)}>
      <div>
        <h2 className="text-base font-semibold text-[var(--color-foreground)]">{title}</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">{description}</p>
        <p className="mt-1 font-mono text-[11px] text-[var(--color-subtle)]">{path}</p>
      </div>
      {children}
    </section>
  )
}
