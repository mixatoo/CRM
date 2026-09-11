import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  Info,
  MapPin,
  Pencil,
  Plane,
  Plus,
  StickyNote,
  Trash2,
} from 'lucide-react'
import type { Trip } from '@/domain/entities'
import { ITINERARY_UNSCHEDULED_DAY_KEY } from '@/domain/entities/trip-itinerary-note'
import { TRIP_SERVICE_STATUS_LABELS } from '@/domain/entities/trip-service'
import { buildTripItinerary, type ItineraryDay, type ItineraryEntry, type ItineraryInsight } from '@/domain/trip/build-itinerary'
import { CrmPanel } from '@/design-system/layout/CrmPanel'
import { Button } from '@/design-system/components/Button'
import { ConfirmDialog } from '@/design-system/components/ConfirmDialog'
import { ItineraryNoteDialog } from '@/features/trips/components/itinerary/ItineraryNoteDialog'
import { ItineraryPreviewDialog } from '@/features/trips/components/itinerary/ItineraryPreviewDialog'
import { buildItineraryPdfBlob } from '@/document-system/templates/itinerary-template'
import { PdfExportDialog } from '@/document-system/export/PdfExportDialog'
import { useItineraryNoteMutations } from '@/features/trips/hooks/use-itinerary-note-mutations'
import { useTripItineraryNotes } from '@/features/trips/hooks/use-trip-itinerary-notes'
import { useTripServices } from '@/features/trips/hooks/use-trip-services'
import { cn } from '@/shared/utils/cn'

interface TripItineraryTabProps {
  trip: Trip
}

const INSIGHT_ICON = {
  info: Info,
  warning: AlertCircle,
  success: CheckCircle2,
} as const

const INSIGHT_TONE_CLASS = {
  info: 'border-[var(--color-border)] bg-[var(--color-surface)]',
  warning: 'border-[var(--color-warning)]/30 bg-[var(--color-warning-muted)]/25',
  success: 'border-[var(--color-success)]/30 bg-[var(--color-success-muted)]/25',
} as const

const STATUS_CLASS = {
  proposal: 'bg-[var(--color-warning-muted)] text-[var(--color-warning)]',
  confirmed: 'bg-[var(--color-success-muted)] text-[var(--color-success)]',
  canceled: 'bg-[var(--color-surface-muted)] text-[var(--color-muted)]',
} as const

function EntryIcon({ entry }: { entry: ItineraryEntry }) {
  if (entry.kind === 'note') return <StickyNote className="size-3.5 shrink-0 text-[var(--color-accent)]" />
  if (entry.kind === 'flight-segment') return <Plane className="size-3.5 shrink-0 text-[var(--color-accent)]" />
  return <MapPin className="size-3.5 shrink-0 text-[var(--color-muted)]" />
}

function ItineraryEntryCard({
  entry,
  onEditNote,
  onDeleteNote,
}: {
  entry: ItineraryEntry
  onEditNote?: (entry: ItineraryEntry) => void
  onDeleteNote?: (entry: ItineraryEntry) => void
}) {
  const content = (
    <div
      className={cn(
        'group flex gap-3 rounded-[var(--radius-md)] border px-3 py-2.5 transition-colors',
        entry.kind === 'note'
          ? 'border-[var(--color-accent)]/25 bg-[var(--color-accent-muted)]/15'
          : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)]/30',
      )}
    >
      <div className="flex w-14 shrink-0 flex-col items-end pt-0.5">
        {entry.timeLabel ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium tabular-nums text-[var(--color-foreground)]">
            <Clock3 className="size-3 text-[var(--color-muted)]" />
            {entry.timeLabel}
          </span>
        ) : (
          <span className="text-[10px] uppercase tracking-wide text-[var(--color-subtle)]">All day</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <EntryIcon entry={entry} />
          <p className="truncate text-sm font-medium text-[var(--color-foreground)]">{entry.title}</p>
          {entry.status ? (
            <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium uppercase', STATUS_CLASS[entry.status])}>
              {TRIP_SERVICE_STATUS_LABELS[entry.status]}
            </span>
          ) : null}
          {entry.categoryLabel ? (
            <span className="text-[10px] uppercase tracking-wide text-[var(--color-subtle)]">{entry.categoryLabel}</span>
          ) : null}
        </div>
        {entry.subtitle ? <p className="mt-0.5 text-xs text-[var(--color-muted)]">{entry.subtitle}</p> : null}
        {entry.detail ? <p className="mt-1 text-xs text-[var(--color-subtle)]">{entry.detail}</p> : null}
      </div>

      {entry.kind === 'note' ? (
        <div className="flex shrink-0 items-start gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            className="rounded p-1 text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-foreground)]"
            onClick={() => onEditNote?.(entry)}
            aria-label="Edit note"
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            type="button"
            className="rounded p-1 text-[var(--color-muted)] hover:bg-[var(--color-danger-muted)] hover:text-[var(--color-danger)]"
            onClick={() => onDeleteNote?.(entry)}
            aria-label="Delete note"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  )

  if (entry.serviceHref && entry.kind !== 'note') {
    return (
      <Link to={entry.serviceHref} className="block no-underline">
        {content}
      </Link>
    )
  }

  return content
}

