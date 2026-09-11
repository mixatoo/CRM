import type { TripService } from '@/domain/entities/trip-service'

export function tripServiceSelling(service: Pick<TripService, 'cost' | 'selling'>) {
  return service.selling ?? service.cost
}

export function tripServiceMargin(service: Pick<TripService, 'cost' | 'selling'>) {
  return tripServiceSelling(service) - service.cost
}

export function tripServiceMarginPercent(service: Pick<TripService, 'cost' | 'selling'>) {
  const cost = service.cost
  const selling = tripServiceSelling(service)
  if (cost === 0) return selling > 0 ? 100 : 0
  return ((selling - cost) / cost) * 100
}
