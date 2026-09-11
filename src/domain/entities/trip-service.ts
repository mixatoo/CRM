import {
  SERVICE_CATEGORIES,
  SERVICE_CATEGORY_LABELS,
  type ServiceCategory,
  type ServiceCategoryCounts,
} from '@/domain/entities/trip'
import type {
  ActivityServiceDetails,
  CruiseServiceDetails,
  InsuranceServiceDetails,
  LodgingServiceDetails,
  RestaurantServiceDetails,
  TourServiceDetails,
} from '@/domain/entities/trip-service-category-details'
import type { FlightServiceDetails } from '@/domain/entities/trip-service-flight'

export type TripServiceStatus = 'proposal' | 'confirmed' | 'canceled'

export interface TripService {
  id: string
  tripId: string
  lineNumber: number
  category: ServiceCategory
  status: TripServiceStatus
  name: string
  supplierName?: string
  /** Link to global supplier directory record */
  supplierId?: string
  startDate?: string
  endDate?: string
  cost: number
  selling?: number
  currency: string
  notes?: string
  /** Structured itinerary for `category === 'flight'`. */
  flightDetails?: FlightServiceDetails
  activityDetails?: ActivityServiceDetails
  cruiseDetails?: CruiseServiceDetails
  lodgingDetails?: LodgingServiceDetails
  restaurantDetails?: RestaurantServiceDetails
  tourDetails?: TourServiceDetails
  insuranceDetails?: InsuranceServiceDetails
  createdAt: string
  updatedAt: string
}

export const TRIP_SERVICE_STATUSES: TripServiceStatus[] = ['proposal', 'confirmed', 'canceled']

export const TRIP_SERVICE_STATUS_LABELS: Record<TripServiceStatus, string> = {
  proposal: 'Proposal',
  confirmed: 'Confirmed',
  canceled: 'Canceled',
}

export function computeServiceBreakdown(
  services: Pick<TripService, 'category' | 'status'>[],
): ServiceCategoryCounts[] {
  const counts = new Map<ServiceCategory, { proposal: number; confirmed: number; canceled: number }>()
  for (const category of SERVICE_CATEGORIES) {
    counts.set(category, { proposal: 0, confirmed: 0, canceled: 0 })
  }
  for (const service of services) {
    const row = counts.get(service.category)
    if (!row) continue
    row[service.status] += 1
  }
  return SERVICE_CATEGORIES.map((category) => ({
    category,
    ...counts.get(category)!,
  }))
}

export function formatServiceCategory(category: ServiceCategory): string {
  return SERVICE_CATEGORY_LABELS[category]
}