function DaySection({
  day,
  onAddNote,
  onEditNote,
  onDeleteNote,
}: {
  day: ItineraryDay
  onAddNote: (day: ItineraryDay) => void
  onEditNote: (entry: ItineraryEntry) => void
  onDeleteNote: (entry: ItineraryEntry) => void
}) {
  return (
    <section className="space-y-2">
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {day.dayNumber ? (
            <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-muted)] text-xs font-semibold text-[var(--color-accent)]">
              {day.dayNumber}
            </span>
          ) : null}
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-[var(--color-foreground)]">{day.label}</h3>
            {day.isGap ? (
              <p className="text-xs text-[var(--color-warning)]">No items scheduled yet</p>
            ) : (
              <p className="text-xs text-[var(--color-muted)]">
                {day.entries.length} item{day.entries.length === 1 ? '' : 's'}
              </p>
            )}
          </div>
        </div>
        <Button variant="ghost" size="sm" className="shrink-0" onClick={() => onAddNote(day)}>
          <Plus className="size-3.5" />
          Note
        </Button>
      </header>

      {day.entries.length > 0 ? (
        <div className="space-y-2 pl-0 sm:pl-9">
          {day.entries.map((entry) => (
            <ItineraryEntryCard key={entry.id} entry={entry} onEditNote={onEditNote} onDeleteNote={onDeleteNote} />
          ))}
        </div>
      ) : (
        <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)]/30 px-4 py-6 text-center text-xs text-[var(--color-muted)] sm:ml-9">
          Free day — add a note or schedule a service
        </div>
      )}
    </section>
  )
}

