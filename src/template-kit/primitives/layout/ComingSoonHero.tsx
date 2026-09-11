import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { layout } from '../tokens/layout'
import { cn } from '../utils/cn'

export interface ComingSoonHeroProps {
  icon: LucideIcon
  badgeSecondary: string
  title: ReactNode
  description: string
  linkTo: string
  linkLabel: string
  className?: string
}

export function ComingSoonHero({
  icon: Icon,
  badgeSecondary,
  title,
  description,
  linkTo,
  linkLabel,
  className,
}: ComingSoonHeroProps) {
  return (
    <section
      className={cn(
        'relative flex min-h-0 flex-1 items-center overflow-hidden bg-[var(--color-surface)]',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, var(--color-border) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden
      />
      <Icon
        className="pointer-events-none absolute -right-8 top-1/2 h-64 w-64 -translate-y-1/2 text-[var(--color-accent-muted)] opacity-60 sm:-right-4 sm:h-80 sm:w-80 lg:h-96 lg:w-96"
        strokeWidth={0.75}
        aria-hidden
      />

      <div className="relative w-full px-8 py-12 sm:px-12 lg:px-16">
        <div className="max-w-lg">
          <div className="inline-flex overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] shadow-sm">
            <span className="flex items-center gap-1.5 bg-[var(--color-accent)] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
              <Sparkles className="h-3.5 w-3.5" />
              Soon
            </span>
            <span className="flex items-center bg-[var(--color-surface-muted)] px-3 py-2 text-xs font-medium text-[var(--color-foreground)] sm:text-sm">
              {badgeSecondary}
            </span>
          </div>

          <h1 className="mt-5 text-3xl font-semibold leading-tight text-[var(--color-foreground)] sm:text-4xl lg:text-[2.75rem]">
            {title}
          </h1>

          <p className={cn('mt-4 max-w-md text-sm leading-relaxed sm:text-base', layout.caption)}>
            {description}
          </p>

          <div className="mt-8 h-px w-12 bg-[var(--color-accent)]" aria-hidden />

          <Link
            to={linkTo}
            className="mt-6 inline-flex text-sm font-medium text-[var(--color-accent)] hover:underline"
          >
            {linkLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}
