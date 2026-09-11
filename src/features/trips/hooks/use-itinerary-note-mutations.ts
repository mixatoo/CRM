import { useMutation, useQueryClient } from '@tanstack/react-query'
import { appContainer } from '@/app/container'
import type { TripItineraryNote } from '@/domain/entities/trip-itinerary-note'
import { ITINERARY_UNSCHEDULED_DAY_KEY } from '@/domain/entities/trip-itinerary-note'
import { useToast } from '@/design-system/components/Toast'

export interface SaveItineraryNoteInput {
  tripId: string
  dayKey: string
  title: string
  body?: string
  timeLabel?: string
}

async function nextSortOrder(tripId: string, dayKey: string) {
  const notes = await appContainer.uow.tripItineraryNotes.findByTripId(tripId)
  const dayNotes = notes.filter((note) => note.dayKey === dayKey)
  return dayNotes.reduce((max, note) => Math.max(max, note.sortOrder), 0) + 1
}

export function useItineraryNoteMutations() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const invalidate = (tripId: string) => {
    void queryClient.invalidateQueries({ queryKey: ['trip-itinerary-notes', tripId] })
  }

  const createNote = useMutation({
    mutationFn: async (input: SaveItineraryNoteInput) => {
      const now = new Date().toISOString()
      const dayKey = input.dayKey.trim() || ITINERARY_UNSCHEDULED_DAY_KEY
      return appContainer.uow.tripItineraryNotes.create({
        tripId: input.tripId,
        dayKey,
        sortOrder: await nextSortOrder(input.tripId, dayKey),
        title: input.title.trim(),
        body: input.body?.trim() || undefined,
        timeLabel: input.timeLabel?.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      })
    },
    onSuccess: (note) => {
      invalidate(note.tripId)
      toast({ intent: 'updated', title: 'Note added to itinerary' })
    },
    onError: () => toast({ intent: 'failed', title: 'Could not add itinerary note' }),
  })

  const updateNote = useMutation({
    mutationFn: async ({
      note,
      patch,
    }: {
      note: TripItineraryNote
      patch: Partial<Pick<TripItineraryNote, 'title' | 'body' | 'timeLabel' | 'dayKey'>>
    }) => {
      return appContainer.uow.tripItineraryNotes.update(note.id, {
        ...patch,
        title: patch.title?.trim() ?? note.title,
        body: patch.body?.trim() || undefined,
        timeLabel: patch.timeLabel?.trim() || undefined,
        updatedAt: new Date().toISOString(),
      })
    },
    onSuccess: (note) => {
      invalidate(note.tripId)
      toast({ intent: 'updated', title: 'Note updated' })
    },
    onError: () => toast({ intent: 'failed', title: 'Could not update note' }),
  })

  const deleteNote = useMutation({
    mutationFn: async (note: TripItineraryNote) => {
      await appContainer.uow.tripItineraryNotes.delete(note.id)
      return note.tripId
    },
    onSuccess: (tripId) => {
      invalidate(tripId)
      toast({ intent: 'deleted', title: 'Note removed' })
    },
    onError: () => toast({ intent: 'failed', title: 'Could not delete note' }),
  })

  return {
    createNote,
    updateNote,
    deleteNote,
    isPending: createNote.isPending || updateNote.isPending || deleteNote.isPending,
  }
}
