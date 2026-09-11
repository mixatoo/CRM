import { db } from '@/infrastructure/database/db'
import type { TripItineraryNote } from '@/domain/entities/trip-itinerary-note'
import type { TripItineraryNoteRepository } from '@/repositories/interfaces'
import { generateId } from '@/shared/utils/cn'

export class DexieTripItineraryNoteRepository implements TripItineraryNoteRepository {
  async findAll() {
    return db.tripItineraryNotes.orderBy('sortOrder').toArray()
  }

  async findById(id: string) {
    return (await db.tripItineraryNotes.get(id)) ?? null
  }

  async findByTripId(tripId: string) {
    const notes = await db.tripItineraryNotes.where('tripId').equals(tripId).toArray()
    return notes.sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt))
  }

  async create(data: Omit<TripItineraryNote, 'id'>) {
    const item: TripItineraryNote = { ...data, id: generateId('ITN') }
    await db.tripItineraryNotes.add(item)
    return item
  }

  async update(id: string, data: Partial<TripItineraryNote>) {
    const existing = await db.tripItineraryNotes.get(id)
    if (!existing) throw new Error('Itinerary note not found')
    const updated: TripItineraryNote = { ...existing, ...data }
    await db.tripItineraryNotes.put(updated)
    return updated
  }

  async delete(id: string) {
    await db.tripItineraryNotes.delete(id)
  }
}
