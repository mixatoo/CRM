import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowRight, Construction } from 'lucide-react'
import { Page } from '@/design-system/layout/Page'
import { PageHeader } from '@/design-system/layout/PageHeader'
import { PLANNED_MODULES } from '@/features/home/config/planned-modules'
import { layout } from '@/design-system/tokens/layout'
import { cn } from '@/shared/utils/cn'

export function ModuleRoadmapPage() {
  const { moduleId } = useParams<{ moduleId: string }>()
  const config = moduleId ? PLANNED_MODULES[moduleId] : undefined

  if (!config) {
    return <Navigate to="/" replace />
  }

  const Icon = config.icon

  return (
    <Page className="min-w-0">
      <PageHeader
        title={config.title}
        description={config.description}
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            <Construction className="h-3.5 w-3.5" />
            Planned module
          </span>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
          <div className={layout.cardPad}>
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent-muted)]">
                <Icon className="h-5 w-5 text-[var(--color-accent)]" />
              </div>
              <div className="min-w-0">
                <h2 className={layout.entityTitle}>What&apos;s coming</h2>
                <p className={cn('mt-1', layout.caption)}>
                  This module is on the product roadmap. Trip-level workflows for related data are already available.
                </p>
              </div>
            </div>
            <ul className="space-y-3">
              {config.highlights.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-relaxed text-[var(--color-foreground)]">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" aria-hidden />
                  <span className="min-w-0 break-words">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <aside className="space-y-3">
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              Available now
            </h3>
            <ul className="mt-3 space-y-2">
              {config.relatedLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="flex items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 text-sm transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-muted)]/40"
                  >
                    <span className="min-w-0 truncate">{link.label}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[var(--color-muted)]" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <p className={cn('px-1', layout.caption)}>
            Need this module prioritized? Note it in your rollout plan — the navigation is wired and permissions are ready.
          </p>
        </aside>
      </div>
    </Page>
  )
}
