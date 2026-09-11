import { db } from '@/infrastructure/database/db'
import { syncTripFinancials } from '@/infrastructure/database/trip-sync'
import { computeServiceBreakdown } from '@/domain/entities/trip-service'
import type { TripService } from '@/domain/entities/trip-service'
import type { TripServiceRepository } from '@/repositories/interfaces'
import { generateId } from '@/shared/utils/cn'

export class DexieTripServiceRepository implements TripServiceRepository {
  async findAll() {
    return db.tripServices.orderBy('lineNumber').toArray()
  }

  async findById(id: string) {
    return (await db.tripServices.get(id)) ?? null
  }

  async findByTripId(tripId: string) {
    const services = await db.tripServices.where('tripId').equals(tripId).toArray()
    return services.sort((a, b) => a.lineNumber - b.lineNumber)
  }

  async create(data: Omit<TripService, 'id'>) {
    const item: TripService = { ...data, id: generateId('SRV') }
    await db.tripServices.add(item)
    await this.syncTripBreakdown(data.tripId)
    await syncTripFinancials(data.tripId)
    return item
  }

  async update(id: string, data: Partial<TripService>) {
    const existing = await db.tripServices.get(id)
    if (!existing) throw new Error('Service not found')
    const updated: TripService = { ...existing, ...data, updatedAt: new Date().toISOString() }
    await db.tripServices.put(updated)
    await this.syncTripBreakdown(updated.tripId)
    await syncTripFinancials(updated.tripId)
    return updated
  }

  async delete(id: string) {
    const existing = await db.tripServices.get(id)
    if (!existing) return
    await db.tripServices.delete(id)
    await this.syncTripBreakdown(existing.tripId)
    await syncTripFinancials(existing.tripId)
  }

  async syncTripBreakdown(tripId: string) {
    const services = await this.findByTripId(tripId)
    await db.trips.update(tripId, {
      serviceBreakdown: computeServiceBreakdown(services),
      updatedAt: new Date().toISOString(),
    })
  }
}