function InsightCard({ insight }: { insight: ItineraryInsight }) {
  const Icon = INSIGHT_ICON[insight.tone]
  return (
    <div className={cn('rounded-[var(--radius-md)] border px-3 py-2.5', INSIGHT_TONE_CLASS[insight.tone])}>
      <div className="flex gap-2">
        <Icon className="mt-0.5 size-4 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--color-foreground)]">{insight.title}</p>
          <p className="mt-0.5 text-xs text-[var(--color-muted)]">{insight.detail}</p>
          {insight.href ? (
            <Link to={insight.href} className="mt-1 inline-block text-xs font-medium text-[var(--color-accent)]">
              {insight.hrefLabel ?? 'Open'}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function TripItineraryTab({ trip }: TripItineraryTabProps) {
  const { data: services = [], isLoading: servicesLoading } = useTripServices(trip.id)
  const { data: notes = [], isLoading: notesLoading } = useTripItineraryNotes(trip.id)
  const { createNote, updateNote, deleteNote, isPending } = useItineraryNoteMutations()

  const [confirmedOnly, setConfirmedOnly] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [pdfExportOpen, setPdfExportOpen] = useState(false)
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [noteDayKey, setNoteDayKey] = useState(trip.startDate ?? ITINERARY_UNSCHEDULED_DAY_KEY)
  const [noteDayLabel, setNoteDayLabel] = useState('')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const itinerary = useMemo(
    () => buildTripItinerary(trip, services, notes, { confirmedOnly }),
    [trip, services, notes, confirmedOnly],
  )

  const editingNote = notes.find((note) => note.id === editingNoteId) ?? null
  const deleteTarget = notes.find((note) => note.id === deleteTargetId) ?? null

  const isLoading = servicesLoading || notesLoading

  const openAddNote = (day: ItineraryDay) => {
    setEditingNoteId(null)
    setNoteDayKey(day.dayKey)
    setNoteDayLabel(day.label)
    setNoteDialogOpen(true)
  }

  const openEditNote = (entry: ItineraryEntry) => {
    if (!entry.noteId) return
    const day = itinerary.days.find((row) => row.dayKey === entry.dayKey)
    setEditingNoteId(entry.noteId)
    setNoteDayKey(entry.dayKey)
    setNoteDayLabel(day?.label ?? entry.dayKey)
    setNoteDialogOpen(true)
  }

  const handleNoteSubmit = (input: Parameters<typeof createNote.mutate>[0]) => {
    if (editingNote) {
      updateNote.mutate(
        { note: editingNote, patch: input },
        { onSuccess: () => setNoteDialogOpen(false) },
      )
      return
    }
    createNote.mutate(input, { onSuccess: () => setNoteDialogOpen(false) })
  }

  const generateItineraryPdf = useCallback(
    () => buildItineraryPdfBlob({ trip, itinerary }),
    [trip, itinerary],
  )

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--color-foreground)]">Itinerary</h2>
          <p className="text-xs text-[var(--color-muted)]">
            Built automatically from trip dates and services. Add notes for client-facing details.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2.5 py-1.5 text-xs">
            <input
              type="checkbox"
              className="size-3.5 accent-[var(--color-accent)]"
              checked={confirmedOnly}
              onChange={(event) => setConfirmedOnly(event.target.checked)}
            />
            Confirmed only
          </label>
          <Button
            size="sm"
            variant="secondary"
            disabled={isLoading}
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="size-3.5" />
            Preview
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={isLoading}
            onClick={() => setPdfExportOpen(true)}
          >
            <Download className="size-3.5" />
            Export PDF
          </Button>
          <Button
            size="sm"
            onClick={() =>
              openAddNote(
                itinerary.days.find((day) => day.dayKey === (trip.startDate ?? ITINERARY_UNSCHEDULED_DAY_KEY)) ?? {
                  dayKey: trip.startDate ?? ITINERARY_UNSCHEDULED_DAY_KEY,
                  label: 'Trip note',
                  entries: [],
                  isGap: false,
                },
              )
            }
          >
            <Plus className="size-3.5" />
            Add note
          </Button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <CrmPanel
          title="Day by day"
          actions={
            <span className="text-[10px] text-[var(--color-muted)]">
              {itinerary.stats.scheduledDays} day{itinerary.stats.scheduledDays === 1 ? '' : 's'} ·{' '}
              {itinerary.stats.serviceEntries} service{itinerary.stats.serviceEntries === 1 ? '' : 's'}
            </span>
          }
          className="min-h-0"
        >
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {isLoading ? (
              <p className="text-sm text-[var(--color-muted)]">Loading itinerary…</p>
            ) : itinerary.days.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <CalendarDays className="size-8 text-[var(--color-subtle)]" />
                <p className="text-sm font-medium text-[var(--color-foreground)]">No itinerary yet</p>
                <p className="max-w-sm text-xs text-[var(--color-muted)]">
                  Set trip dates and add services — the timeline will appear here automatically.
                </p>
                <Link to={`/trips/${trip.id}/services`} className="text-xs font-medium text-[var(--color-accent)]">
                  Go to services
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {itinerary.days.map((day) => (
                  <DaySection
                    key={day.dayKey}
                    day={day}
                    onAddNote={openAddNote}
                    onEditNote={openEditNote}
                    onDeleteNote={(entry) => entry.noteId && setDeleteTargetId(entry.noteId)}
                  />
                ))}
              </div>
            )}
          </div>
        </CrmPanel>

        <div className="flex min-h-0 flex-col gap-3">
          <CrmPanel title="Smart insights">
            <div className="space-y-2 p-3">
              {itinerary.insights.length === 0 ? (
                <p className="text-xs text-[var(--color-muted)]">No issues detected.</p>
              ) : (
                itinerary.insights.map((insight) => <InsightCard key={insight.id} insight={insight} />)
              )}
            </div>
          </CrmPanel>

          <CrmPanel title="Summary">
            <dl className="grid grid-cols-2 gap-px bg-[var(--color-border)] p-px text-center text-xs">
              <div className="bg-[var(--color-surface)] px-2 py-3">
                <dt className="text-[var(--color-muted)]">Confirmed</dt>
                <dd className="mt-1 text-lg font-semibold text-[var(--color-success)]">{itinerary.stats.confirmedCount}</dd>
              </div>
              <div className="bg-[var(--color-surface)] px-2 py-3">
                <dt className="text-[var(--color-muted)]">Proposal</dt>
                <dd className="mt-1 text-lg font-semibold text-[var(--color-warning)]">{itinerary.stats.proposalCount}</dd>
              </div>
              <div className="bg-[var(--color-surface)] px-2 py-3">
                <dt className="text-[var(--color-muted)]">Open days</dt>
                <dd className="mt-1 text-lg font-semibold">{itinerary.stats.emptyDayCount}</dd>
              </div>
              <div className="bg-[var(--color-surface)] px-2 py-3">
                <dt className="text-[var(--color-muted)]">Notes</dt>
                <dd className="mt-1 text-lg font-semibold">{itinerary.stats.noteEntries}</dd>
              </div>
            </dl>
          </CrmPanel>
        </div>
      </div>

      <ItineraryPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        trip={trip}
        itinerary={itinerary}
      />

      <PdfExportDialog
        open={pdfExportOpen}
        onOpenChange={setPdfExportOpen}
        title="Itinerary PDF preview"
        description={`Review the final layout before downloading ${trip.reference}_itinerary.pdf`}
        filename={`${trip.reference}_itinerary.pdf`}
        generatePdf={generateItineraryPdf}
      />

      <ItineraryNoteDialog
        open={noteDialogOpen}
        onOpenChange={setNoteDialogOpen}
        tripId={trip.id}
        dayKey={noteDayKey}
        dayLabel={noteDayLabel}
        note={editingNote}
        isPending={isPending}
        onSubmit={handleNoteSubmit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        title="Remove itinerary note?"
        description="This note will be removed from the client itinerary."
        confirmLabel="Remove"
        variant="danger"
        isPending={deleteNote.isPending}
        onConfirm={() => {
          if (!deleteTarget) return
          deleteNote.mutate(deleteTarget, { onSuccess: () => setDeleteTargetId(null) })
        }}
      />
    </div>
  )
}
