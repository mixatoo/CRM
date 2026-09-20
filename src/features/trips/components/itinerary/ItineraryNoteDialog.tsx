import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { CloseButton } from '@/design-system/components/CloseButton'
import type { TripItineraryNote } from '@/domain/entities/trip-itinerary-note'
import { ITINERARY_UNSCHEDULED_DAY_KEY } from '@/domain/entities/trip-itinerary-note'
import { Button } from '@/design-system/components/Button'
import { Input } from '@/design-system/components/Input'
import { NotesTextarea } from '@/design-system/components/NotesField'
import { CrmInputCell } from '@/design-system/layout/CrmPanel'
import type { SaveItineraryNoteInput } from '@/features/trips/hooks/use-itinerary-note-mutations'

interface ItineraryNoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tripId: string
  dayKey: string
  dayLabel: string
  note?: TripItineraryNote | null
  isPending?: boolean
  onSubmit: (input: SaveItineraryNoteInput) => void
}

export function ItineraryNoteDialog({
  open,
  onOpenChange,
  tripId,
  dayKey,
  dayLabel,
  note,
  isPending,
  onSubmit,
}: ItineraryNoteDialogProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [timeLabel, setTimeLabel] = useState('')

  useEffect(() => {
    if (!open) return
    setTitle(note?.title ?? '')
    setBody(note?.body ?? '')
    setTimeLabel(note?.timeLabel ?? '')
  }, [open, note])

  const canSubmit = title.trim().length > 0 && !isPending

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit({
      tripId,
      dayKey: dayKey || ITINERARY_UNSCHEDULED_DAY_KEY,
      title,
      body,
      timeLabel,
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[600] bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[601] w-[min(28rem,calc(100vw-1rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl outline-none">
          <header className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
            <div>
              <Dialog.Title className="text-sm font-semibold">
                {note ? 'Edit itinerary note' : 'Add itinerary note'}
              </Dialog.Title>
              <Dialog.Description className="text-xs text-[var(--color-muted)]">{dayLabel}</Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <CloseButton />
            </Dialog.Close>
          </header>

          <div className="space-y-3 p-4">
            <CrmInputCell label="Title">
              <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Airport pickup briefing" />
            </CrmInputCell>
            <CrmInputCell label="Time (optional)">
              <Input value={timeLabel} onChange={(event) => setTimeLabel(event.target.value)} placeholder="14:30" />
            </CrmInputCell>
            <CrmInputCell label="Details (optional)">
              <NotesTextarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={3}
                placeholder="Meeting point, dress code, contact number…"
                className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 outline-none focus:border-[var(--color-accent)]"
              />
            </CrmInputCell>
          </div>

          <footer className="flex justify-end gap-2 border-t border-[var(--color-border)] px-4 py-3">
            <Dialog.Close asChild>
              <Button variant="ghost" size="sm">
                Cancel
              </Button>
            </Dialog.Close>
            <Button size="sm" loading={isPending} disabled={!canSubmit} onClick={handleSubmit}>
              {isPending ? 'Saving…' : note ? 'Save note' : 'Add note'}
            </Button>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
