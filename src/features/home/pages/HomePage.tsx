import { Link } from 'react-router-dom'
import { ArrowRight, LayoutGrid, List, Plane } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { Page } from '@/design-system/layout/Page'
import { PageHeader } from '@/design-system/layout/PageHeader'
import { DEMO_TRIP_ID } from '@/infrastructure/database/mocks/trip-services.mock'
import {
  MODULE_STATUS_CLASS,
  MODULE_STATUS_LABEL,
  type ModuleStatusEntry,
} from '@/features/home/config/module-status'
import { layout } from '@/design-system/tokens/layout'
import { cn } from '@/shared/utils/cn'

const MODULE_STATUS: ModuleStatusEntry[] = [
  { name: 'Dashboard', status: 'planned', note: 'Portfolio KPIs, upcoming departures, reminders, and recent activity — coming soon' },
  { name: 'Calendar', status: 'live', note: 'Trip departures, returns, and reminder due dates' },
  { name: 'Activity feed', status: 'live', note: 'Cross-trip changelog with filters and pagination' },
  { name: 'Trips', status: 'live', note: 'List, filters, bulk edit, workspace shell' },
  { name: 'Trip dashboard', status: 'live', note: 'KPIs, progress bar, service breakdown' },
  { name: 'Trip services', status: 'partial', note: 'Flight workspace is live; other categories use structured editors' },
  { name: 'Invoices & payments', status: 'live', note: 'Trip documents, payments, revenue, PDF export' },
  { name: 'UI templates', status: 'live', note: 'Reference patterns for upcoming list pages' },
  { name: 'Clients directory', status: 'live', note: 'Global list, CRUD, trip linking, PII masking' },
  { name: 'Suppliers directory', status: 'live', note: 'Global list, CRUD, trip service linking, PII masking' },
  { name: 'Transactions', status: 'live', note: 'Cross-trip payment register with filters and trip links' },
  { name: 'Reports', status: 'live', note: 'Pipeline, margin, collections, and supplier exposure' },
  { name: 'Reminders', status: 'live', note: 'Operational tasks with due dates, assignees, and trip links' },
  { name: 'Pipeline', status: 'live', note: 'Kanban funnel across trip stages with portfolio value' },
  { name: 'Global search', status: 'live', note: 'Unified search across trips, clients, suppliers, travelers, and reminders' },
  { name: 'Invoices (AR)', status: 'live', note: 'Cross-trip receivables with aging filters and KPIs' },
  { name: 'Settings', status: 'live', note: 'Organization profile and session timeout configuration' },
  {
    name: 'Travelers directory',
    status: 'live',
    note: 'Global list, CRUD, account linking, and search across all accounts',
  },
]

const QUICK_LINKS = [
  {
    to: `/trips/${DEMO_TRIP_ID}/dashboard`,
    icon: Plane,
    title: 'Open demo trip',
    caption: 'Advanced Webinar Series — Cairo',
  },
  {
    to: '/trips',
    icon: List,
    title: 'Browse all trips',
    caption: '10 seeded records with filters and bulk actions',
  },
  {
    to: '/templates',
    icon: LayoutGrid,
    title: 'UI templates',
    caption: 'Buttons, lists, and tables to copy into new modules',
  },
] as const

function formatRole(role: string | undefined) {
  if (!role) return 'Guest'
  return role.charAt(0).toUpperCase() + role.slice(1)
}

export function HomePage() {
  const user = useAuthStore((s) => s.user)

  return (
    <Page className="min-w-0">
      <PageHeader
        title={`Welcome, ${user?.name ?? 'User'}`}
        description="Egyliere OPs — luxury travel operations CRM. Modules ship incrementally; use the links below to explore what is live while we build the rest."
        actions={
          user?.role && (
            <span className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-2.5 py-1 text-xs font-medium text-[var(--color-muted)]">
              Signed in as {formatRole(user.role)}
            </span>
          )
        }
      />

      <section className="mb-6 sm:mb-8">
        <h2 className={cn('mb-3', layout.sectionTitle)}>Quick start</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {QUICK_LINKS.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] transition-colors hover:border-[var(--color-accent)] sm:flex-row sm:items-center sm:justify-between',
                  layout.cardPad,
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent-muted)]">
                    <Icon className="h-5 w-5 text-[var(--color-accent)]" />
                  </div>
                  <div className="min-w-0">
                    <div className={layout.entityTitle}>{item.title}</div>
                    <div className={layout.caption}>{item.caption}</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-[var(--color-muted)]" />
              </Link>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className={cn('mb-3', layout.sectionTitle)}>Module status</h2>
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          <ul className="divide-y divide-[var(--color-border)]">
            {MODULE_STATUS.map((module) => (
              <li
                key={module.name}
                className={cn('flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between', layout.cardPad)}
              >
                <div className="min-w-0">
                  <div className={layout.entityTitle}>{module.name}</div>
                  <p className={cn('mt-0.5', layout.caption)}>{module.note}</p>
                </div>
                <span
                  className={cn(
                    'inline-flex w-fit shrink-0 rounded-[var(--radius-md)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                    MODULE_STATUS_CLASS[module.status],
                  )}
                >
                  {MODULE_STATUS_LABEL[module.status]}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className={cn('mt-3', layout.caption)}>
          This build runs as a client-side SPA with IndexedDB — suitable for demos and single-browser workflows until the API layer is added.
        </p>
      </section>
    </Page>
  )
}
