import { useState } from 'react'
import {
  Bell,
  CalendarDays,
  LayoutDashboard,
  LayoutGrid,
  List,
  MousePointerClick,
  PanelTop,
  Table2,
  UserRound,
} from 'lucide-react'
import { Page } from '@/design-system/layout/Page'
import { PageHeader } from '@/design-system/layout/PageHeader'
import { ButtonsShowcase } from '@/features/ui-templates/components/ButtonsShowcase'
import { ClientsShowcase } from '@/features/ui-templates/components/ClientsShowcase'
import { FeedbackShowcase } from '@/features/ui-templates/components/FeedbackShowcase'
import { ToastPlayground } from '@/features/ui-templates/components/ToastPlayground'
import { FormsShowcase } from '@/features/ui-templates/components/FormsShowcase'
import { ListsShowcase } from '@/features/ui-templates/components/ListsShowcase'
import { PanelsShowcase } from '@/features/ui-templates/components/PanelsShowcase'
import { TablesShowcase } from '@/features/ui-templates/components/TablesShowcase'
import { WorkspaceShowcase } from '@/features/ui-templates/components/WorkspaceShowcase'
import {
  PROJECT_PATTERN_SOURCE_MAP,
  PROJECT_UI_CATALOG,
  type ProjectPatternTab,
} from '@/features/ui-templates/patterns/catalog'
import { cn } from '@/shared/utils/cn'

type TemplateTab = ProjectPatternTab | 'overview'

const TABS: Array<{ id: TemplateTab; label: string; icon: typeof LayoutGrid }> = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'buttons', label: 'Buttons', icon: MousePointerClick },
  { id: 'forms', label: 'Forms', icon: CalendarDays },
  { id: 'clients', label: 'Clients', icon: UserRound },
  { id: 'lists', label: 'Lists', icon: List },
  { id: 'tables', label: 'Tables', icon: Table2 },
  { id: 'workspace', label: 'Workspace', icon: LayoutDashboard },
  { id: 'panels', label: 'Panels', icon: PanelTop },
  { id: 'feedback', label: 'Feedback', icon: Bell },
]

export function UiTemplatesPage() {
  const [tab, setTab] = useState<TemplateTab>('overview')

  return (
    <Page className="min-w-0 pb-6 sm:pb-10">
      <PageHeader
        title="UI Templates"
        description="Living reference for Egyliere Ops patterns — forms, clients, trips workspace, and shared design-system building blocks."
      />

      <div className="mb-4 flex gap-1 overflow-x-auto overscroll-x-contain rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]/40 p-1 sm:mb-6 sm:flex-wrap">
        {TABS.map((item) => {
          const Icon = item.icon
          const active = tab === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-2.5 text-sm transition-colors sm:py-2',
                active
                  ? 'bg-[var(--color-surface)] font-medium text-[var(--color-foreground)] shadow-sm'
                  : 'font-normal text-[var(--color-muted)] hover:text-[var(--color-foreground)]',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          )
        })}
      </div>

      {tab === 'overview' && <OverviewPanel onOpen={setTab} />}
      {tab === 'buttons' && <ButtonsShowcase />}
      {tab === 'forms' && <FormsShowcase />}
      {tab === 'clients' && <ClientsShowcase />}
      {tab === 'lists' && <ListsShowcase />}
      {tab === 'tables' && <TablesShowcase />}
      {tab === 'workspace' && <WorkspaceShowcase />}
      {tab === 'panels' && <PanelsShowcase />}
      {tab === 'feedback' && <FeedbackShowcase />}
    </Page>
  )
}

function OverviewPanel({ onOpen }: { onOpen: (tab: TemplateTab) => void }) {
  const tabCards: Array<{ tab: Exclude<TemplateTab, 'overview'>; title: string; text: string }> = [
    { tab: 'buttons', title: 'Buttons', text: 'Variants, sizes, toolbar actions, and buttonVariants for links.' },
    {
      tab: 'forms',
      title: 'Forms',
      text: 'Field hints, date pickers, composite prefix rows, and operation worksheet controls.',
    },
    {
      tab: 'clients',
      title: 'Clients',
      text: 'Multi-step nav, segmented fields, demographics, payment setup, and membership term editor.',
    },
    { tab: 'lists', title: 'Lists', text: 'List toolbar, facet pickers, sort dropdown — same stack as TripsPage.' },
    {
      tab: 'tables',
      title: 'Tables',
      text: 'CRM table design gallery (8 themes) plus Trips list table with selection, badges, and pagination.',
    },
    { tab: 'workspace', title: 'Workspace', text: 'TripInfoBar, TripProgressBar, tab nav, and WorkspaceShell layout.' },
    { tab: 'panels', title: 'Panels & badges', text: 'CrmPanel field grids, metric cells, trip/service status badges.' },
    { tab: 'feedback', title: 'Feedback', text: 'ConfirmDialog, Sonner toasts, SearchField densities, loading skeletons.' },
  ]

  const projectPatterns = PROJECT_UI_CATALOG.filter((entry) => entry.tab === 'forms' || entry.tab === 'clients')

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-foreground)]">Toast playground</h3>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              Toasts slide in below the top bar — centered on the workspace.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpen('feedback')}
            className="shrink-0 text-xs font-medium text-[var(--color-accent)] hover:underline"
          >
            Open Feedback tab →
          </button>
        </div>
        <ToastPlayground compact />
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tabCards.map((card) => (
          <button
            key={card.tab}
            type="button"
            onClick={() => onOpen(card.tab)}
            className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left transition-colors hover:border-[var(--color-accent)]/30 hover:bg-[var(--color-surface-elevated)]"
          >
            <h3 className="text-sm font-semibold text-[var(--color-foreground)]">{card.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-[var(--color-muted)]">{card.text}</p>
            <p className="mt-3 font-mono text-[10px] text-[var(--color-subtle)]">
              {PROJECT_PATTERN_SOURCE_MAP[card.tab]}
            </p>
          </button>
        ))}
      </div>

      <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h3 className="text-sm font-semibold text-[var(--color-foreground)]">Project-specific patterns</h3>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Patterns designed for Egyliere Ops — copy from the live demos in Forms and Clients tabs.
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {projectPatterns.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() => onOpen(entry.tab)}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]/20 px-3 py-2.5 text-left transition-colors hover:border-[var(--color-accent)]/30 hover:bg-[var(--color-surface-elevated)]"
              >
                <span className="block text-xs font-medium text-[var(--color-foreground)]">{entry.title}</span>
                <span className="mt-0.5 block text-[11px] leading-snug text-[var(--color-muted)]">{entry.description}</span>
                <span className="mt-1 block font-mono text-[10px] text-[var(--color-subtle)]">{entry.source}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)]/30 px-4 py-3">
        <p className="text-xs leading-relaxed text-[var(--color-muted)]">
          Flight table inputs, ticket operations, and financial summary bars live under{' '}
          <span className="font-mono text-[10px]">src/features/trips/components/services/flight/</span>.
          Composite field patterns in the Forms tab mirror those worksheet layouts.
        </p>
      </div>
    </div>
  )
}
