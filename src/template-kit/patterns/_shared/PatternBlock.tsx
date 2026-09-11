import type { ReactNode } from 'react'

export function PatternBlock({
  title,
  description,
  path,
  children,
}: {
  title: string
  description: string
  path?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <h3 className="text-sm font-semibold text-[var(--color-foreground)]">{title}</h3>
      <p className="mt-1 text-xs text-[var(--color-muted)]">{description}</p>
      {path ? <p className="mt-1 font-mono text-[10px] text-[var(--color-subtle)]">{path}</p> : null}
      <div className="mt-3">{children}</div>
    </section>
  )
}
