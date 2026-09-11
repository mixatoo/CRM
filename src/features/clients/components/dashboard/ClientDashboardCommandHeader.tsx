import { Link } from 'react-router-dom'
import { ArrowRight, Briefcase, LayoutGrid, Plane, UserCircle } from 'lucide-react'
import type { Client } from '@/domain/entities/client'
import { clientPrimaryLabel } from '@/domain/entities/client'
import {
  dashboardCommandHeaderClassName,
  dashboardCommandHeaderGlowClassName,
} from '@/features/clients/components/dashboard/client-dashboard-modern-ui'
import { cn } from '@/shared/utils/cn'

interface ClientDashboardCommandHeaderProps {
  client: Client
  currency: string
  healthLabel: string
  healthTone: 'success' | 'warning' | 'accent'
  className?: string
}

const HEALTH_TONE_CLASS = {
  success: 'bg-[var(--color-success)]/15 text-[var(--color-success)] ring-[var(--color-success)]/25',
  warning: 'bg-[var(--color-warning)]/15 text-[var(--color-warning)] ring-[var(--color-warning)]/25',
  accent: 'bg-white/10 text-white ring-white/20',
}

export function ClientDashboardCommandHeader({
  client,
  currency,
  healthLabel,
  healthTone,
  className,
}: ClientDashboardCommandHeaderProps) {
  const base = `/clients/${client.id}`
  const name = clientPrimaryLabel(client)

  const quickLinks = [
    { label: 'Trips', href: `${base}/trips`, icon: Plane },
    { label: 'Services', href: `${base}/services`, icon: Briefcase },
    { label: 'Profile', href: `${base}/profile`, icon: UserCircle },
  ]

  return (
    <header className={cn(dashboardCommandHeaderClassName, className)}>
      <div className={dashboardCommandHeaderGlowClassName} aria-hidden />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/90 ring-1 ring-white/15">
              <LayoutGrid className="h-3 w-3" aria-hidden />
              Account command center
            </span>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1',
                HEALTH_TONE_CLASS[healthTone],
              )}
            >
              {healthLabel}
            </span>
          </div>
          <h1 className="truncate text-xl font-semibold tracking-tight text-white sm:text-2xl">{name}</h1>
          <p className="mt-1 text-sm text-white/70">
            Live performance, collections, and pipeline for this account · {currency}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-medium text-white ring-1 ring-white/15 transition-colors hover:bg-white/16"
            >
              <link.icon className="h-3.5 w-3.5" aria-hidden />
              {link.label}
              <ArrowRight className="h-3 w-3 opacity-70" aria-hidden />
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}

interface ClientDashboardSectionNavProps {
  activeSection: string
  onSectionChange: (sectionId: import('@/features/clients/components/dashboard/client-dashboard-modern-ui').DashboardSectionId) => void
}

export function ClientDashboardSectionNav({ activeSection, onSectionChange }: ClientDashboardSectionNavProps) {
  const sections = [
    { id: 'financial' as const, label: 'Financial' },
    { id: 'activity' as const, label: 'Activity' },
    { id: 'operations' as const, label: 'Operations' },
  ]

  return (
    <nav
      className={cn(
        'sticky top-0 z-20 flex gap-1 overflow-x-auto border-b border-[var(--color-border)]/80',
        'bg-[var(--color-surface)]/92 px-4 py-2 backdrop-blur-md supports-[backdrop-filter]:bg-[var(--color-surface)]/85',
        '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
      )}
      aria-label="Dashboard sections"
    >
      {sections.map((section) => {
        const active = activeSection === section.id
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSectionChange(section.id)}
            className={cn(
              'shrink-0 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-[var(--color-accent)] text-white shadow-sm'
                : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-foreground)]',
            )}
            aria-current={active ? 'true' : undefined}
          >
            {section.label}
          </button>
        )
      })}
    </nav>
  )
}
