import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Flag, MapPin, PlaneLanding, PlaneTakeoff } from 'lucide-react'
import { Page } from '@/design-system/layout/Page'
import { PageHeader } from '@/design-system/layout/PageHeader'
import { CrmPanel } from '@/design-system/layout/CrmPanel'
import { Button } from '@/design-system/components/Button'
import { Skeleton } from '@/design-system/components/Skeleton'
import {
  todayIso,
  useCalendarEvents,
  useCalendarMonth,
  type CalendarEvent,
} from '@/features/calendar/hooks/use-calendar-events'
import { layout } from '@/design-system/tokens/layout'
import { formatDate } from '@/shared/utils/date-format'
import { cn } from '@/shared/utils/cn'

export function CalendarPage() {
  const [monthOffset, setMonthOffset] = useState(0)
  const { year, month, label } = useCalendarMonth(monthOffset)
  const { data, isLoading } = useCalendarEvents(year, month)
  const today = todayIso()

  return (
    <Page className="min-w-0">
      <PageHeader
        title="Calendar"
        description="Trip departures, returns, and reminder due dates in one operational timeline."
        actions={
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setMonthOffset((value) => value - 1)}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[9rem] text-center text-sm font-semibold text-[var(--color-foreground)]">{label}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setMonthOffset((value) => value + 1)}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            {monthOffset !== 0 ? (
              <Button type="button" variant="secondary" size="sm" onClick={() => setMonthOffset(0)}>
                Today
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3 text-xs text-[var(--color-muted)]">
        <LegendItem icon={PlaneTakeoff} label="Trip departure" tone="accent" />
        <LegendItem icon={PlaneLanding} label="Trip return" tone="foreground" />
        <LegendItem icon={Flag} label="Reminder" tone="warning" />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (data?.grouped.length ?? 0) === 0 ? (
        <CrmPanel title="No events this month">
          <p className="px-4 py-8 text-sm text-[var(--color-muted)]">
            No trip dates or reminders fall in {label}. Try another month or add reminders from the reminders module.
          </p>
        </CrmPanel>
      ) : (
        <div className="space-y-4">
          {data?.grouped.map((group) => (
            <CrmPanel
              key={group.date}
              title={formatDate(group.date)}
              actions={
                group.date === today ? (
                  <span className="rounded-full bg-[var(--color-accent-muted)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-accent)]">
                    Today
                  </span>
                ) : undefined
              }
            >
              <ul className="divide-y divide-[var(--color-border)]">
                {group.items.map((event) => (
                  <li key={event.id}>
                    <EventRow event={event} />
                  </li>
                ))}
              </ul>
            </CrmPanel>
          ))}
        </div>
      )}
    </Page>
  )
}

function EventRow({ event }: { event: CalendarEvent }) {
  const Icon = event.kind === 'trip_start' ? PlaneTakeoff : event.kind === 'trip_end' ? PlaneLanding : Flag
  const tone =
    event.kind === 'trip_start'
      ? 'text-[var(--color-accent)] bg-[var(--color-accent-muted)]'
      : event.kind === 'trip_end'
        ? 'text-[var(--color-foreground)] bg-[var(--color-surface-muted)]'
        : 'text-[var(--color-warning)] bg-[var(--color-warning-muted)]'

  const content = (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)]', tone)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--color-foreground)]">{event.title}</p>
        <p className="text-xs text-[var(--color-muted)]">
          {event.meta}
          {event.reference ? (
            <>
              {' · '}
              <span className="font-mono text-[var(--color-accent)]">{event.reference}</span>
            </>
          ) : null}
        </p>
      </div>
      {event.tripId ? <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--color-subtle)]" /> : null}
    </div>
  )

  if (event.tripId) {
    const tab = event.kind === 'reminder' ? 'dashboard' : 'dashboard'
    return (
      <Link to={`/trips/${event.tripId}/${tab}`} className="block transition-colors hover:bg-[var(--color-surface-muted)]/40">
        {content}
      </Link>
    )
  }

  return content
}

function LegendItem({
  icon: Icon,
  label,
  tone,
}: {
  icon: typeof Flag
  label: string
  tone: 'accent' | 'foreground' | 'warning'
}) {
  const toneClass =
    tone === 'accent'
      ? 'text-[var(--color-accent)]'
      : tone === 'warning'
        ? 'text-[var(--color-warning)]'
        : 'text-[var(--color-foreground)]'

  return (
    <span className={cn('inline-flex items-center gap-1.5', layout.caption)}>
      <Icon className={cn('h-3.5 w-3.5', toneClass)} />
      {label}
    </span>
  )
}
